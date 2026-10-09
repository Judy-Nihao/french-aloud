"use client";

import { Drawer } from "@base-ui/react/drawer";
import { useEffect, useState } from "react";
import { CopyTextButton, quietButton } from "./CopyTextButton";
import type { Reading } from "@/lib/reading-history";

export function RecentReadings({
  readings,
  onRestore,
  onClear,
  storageError,
}: {
  readings: Reading[];
  onRestore: (text: string) => void;
  onClear: () => void;
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
      <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
        <Drawer.Trigger className={quietButton}>
          Recent readings{readings.length ? ` (${readings.length})` : ""}
        </Drawer.Trigger>
      </div>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-slate-950/30" />
        <Drawer.Viewport
          className={`fixed inset-0 z-50 flex ${desktop ? "justify-end" : "items-end"}`}
        >
          <Drawer.Popup
            className={`flex flex-col border border-slate-200 bg-slate-50 text-slate-900 shadow-xl outline-none ${desktop ? "h-full w-96 max-w-full" : "max-h-[85dvh] w-full rounded-t-3xl"}`}
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
                  <Drawer.Close className={quietButton}>Close</Drawer.Close>
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
                <ol className="divide-y divide-slate-200">
                  {readings.map((reading) => (
                    <li key={reading.text} className="py-5">
                      <p
                        lang="fr"
                        className="text-base leading-7 break-words whitespace-pre-wrap"
                      >
                        {reading.text}
                      </p>
                      <time
                        dateTime={new Date(reading.playedAt).toISOString()}
                        className="mt-2 block text-xs text-slate-500"
                      >
                        {new Date(reading.playedAt).toLocaleString()}
                      </time>
                      <div className="mt-2 flex justify-between gap-2">
                        <button
                          type="button"
                          className={quietButton}
                          onClick={() => {
                            onRestore(reading.text);
                            setOpen(false);
                          }}
                        >
                          Use text
                        </button>
                        <CopyTextButton text={reading.text} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="border-t border-slate-200 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  className={quietButton}
                  disabled={!readings.length}
                  onClick={onClear}
                >
                  Clear history
                </button>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
