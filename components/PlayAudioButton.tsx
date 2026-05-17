"use client";

import { useRef, useState } from "react";
import { AudioLines } from "lucide-react";

type VoiceType = "female" | "male";

type PlayAudioButtonProps = {
  idleLabel: string;
  activeLabel?: string;
  text: string;
  voice: VoiceType;
  disabled?: boolean;
  onStatusChange?: (
    state: "loading" | "success" | "error",
    message: string,
  ) => void;
};

export const PlayAudioButton = ({
  idleLabel,
  activeLabel = "Playing audio",
  text,
  voice,
  disabled = false,
  onStatusChange,
}: PlayAudioButtonProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    const phrase = text.trim();
    if (!phrase) {
      onStatusChange?.("error", "Enter a French word or sentence first");
      return;
    }

    setIsLoading(true);
    onStatusChange?.("loading", "Calling /api/tts...");

    try {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
        audioRef.current.pause();
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase, voice }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `TTS failed with ${response.status}`);
      }

      const cacheStatus = response.headers.get("X-TTS-Cache");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        setIsLoading(false);
      };
      audio.onpause = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
      onStatusChange?.(
        "success",
        `TTS succeeded with ${voice} voice. ${getCacheMessage(cacheStatus)}`,
      );
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      onStatusChange?.(
        "error",
        error instanceof Error ? error.message : "TTS failed",
      );
    }
  };

  const showIcon = isPlaying || isLoading;

  return (
    <button
      type="button"
      className="mt-4 w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
      onClick={handlePlay}
      disabled={disabled || isLoading}
    >
      {showIcon ? (
        <AudioLines className="mx-auto h-4 w-4 text-white" />
      ) : (
        idleLabel
      )}
    </button>
  );
};

const getCacheMessage = (cacheStatus: string | null) => {
  if (cacheStatus === "HIT") {
    return "Using the cached audio.";
  }

  if (cacheStatus === "MISS") {
    return "Calling the TTS API and caching the audio.";
  }

  return "Cache status unavailable.";
};
