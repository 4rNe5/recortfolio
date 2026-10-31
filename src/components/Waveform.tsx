import type { CSSProperties } from "react";
import { activity, PEAK, SPAN, trackLit, years } from "@/lib/timeline";
import s from "./Tracks.module.css";

// 챕터 머리의 파형 = 경력 타임라인 (src/lib/timeline.ts).
// 막대 하나가 한 달, 높이는 그 달의 실제 활동 수. 모든 챕터가 같은 테이프를 공유하고,
// 이 챕터의 기간만 트랙 색으로 켜진다. 재생 헤드는 그 기간 안에서 읽는 만큼 움직인다(--p).

const STEP = 10; // 막대 간격(viewBox 단위)
const BAR = 6;

function paths(only?: Set<number>) {
  // 네 묶음으로 나눠 그린다 — 빨리 감을 때(--v) 묶음마다 다른 폭으로 튄다
  return [0, 1, 2, 3].map((g) => (
    <path
      key={g}
      d={activity
        .map((c, k) => {
          if ((k * 7 + (k >> 2)) % 4 !== g || (only && !only.has(k))) return "";
          const h = c ? (0.16 + 0.84 * (c / PEAK)) * 36 : 3;
          return `M${k * STEP + (STEP - BAR) / 2} ${20 - h / 2}h${BAR}v${h}h-${BAR}z`;
        })
        .join("")}
    />
  ));
}

export default function Waveform({ i }: { i: number }) {
  const { on, a, b } = trackLit(i);
  const w = SPAN * STEP;
  return (
    <div className={s.wave} data-wave aria-hidden style={{ ["--a" as string]: a, ["--b" as string]: b } as CSSProperties}>
      <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={s.waveBase}>
        {paths()}
      </svg>
      <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={s.waveLit}>
        {paths(on)}
      </svg>
      <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={s.waveFill}>
        {paths(on)}
      </svg>
      <span className={s.playhead} />
      <span className={s.years}>
        {years.map((y) => (
          <span key={y.label} style={{ left: `${(y.k / SPAN) * 100}%` }}>
            {y.label}
          </span>
        ))}
      </span>
    </div>
  );
}
