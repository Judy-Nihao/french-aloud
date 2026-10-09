"use client";

import { useSpeechPlayback } from "@/components/useSpeechPlayback";

type PlayAudioButtonProps = {
  idleLabel: string;
  text: string;
  voice: "female" | "male";
  speed?: number;
  disabled?: boolean;
  onStatusChange?: (
    state: "loading" | "success" | "error",
    message: string,
  ) => void;
};

export const PlayAudioButton = ({
  idleLabel,
  text,
  voice,
  speed = 1,
  disabled = false,
  onStatusChange,
}: PlayAudioButtonProps) => {
  const { state, play, stop } = useSpeechPlayback({ speed, onStatusChange });
  const busy = state !== "idle";
  return (
    <button
      type="button"
      className="mt-4 w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
      onClick={() => {
        if (busy) {
          stop();
          return;
        }
        if (!text.trim()) {
          onStatusChange?.("error", "Enter a French word or sentence first.");
          return;
        }
        void play({ text: text.trim(), voice }, `${voice} voice`);
      }}
      disabled={disabled && !busy}
    >
      {state === "loading"
        ? "Cancel"
        : state === "playing"
          ? "Stop playback"
          : idleLabel}
    </button>
  );
};
