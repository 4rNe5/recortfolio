"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { tracks } from "@/content/portfolio";
import { tape, type Frame } from "@/lib/tape";
import { formatTime, useFrame, useTape } from "@/lib/useTape";
import s from "./MiniDeck.module.css";

/** 모바일·태블릿: 기기가 화면 밖으로 나가면 나타나는 하단 트랜스포트 바 */
export default function MiniDeck() {
  const snap = useTape();
  const [show, setShow] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const deck = document.getElementById("deck");
    if (!deck) return;
    const mq = window.matchMedia("(max-width: 1099px)");
    let visible = true;
    const update = () => setShow(mq.matches && !visible);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      update();
    });
    io.observe(deck);
    mq.addEventListener("change", update);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  const onFrame = useCallback((f: Frame) => {
    wheelRef.current?.style.setProperty("--angle", `${f.angle.toFixed(1)}deg`);
    if (timeRef.current) timeRef.current.textContent = formatTime(f.seconds);
    barRef.current?.style.setProperty("--p", f.progress.toFixed(4));
  }, []);
  useFrame(onFrame);

  // 미니 휠: 가로 드래그로 스크럽
  const drag = useRef<{ x: number; t: number; v: number } | null>(null);
  const down = (e: RPE<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), v: 0 };
    tape.dragStart();
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const now = performance.now();
    const deg = dx * 1.6;
    d.v = (deg / Math.max(1, now - d.t)) * 1000;
    d.x = e.clientX;
    d.t = now;
    tape.dragBy(deg);
  };
  const up = () => {
    if (!drag.current) return;
    tape.dragEnd(performance.now() - drag.current.t < 80 ? drag.current.v : 0);
    drag.current = null;
  };

  const t = tracks[snap.track];
  return (
    <div className={s.bar} data-show={show || undefined} inert={!show}>
      <span ref={barRef} className={s.progress} aria-hidden />
      <div
        ref={wheelRef}
        className={s.wheel}
        role="slider"
        aria-label="미니 조그 휠"
        aria-valuemin={0}
        aria-valuemax={tracks.length - 1}
        aria-valuenow={snap.track}
        tabIndex={0}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <i />
      </div>
      <button className={s.oled} onClick={() => tape.toggleMenu(true)} aria-label={`트랙리스트 열기 — 현재 ${t.title}`}>
        <span className={s.row}>
          <span ref={timeRef} className={s.time}>
            0.00.00
          </span>
          <span className={s.no}>{String(snap.track).padStart(2, "0")}</span>
        </span>
        <span className={s.title}>{snap.message ?? t.display}</span>
      </button>
      <div className={s.keys}>
        <button aria-label="이전 트랙" onClick={() => tape.prev()}>
          <span className={s.prev} />
        </button>
        <button aria-label={snap.playing ? "일시정지" : "재생"} data-on={snap.playing || undefined} onClick={() => tape.togglePlay()}>
          {snap.playing ? <span className={s.pause} /> : <span className={s.play} />}
        </button>
        <button aria-label="다음 트랙" onClick={() => tape.next()}>
          <span className={s.next} />
        </button>
        <button aria-label="연락하기" data-rec={snap.rec || undefined} onClick={() => tape.rec()}>
          <span className={s.rec} />
        </button>
      </div>
    </div>
  );
}
