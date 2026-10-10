"use client";

import { Square, Volume2, X } from "lucide-react";
import { useSpeechPlayback } from "@/components/useSpeechPlayback";

type PlayAudioButtonProps = {
  onPlaybackStart?: (text: string) => void;
  text: string;
  voiceId: string | null;
  voiceName: string | null;
  speed: number;
  disabled?: boolean;
  onStatusChange?: (
    state: "loading" | "success" | "error",
    message: string,
  ) => void;
  onCacheStatusChange?: (status: "hit" | "miss" | null) => void;
};

export const PlayAudioButton = ({
  text,
  voiceId,
  voiceName,
  speed,
  disabled = false,
  onStatusChange,
  onCacheStatusChange,
  onPlaybackStart,
}: PlayAudioButtonProps) => {
  const { state, play, stop } = useSpeechPlayback({
    speed,
    onStatusChange,
    onCacheStatusChange,
    onPlaybackStart,
  });
  const busy = state !== "idle";
  const ActionIcon =
    state === "loading" ? X : state === "playing" ? Square : Volume2;
  const handleClick = () => {
    if (busy) {
      stop();
      return;
    }
    if (!text.trim()) {
      onStatusChange?.("error", "Enter a French word or sentence first.");
      return;
    }
    if (!voiceId || !voiceName) {
      onStatusChange?.("error", "Choose a voice first.");
      return;
    }
    void play({ text: text.trim(), voiceId }, voiceName);
  };
  return (
    <button
      type="button"
      data-playing={state === "playing" ? "true" : undefined}
      className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-ink px-4 py-3 font-medium text-surface transition-colors duration-200 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-border-control focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-border-control disabled:text-secondary data-[playing=true]:bg-success data-[playing=true]:hover:bg-success-hover motion-reduce:transition-none md:text-sm"
      onClick={handleClick}
      disabled={disabled && !busy}
    >
      <ActionIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {state === "loading"
        ? "Cancel"
        : state === "playing"
          ? "Stop playback"
          : "Read aloud"}
    </button>
  );
};
