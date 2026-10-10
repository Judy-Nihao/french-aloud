"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
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
  const [voices, setVoices] = useState<PublicVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [voiceListStatus, setVoiceListStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [voiceListError, setVoiceListError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
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
    <>
      <header>
        <div className="pt-5 sm:pt-3">
          <h1 className="text-center font-heading text-4xl leading-tight font-semibold text-ink sm:text-6xl">
            French Aloud
          </h1>
          <div className="absolute -top-11 right-6 -translate-y-[0.5px] sm:right-8">
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
      <section className="mt-9 sm:mt-10">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-medium text-body"
              htmlFor="french-text"
            >
              French text
            </label>
            <CopyTextButton text={text} />
          </div>
          <textarea
            id="french-text"
            className="field-sizing-content min-h-32 w-full resize-y overflow-y-auto rounded-control border border-border-control bg-surface px-4 py-4 text-lg leading-8 text-ink outline-none placeholder:text-placeholder focus:border-muted focus:ring-4 focus:ring-soft"
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
          disabled={voiceListStatus !== "ready"}
          onStatusChange={(state, message) => {
            setStatusMessage(state === "error" ? message : "");
          }}
          onCacheStatusChange={setCacheStatus}
          onPlaybackStart={(playedText) =>
            saveReadings(addReading(readingsRef.current, playedText))
          }
        />

        <div className="mt-8">
          {voiceListStatus === "loading" ? <VoiceListSkeleton /> : null}

          {voiceListStatus === "error" ? (
            <div
              className="rounded-lg border border-control-outline bg-control-surface px-4 py-4"
              role="alert"
            >
              <p className="text-sm text-control-body">{voiceListError}</p>
              <button
                type="button"
                className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-control-outline bg-control-hover px-3 py-2 text-sm font-medium text-control-strong hover:bg-control-soft focus-visible:ring-2 focus-visible:ring-control-focus focus-visible:ring-offset-2 focus-visible:outline-none"
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
            <>
              <div className="grid gap-5 sm:grid-cols-2">
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
                        isSelected
                          ? group.selectedClassName
                          : "border-transparent"
                      }`}
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
                        <label
                          className={`inline-flex min-h-8 items-center rounded-md px-3 py-1.5 text-sm font-medium ${group.labelClassName}`}
                          htmlFor={selectId}
                        >
                          {group.label}
                        </label>

                        {isSelected ? (
                          <span
                            className={`text-xs font-semibold ${group.selectedLabelClassName}`}
                          >
                            Selected
                          </span>
                        ) : null}
                      </div>

                      <div className="relative">
                        <select
                          id={selectId}
                          className={`min-h-12 w-full cursor-pointer appearance-none rounded-lg border bg-control-surface px-4 py-3 pr-11 text-sm font-medium text-control-ink transition-colors duration-150 outline-none hover:bg-control-hover focus:border-control-focus focus:ring-2 focus:ring-control-soft ${
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
            </>
          ) : null}
        </div>

        <SpeechSpeedControl value={speed} onChange={setSpeed} />

        <div aria-live="polite">
          {cacheStatus ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-control-border bg-control-surface px-2.5 py-1 text-xs font-medium text-control-muted">
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
            <p className="mt-3 rounded-lg bg-control-hover px-3 py-2.5 text-sm text-control-secondary">
              {statusMessage}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
};

const VoiceListSkeleton = () => (
  <div
    className="grid gap-5 sm:grid-cols-2"
    aria-label="Loading voices"
    role="status"
  >
    {voiceGroups.map((group) => (
      <div key={group.gender} className="motion-safe:animate-pulse">
        <div className="mb-2 h-8 w-32 rounded-md bg-control-soft" />
        <div className="h-12 w-full rounded-lg border border-control-border bg-control-soft" />
      </div>
    ))}
  </div>
);
