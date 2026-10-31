"use client";

import { useEffect } from "react";
import { scramble } from "@/lib/scramble";
import { tape } from "@/lib/tape";

/** 테이프 엔진 시작 + 챕터 머리 붙음 감지 + 트랙 전환 연출 */
export default function Boot() {
  useEffect(() => tape.start(), []);

  // 첫 방문의 전원 켜기 연출이 끝나면 표시를 걷는다
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-boot")) return;
    const t = setTimeout(() => root.removeAttribute("data-boot"), 1900);
    return () => clearTimeout(t);
  }, []);

  // 챕터 머리 바로 앞의 감지점이 화면 위로 지나가면 그 챕터에 data-stuck을 단다.
  // (CSS의 붙음 감지 쿼리는 iOS Safari가 지원하지 않는다. IntersectionObserver는 재생목록에서 고른
  //  순간이동처럼 감지점이 화면을 건너뛰면 알려 주지 않아서, 스크롤 위치가 바뀐 프레임마다 직접 잰다)
  useEffect(() => {
    const marks = Array.from(document.querySelectorAll<HTMLElement>("[data-sentinel]")).map((el) => ({
      el,
      section: el.closest<HTMLElement>("[data-track]"),
      on: false,
    }));
    let lastY = -1;
    // 붙는 머리는 모바일·태블릿 레이아웃에만 있다
    const mq = window.matchMedia("(max-width: 1099px)");
    return tape.onFrame((f) => {
      if (!mq.matches || f.scrollY === lastY) return;
      lastY = f.scrollY;
      for (const m of marks) {
        const on = m.el.getBoundingClientRect().top < 0;
        if (on !== m.on) {
          m.on = on;
          m.section?.toggleAttribute("data-stuck", on);
        }
      }
    });
  }, []);

  // 새 트랙에 들어서면 그 챕터 제목이 OLED처럼 한 번 섞였다가 맞춰진다 (화면에 보일 때만)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const on = (e: Event) => {
      const { i } = (e as CustomEvent<{ i: number }>).detail;
      const el = document.querySelector<HTMLElement>(`[data-track="${i}"] [data-scramble]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      scramble(el);
    };
    window.addEventListener("tape:track", on);
    return () => window.removeEventListener("tape:track", on);
  }, []);

  return null;
}
