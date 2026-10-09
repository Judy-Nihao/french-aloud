"use client";

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
      className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-50 transition-colors duration-200 hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-slate-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      onClick={handleClick}
      disabled={disabled && !busy}
    >
      {state === "loading"
        ? "Cancel"
        : state === "playing"
          ? "Stop playback"
          : "Read aloud"}
    </button>
  );
};
