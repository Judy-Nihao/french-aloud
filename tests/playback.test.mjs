import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "french-player-"));
for (const name of ["speech-events", "streaming-audio"]) {
  const source = fs.readFileSync(
    new URL(`../lib/${name}.ts`, import.meta.url),
    "utf8",
  );
  fs.writeFileSync(
    path.join(temp, `${name}.js`),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
}
const require = createRequire(import.meta.url);
const { StreamingAudioPlayer } = require(path.join(temp, "streaming-audio.js"));
const originals = {
  Audio: globalThis.Audio,
  MediaSource: globalThis.MediaSource,
  fetch: globalThis.fetch,
  create: URL.createObjectURL,
  revoke: URL.revokeObjectURL,
};
test.after(() => {
  Object.assign(globalThis, {
    Audio: originals.Audio,
    MediaSource: originals.MediaSource,
    fetch: originals.fetch,
  });
  URL.createObjectURL = originals.create;
  URL.revokeObjectURL = originals.revoke;
  fs.rmSync(temp, { recursive: true });
});
let audio, media, fetches, request, network, revoked;
class Audio {
  paused = true;
  constructor() {
    // Capture the fake media element for assertions.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    audio = this;
  }
  set src(value) {
    this.url = value;
    if (media)
      queueMicrotask(() => media.dispatchEvent(new Event("sourceopen")));
  }
  play() {
    this.paused = false;
    this.onplaying?.();
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {}
  removeAttribute() {
    this.url = null;
  }
}
class Buffer extends EventTarget {
  chunks = [];
  appendBuffer(bytes) {
    this.chunks.push([...bytes]);
    queueMicrotask(() => this.dispatchEvent(new Event("updateend")));
  }
}
class Media extends EventTarget {
  readyState = "open";
  static isTypeSupported() {
    return true;
  }
  constructor() {
    super();
    // Capture the fake source for ordered-chunk assertions.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    media = this;
  }
  addSourceBuffer() {
    this.buffer = new Buffer();
    return this.buffer;
  }
  endOfStream() {
    this.readyState = "ended";
  }
}
function setup(streaming = true) {
  audio = null;
  media = null;
  fetches = 0;
  request = null;
  revoked = [];
  globalThis.Audio = Audio;
  globalThis.MediaSource = streaming ? Media : undefined;
  URL.createObjectURL = () => "blob:test";
  URL.revokeObjectURL = (url) => revoked.push(url);
  globalThis.fetch = async (url, options) => {
    fetches++;
    request = options;
    return new Response(
      new ReadableStream({
        start(c) {
          network = c;
        },
      }),
      { headers: { "X-TTS-Cache": "MISS" } },
    );
  };
}
const send = (event) =>
  network.enqueue(new TextEncoder().encode(JSON.stringify(event) + "\n"));
const tick = () => new Promise((resolve) => setImmediate(resolve));

test("starts before generation completes; speed changes preserve pitch without fetching", async () => {
  setup();
  let playing = 0;
  const player = new StreamingAudioPlayer(0.8, () => playing++);
  const result = player.play({ text: "Bonjour.", voiceId: "voice" }, () => {});
  await tick();
  send({ audio: btoa("one") });
  await tick();
  assert.equal(playing, 1);
  assert.equal(media.readyState, "open");
  assert.equal(audio.paused, false);
  player.setSpeed(0.7);
  assert.equal(audio.playbackRate, 0.7);
  assert.equal(audio.preservesPitch, true);
  assert.equal(fetches, 1);
  assert.deepEqual(JSON.parse(request.body), {
    text: "Bonjour.",
    voiceId: "voice",
  });
  send({ audio: btoa("two") });
  send({ done: true });
  network.close();
  await tick();
  assert.deepEqual(media.buffer.chunks, [
    [111, 110, 101],
    [116, 119, 111],
  ]);
  assert.equal(media.readyState, "ended");
  audio.onended();
  await result;
  assert.equal(audio.paused, true);
  assert.deepEqual(revoked, ["blob:test"]);
});
test("stop aborts pending generation and releases media", async () => {
  setup();
  const player = new StreamingAudioPlayer(1, () => {});
  const result = player.play({ text: "Bonjour.", voiceId: "voice" }, () => {});
  await tick();
  player.stop();
  await assert.rejects(result, { name: "AbortError" });
  assert.equal(request.signal.aborted, true);
  assert.equal(audio.paused, true);
  assert.equal(audio.url, null);
});
test("fallback waits for the whole MP3 and retains adjustable playback speed", async () => {
  setup(false);
  let playing = 0;
  const player = new StreamingAudioPlayer(1, () => playing++);
  const result = player.play({ text: "Bonjour.", voiceId: "voice" }, () => {});
  await tick();
  send({ audio: btoa("mp3") });
  await tick();
  assert.equal(playing, 0);
  player.setSpeed(0.75);
  send({ done: true });
  network.close();
  await tick();
  assert.equal(playing, 1);
  assert.equal(audio.playbackRate, 0.75);
  audio.onended();
  await result;
});
test("late provider failure stops already playing audio", async () => {
  setup();
  const player = new StreamingAudioPlayer(1, () => {});
  const result = player.play({ text: "Bonjour.", voiceId: "voice" }, () => {});
  await tick();
  send({ audio: btoa("one") });
  await tick();
  send({ error: "Unavailable" });
  network.close();
  await assert.rejects(result, /Unavailable/);
  assert.equal(audio.paused, true);
  assert.equal(request.signal.aborted, true);
});
