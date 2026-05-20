"use client";

import { useId } from "react";
import { CARD_SHAPES } from "./shapes";

type Props = {
  shapeIndex: number;
  color: string;
  imageSrc?: string;
  className?: string;
};

export default function ShapeBlock({
  shapeIndex,
  color,
  imageSrc,
  className = "",
}: Props) {
  const uid = useId();
  const shape = CARD_SHAPES[shapeIndex % CARD_SHAPES.length];
  const [vbX, vbY, vbW, vbH] = shape.viewBox.split(" ").map(Number);
  const shapeScale = Math.min(vbW / shape.bounds.width, vbH / shape.bounds.height);
  const shapeX =
    vbX + (vbW - shape.bounds.width * shapeScale) / 2 - shape.bounds.x * shapeScale;
  const shapeY =
    vbY + (vbH - shape.bounds.height * shapeScale) / 2 - shape.bounds.y * shapeScale;
  const shapeTransform = `translate(${shapeX} ${shapeY}) scale(${shapeScale})`;
  const clipId = `clip${uid.replace(/:/g, "")}`;

  return (
    <div className={`h-full w-full overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={shape.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="block"
      >
        {imageSrc ? (
          <>
            <defs>
              <clipPath id={clipId}>
                <path d={shape.path} transform={shapeTransform} />
              </clipPath>
            </defs>
            <image
              href={imageSrc}
              x="0"
              y="0"
              width={vbW}
              height={vbH}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          </>
        ) : (
          <path d={shape.path} transform={shapeTransform} fill={color} />
        )}
      </svg>
    </div>
  );
}
