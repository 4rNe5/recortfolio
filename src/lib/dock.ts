// 첫 화면의 녹음기가 재생바로 접혀 들어갔는지 (Motion이 정하고, MiniDeck이 보고 나타난다)
import { useSyncExternalStore } from "react";

let docked = false;
const listeners = new Set<() => void>();

export const dock = {
  set(v: boolean) {
    if (v === docked) return;
    docked = v;
    listeners.forEach((l) => l());
  },
  get: () => docked,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useDocked = () => useSyncExternalStore(dock.subscribe, dock.get, () => false);
