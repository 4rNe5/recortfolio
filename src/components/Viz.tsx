"use client";

import { useEffect, useRef } from "react";
import { tracks } from "@/content/portfolio";
import { dock } from "@/lib/dock";
import { tape, type Frame } from "@/lib/tape";
import { viz } from "@/lib/viz";

// 음악 시각화 — 화면 전체 뒤에 깔리는 캔버스 한 장.
// 스펙트럼은 재생 위치(초)에서 결정적으로 만들어진다: 스크롤을 감으면 음악도 같이 감긴다.
// 세기 = 재생 레벨 + 스크롤 속도 + 장면이 주는 값(viz.boost), 모양 = 아래 막대 ↔ 가운데 원형 파형(viz.ring).

const N = 72;
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};
const rgb = (hex: string) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));

export default function Viz() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const root = document.documentElement;
    const isDark = () => {
      const t = root.getAttribute("data-theme");
      return t === "dark" || (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    };

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let target = rgb(tracks[0].color);
    const cur = [...target];
    let seed = 0;
    const pick = () => {
      const i = tape.getSnapshot().track;
      const t = tracks[i];
      seed = i * 17.3;
      target = t.color === "#1f1f1f" ? (isDark() ? [236, 236, 232] : [30, 30, 30]) : rgb(t.color);
    };
    pick();
    const unsub = tape.subscribe(pick);
    const onTrack = () => viz.hit(1);
    window.addEventListener("tape:track", onTrack);

    const vals = new Float32Array(N);
    let energy = 0.3;
    let on = 0;
    let ring = 0;
    let vel = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let cleared = false;

    const draw = (f: Frame) => {
      if (document.hidden) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dy = Math.abs(f.scrollY - lastY);
      lastY = f.scrollY;
      vel += ((dt > 0 ? dy / dt : 0) - vel) * 0.15;

      // 재생바로 접힌 뒤에는 늘 켜져 있다 (페이지 중간으로 바로 들어온 경우 포함)
      on += (Math.max(viz.on, dock.get() ? 1 : 0) - on) * (1 - Math.exp(-dt * 6));
      ring += (viz.ring - ring) * (1 - Math.exp(-dt * 5));
      const want = 0.22 + f.level * 0.55 + viz.boost * 0.5 + Math.min(1, vel / 2600) * 0.45;
      energy += (want - energy) * (1 - Math.exp(-dt * 6));
      viz.kick *= Math.exp(-dt * 3.2);
      for (let k = 0; k < 3; k++) cur[k] += (target[k] - cur[k]) * (1 - Math.exp(-dt * 3));

      if (on < 0.01) {
        if (!cleared) ctx.clearRect(0, 0, w, h);
        cleared = true;
        return;
      }
      cleared = false;

      // 스펙트럼: 재생 위치(초)를 시간축으로 — 낮은 대역이 크고, 박자마다 들썩인다
      const t = f.seconds * 1.7;
      const beat = Math.pow(Math.max(0, Math.sin(f.seconds * Math.PI * 2 * 1.1)), 8);
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const env = 0.35 + 0.65 * Math.pow(1 - x, 1.3);
        const n1 = noise(t + i * 0.23 + seed);
        const n2 = noise(t * 2.3 + i * 0.71 + seed * 3);
        let v = Math.pow(n1 * 0.7 + n2 * 0.3, 1.5) * env * (0.25 + energy);
        v += beat * (1 - x) * 0.25 * energy + viz.kick * 0.5 * hash(i + Math.floor(now / 70));
        vals[i] += (Math.min(1.2, v) - vals[i]) * 0.3;
      }

      ctx.clearRect(0, 0, w, h);
      const dark = isDark();
      const [r, g, b] = cur.map(Math.round);
      const a = on * (dark ? 0.75 : 0.5);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

      // 아래 막대 — 가운데에서 양옆으로 퍼지는 거울 스펙트럼
      const barA = a * (1 - ring * 0.85);
      if (barA > 0.01) {
        const cx = w / 2;
        const bw = Math.max(2, (w / (N * 2)) * 0.62);
        const step = w / (N * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${barA})`;
        for (let i = 0; i < N; i++) {
          const bh = Math.max(2, vals[i] * h * 0.3);
          ctx.fillRect(cx + i * step, h - bh, bw, bh);
          ctx.fillRect(cx - (i + 1) * step + (step - bw), h - bh, bw, bh);
        }
      }

      // 가운데 원형 파형 — 두 겹, 바깥은 흐리게
      const ringA = a * ring;
      if (ringA > 0.01) {
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.27 * (1 + viz.kick * 0.06 + beat * 0.02);
        for (const [scale, alpha, lw] of [
          [1, 1, 2.2],
          [1.18, 0.35, 1.2],
        ] as const) {
          ctx.beginPath();
          const M = N * 2;
          for (let k = 0; k <= M; k++) {
            const i = k % M;
            const v = vals[i < N ? i : M - 1 - i];
            const rr = R * scale + v * R * 0.42 * scale;
            const ang = (i / M) * Math.PI * 2 - Math.PI / 2 + f.seconds * 0.08;
            const px = cx + Math.cos(ang) * rr;
            const py = cy + Math.sin(ang) * rr;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `rgba(${r},${g},${b},${ringA * alpha})`;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };
    const off = tape.onFrame(draw);

    return () => {
      off();
      unsub();
      window.removeEventListener("resize", resize);
      window.removeEventListener("tape:track", onTrack);
    };
  }, []);

  return <canvas ref={ref} className="viz" aria-hidden />;
}
