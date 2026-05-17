"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type CheckState = "idle" | "loading" | "success" | "error";
type CreatedCard = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};
type VoiceType = "female" | "male";

const voiceOptions: Array<{ label: string; value: VoiceType }> = [
  { label: "Female voice", value: "female" },
  { label: "Male voice", value: "male" },
];

const getCacheMessage = (cacheStatus: string | null) => {
  if (cacheStatus === "HIT") {
    return "Using the cached audio.";
  }

  if (cacheStatus === "MISS") {
    return "Calling the TTS API and caching the audio.";
  }

  return "Cache status unavailable.";
};

export const TestIntegrationPanel = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState(
    "J’apprends le français parce que j’aime trop comment ça sonne.",
  );
  const [voice, setVoice] = useState<VoiceType>("female");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ttsState, setTtsState] = useState<CheckState>("idle");
  const [ttsMessage, setTtsMessage] = useState("ElevenLabs TTS not tested yet");
  const [supabaseState, setSupabaseState] = useState<CheckState>("idle");
  const [supabaseMessage, setSupabaseMessage] = useState(
    "Supabase not tested yet",
  );
  const [cardState, setCardState] = useState<CheckState>("idle");
  const [cardMessage, setCardMessage] = useState("No test card created yet");
  const [createdCard, setCreatedCard] = useState<CreatedCard | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

  const playText = async (phrase: string) => {
    if (!phrase) {
      setTtsState("error");
      setTtsMessage("Enter a French word or sentence first");
      return;
    }

    setTtsState("loading");
    setTtsMessage("Calling /api/tts...");

    try {
      audioRef.current?.pause();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase, voice }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `TTS failed with ${response.status}`);
      }

      const cacheStatus = response.headers.get("X-TTS-Cache");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(audioUrl);

      await audio.play();
      setTtsState("success");
      setTtsMessage(
        `TTS succeeded with ${voice} voice. ${getCacheMessage(cacheStatus)}`,
      );
    } catch (error) {
      setTtsState("error");
      setTtsMessage(error instanceof Error ? error.message : "TTS test failed");
    }
  };

  const testTts = async () => {
    await playText(text.trim());
  };

  const testSupabase = async () => {
    setSupabaseState("loading");
    setSupabaseMessage("Reading the cards table...");

    const { count, error } = await supabase
      .from("cards")
      .select("id", { count: "exact", head: true });

    if (error) {
      setSupabaseState("error");
      setSupabaseMessage(error.message);
      return;
    }

    setSupabaseState("success");
    setSupabaseMessage(
      `Supabase connected. The cards table has ${count ?? 0} rows.`,
    );
  };

  const createVoiceCard = async () => {
    const content = text.trim();

    if (!content) {
      setCardState("error");
      setCardMessage("Enter card text first");
      return;
    }

    setCardState("loading");
    setCardMessage("Creating a voice card...");

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop() ?? "jpg";
        const safeName = imageFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .slice(0, 40);
        const filePath = `${crypto.randomUUID()}-${safeName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("card-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from("card-images")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { data: card, error: insertError } = await supabase
        .from("cards")
        .insert({ content, image_url: imageUrl })
        .select("id, content, image_url, created_at")
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setCreatedCard(card);
      setCardState("success");
      setCardMessage("Card saved to Supabase. Play the audio when ready.");
    } catch (error) {
      setCardState("error");
      setCardMessage(
        error instanceof Error ? error.message : "Failed to create voice card",
      );
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-950">
          Integration test panel
        </p>
        <p className="text-sm leading-6 text-slate-600">
          Check Supabase reads, Storage uploads, database inserts, and the
          ElevenLabs TTS route from one small workflow.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="tts-text"
        >
          Test text
        </label>
        <textarea
          id="tts-text"
          ref={textareaRef}
          className="min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base leading-6 text-slate-950 transition outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
          style={{ overflow: "hidden" }}
          value={text}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setText(event.target.value);
            const textarea = event.target;
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
          }}
        />
      </div>

      <fieldset className="mt-4 grid gap-3">
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
      <button
        type="button"
        className="mt-4 w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
        onClick={testTts}
        disabled={ttsState === "loading"}
      >
        {ttsState === "loading" ? "Playing..." : "Test pronunciation"}
      </button>
      <button
        type="button"
        className="mt-4 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
        onClick={testSupabase}
        disabled={supabaseState === "loading"}
      >
        {supabaseState === "loading" ? "Checking..." : "Test Supabase"}
      </button>
      <div className="mt-4 grid gap-3">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="card-image"
        >
          Test image
        </label>
        <input
          id="card-image"
          type="file"
          accept="image/*"
          className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800 hover:file:bg-slate-200 focus:ring-4 focus:ring-slate-200 focus:outline-none"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={createVoiceCard}
          disabled={cardState === "loading"}
        >
          {cardState === "loading" ? "Creating..." : "Create voice card"}
        </button>
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <StatusLine label="TTS" state={ttsState} message={ttsMessage} />
        <StatusLine
          label="Supabase"
          state={supabaseState}
          message={supabaseMessage}
        />
        <StatusLine label="Card" state={cardState} message={cardMessage} />
      </div>

      {createdCard ? (
        <article className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {createdCard.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="aspect-4/3 w-full object-cover"
              src={createdCard.image_url}
              alt=""
            />
          ) : null}
          <button
            type="button"
            className="absolute top-3 right-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 focus:outline-none"
            onClick={() => {
              setCreatedCard(null);
              setCardState("idle");
              setCardMessage("No test card created yet");
            }}
            aria-label="Reset created card"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid gap-3 p-4">
            <p className="text-lg leading-7 font-medium text-slate-950">
              {createdCard.content}
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="w-full cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 focus:outline-none"
                onClick={() => playText(createdCard.content)}
              >
                Play the audio
              </button>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
};

const StatusLine = ({
  label,
  state,
  message,
}: {
  label: string;
  state: CheckState;
  message: string;
}) => {
  const stateClass = {
    idle: "bg-slate-300",
    loading: "bg-amber-400",
    success: "bg-emerald-500",
    error: "bg-red-500",
  }[state];

  return (
    <p className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-slate-700">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stateClass}`}
        aria-hidden="true"
      />
      <span>
        <span className="font-medium text-slate-950">{label}: </span>
        {message}
      </span>
    </p>
  );
};
