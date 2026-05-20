"use client";

import { useState, useRef, useEffect, type FocusEvent, type FormEvent } from "react";
import { ArrowUp, ImagePlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import CarouselCards from "./CarouselCards";
import { CARD_COLORS, type CardData } from "./data";

const SHAPE_COUNT = 6;
const COLOR_COUNT = CARD_COLORS.length;

function stableIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

type DbRow = {
  id: string;
  content: string;
  translation: string | null;
  image_url: string | null;
};

function rowToCard(row: DbRow): CardData {
  return {
    id: row.id,
    french: row.content,
    english: row.translation ?? undefined,
    imageUrl: row.image_url,
    color: CARD_COLORS[stableIndex(row.id, COLOR_COUNT)],
    shapeIndex: stableIndex(row.id + "shape", SHAPE_COUNT),
  };
}

const Input = () => {
  const [french, setFrench] = useState("");
  const [english, setEnglish] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [focusCardId, setFocusCardId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("cards")
      .select("id, content, translation, image_url")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setCards((data as DbRow[]).map(rowToCard));
        }
      });
  }, []);

  const canSubmit = french.trim().length > 0 && !isSubmitting;

  const handleFormBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;
    if (
      nextFocusedElement instanceof Node &&
      formRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }
    setIsExpanded(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const phrase = french.trim();
      const translation = english.trim();
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

      const { data: savedCard, error: insertError } = await supabase
        .from("cards")
        .insert({
          content: phrase,
          translation: translation || null,
          image_url: imageUrl,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      const newCard: CardData = {
        id: savedCard.id,
        french: phrase,
        english: translation || undefined,
        imageUrl,
        color: CARD_COLORS[stableIndex(savedCard.id, COLOR_COUNT)],
        shapeIndex: stableIndex(savedCard.id + "shape", SHAPE_COUNT),
      };

      setCards((prev) => [newCard, ...prev]);
      setFocusCardId(newCard.id);
      setFrench("");
      setEnglish("");
      setImageFile(null);
      setIsExpanded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      inputRef.current?.blur();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create card",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) console.error(`Failed to delete card: ${error.message}`);
  };

  return (
    <div className="relative">
      <CarouselCards
        cards={cards}
        focusCardId={focusCardId}
        onDeleteCard={handleDeleteCard}
      />

      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onMouseDown={() => setIsExpanded(false)}
        />
      )}
      <div className="fixed bottom-10 left-1/2 z-50 w-[90vw] max-w-2xl -translate-x-1/2">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onFocus={() => setIsExpanded(true)}
          onBlur={handleFormBlur}
        >
          <div className="border-fa-bg/10 bg-fa-primary/95 flex flex-col overflow-hidden rounded-3xl border p-3 shadow-[0_12px_40px_rgba(28,26,23,0.28)] backdrop-blur-md duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <input
              ref={inputRef}
              value={french}
              onChange={(e) => setFrench(e.target.value)}
              placeholder="Read some French aloud for me"
              className="text-fa-bg/90 caret-fa-bg/70 placeholder:text-fa-bg/35 bg-fa-bg/10 focus:bg-fa-bg/15 min-h-11 w-full min-w-0 rounded-xl px-4 text-sm transition outline-none"
            />
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-2 pt-2">
                  <input
                    value={english}
                    onChange={(e) => setEnglish(e.target.value)}
                    placeholder="English"
                    tabIndex={isExpanded ? 0 : -1}
                    className="text-fa-bg/85 caret-fa-bg/70 placeholder:text-fa-bg/35 bg-fa-bg/10 focus:bg-fa-bg/15 min-h-11 min-w-0 rounded-xl px-4 text-sm transition outline-none"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] ?? null)
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      tabIndex={isExpanded ? 0 : -1}
                      className="text-fa-bg/80 hover:bg-fa-bg/15 bg-fa-bg/10 flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm transition"
                      onClick={() => {
                        setIsExpanded(true);
                        fileInputRef.current?.click();
                      }}
                      aria-label={imageFile ? imageFile.name : "Add image"}
                    >
                      <ImagePlus size={17} strokeWidth={2} />
                      <span className="truncate">
                        {imageFile ? imageFile.name : "Add image or take photo"}
                      </span>
                    </button>
                    {imageFile && (
                      <button
                        type="button"
                        tabIndex={isExpanded ? 0 : -1}
                        className="text-fa-bg/55 hover:text-fa-bg hover:bg-fa-bg/15 bg-fa-bg/10 flex min-h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition"
                        onClick={() => {
                          setImageFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    tabIndex={isExpanded ? 0 : -1}
                    disabled={!canSubmit}
                    aria-label="Add card"
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-medium transition ${
                      canSubmit
                        ? "bg-fa-bg text-fa-primary hover:brightness-95 active:scale-[0.98]"
                        : "bg-fa-bg/15 text-fa-bg/30 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Input;
