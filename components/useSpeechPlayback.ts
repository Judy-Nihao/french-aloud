"use client";

import { useEffect, useRef, useState } from "react";
import { StreamingAudioPlayer } from "@/lib/streaming-audio";

let activePlayer: { player: StreamingAudioPlayer; stop: () => void } | null =
  null;

type Options = {
  onPlaybackStart?: (text: string) => void;
  speed?: number;
  onStatusChange?: (
    state: "loading" | "success" | "error",
    message: string,
  ) => void;
  onCacheStatusChange?: (status: "hit" | "miss" | null) => void;
};

export function useSpeechPlayback({
  speed = 1,
  onStatusChange,
  onCacheStatusChange,
  onPlaybackStart,
}: Options) {
  const playerRef = useRef<StreamingAudioPlayer | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const callbacks = useRef({
    onStatusChange,
    onCacheStatusChange,
    onPlaybackStart,
  });
  useEffect(() => {
    callbacks.current = {
      onStatusChange,
      onCacheStatusChange,
      onPlaybackStart,
    };
  });
  useEffect(() => {
    playerRef.current?.setSpeed(speed);
  }, [speed]);
  useEffect(
    () => () => {
      if (activePlayer?.player === playerRef.current) activePlayer = null;
      playerRef.current?.stop();
      playerRef.current = null;
    },
    [],
  );

  const stop = () => {
    if (activePlayer?.player === playerRef.current) activePlayer = null;
    playerRef.current?.stop();
    playerRef.current = null;
    setState("idle");
    callbacks.current.onStatusChange?.("success", "");
  };

  const play = async (
    payload: { text: string; voiceId?: string; voice?: "female" | "male" },
    name: string,
  ) => {
    activePlayer?.stop();
    const player = new StreamingAudioPlayer(speed, () => {
      if (playerRef.current !== player) return;
      setState("playing");
      callbacks.current.onPlaybackStart?.(payload.text);
      callbacks.current.onStatusChange?.("success", "");
    });
    playerRef.current = player;
    activePlayer = { player, stop };
    setState("loading");
    callbacks.current.onCacheStatusChange?.(null);
    callbacks.current.onStatusChange?.("loading", `Preparing ${name}...`);
    try {
      await player.play(payload, (cache) => {
        if (playerRef.current === player)
          callbacks.current.onCacheStatusChange?.(cache);
      });
      if (playerRef.current !== player) return;
      setState("idle");
      callbacks.current.onStatusChange?.("success", "");
    } catch (error) {
      if (playerRef.current !== player) return;
      player.stop();
      setState("idle");
      callbacks.current.onCacheStatusChange?.(null);
      callbacks.current.onStatusChange?.(
        "error",
        error instanceof Error ? error.message : "Unable to play speech.",
      );
    } finally {
      if (playerRef.current === player) playerRef.current = null;
      if (activePlayer?.player === player) activePlayer = null;
    }
  };
  return { state, play, stop };
}
