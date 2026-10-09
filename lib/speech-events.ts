export type SpeechEvent = { audio?: string; error?: string; done?: boolean };

export async function consumeSpeechEvents(
  body: ReadableStream<Uint8Array>,
  onAudio: (chunk: Uint8Array<ArrayBuffer>) => Promise<void>,
  signal: AbortSignal,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let completed = false;
  const abort = () => {
    void reader.cancel();
  };
  signal.addEventListener("abort", abort, { once: true });
  const parse = async (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as SpeechEvent;
    if (event.error) throw new Error(event.error);
    if (event.audio) {
      const raw = atob(event.audio);
      const chunk = Uint8Array.from(raw, (character) =>
        character.charCodeAt(0),
      );
      await onAudio(chunk);
    }
    if (event.done) completed = true;
  };
  try {
    while (!completed && !signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = pending.indexOf("\n")) !== -1) {
        await parse(pending.slice(0, newline));
        pending = pending.slice(newline + 1);
      }
    }
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    pending += decoder.decode();
    if (pending.trim()) await parse(pending);
    if (!completed) throw new Error("Audio was interrupted. Please try again.");
  } finally {
    signal.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
