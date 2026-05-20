"use client";

import { motion } from "framer-motion";
import type { CardData } from "./data";
import PlayPhraseButton from "./PlayPhraseButton";
import ShapeBlock from "./ShapeBlock";

type Props = {
  card: CardData;
  variant: "A" | "B";
  enterDelay?: number;
};

function textSize(content: string): string {
  const len = content.length;
  if (len <= 7) return "text-[clamp(1.75rem,5vw,2.25rem)] leading-[1.0]";
  if (len <= 14) return "text-[clamp(1.375rem,3.5vw,1.75rem)] leading-[1.05]";
  if (len <= 25) return "text-[clamp(1.1rem,2.8vw,1.375rem)] leading-[1.1]";
  return "text-[clamp(0.95rem,2.2vw,1.2rem)] leading-[1.2]";
}

export default function Card({ card, variant, enterDelay = 0 }: Props) {
  const hasImage = Boolean(card.imageUrl);
  const isWhiteText = card.color.textClass === "text-white";
  const textColor = isWhiteText
    ? "rgba(255,255,255,0.96)"
    : "rgba(28,26,23,0.9)";
  const annotColor = isWhiteText
    ? "rgba(255,255,255,0.65)"
    : "rgba(28,26,23,0.55)";
  const iconClassName = isWhiteText ? "text-fa-primary" : "text-fa-accent";

  const tilt =
    variant === "B"
      ? { transform: `rotate(${card.shapeIndex % 2 === 0 ? 1.2 : -1.0}deg)` }
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: enterDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileTap={{ scale: 0.93, y: 3 }}
      className="relative cursor-pointer overflow-hidden rounded-2xl"
      style={{
        ...tilt,
        boxShadow:
          "0 4px 14px rgba(28,26,23,0.18), 0 1px 3px rgba(28,26,23,0.08)",
      }}
    >
      <div
        className="flex min-h-[26rem] flex-col"
        style={{ background: card.color.hex }}
      >
        {hasImage && (
          <div className="p-3">
            <div className="aspect-square w-full">
              <ShapeBlock
                shapeIndex={card.shapeIndex}
                color={card.color.hex}
                imageSrc={card.imageUrl ?? undefined}
              />
            </div>
          </div>
        )}
        <div
          className={`flex flex-1 flex-col gap-1 px-3 pt-0.5 pb-3 ${
            hasImage ? "" : "text-center"
          }`}
        >
          <div
            className={`flex flex-col ${
              hasImage ? "" : "flex-1 justify-center"
            }`}
          >
            <p
              lang="fr"
              className={`font-display ${
                hasImage
                  ? textSize(card.french)
                  : "text-[clamp(2.5rem,10vw,4.5rem)] leading-[1.02]"
              }`}
              style={{ color: textColor }}
            >
              {card.french}
            </p>
            {card.english && (
              <p
                className="font-hand text-[0.75rem] leading-[1.3]"
                style={{ color: annotColor }}
              >
                {card.english}
              </p>
            )}
          </div>
          <div className="mt-auto flex justify-center pt-3">
            <PlayPhraseButton
              text={card.french}
              imageUrl={card.imageUrl}
              iconSize={18}
              iconClassName={iconClassName}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
