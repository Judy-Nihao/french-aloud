"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import { PlayAudioButton } from "@/components/PlayAudioButton";
import { SpeechSpeedControl } from "@/components/SpeechSpeedControl";
import { CopyTextButton } from "@/components/CopyTextButton";
import { RecentReadings } from "@/components/RecentReadings";
import {
  addReading,
  parseReadings,
  HISTORY_KEY,
  type Reading,
} from "@/lib/reading-history";

import { voices, defaultVoiceId, type VoiceGender } from "@/lib/voices";

const voiceGroups: Array<{
  gender: VoiceGender;
  label: string;
  labelClassName: string;
  selectedClassName: string;
  selectedLabelClassName: string;
  placeholder: string;
}> = [
  {
    gender: "female",
    label: "Female voices",
    labelClassName: "bg-female-label text-female-ink",
    selectedClassName: "border-female-border bg-female-surface",
    selectedLabelClassName: "text-female-selected",
    placeholder: "Choose a female voice",
  },
  {
    gender: "male",
    label: "Male voices",
    labelClassName: "bg-male-label text-male-ink",
    selectedClassName: "border-male-border bg-male-surface",
    selectedLabelClassName: "text-male-selected",
    placeholder: "Choose a male voice",
  },
];

export const FrenchReader = () => {
  const [text, setText] = useState(
    "J’apprends le français parce que j’aime trop comment ça sonne.",
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState(defaultVoiceId);
  const [statusMessage, setStatusMessage] = useState("");
  const [cacheStatus, setCacheStatus] = useState<"hit" | "miss" | null>(null);
  const [speed, setSpeed] = useState(1);
  const [readings, setReadings] = useState<Reading[]>([]);
  const readingsRef = useRef<Reading[]>([]);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const saved = parseReadings(localStorage.getItem(HISTORY_KEY));
      readingsRef.current = saved;
      // Restore browser-only storage after hydration, keeping server markup deterministic.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReadings(saved);
    } catch {
      setStorageError(true);
    }
  }, []);

  const saveReadings = (next: Reading[]) => {
    readingsRef.current = next;
    setReadings(next);
    try {
      if (next.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      else localStorage.removeItem(HISTORY_KEY);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  const selectedVoice =
    voices.find((voice) => voice.id === selectedVoiceId) ?? null;

  return (
    <>
      <header>
        <div className="pt-5 md:pt-3">
          <h1 className="text-center font-heading text-5xl leading-tight font-semibold text-ink md:text-6xl">
            French Aloud
          </h1>
          <div className="absolute -top-11 right-[-0.5px] translate-y-[-0.5px]">
            <RecentReadings
              readings={readings}
              storageError={storageError}
              selectedText={text}
              onRemove={(removedText) =>
                saveReadings(
                  readingsRef.current.filter(
                    (reading) => reading.text !== removedText,
                  ),
                )
              }
              onRestore={(savedText) => {
                setText(savedText);
                setStatusMessage("");
                setCacheStatus(null);
              }}
            />
          </div>
        </div>
      </header>
      <section className="mt-9 md:mt-10">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <label
              className="font-medium text-body md:text-sm"
              htmlFor="french-text"
            >
              French text
            </label>
            <CopyTextButton text={text} />
          </div>
          <textarea
            id="french-text"
            className="field-sizing-content min-h-32 w-full resize-y overflow-y-auto rounded-control border border-border-control bg-surface px-4 py-4 leading-8 text-ink outline-none placeholder:text-placeholder focus:border-muted focus:ring-4 focus:ring-soft md:text-lg"
            placeholder="Type or paste French text…"
            rows={4}
            value={text}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setText(event.target.value);
              setStatusMessage("");
              setCacheStatus(null);
            }}
          />
        </div>

        <PlayAudioButton
          key={`${selectedVoiceId}:${text}`}
          text={text}
          voiceId={selectedVoice?.id ?? null}
          voiceName={selectedVoice?.name ?? null}
          speed={speed}
          onStatusChange={(state, message) => {
            setStatusMessage(state === "error" ? message : "");
          }}
          onCacheStatusChange={setCacheStatus}
          onPlaybackStart={(playedText) =>
            saveReadings(addReading(readingsRef.current, playedText))
          }
        />

        <div className="mt-8">
          <div className="grid gap-5 md:grid-cols-2">
            {voiceGroups.map((group) => {
              const groupVoices = voices.filter(
                (voice) => voice.gender === group.gender,
              );
              const selectId = `${group.gender}-voice`;
              const selectedGroupVoice = groupVoices.some(
                (voice) => voice.id === selectedVoiceId,
              )
                ? selectedVoiceId
                : "";
              const isSelected = Boolean(selectedGroupVoice);

              return (
                <div
                  key={group.gender}
                  className={`rounded-control border p-3 transition-colors duration-200 motion-reduce:transition-none ${
                    isSelected ? group.selectedClassName : "border-transparent"
                  }`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
                    <label
                      className={`inline-flex min-h-8 items-center rounded-md px-3 py-1.5 font-medium md:text-sm ${group.labelClassName}`}
                      htmlFor={selectId}
                    >
                      {group.label}
                    </label>

                    {isSelected ? (
                      <span
                        className={`font-semibold md:text-xs ${group.selectedLabelClassName}`}
                      >
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <select
                      id={selectId}
                      className={`min-h-12 w-full cursor-pointer appearance-none rounded-lg border bg-control-surface px-4 py-3 pr-11 font-medium text-control-ink transition-colors duration-150 outline-none hover:bg-control-hover focus:border-control-focus focus:ring-2 focus:ring-control-soft md:text-sm ${
                        isSelected
                          ? "border-control-focus"
                          : "border-control-outline"
                      }`}
                      value={selectedGroupVoice ?? ""}
                      onChange={(event) => {
                        setSelectedVoiceId(event.target.value);
                        setStatusMessage("");
                        setCacheStatus(null);
                      }}
                    >
                      <option value="" disabled>
                        {group.placeholder}
                      </option>
                      {groupVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-control-muted"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <SpeechSpeedControl value={speed} onChange={setSpeed} />

        <div aria-live="polite">
          {cacheStatus ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-control-border bg-control-surface px-2.5 py-1 font-medium text-control-muted md:text-xs">
              <span
                className="h-1.5 w-1.5 rounded-full bg-control-dot"
                aria-hidden="true"
              />
              API ·{" "}
              {cacheStatus === "hit" ? "Cached audio" : "New audio generated"}
            </p>
          ) : null}
        </div>

        <div aria-live="polite">
          {statusMessage ? (
            <p className="mt-3 rounded-lg bg-control-hover px-3 py-2.5 text-control-secondary md:text-sm">
              {statusMessage}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
};
