"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Voice = "female" | "male";

const VoiceContext = createContext<{
  voice: Voice;
  setVoice: (v: Voice) => void;
}>({ voice: "female", setVoice: () => {} });

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState<Voice>("female");
  return (
    <VoiceContext.Provider value={{ voice, setVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
