"use client";

import Image from "next/image";
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
    <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {card.image_url ? (
        <div className="relative aspect-4/3">
          <Image
            className="object-cover"
            src={card.image_url}
            alt=""
            fill
            sizes="(min-width: 768px) 704px, 100vw"
          />
        </div>
      ) : null}

      <div className="grid gap-3 p-4">
        <p className="min-w-0 text-lg leading-7 font-medium text-slate-950">
          {card.content}
        </p>

        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <div>
            <PlayAudioButton
              idleLabel="Play the audio"
              text={card.content}
              voice={voice}
            />
          </div>

          <div className="mt-2">
            <button
              type="button"
              className="w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 focus:outline-none"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
