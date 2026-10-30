"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { tracks, type Track } from "@/content/portfolio";
import * as sound from "@/lib/sound";
import { tape, type Frame, type VT } from "@/lib/tape";
import { formatDuration, useFrame, useTape } from "@/lib/useTape";
import s from "./TrackMenu.module.css";

const ROW = 60; // 목록 한 줄 높이(px) — 선택 막대가 이 간격으로 미끄러진다
const num = (i: number) => String(i).padStart(2, "0");

const SUB: Record<string, string> = { intro: "소개", awards: "수상", stage: "발표와 전시", contact: "연락하기" };
const subOf = (t: Track) => (t.kind === "project" ? t.period : SUB[t.kind]);

function Cover({ t, i, size }: { t: Track; i: number; size: number }) {
  return (
    <span className={s.cover} data-cover style={{ width: size, height: size, ["--c" as string]: t.color } as CSSProperties}>
      {t.kind === "project" ? (
        <Image src={t.icon} alt="" width={size * 2} height={size * 2} data-logo={t.id === "sfoodgo" || undefined} />
      ) : (
        <span className={s.coverNo}>{num(i)}</span>
      )}
    </span>
  );
}

/** M 키 — MP3 플레이어의 재생목록 화면 */
export default function TrackMenu() {
  const snap = useTape();
  const [durations, setDurations] = useState<number[]>([]);
  const [sel, setSel] = useState(0);
  /** 마우스로 고른 줄은 목록을 굴리지 않는다 (굴리면 줄이 커서 밑에서 미끄러져 다른 줄이 눌린다) */
  const byMouse = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const remainRef = useRef<HTMLSpanElement>(null);
  const opener = useRef<Element | null>(null);
  const durRef = useRef<number[]>([]);
  const open = snap.menu;

  // 열릴 때: 현재 트랙을 선택하고 목록에 포커스
  useEffect(() => {
    if (open) {
      opener.current = document.activeElement;
      const d = tape.durations();
      durRef.current = d;
      setDurations(d);
      byMouse.current = false;
      setSel(tape.getSnapshot().track);
      requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
    } else if (opener.current instanceof HTMLElement) {
      opener.current.focus({ preventScroll: true });
      opener.current = null;
    }
  }, [open]);

  // 선택한 줄이 항상 보이게
  useEffect(() => {
    const l = listRef.current;
    if (!l || !open || byMouse.current) return;
    const top = sel * ROW;
    if (top < l.scrollTop) l.scrollTo({ top, behavior: "smooth" });
    else if (top + ROW > l.scrollTop + l.clientHeight) l.scrollTo({ top: top + ROW - l.clientHeight, behavior: "smooth" });
  }, [sel, open]);

  // 오른쪽 스크롤 표시
  const syncThumb = useCallback(() => {
    const l = listRef.current;
    const th = thumbRef.current;
    if (!l || !th) return;
    const ratio = l.clientHeight / l.scrollHeight;
    const h = Math.max(0.12, ratio);
    const max = l.scrollHeight - l.clientHeight;
    th.style.height = `${h * 100}%`;
    th.style.transform = `translateY(${max > 0 ? (l.scrollTop / max) * ((1 - h) / h) * 100 : 0}%)`;
  }, []);
  useEffect(() => {
    if (open) requestAnimationFrame(syncThumb);
  }, [open, durations, syncThumb]);

  // 지금 재생 중 카드의 진행 막대 — React 렌더 없이 매 프레임 갱신
  const onFrame = useCallback(
    (f: Frame) => {
      if (!open) return;
      const d = durRef.current[tape.getSnapshot().track] ?? 0;
      barRef.current?.style.setProperty("--tp", f.trackProgress.toFixed(4));
      if (elapsedRef.current) elapsedRef.current.textContent = formatDuration(f.trackProgress * d);
      if (remainRef.current) remainRef.current.textContent = `-${formatDuration((1 - f.trackProgress) * d)}`;
    },
    [open],
  );
  useFrame(onFrame);

  const choose = (i: number) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced) {
      tape.goTo(i);
      tape.toggleMenu(false);
      return;
    }
    // 고른 표지가 날아가 챕터 아이콘 자리에 안착한다 (프로젝트 트랙만 — 나머지는 장면 전환)
    const root = document.documentElement;
    const player = playerRef.current;
    const cover = listRef.current?.querySelector<HTMLElement>(`#trk-${i} [data-cover]`);
    const icon = document.querySelector<HTMLElement>(`[data-icon="${i}"]`);
    const named: HTMLElement[] = [];
    const name = (el: HTMLElement | null | undefined, n: string) => {
      if (!el) return;
      el.style.viewTransitionName = n;
      named.push(el);
    };
    name(player, "menu");
    if (icon) name(cover, "cover");
    root.classList.add("vt-pick");
    const vt = doc.startViewTransition(() => {
      named.forEach((el) => (el.style.viewTransitionName = ""));
      named.length = 0;
      flushSync(() => tape.toggleMenu(false));
      tape.jumpTo(i);
      if (icon) name(icon, "cover");
    });
    vt.finished.finally(() => {
      named.forEach((el) => (el.style.viewTransitionName = ""));
      root.classList.remove("vt-pick");
    });
  };
  const move = (i: number) => {
    const n = Math.max(0, Math.min(tracks.length - 1, i));
    if (n !== sel) {
      setSel(n);
      if (snap.sound) sound.tick(0.7);
    }
  };
  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    byMouse.current = false;
    if (k === "ArrowDown" || k === "ArrowRight") move(sel + 1);
    else if (k === "ArrowUp" || k === "ArrowLeft") move(sel - 1);
    else if (k === "Home") move(0);
    else if (k === "End") move(tracks.length - 1);
    else if (k === "Enter" || k === " ") choose(sel);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const cur = tracks[snap.track];
  const total = durations.reduce((a, b) => a + b, 0);

  return (
    <div className={s.root} data-open={open || undefined} inert={!open}>
      <button className={s.scrim} tabIndex={-1} aria-label="닫기" onClick={() => tape.toggleMenu(false)} />

      <div ref={playerRef} className={s.player} role="dialog" aria-modal="true" aria-label="트랙리스트">
        <div className={s.grille} aria-hidden />
        <div className={s.screen}>
          {/* 상태줄 */}
          <div className={s.status}>
            <span className={s.state} data-state={snap.playing ? "play" : "stop"} aria-hidden />
            <span className={s.statusTitle}>Side A</span>
            <span className={s.statusTotal}>{total ? formatDuration(total) : ""}</span>
            <span className={s.battery} aria-hidden>
              <i />
            </span>
          </div>

          {/* 지금 재생 중 */}
          <div className={s.now} style={{ ["--c" as string]: cur.color } as CSSProperties}>
            <Cover t={cur} i={snap.track} size={52} />
            <div className={s.nowText}>
              <span className={s.nowLabel}>{snap.playing ? "재생 중" : "일시정지"}</span>
              <span className={s.nowTitle}>{cur.title}</span>
              <span className={s.progress}>
                <span ref={barRef} className={s.progressBar} />
              </span>
              <span className={s.times}>
                <span ref={elapsedRef}>0:00</span>
                <span ref={remainRef}>-0:00</span>
              </span>
            </div>
          </div>

          {/* 목록 */}
          <div className={s.listWrap}>
            <ol
              ref={listRef}
              className={s.list}
              role="listbox"
              tabIndex={0}
              aria-label="트랙 선택"
              aria-activedescendant={`trk-${sel}`}
              onKeyDown={onKey}
              onScroll={syncThumb}
              style={{ ["--sel" as string]: sel, ["--row" as string]: `${ROW}px` } as CSSProperties}
            >
              <li className={s.highlight} aria-hidden />
              {tracks.map((t, i) => (
                <li
                  key={t.id}
                  id={`trk-${i}`}
                  role="option"
                  aria-selected={i === sel}
                  className={s.row}
                  data-sel={i === sel || undefined}
                  data-current={i === snap.track || undefined}
                  style={{ ["--c" as string]: t.color, ["--i" as string]: i } as CSSProperties}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    byMouse.current = true;
                    move(i);
                  }}
                  onClick={() => choose(i)}
                >
                  <span className={s.no}>
                    {i === snap.track ? (
                      <span className={s.eq} data-on={snap.playing || undefined} aria-label="현재 트랙">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      num(i)
                    )}
                  </span>
                  <Cover t={t} i={i} size={36} />
                  <span className={s.meta}>
                    <span className={s.title}>
                      <span>{t.title}</span>
                    </span>
                    <span className={s.sub}>{subOf(t)}</span>
                  </span>
                  <span className={s.dur}>{durations[i] ? formatDuration(durations[i]) : ""}</span>
                </li>
              ))}
            </ol>
            <span className={s.scroll} aria-hidden>
              <span ref={thumbRef} className={s.thumb} />
            </span>
          </div>
        </div>

        {/* 하단 조작 안내 */}
        <div className={s.foot}>
          <span className={s.keys}>
            <kbd>↑</kbd>
            <kbd>↓</kbd> 고르기 <kbd>Enter</kbd> 재생 <kbd>Esc</kbd> 닫기
          </span>
          <button tabIndex={open ? 0 : -1} className={s.close} onClick={() => tape.toggleMenu(false)}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
