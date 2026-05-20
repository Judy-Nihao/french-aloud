"use client";

import { motion } from "framer-motion";
import { useVoice, type Voice } from "./VoiceContext";

const OPTIONS: { value: Voice; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export default function VoiceSwitch() {
  const { voice, setVoice } = useVoice();

  return (
    <div className="border-fa-primary/20 bg-fa-primary/12 fixed top-10 left-1/2 z-50 flex -translate-x-1/2 rounded-full border p-1 shadow-sm backdrop-blur-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setVoice(opt.value)}
          className="relative cursor-pointer px-3.5 py-1.5 text-xs transition"
        >
          {voice === opt.value && (
            <motion.span
              layoutId="voice-indicator"
              className="bg-fa-primary/30 absolute inset-0 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 font-medium transition-colors ${
              voice === opt.value ? "text-fa-primary" : "text-fa-primary/40"
            }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
