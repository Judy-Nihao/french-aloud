import { NextRequest, NextResponse } from "next/server";
import { isAllowedVoiceId } from "@/lib/elevenlabs-voices";
import {
  createSpeechStream,
  speechModel,
  voiceSettings,
} from "@/lib/elevenlabs-stream";

export const runtime = "nodejs";
export const maxDuration = 60;

// Best-effort per-instance cache; only completed streams are stored.
const audioCache = new Map<string, Uint8Array>();
const maxCacheBytes = 20 * 1024 * 1024;
const maxEntryBytes = 2 * 1024 * 1024;
let cacheBytes = 0;

export const POST = async (req: NextRequest) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }
  const {
    text,
    voiceId: requestedVoiceId,
    voice = "female",
  } = body as {
    text?: unknown;
    voiceId?: unknown;
    voice?: unknown;
  };
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Enter French text first." },
      { status: 400 },
    );
  }
  if (text.trim().length > 5_000) {
    return NextResponse.json(
      { error: "Please use 5,000 characters or fewer." },
      { status: 400 },
    );
  }
  if (
    requestedVoiceId !== undefined &&
    (typeof requestedVoiceId !== "string" || !requestedVoiceId.trim())
  ) {
    return NextResponse.json({ error: "Invalid voice ID." }, { status: 400 });
  }
  if (
    requestedVoiceId === undefined &&
    voice !== "female" &&
    voice !== "male"
  ) {
    return NextResponse.json(
      { error: "Choose a valid voice." },
      { status: 400 },
    );
  }
  const voiceId =
    typeof requestedVoiceId === "string"
      ? requestedVoiceId.trim()
      : voice === "male"
        ? process.env.ELEVENLABS_MALE_VOICE_ID
        : (process.env.ELEVENLABS_FEMALE_VOICE_ID ??
          process.env.ELEVENLABS_VOICE_ID);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "Speech generation is not configured." },
      { status: 503 },
    );
  }
  if (!isAllowedVoiceId(voiceId)) {
    return NextResponse.json(
      { error: "This voice is not available." },
      { status: 400 },
    );
  }
  const normalizedText = text.trim();
  const key = JSON.stringify({
    text: normalizedText,
    voiceId,
    model: speechModel,
    voiceSettings,
  });
  const cached = audioCache.get(key);
  const headers = {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-store, no-transform",
    "X-TTS-Cache": cached ? "HIT" : "MISS",
    "X-Accel-Buffering": "no",
  };
  if (cached) return new Response(new Uint8Array(cached), { headers });
  const source = createSpeechStream({
    text: normalizedText,
    voiceId,
    apiKey,
    signal: req.signal,
  });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let failed = false;
  const decoder = new TextDecoder();
  const stream = source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        // Each source chunk is a complete NDJSON event.
        if (decoder.decode(chunk).includes('"error":')) failed = true;
        size += chunk.byteLength;
        if (size <= maxEntryBytes) chunks.push(chunk);
        else chunks.length = 0;
        controller.enqueue(chunk);
      },
      flush() {
        if (failed || req.signal.aborted || size > maxEntryBytes) return;
        const audio = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          audio.set(chunk, offset);
          offset += chunk.byteLength;
        }
        cacheBytes -= audioCache.get(key)?.byteLength ?? 0;
        audioCache.delete(key);
        while (cacheBytes + size > maxCacheBytes || audioCache.size >= 100) {
          const oldest = audioCache.keys().next().value;
          if (oldest === undefined) break;
          cacheBytes -= audioCache.get(oldest)!.byteLength;
          audioCache.delete(oldest);
        }
        audioCache.set(key, audio);
        cacheBytes += size;
      },
    }),
  );
  return new Response(stream, { headers });
};
