import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechStream } from "../lib/elevenlabs-stream.ts";
import { consumeSpeechEvents } from "../lib/speech-events.ts";

class Socket extends EventTarget {
  readyState = 0;
  sent = [];
  close() {
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
  send(data) {
    this.sent.push(JSON.parse(data));
  }
  open() {
    this.readyState = 1;
    this.dispatchEvent(new Event("open"));
  }
  message(data) {
    this.dispatchEvent(
      new MessageEvent("message", { data: JSON.stringify(data) }),
    );
  }
}
function setup(options = {}) {
  const socket = new Socket();
  const abort = new AbortController();
  let url;
  const stream = createSpeechStream({
    text: "Bonjour.",
    voiceId: "voice",
    apiKey: "secret",
    signal: abort.signal,
    createSocket: (value) => {
      url = value;
      return socket;
    },
    ...options,
  });
  return {
    socket,
    abort,
    stream,
    get url() {
      return url;
    },
  };
}
const read = async (stream) =>
  (await new Response(stream).text()).trim().split("\n").map(JSON.parse);

test("v4 Turbo registers one voice, fixed settings and flushes short text", async () => {
  const s = setup();
  s.socket.open();
  assert.equal(new URL(s.url).searchParams.get("model_id"), "eleven_v4_turbo");
  assert.equal(new URL(s.url).searchParams.get("language_code"), "fr");
  assert.deepEqual(s.socket.sent, [
    {
      voices: ["voice"],
      xi_api_key: "secret",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    },
    { inputs: [{ text: "Bonjour.", voice_id: "voice" }] },
    { close_socket: true },
  ]);
  const reader = s.stream.getReader();
  s.socket.message({ audio: btoa("first") });
  assert.deepEqual(
    JSON.parse(new TextDecoder().decode((await reader.read()).value)),
    { audio: btoa("first") },
  );
  s.socket.message({ is_final_audio_for_turn: true });
  s.socket.message({ audio: btoa("trailing"), is_final: true });
  const rest = [];
  for (;;) {
    const r = await reader.read();
    if (r.done) break;
    rest.push(JSON.parse(new TextDecoder().decode(r.value)));
  }
  assert.deepEqual(rest, [{ audio: btoa("trailing") }, { done: true }]);
  assert.equal(s.socket.readyState, 3);
});
test("provider errors are safe and do not mark partial audio as complete", async () => {
  const s = setup();
  s.socket.open();
  s.socket.message({ audio: btoa("partial") });
  s.socket.message({ error: "secret provider error" });
  const events = await read(s.stream);
  assert.ok(events[1].error);
  assert.ok(!events.some((e) => e.done));
  assert.ok(!JSON.stringify(events).includes("secret"));
});
test("premature close and empty final fail", async () => {
  for (const action of [
    (s) => s.close(),
    (s) => s.message({ is_final: true }),
  ]) {
    const s = setup();
    s.socket.open();
    action(s.socket);
    assert.ok((await read(s.stream))[0].error);
  }
});
test("timeout closes the session", async () => {
  const s = setup({ timeoutMs: 5 });
  s.socket.open();
  assert.match((await read(s.stream))[0].error, /timed out/);
  assert.equal(s.socket.readyState, 3);
});
test("request abort and downstream cancellation close provider connection", async () => {
  const s = setup();
  s.socket.open();
  s.abort.abort();
  assert.ok((await read(s.stream))[0].error);
  const c = setup();
  c.socket.open();
  await c.stream.cancel();
  assert.equal(c.socket.readyState, 3);
});
test("client accepts split/coalesced HTTP chunks and retains audio order", async () => {
  const encoder = new TextEncoder();
  const out = [];
  const content =
    JSON.stringify({ audio: btoa("one") }) +
    "\n" +
    JSON.stringify({ audio: btoa("two") }) +
    "\n" +
    JSON.stringify({ done: true }) +
    "\n";
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(content.slice(0, 7)));
      c.enqueue(encoder.encode(content.slice(7)));
      c.close();
    },
  });
  await consumeSpeechEvents(
    stream,
    async (chunk) => out.push(new TextDecoder().decode(chunk)),
    new AbortController().signal,
  );
  assert.deepEqual(out, ["one", "two"]);
});
test("client rejects truncated streams and provider errors", async () => {
  for (const content of ['{"audio":"b25l"}\n', '{"error":"Unavailable"}\n']) {
    await assert.rejects(
      consumeSpeechEvents(
        new Response(content).body,
        async () => {},
        new AbortController().signal,
      ),
    );
  }
});
test("client cancellation interrupts a pending read", async () => {
  let cancelled = false;
  const abort = new AbortController();
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const result = consumeSpeechEvents(stream, async () => {}, abort.signal);
  abort.abort();
  await assert.rejects(result, { name: "AbortError" });
  assert.ok(cancelled);
});
