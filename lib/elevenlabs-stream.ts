export const speechModel = "eleven_v4_turbo";
export const voiceSettings = { stability: 0.5, similarity_boost: 0.75 };
export const speechFormat = "mp3_44100_128";

type StreamOptions = {
  text: string;
  voiceId: string;
  apiKey: string;
  signal: AbortSignal;
  createSocket?: (url: string) => WebSocket;
  timeoutMs?: number;
};

// NDJSON can carry provider errors even after response headers have been sent.
export function createSpeechStream({
  text,
  voiceId,
  apiKey,
  signal,
  createSocket = (url) => new WebSocket(url),
  timeoutMs = 30_000,
}: StreamOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cleanup = () => {};
  return new ReadableStream({
    start(controller) {
      let finished = false;
      let hasAudio = false;
      let socket: WebSocket | undefined;
      let timer: ReturnType<typeof setTimeout>;
      const emit = (event: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      const finish = (error?: string, cancelled = false) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        if (socket && socket.readyState < 2) socket.close();
        if (!cancelled) {
          emit(error ? { error } : { done: true });
          controller.close();
        }
      };
      const abort = () => finish("Speech request cancelled.");
      const resetTimeout = () => {
        clearTimeout(timer);
        timer = setTimeout(
          () => finish("Speech generation timed out. Please try again."),
          timeoutMs,
        );
      };
      cleanup = () => finish(undefined, true);
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener("abort", abort, { once: true });
      resetTimeout();
      try {
        const params = new URLSearchParams({
          model_id: speechModel,
          output_format: speechFormat,
          language_code: "fr",
        });
        socket = createSocket(
          `wss://api.elevenlabs.io/v1/text-to-dialogue/stream-input?${params}`,
        );
        socket.addEventListener("open", () => {
          if (finished) return;
          socket!.send(
            JSON.stringify({
              voices: [voiceId],
              xi_api_key: apiKey,
              voice_settings: voiceSettings,
            }),
          );
          socket!.send(
            JSON.stringify({ inputs: [{ text, voice_id: voiceId }] }),
          );
          // Flush even a single word and release the session after generation.
          socket!.send(JSON.stringify({ close_socket: true }));
        });
        socket.addEventListener("message", (event) => {
          if (finished) return;
          resetTimeout();
          try {
            const message = JSON.parse(String(event.data));
            if (message.error || message.type === "error") {
              finish(
                "ElevenLabs could not generate speech. Check model access, voice availability and credits.",
              );
              return;
            }
            if (typeof message.audio === "string" && message.audio) {
              hasAudio = true;
              emit({ audio: message.audio });
            }
            // Turn end is not session end: MP3 can have trailing bytes.
            if (message.is_final)
              finish(hasAudio ? undefined : "No audio was generated.");
          } catch {
            finish("Invalid speech response. Please try again.");
          }
        });
        socket.addEventListener("error", () =>
          finish("Unable to connect to ElevenLabs. Please try again."),
        );
        socket.addEventListener("close", () =>
          finish(
            "Speech connection ended before audio was complete. Please try again.",
          ),
        );
      } catch {
        finish("Unable to start speech generation. Please try again.");
      }
    },
    cancel() {
      cleanup();
    },
  });
}
