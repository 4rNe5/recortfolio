"use client";

import { useEffect } from "react";
import { tape } from "@/lib/tape";

/** 읽기선: 화면 높이의 이 지점이 "재생 위치"다 */
const READ = 0.45;

type Line = { el: HTMLElement; start: number; end: number; top: number; h: number; state: string; lp: number };

/**
 * 가사 모드 — 테이프 위치(스크롤)가 지나가는 줄만 켜진다.
 * 줄 위치는 크기가 바뀔 때만 재고, 매 프레임은 산술만 한다 (레이아웃 읽기 없음).
 */
export default function Lyrics() {
  useEffect(() => {
    let lines: Line[] = [];

    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-lyric]"));
      lines = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top + window.scrollY, h: r.height, start: 0, end: 0, state: el.dataset.state ?? "", lp: -1 };
      });
      // 같은 목록 안에선 다음 줄이 시작되기 직전까지를 이 줄의 구간으로 — 줄 사이 틈에서 깜빡이지 않게
      lines.forEach((L, i) => {
        const next = lines[i + 1];
        const sameList = next && next.el.parentElement === L.el.parentElement;
        L.start = L.top - 14;
        L.end = sameList ? next.top - 14 : L.top + L.h + 40;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const off = tape.onFrame((f) => {
      const read = f.scrollY + window.innerHeight * READ;
      for (const L of lines) {
        const state = read < L.start ? "next" : read >= L.end ? "past" : "now";
        if (state !== L.state) {
          L.state = state;
          L.el.dataset.state = state;
        }
        const lp = Math.min(1, Math.max(0, (read - L.top) / L.h));
        if (Math.abs(lp - L.lp) > 0.002) {
          L.lp = lp;
          L.el.style.setProperty("--lp", lp.toFixed(3));
        }
      }
    });

    return () => {
      ro.disconnect();
      off();
    };
  }, []);
  return null;
}
