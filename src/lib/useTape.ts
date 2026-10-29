"use client";

import { useEffect, useSyncExternalStore } from "react";
import { tape, type Frame } from "./tape";

export function useTape() {
  return useSyncExternalStore(tape.subscribe, tape.getSnapshot, tape.getServerSnapshot);
}

/** 매 프레임 콜백 — React 렌더 없이 DOM을 직접 갱신할 때 사용 */
export function useFrame(cb: (f: Frame) => void) {
  useEffect(() => tape.onFrame(cb), [cb]);
}

export const formatTime = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  return `${h}.${String(m).padStart(2, "0")}.${String(sec).padStart(2, "0")}`;
};

export const formatDuration = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
