import { NextResponse } from "next/server";

type VoiceGender = "female" | "male";

type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  category?: string;
  description?: string | null;
  labels?: Record<string, string>;
  preview_url?: string | null;
};

type ElevenLabsVoicesResponse = {
  voices?: ElevenLabsVoice[];
};

const parseVoiceIds = (value: string | undefined) =>
  [...new Set(value?.split(",").map((id) => id.trim()).filter(Boolean) ?? [])];

const getConfiguredVoices = () => {
  const femaleIds = parseVoiceIds(process.env.ELEVENLABS_FEMALE_VOICE_IDS);
  const maleIds = parseVoiceIds(process.env.ELEVENLABS_MALE_VOICE_IDS);

  return [
    ...femaleIds.map((id) => ({ id, gender: "female" as const })),
    ...maleIds.map((id) => ({ id, gender: "male" as const })),
  ];
};

export const GET = async () => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const configuredVoices = getConfiguredVoices();
  const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  if (!apiKey || configuredVoices.length === 0 || !defaultVoiceId) {
    return NextResponse.json(
      {
        error:
          "Voice list not configured. Set ELEVENLABS_API_KEY, ELEVENLABS_FEMALE_VOICE_IDS, ELEVENLABS_MALE_VOICE_IDS, and ELEVENLABS_DEFAULT_VOICE_ID.",
      },
      { status: 503 },
    );
  }

  if (!configuredVoices.some(({ id }) => id === defaultVoiceId)) {
    return NextResponse.json(
      { error: "The default voice must be included in the configured voice list." },
      { status: 503 },
    );
  }

  const searchParams = new URLSearchParams({
    page_size: String(configuredVoices.length),
    include_total_count: "false",
  });

  configuredVoices.forEach(({ id }) => {
    searchParams.append("voice_ids", id);
  });

  const response = await fetch(
    `https://api.elevenlabs.io/v2/voices?${searchParams.toString()}`,
    {
      headers: { "xi-api-key": apiKey },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("ElevenLabs voices error:", error);

    return NextResponse.json(
      { error: "Voice list request failed." },
      { status: response.status },
    );
  }

  const data = (await response.json()) as ElevenLabsVoicesResponse;
  const voiceById = new Map(
    (data.voices ?? []).map((voice) => [voice.voice_id, voice]),
  );

  const voices = configuredVoices.flatMap(({ id, gender }) => {
    const voice = voiceById.get(id);

    if (!voice) return [];

    return [
      {
        id,
        name: voice.name,
        gender: gender satisfies VoiceGender,
        category: voice.category ?? null,
        description: voice.description ?? null,
        labels: voice.labels ?? {},
        previewUrl: voice.preview_url ?? null,
        isDefault: id === defaultVoiceId,
      },
    ];
  });

  return NextResponse.json({ voices });
};
