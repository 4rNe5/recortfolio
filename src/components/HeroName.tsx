"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Frame } from "@/lib/tape";
import { useFrame } from "@/lib/useTape";
import s from "./Tracks.module.css";

/**
 * 이름 타이틀 — 글자 굵기가 소리처럼 움직인다.
 * 재생 중에는 레벨 미터에 맞춰 숨 쉬고, 포인터가 가까운 글자는 두꺼워진다.
 */
export default function HeroName({ first, rest }: { first: string; rest: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const letters = useRef<HTMLSpanElement[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const weights = useRef<number[]>([]);

  useEffect(() => {
    letters.current = Array.from(ref.current?.querySelectorAll<HTMLSpanElement>("[data-l]") ?? []);
    weights.current = letters.current.map(() => 300);
    const move = (e: PointerEvent) => (pointer.current = { x: e.clientX, y: e.clientY });
    const leave = () => (pointer.current = null);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  const onFrame = useCallback((f: Frame) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = pointer.current;
    letters.current.forEach((l, i) => {
      let near = 0;
      if (p) {
        const b = l.getBoundingClientRect();
        const d = Math.hypot(p.x - (b.left + b.width / 2), p.y - (b.top + b.height / 2));
        near = Math.max(0, 1 - d / (r.height * 0.9));
      }
      // 글자마다 위상이 다른 레벨 → 파형처럼 흐른다
      const wave = f.level * (0.6 + 0.4 * Math.sin(f.seconds * 9 + i * 0.7));
      // TE처럼 가늘게: 기본 300, 가까워지거나 소리가 커져도 560을 넘지 않는다
      const want = 300 + Math.max(near * near * 260, wave * 220);
      const cur = weights.current[i] ?? 300;
      const next = cur + (want - cur) * 0.18;
      if (Math.abs(next - cur) > 0.4) {
        weights.current[i] = next;
        l.style.fontVariationSettings = `"wght" ${next.toFixed(0)}`;
      }
    });
  }, []);
  useFrame(onFrame);

  const split = (word: string, offset: number) =>
    Array.from(word).map((ch, i) => (
      <span key={i} data-l aria-hidden style={{ ["--d" as string]: `${(offset + i) * 28}ms` }}>
        {ch === " " ? " " : ch}
      </span>
    ));

  return (
    <h1 ref={ref} className={s.name} aria-label={`${first} ${rest}`}>
      <span className={s.nameLine}>{split(first, 0)}</span>
      <span className={s.nameLine}>{split(rest, first.length)}</span>
    </h1>
  );
}
