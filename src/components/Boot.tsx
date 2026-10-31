"use client";

import { useEffect } from "react";
import { tape } from "@/lib/tape";

/** 테이프 엔진 시작 + 챕터 머리 붙음 감지 */
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

  return null;
}
