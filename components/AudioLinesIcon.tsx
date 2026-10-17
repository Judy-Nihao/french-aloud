"use client";

import { motion, useReducedMotion } from "motion/react";

// AudioLines geometry and timing adapted from the selected Lucide Animated icon.
const lines = [
  { normal: "M6 6v11", contracted: "M6 10v3", duration: 1.5 },
  { normal: "M10 3v18", contracted: "M10 9v5", duration: 1 },
  { normal: "M14 8v7", contracted: "M14 6v11", duration: 0.8 },
  { normal: "M18 5v13", contracted: "M18 7v9", duration: 1.5 },
];

export function AudioLinesIcon() {
  const reducedMotion = useReducedMotion();
  return (
    <svg
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 10v3" />
      {lines.map(({ normal, contracted, duration }) => (
        <motion.path
          key={normal}
          d={normal}
          initial={false}
          animate={{
            d: reducedMotion === false ? [normal, contracted, normal] : normal,
          }}
          transition={{
            duration: reducedMotion === false ? duration : 0,
            repeat: reducedMotion === false ? Infinity : 0,
          }}
        />
      ))}
      <path d="M22 10v3" />
    </svg>
  );
}
