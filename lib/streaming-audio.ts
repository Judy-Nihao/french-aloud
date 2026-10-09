import { consumeSpeechEvents } from "./speech-events";

function waitForEvent(target: EventTarget, name: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      target.removeEventListener(name, success);
      target.removeEventListener("error", error);
      signal.removeEventListener("abort", abort);
    };
    const success = () => {
      cleanup();
      resolve();
    };
    const error = () => {
      cleanup();
      reject(new Error("Unable to decode this audio."));
    };
    const abort = () => {
      cleanup();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Audio playback timed out."));
    }, 30_000);
    target.addEventListener(name, success, { once: true });
    target.addEventListener("error", error, { once: true });
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

export class StreamingAudioPlayer {
  private audio = new Audio();
  private controller = new AbortController();
  private url: string | null = null;

  constructor(speed: number, onPlaying: () => void) {
    this.setSpeed(speed);
    this.audio.onplaying = onPlaying;
  }

  setSpeed(speed: number) {
    this.audio.preservesPitch = true;
    // Loading a new source resets playbackRate to this default.
    this.audio.defaultPlaybackRate = speed;
    this.audio.playbackRate = speed;
  }

  stop() {
    this.controller.abort();
    this.audio.onplaying = null;
    this.audio.onended = null;
    this.audio.onerror = null;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null;
  }

  async play(
    payload: { text: string; voiceId?: string; voice?: "female" | "male" },
    onCache: (value: "hit" | "miss" | null) => void,
  ) {
    const signal = this.controller.signal;
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error ?? "Unable to generate speech.");
    }
    if (!response.body) throw new Error("Audio response is empty.");
    const cache = response.headers.get("X-TTS-Cache");
    onCache(cache === "HIT" ? "hit" : cache === "MISS" ? "miss" : null);

    // Native media playback retains pitch when changing playbackRate.
    const supportsStreaming =
      typeof MediaSource !== "undefined" &&
      MediaSource.isTypeSupported("audio/mpeg");
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let buffer: SourceBuffer | undefined;
    let media: MediaSource | undefined;
    let started = false;
    let playbackError: Error | undefined;
    let rejectPlayback: ((reason: Error) => void) | undefined;
    const ended = new Promise<void>((resolve, reject) => {
      rejectPlayback = reject;
      this.audio.onended = () => resolve();
      this.audio.onerror = () => {
        playbackError = new Error("Unable to play this audio.");
        reject(playbackError);
        this.controller.abort();
      };
      signal.addEventListener(
        "abort",
        () => reject(new DOMException("Cancelled", "AbortError")),
        { once: true },
      );
    });
    // Attach a handler immediately; playback can fail before the stream finishes.
    void ended.catch(() => {});
    try {
      if (supportsStreaming) {
        media = new MediaSource();
        this.url = URL.createObjectURL(media);
        const opened = waitForEvent(media, "sourceopen", signal);
        this.audio.src = this.url;
        await opened;
        buffer = media.addSourceBuffer("audio/mpeg");
      }
      await consumeSpeechEvents(
        response.body,
        async (chunk) => {
          if (playbackError) throw playbackError;
          if (!buffer) {
            chunks.push(chunk);
            return;
          }
          const updated = waitForEvent(buffer, "updateend", signal);
          void updated.catch(() => {});
          buffer.appendBuffer(chunk);
          await updated;
          if (!started) {
            started = true;
            void this.audio.play().catch((error: Error) => {
              playbackError = error;
              rejectPlayback?.(error);
              this.controller.abort();
            });
          }
        },
        signal,
      );
      if (buffer && media?.readyState === "open") media.endOfStream();
      if (!buffer) {
        if (!chunks.length) throw new Error("No audio was generated.");
        this.url = URL.createObjectURL(
          new Blob(chunks, { type: "audio/mpeg" }),
        );
        this.audio.src = this.url;
        await this.audio.play();
      }
      await ended;
    } catch (error) {
      throw playbackError ?? error;
    } finally {
      this.stop();
    }
  }
}
