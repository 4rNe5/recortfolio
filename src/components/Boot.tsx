"use client";

import { useEffect } from "react";
import { tape } from "@/lib/tape";

/** 테이프 엔진 시작 + 스크롤 등장 애니메이션 관찰 */
export default function Boot() {
  useEffect(() => {
    const stop = tape.start();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      stop();
    };
  }, []);
  return null;
}
