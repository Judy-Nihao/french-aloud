import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = fs.readFileSync(
  new URL("../app/api/tts/route.ts", import.meta.url),
  "utf8",
);
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const encoder = new TextEncoder();
const packet = (event) => encoder.encode(JSON.stringify(event) + "\n");
let calls = 0,
  provider;
const exports = {};
new Function("require", "exports", code)((name) => {
  if (name === "@/lib/elevenlabs-voices")
    return { isAllowedVoiceId: (id) => id === "allowed" };
  if (name === "@/lib/elevenlabs-stream")
    return {
      speechModel: "eleven_v4_turbo",
      voiceSettings: { stability: 0.5, similarity_boost: 0.75 },
      createSpeechStream: () => {
        calls++;
        return new ReadableStream({
          start(c) {
            provider = c;
          },
        });
      },
    };
  return require(name);
}, exports);
const original = process.env.ELEVENLABS_API_KEY;
process.env.ELEVENLABS_API_KEY = "test-only-key";
test.after(() => {
  if (original === undefined) delete process.env.ELEVENLABS_API_KEY;
  else process.env.ELEVENLABS_API_KEY = original;
});
const request = (body, signal) =>
  new Request("http://localhost/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

test("invalid requests never invoke the provider", async () => {
  for (const body of [
    { text: "" },
    { text: "Bonjour", voiceId: "unknown" },
    { text: "x".repeat(5001), voiceId: "allowed" },
    [],
  ]) {
    assert.equal((await exports.POST(request(body))).status, 400);
  }
  assert.equal(calls, 0);
});
test("forwards the first chunk immediately and caches only completed audio; speed is not a generation setting", async () => {
  const before = calls;
  const response = await exports.POST(
    request({ text: "Bonjour", voiceId: "allowed", speed: 0.7 }),
  );
  assert.equal(response.headers.get("X-TTS-Cache"), "MISS");
  const reader = response.body.getReader();
  provider.enqueue(packet({ audio: "b25l" }));
  assert.match(new TextDecoder().decode((await reader.read()).value), /b25l/);
  provider.enqueue(packet({ done: true }));
  provider.close();
  while (!(await reader.read()).done) {}
  const cached = await exports.POST(
    request({ text: "Bonjour", voiceId: "allowed", speed: 1.2 }),
  );
  assert.equal(cached.headers.get("X-TTS-Cache"), "HIT");
  assert.match(await cached.text(), /done/);
  assert.equal(calls, before + 1);
});
test("partial provider failures are never cached", async () => {
  const payload = { text: "Erreur", voiceId: "allowed" };
  const response = await exports.POST(request(payload));
  const reading = response.text();
  provider.enqueue(packet({ audio: "b25l" }));
  provider.enqueue(packet({ error: "Unavailable" }));
  provider.close();
  await reading;
  const retry = await exports.POST(request(payload));
  assert.equal(retry.headers.get("X-TTS-Cache"), "MISS");
  const readingRetry = retry.text();
  provider.enqueue(packet({ error: "Unavailable" }));
  provider.close();
  await readingRetry;
});
test("aborted requests are not cached even if a final frame races with abort", async () => {
  const abort = new AbortController();
  const payload = { text: "Annuler", voiceId: "allowed" };
  const response = await exports.POST(request(payload, abort.signal));
  const reading = response.text();
  provider.enqueue(packet({ audio: "b25l" }));
  abort.abort();
  provider.enqueue(packet({ done: true }));
  provider.close();
  await reading;
  const retry = await exports.POST(request(payload));
  assert.equal(retry.headers.get("X-TTS-Cache"), "MISS");
  const readingRetry = retry.text();
  provider.enqueue(packet({ error: "Unavailable" }));
  provider.close();
  await readingRetry;
});
