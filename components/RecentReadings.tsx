"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Reading } from "@/lib/reading-history";

export function RecentReadings({
  readings,
  onRestore,
  onRemove,
  storageError,
  selectedText,
}: {
  readings: Reading[];
  onRestore: (text: string) => void;
  onRemove: (text: string) => void;
  selectedText: string;
  storageError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      swipeDirection={desktop ? "right" : "down"}
    >
      <Drawer.Trigger className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-slate-50/80 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:outline-none">
        Recent readings{readings.length ? ` (${readings.length})` : ""}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="reading-drawer-backdrop fixed inset-0 z-40 bg-slate-950/30" />
        <Drawer.Viewport
          className={`fixed inset-0 z-50 flex ${desktop ? "justify-end" : "items-end"}`}
        >
          <Drawer.Popup
            className={`reading-drawer-popup flex flex-col border border-slate-200 bg-slate-50 text-slate-900 shadow-xl outline-none ${desktop ? "h-full w-96 max-w-full" : "max-h-[85dvh] w-full rounded-t-3xl"}`}
          >
            <Drawer.Content className="flex min-h-0 flex-1 flex-col">
              {!desktop && (
                <div
                  className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-300"
                  aria-hidden="true"
                />
              )}
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <Drawer.Title className="text-xl font-semibold">
                    Recent readings
                  </Drawer.Title>
                  <Drawer.Close
                    className={iconButton}
                    aria-label="Close recent readings"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Drawer.Close>
                </div>
                <Drawer.Description className="mt-2 text-sm text-slate-500">
                  Your last 10 texts, saved in this browser.
                </Drawer.Description>
                {storageError && (
                  <p role="status" className="mt-2 text-sm text-slate-600">
                    Browser storage is unavailable. History lasts for this visit
                    only.
                  </p>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                {!readings.length && (
                  <p className="py-8 text-sm text-slate-500">
                    Texts appear here when playback starts.
                  </p>
                )}
                <ol className="grid gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  {readings.map((reading) => {
                    const selected = selectedText.trim() === reading.text;
                    return (
                      <li key={reading.text} className="relative">
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onRestore(reading.text)}
                          className={`w-full cursor-pointer rounded-xl border p-4 pr-14 text-left transition-[opacity,border-color,background-color] duration-150 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none active:opacity-70 motion-reduce:transition-none ${selected ? "border-slate-400 bg-slate-200/60 opacity-100" : "border-slate-200 bg-slate-100/40 opacity-80 hover:border-slate-300 hover:bg-slate-200/40 hover:opacity-100"}`}
                        >
                          <span
                            lang="fr"
                            className="block text-base leading-7 break-words whitespace-pre-wrap"
                          >
                            {reading.text}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`${iconButton} absolute top-1 right-1`}
                          aria-label={`Delete reading: ${reading.text}`}
                          onClick={() => onRemove(reading.text)}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const iconButton =
  "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
