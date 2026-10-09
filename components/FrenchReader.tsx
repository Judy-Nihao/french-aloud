"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SpeechSpeedControl } from "@/components/SpeechSpeedControl";
import { PlayAudioButton } from "@/components/PlayAudioButton";

type VoiceType = "female" | "male";

const voiceOptions: Array<{ label: string; value: VoiceType }> = [
  { label: "Female voice", value: "female" },
  { label: "Male voice", value: "male" },
];

export const FrenchReader = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState(
    "J’apprends le français parce que j’aime trop comment ça sonne.",
  );
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState<VoiceType>("female");
  const [statusMessage, setStatusMessage] = useState(
    "Choose a voice, then listen.",
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-3">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="french-text"
        >
          French text
        </label>
        <textarea
          id="french-text"
          ref={textareaRef}
          className="min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-lg leading-7 text-slate-950 transition outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
          style={{ overflow: "hidden" }}
          value={text}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setText(event.target.value);
            setStatusMessage("");
          }}
        />
      </div>

      <fieldset className="mt-5 grid gap-3">
        <legend className="text-sm font-medium text-slate-700">Voice</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {voiceOptions.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              key={option.value}
            >
              <input
                checked={voice === option.value}
                className="h-4 w-4 accent-slate-950"
                name="voice"
                onChange={() => setVoice(option.value)}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <PlayAudioButton
        key={`${voice}:${text}`}
        idleLabel="Read aloud"
        text={text}
        voice={voice}
        speed={speed}
        onStatusChange={(state, message) => {
          setStatusMessage(message);
        }}
      />

      <SpeechSpeedControl value={speed} onChange={setSpeed} />

      <p
        className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-slate-600"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </section>
  );
};
