import { NextResponse } from "next/server";
import { voices, defaultVoiceId } from "@/lib/voices";

export const GET = () =>
  NextResponse.json({
    voices: voices.map((voice) => ({
      ...voice,
      isDefault: voice.id === defaultVoiceId,
    })),
  });
