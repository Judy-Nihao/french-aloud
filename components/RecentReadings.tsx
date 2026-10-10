"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    const query = window.matchMedia("(min-width: 768px)");
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
      <Drawer.Trigger render={<Button variant="tab" />}>
        Recent readings{readings.length ? ` (${readings.length})` : ""}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="reading-drawer-backdrop fixed inset-0 z-40 bg-ink/30" />
        <Drawer.Viewport
          className={`fixed inset-0 z-50 flex ${desktop ? "justify-end" : "items-end"}`}
        >
          <Drawer.Popup
            className={`reading-drawer-popup flex flex-col border border-border bg-surface text-strong shadow-drawer outline-none ${desktop ? "h-full w-96 max-w-full" : "max-h-[85dvh] w-full rounded-t-panel"}`}
          >
            <Drawer.Content className="flex min-h-0 flex-1 flex-col">
              {!desktop && (
                <div
                  className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-control"
                  aria-hidden="true"
                />
              )}
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <Drawer.Title className="font-medium md:text-xl">
                    Recent readings
                  </Drawer.Title>
                  <Drawer.Close
                    render={<Button variant="icon-circle" className="mr-1" />}
                    aria-label="Close recent readings"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Drawer.Close>
                </div>
                <Drawer.Description className="mt-2 text-secondary md:text-sm">
                  Your last 10 texts, saved in this browser.
                </Drawer.Description>
                {storageError && (
                  <p role="status" className="mt-2 text-secondary md:text-sm">
                    Browser storage is unavailable. History lasts for this visit
                    only.
                  </p>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                {!readings.length && (
                  <p className="py-8 text-secondary md:text-sm">
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
                          className={`w-full cursor-pointer rounded-control border p-4 pr-14 text-left transition-[border-color,background-color] duration-150 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none active:bg-soft motion-reduce:transition-none ${selected ? "border-border-active bg-selection-soft" : "border-border bg-surface hover:border-border-control hover:bg-hover"}`}
                        >
                          <span
                            lang="fr"
                            className="block leading-7 break-words whitespace-pre-wrap md:text-base"
                          >
                            {reading.text}
                          </span>
                        </button>
                        <Button
                          variant="icon"
                          className="absolute top-1/2 right-1 -translate-y-1/2"
                          aria-label={`Delete reading: ${reading.text}`}
                          onClick={() => onRemove(reading.text)}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
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
