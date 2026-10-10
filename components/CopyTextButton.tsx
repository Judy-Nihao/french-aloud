"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

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
    <Button
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
    </Button>
  );
}
