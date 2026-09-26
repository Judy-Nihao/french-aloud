"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines } from "lucide-react";
import type { ReadingMode } from "@/components/ReadingModeControl";

type NamedVoicePlayButtonProps = {
  text: string;
  voiceId: string | null;
  voiceName: string | null;
  speed: number;
  readingMode: ReadingMode;
  disabled?: boolean;
  onStatusChange?: (
    state: "loading" | "success" | "error",
    message: string,
  ) => void;
  onCacheStatusChange?: (status: "hit" | "miss" | null) => void;
};

export const NamedVoicePlayButton = ({
  text,
  voiceId,
  voiceName,
  speed,
  readingMode,
  disabled = false,
  onStatusChange,
  onCacheStatusChange,
}: NamedVoicePlayButtonProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const handlePlay = async () => {
    const phrase = text.trim();

    if (!phrase) {
      onStatusChange?.("error", "Enter a French word or sentence first.");
      return;
    }

    if (!voiceId || !voiceName) {
      onStatusChange?.("error", "Choose a voice first.");
      return;
    }

    setIsLoading(true);
    onCacheStatusChange?.(null);
    onStatusChange?.("loading", `Preparing ${voiceName}...`);

    try {
      stopCurrentAudio();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase, voiceId, speed, readingMode }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `TTS failed with ${response.status}`);
      }

      const cacheStatus = response.headers.get("X-TTS-Cache");
      const audioUrl = URL.createObjectURL(await response.blob());
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      audioUrlRef.current = audioUrl;
      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
        stopCurrentAudio();
      };
      audio.onpause = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
      onCacheStatusChange?.(getCacheStatus(cacheStatus));
      onStatusChange?.("success", "");
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      stopCurrentAudio();
      onStatusChange?.(
        "error",
        error instanceof Error ? error.message : "Unable to generate audio.",
      );
    }
  };

  return (
    <button
      type="button"
      className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition-colors duration-200 hover:bg-stone-700 focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
      onClick={handlePlay}
      disabled={disabled || isLoading}
    >
      {isLoading || isPlaying ? (
        <AudioLines className="h-4 w-4" aria-hidden="true" />
      ) : (
        "Read aloud"
      )}
    </button>
  );
};

const getCacheStatus = (cacheStatus: string | null) => {
  if (cacheStatus === "HIT") return "hit";
  if (cacheStatus === "MISS") return "miss";
  return null;
};
