import { NextRequest, NextResponse } from "next/server";
import { isAllowedVoiceId } from "@/lib/elevenlabs-voices";

const modelId = "eleven_multilingual_v2";
const similarityBoost = 0.75;
const defaultSpeed = 1;
const minSpeed = 0.7;
const maxSpeed = 1.2;
const maxCacheEntries = 100;
const audioCache = new Map<string, ArrayBuffer>();
const voiceTypes = ["female", "male"] as const;
const readingModes = ["clear", "natural", "expressive"] as const;

const voiceSettingsByMode = {
  clear: { stability: 0.75, style: 0 },
  natural: { stability: 0.5, style: 0 },
  expressive: { stability: 0.4, style: 0.25 },
} as const;

type VoiceType = (typeof voiceTypes)[number];
type ReadingMode = (typeof readingModes)[number];

const getCacheKey = async (input: unknown) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(input));
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const setCachedAudio = (key: string, audioBuffer: ArrayBuffer) => {
  if (audioCache.size >= maxCacheEntries) {
    const oldestKey = audioCache.keys().next().value;

    if (oldestKey) {
      audioCache.delete(oldestKey);
    }
  }

  audioCache.set(key, audioBuffer);
};

const createAudioResponse = (
  audioBuffer: ArrayBuffer,
  cacheStatus: "HIT" | "MISS",
) => {
  return new NextResponse(audioBuffer.slice(0), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-TTS-Cache": cacheStatus,
    },
  });
};

const isVoiceType = (value: unknown): value is VoiceType => {
  return voiceTypes.includes(value as VoiceType);
};

const isReadingMode = (value: unknown): value is ReadingMode => {
  return readingModes.includes(value as ReadingMode);
};

const getVoiceId = (voice: VoiceType) => {
  const voiceIdByType: Record<VoiceType, string | undefined> = {
    female:
      process.env.ELEVENLABS_FEMALE_VOICE_ID ?? process.env.ELEVENLABS_VOICE_ID,
    male: process.env.ELEVENLABS_MALE_VOICE_ID,
  };

  return voiceIdByType[voice];
};

export const POST = async (req: NextRequest) => {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    text,
    voice = "female",
    voiceId: requestedVoiceId,
    speed = defaultSpeed,
    readingMode = "natural",
  } = body as {
    text?: unknown;
    voice?: unknown;
    voiceId?: unknown;
    speed?: unknown;
    readingMode?: unknown;
  };

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (
    requestedVoiceId !== undefined &&
    (typeof requestedVoiceId !== "string" || !requestedVoiceId.trim())
  ) {
    return NextResponse.json(
      { error: "voiceId must be a non-empty string" },
      { status: 400 },
    );
  }

  if (typeof speed !== "number" || !Number.isFinite(speed)) {
    return NextResponse.json(
      { error: "speed must be a number" },
      { status: 400 },
    );
  }

  if (speed < minSpeed || speed > maxSpeed) {
    return NextResponse.json(
      { error: `speed must be between ${minSpeed} and ${maxSpeed}` },
      { status: 400 },
    );
  }

  if (!isReadingMode(readingMode)) {
    return NextResponse.json(
      { error: "readingMode must be clear, natural, or expressive" },
      { status: 400 },
    );
  }

  if (requestedVoiceId === undefined && !isVoiceType(voice)) {
    return NextResponse.json(
      { error: "voice must be female or male" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId =
    typeof requestedVoiceId === "string"
      ? requestedVoiceId.trim()
      : getVoiceId(voice as VoiceType);

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        error:
          "TTS not configured. Set ELEVENLABS_API_KEY, ELEVENLABS_FEMALE_VOICE_ID, and ELEVENLABS_MALE_VOICE_ID.",
      },
      { status: 503 },
    );
  }

  if (!isAllowedVoiceId(voiceId)) {
    return NextResponse.json(
      { error: "This voice is not available" },
      { status: 400 },
    );
  }

  const normalizedText = text.trim();
  const voiceSettings = {
    ...voiceSettingsByMode[readingMode],
    similarity_boost: similarityBoost,
    speed,
  };
  const cacheKey = await getCacheKey({
    text: normalizedText,
    voiceId,
    modelId,
    voiceSettings,
  });
  const cachedAudio = audioCache.get(cacheKey);

  if (cachedAudio) {
    return createAudioResponse(cachedAudio, "HIT");
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: normalizedText,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("ElevenLabs error:", err);
    return NextResponse.json(
      { error: "TTS request failed" },
      { status: res.status },
    );
  }

  const audioBuffer = await res.arrayBuffer();
  setCachedAudio(cacheKey, audioBuffer);

  return createAudioResponse(audioBuffer, "MISS");
};
