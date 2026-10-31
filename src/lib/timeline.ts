// 경력 타임라인 — 모든 챕터의 파형이 같은 테이프(월 단위)를 공유한다.
// 막대 높이 = 그 달의 실제 활동 수(진행 중인 프로젝트 + 수상 + 발표·전시), 콘텐츠(portfolio.ts)에서만 계산한다.
// 각 챕터는 자기 기간의 막대만 색이 켜지고, 재생 헤드는 그 기간 안에서 움직인다.

import { awards, stage, tracks, type Track } from "@/content/portfolio";

type Ym = number; // 연*12 + (월-1)

const ym = (s: string): Ym | null => {
  const m = s.match(/(\d{4})\.(\d{1,2})/);
  return m ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
};
/** "2025.09 – 2025.12", "2024.10", "2026.10 – 진행 중", "2024.10, 2024.12" */
const months = (s: string, now: Ym): Ym[] => {
  const all = [...s.matchAll(/(\d{4})\.(\d{1,2})/g)].map((m) => Number(m[1]) * 12 + Number(m[2]) - 1);
  if (!all.length) return [];
  if (/[–-]/.test(s)) {
    const a = all[0];
    const b = all[1] ?? (/진행/.test(s) ? now : a);
    return Array.from({ length: Math.max(1, b - a + 1) }, (_, k) => a + k);
  }
  return all;
};

const today = new Date();
const NOW: Ym = today.getFullYear() * 12 + today.getMonth();

const projectMonths = tracks.flatMap((t) => (t.kind === "project" ? [months(t.period, NOW)] : []));
const awardMonths = awards.map((a) => ym(a.date)).filter((x): x is Ym => x !== null);
const stageMonths = stage.flatMap((s) => months(s.date, NOW));

const everything = [...projectMonths.flat(), ...awardMonths, ...stageMonths];
const START = Math.min(...everything);
const END = Math.max(NOW, ...everything);
export const SPAN = END - START + 1;

/** 달마다 활동 수 */
export const activity: number[] = Array.from({ length: SPAN }, () => 0);
for (const m of [...projectMonths.flat(), ...awardMonths, ...stageMonths]) activity[m - START] += 1;
export const PEAK = Math.max(1, ...activity);

/** 연도 눈금: 1월 위치 */
export const years = Array.from({ length: SPAN }, (_, k) => START + k)
  .filter((m) => m % 12 === 0)
  .map((m) => ({ k: m - START, label: String(m / 12) }));

/** 이 챕터에서 켜지는 달(인덱스)과 재생 헤드 구간 [a, b] (0..1) */
export function lit(t: Track): { on: Set<number>; a: number; b: number } {
  let ms: Ym[];
  switch (t.kind) {
    case "intro":
      ms = Array.from({ length: SPAN }, (_, k) => START + k);
      break;
    case "project":
      ms = months(t.period, NOW);
      break;
    case "awards":
      ms = awardMonths;
      break;
    case "stage":
      ms = stageMonths;
      break;
    case "contact":
      ms = [END];
      break;
  }
  const idx = ms.map((m) => m - START).filter((k) => k >= 0 && k < SPAN);
  const lo = Math.min(...idx);
  const hi = Math.max(...idx);
  return { on: new Set(idx), a: lo / SPAN, b: (hi + 1) / SPAN };
}

export const trackLit = (i: number) => lit(tracks[i]);
