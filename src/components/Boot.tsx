"use client";

import { useEffect } from "react";
import { scramble } from "@/lib/scramble";
import { tape } from "@/lib/tape";

/** 테이프 엔진 시작 + 챕터 머리 붙음 감지 + 챕터 등장·제목 섞임 연출 */
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
  // (CSS의 붙음 감지 쿼리는 iOS Safari가 지원하지 않아 IntersectionObserver를 쓴다)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const section = e.target.closest("[data-track]");
        section?.toggleAttribute("data-stuck", !e.isIntersecting && e.boundingClientRect.top < 0);
      }
    });
    document.querySelectorAll("[data-sentinel]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 챕터 요소는 처음 화면에 들어올 때 한 번 떠오른다 (스크롤 위치에 묶이지 않음 — 다시 숨지 않는다)
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-shown", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
