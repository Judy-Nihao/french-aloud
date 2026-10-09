"use client";

import { useSpeechPlayback } from "@/components/useSpeechPlayback";

type NamedVoicePlayButtonProps = {
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

export const NamedVoicePlayButton = ({
  text,
  voiceId,
  voiceName,
  speed,
  disabled = false,
  onStatusChange,
  onCacheStatusChange,
}: NamedVoicePlayButtonProps) => {
  const { state, play, stop } = useSpeechPlayback({
    speed,
    onStatusChange,
    onCacheStatusChange,
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
      className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition-colors duration-200 hover:bg-stone-700 focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
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
