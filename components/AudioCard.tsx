"use client";

import { X } from "lucide-react";
import { PlayAudioButton } from "@/components/PlayAudioButton";

type VoiceType = "female" | "male";

type Card = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

type AudioCardProps = {
  card: Card;
  voice: VoiceType;
  onReset: () => void;
};

export const AudioCard = ({ card, voice, onReset }: AudioCardProps) => {
  return (
    <article className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="aspect-4/3 w-full object-cover"
          src={card.image_url}
          alt=""
        />
      ) : null}

      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 text-lg leading-7 font-medium text-slate-950">
            {card.content}
          </p>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 focus:outline-none"
            onClick={onReset}
            aria-label="Reset created card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <PlayAudioButton
            idleLabel="Play the audio"
            activeLabel="Playing audio"
            text={card.content}
            voice={voice}
          />
        </div>
      </div>
    </article>
  );
};
