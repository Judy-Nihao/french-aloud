"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { RotateCcw } from "lucide-react";
import { NamedVoicePlayButton } from "@/components/NamedVoicePlayButton";

type VoiceGender = "female" | "male";

type PublicVoice = {
  id: string;
  name: string;
  gender: VoiceGender;
  category: string | null;
  description: string | null;
  labels: Record<string, string>;
  previewUrl: string | null;
  isDefault: boolean;
};

type VoiceListResponse = {
  voices?: PublicVoice[];
  error?: string;
};

const voiceGroups: Array<{ gender: VoiceGender; label: string }> = [
  { gender: "female", label: "Female voices" },
  { gender: "male", label: "Male voices" },
];

export const NamedVoiceReader = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState(
    "J’apprends le français parce que j’aime trop comment ça sonne.",
  );
  const [voices, setVoices] = useState<PublicVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [voiceListStatus, setVoiceListStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [voiceListError, setVoiceListError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Choose a voice, then listen.",
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    const controller = new AbortController();

    const loadVoices = async () => {
      try {
        const response = await fetch("/api/voices", {
          signal: controller.signal,
        });
        const data = (await response.json()) as VoiceListResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load voices.");
        }

        const availableVoices = data.voices ?? [];

        if (availableVoices.length === 0) {
          throw new Error("No voices are available right now.");
        }

        setVoices(availableVoices);
        setSelectedVoiceId(
          availableVoices.find((voice) => voice.isDefault)?.id ??
            availableVoices[0].id,
        );
        setVoiceListStatus("ready");
        setVoiceListError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setVoiceListStatus("error");
        setVoiceListError(
          error instanceof Error ? error.message : "Unable to load voices.",
        );
      }
    };

    void loadVoices();

    return () => controller.abort();
  }, [loadAttempt]);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.id === selectedVoiceId) ?? null,
    [selectedVoiceId, voices],
  );

  return (
    <section className="mt-10">
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-stone-800" htmlFor="text">
          French text
        </label>
        <textarea
          id="text"
          ref={textareaRef}
          className="min-h-36 w-full resize-y rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-lg leading-8 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          style={{ overflow: "hidden" }}
          value={text}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setText(event.target.value);
          }}
        />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold text-stone-800">Voice</h2>
          {selectedVoice ? (
            <p className="truncate text-xs text-stone-500">
              Selected: {selectedVoice.name}
            </p>
          ) : null}
        </div>

        {voiceListStatus === "loading" ? <VoiceListSkeleton /> : null}

        {voiceListStatus === "error" ? (
          <div
            className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-4"
            role="alert"
          >
            <p className="text-sm text-stone-700">{voiceListError}</p>
            <button
              type="button"
              className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200 focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => {
                setVoiceListStatus("loading");
                setLoadAttempt((attempt) => attempt + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}

        {voiceListStatus === "ready" ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {voiceGroups.map((group) => {
              const groupVoices = voices.filter(
                (voice) => voice.gender === group.gender,
              );

              return (
                <fieldset className="min-w-0" key={group.gender}>
                  <legend className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    {group.label}
                  </legend>
                  <div className="overflow-hidden rounded-lg border border-stone-300 bg-stone-50">
                    {groupVoices.map((voice, index) => {
                      const isSelected = voice.id === selectedVoiceId;

                      return (
                        <label
                          className={`flex min-h-16 cursor-pointer items-start gap-3 px-3.5 py-3 transition-colors duration-150 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-stone-500 focus-within:ring-inset ${
                            index > 0 ? "border-t border-stone-200" : ""
                          } ${
                            isSelected
                              ? "bg-stone-200/70"
                              : "hover:bg-stone-100"
                          }`}
                          key={voice.id}
                        >
                          <input
                            checked={isSelected}
                            className="mt-1 h-4 w-4 shrink-0 accent-stone-900"
                            name="voiceId"
                            onChange={() => setSelectedVoiceId(voice.id)}
                            type="radio"
                            value={voice.id}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-stone-900">
                              {voice.name}
                            </span>
                            {voice.description ? (
                              <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-stone-600">
                                {voice.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        ) : null}
      </div>

      <NamedVoicePlayButton
        text={text}
        voiceId={selectedVoice?.id ?? null}
        voiceName={selectedVoice?.name ?? null}
        disabled={voiceListStatus !== "ready" || isGenerating}
        onStatusChange={(state, message) => {
          setIsGenerating(state === "loading");
          setStatusMessage(message);
        }}
      />

      <p
        className="mt-4 min-h-10 rounded-lg bg-stone-100 px-3 py-2.5 text-sm text-stone-600"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </section>
  );
};

const VoiceListSkeleton = () => (
  <div
    className="grid gap-6 sm:grid-cols-2"
    aria-label="Loading voices"
    role="status"
  >
    {["Female voices", "Male voices"].map((label) => (
      <div key={label}>
        <div className="mb-2 h-3 w-24 rounded bg-stone-200 motion-safe:animate-pulse" />
        <div className="overflow-hidden rounded-lg border border-stone-200">
          {[0, 1, 2].map((item) => (
            <div
              className="flex min-h-16 items-center gap-3 border-t border-stone-200 px-3.5 first:border-t-0"
              key={item}
            >
              <div className="h-4 w-4 rounded-full bg-stone-200 motion-safe:animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-stone-200 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
