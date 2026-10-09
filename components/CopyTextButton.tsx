"use client";

import { useEffect, useRef, useState } from "react";

export const quietButton =
  "min-h-11 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40";

export function CopyTextButton({ text }: { text: string }) {
  const [status, setStatus] = useState("Copy");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <button
      type="button"
      className={quietButton}
      disabled={!text.trim()}
      onClick={async () => {
        if (timer.current) clearTimeout(timer.current);
        try {
          await navigator.clipboard.writeText(text.trim());
          setStatus("Copied");
        } catch {
          setStatus("Copy failed. Try again");
        }
        timer.current = setTimeout(() => setStatus("Copy"), 2000);
      }}
    >
      <span aria-live="polite">{status}</span>
    </button>
  );
}
