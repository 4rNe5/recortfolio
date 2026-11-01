"use client";

import { useEffect } from "react";
import { BOOST_SPEED, tape } from "@/lib/tape";
import { useTape } from "@/lib/useTape";
import s from "./Hold.module.css";

// 조작 대상이 아닌 곳을 길게 누르면 2.5배속 — 버튼·링크·기기·미니 덱·재생목록 위에서는 원래 동작
const SKIP = "a, button, input, textarea, select, label, summary, [role=button], [role=slider], [role=dialog], #deck, [data-minideck]";
const DELAY = 320; // iOS 길게 눌러 선택(약 500ms)보다 먼저
const SLOP = 10; // 이만큼 움직이면 스크롤로 본다

/** Reels식 누르고 있는 동안 배속 */
export default function Hold() {
  const snap = useTape();

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let x0 = 0;
    let y0 = 0;
    let active = false;

    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const end = () => {
      clear();
      if (!active) return;
      active = false;
      root.removeAttribute("data-hold");
      tape.hold(false);
    };
    const onStart = (e: TouchEvent) => {
      end();
      if (e.touches.length !== 1 || tape.getSnapshot().menu) return;
      const t = e.touches[0];
      if ((e.target as Element | null)?.closest?.(SKIP)) return;
      x0 = t.clientX;
      y0 = t.clientY;
      timer = setTimeout(() => {
        timer = null;
        active = true;
        root.setAttribute("data-hold", ""); // 누르는 동안 글자 선택·길게 누르기 메뉴 끔
        window.getSelection()?.removeAllRanges();
        tape.hold(true);
      }, DELAY);
    };
    const onMove = (e: TouchEvent) => {
      if (active) {
        e.preventDefault(); // 누르고 있는 동안은 손가락이 움직여도 화면을 끌지 않는다
        return;
      }
      if (!timer) return;
      const t = e.touches[0];
      if (Math.hypot(t.clientX - x0, t.clientY - y0) > SLOP) clear();
    };
    const onMenu = (e: Event) => {
      if (active || timer) e.preventDefault();
    };
    const onHide = () => document.hidden && end();

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
    window.addEventListener("contextmenu", onMenu);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      end();
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      window.removeEventListener("contextmenu", onMenu);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return (
    <div className={s.pill} data-on={snap.boost || undefined} aria-hidden>
      <span>{BOOST_SPEED}X</span>
      <svg viewBox="0 0 14 8" width="14" height="8">
        <path d="M0 0l6 4-6 4zM7 0l6 4-6 4z" />
      </svg>
    </div>
  );
}
