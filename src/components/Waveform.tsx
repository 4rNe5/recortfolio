import s from "./Tracks.module.css";

// 트랙 id에서 결정적으로 만든 파형 — 서버에서 그리고, 재생 위치(--p)에 따라 CSS로 채워진다.
function bars(seed: string, n: number) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const out: number[] = [];
  let env = 0.4;
  for (let i = 0; i < n; i++) {
    env += (rnd() - 0.5) * 0.25;
    env = Math.min(0.95, Math.max(0.25, env));
    const beat = i % 8 === 0 ? 0.25 : 0;
    out.push(Math.min(1, Math.max(0.08, env * (0.45 + rnd() * 0.75) + beat)));
  }
  return out;
}

export default function Waveform({ seed, count = 96 }: { seed: string; count?: number }) {
  const b = bars(seed, count);
  const w = count * 4;
  // 막대를 네 묶음으로 나눠 그린다 — 빨리 감을 때(--v) 묶음마다 다른 폭으로 튄다
  const groups = [0, 1, 2, 3].map((g) =>
    b
      .map((v, i) => {
        if ((i * 7 + (i >> 2)) % 4 !== g) return "";
        const hgt = v * 36;
        return `M${i * 4 + 1} ${20 - hgt / 2}h2v${hgt}h-2z`;
      })
      .join(""),
  );
  const paths = groups.map((d, g) => <path key={g} d={d} />);
  return (
    <div className={s.wave} data-wave aria-hidden>
      <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={s.waveBase}>
        {paths}
      </svg>
      <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={s.waveFill}>
        {paths}
      </svg>
      <span className={s.playhead} />
    </div>
  );
}
