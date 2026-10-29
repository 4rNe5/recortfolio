"use client";

import { tape } from "@/lib/tape";
import { useTape } from "@/lib/useTape";
import s from "./Tracks.module.css";

export default function HeroActions() {
  const snap = useTape();
  return (
    <div className={s.actions}>
      <button className={s.playBtn} data-on={snap.playing || undefined} onClick={() => tape.togglePlay()}>
        <span className={s.playIcon} aria-hidden />
        {snap.playing ? "일시정지" : "포트폴리오 재생"}
      </button>
      <button className={s.ghostBtn} onClick={() => tape.toggleMenu(true)}>
        트랙리스트 보기
      </button>
      <a className={s.ghostBtn} href="mailto:me@4rne5.dev">
        메일 보내기
      </a>
    </div>
  );
}
