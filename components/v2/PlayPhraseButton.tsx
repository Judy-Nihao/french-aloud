"use client";

import { useRef, useState } from "react";
import { AudioLines } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useVoice } from "./VoiceContext";

const audioCache = new Map<string, Blob>();

type Props = {
  text: string;
  imageUrl?: string | null;
  iconClassName?: string;
  iconSize?: number;
  className?: string;
};

export default function PlayPhraseButton({
  text,
  imageUrl = null,
  iconClassName = "",
  iconSize = 20,
  className = "",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSavedRef = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">(
    "idle",
  );
  const { voice } = useVoice();

  const handlePlay = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const phrase = text.trim();
    if (!phrase || state === "loading") return;

    setState("loading");

    try {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
        audioRef.current.pause();
      }

      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        void supabase
          .from("cards")
          .insert({ content: phrase, image_url: imageUrl })
          .then(({ error }) => {
            if (error) {
              hasSavedRef.current = false;
              console.error(`Database insert failed: ${error.message}`);
            }
          });
      }

      const cacheKey = `${phrase}:${voice}`;
      let audioBlob = audioCache.get(cacheKey);

      if (!audioBlob) {
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

        audioBlob = await response.blob();
        audioCache.set(cacheKey, audioBlob);
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setState("idle");
      };
      audio.onpause = () => {
        setState("idle");
      };

      await audio.play();
      setState("playing");
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };

  const isLoading = state === "loading";
  const isPlaying = state === "playing";

  return (
    <button
      type="button"
      className={`border-fa-primary/15 bg-fa-bg/95 text-fa-primary hover:bg-fa-card focus:ring-fa-primary/25 relative z-20 flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border p-2 shadow-[0_5px_16px_rgba(28,26,23,0.16),0_1px_3px_rgba(28,26,23,0.08)] transition hover:scale-105 focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-wait disabled:opacity-70 ${className}`}
      onClick={handlePlay}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      disabled={isLoading}
      aria-label={
        isPlaying
          ? `Playing ${text}`
          : isLoading
            ? `Loading ${text}`
            : `Play ${text}`
      }
    >
      <AudioLines
        size={iconSize}
        strokeWidth={1.75}
        className={`${iconClassName || "text-fa-primary"} ${isPlaying ? "animate-pulse" : ""}`}
      />
    </button>
  );
}
