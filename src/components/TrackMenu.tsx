"use client";

import { useEffect, useRef, useState } from "react";
import { tracks } from "@/content/portfolio";
import { tape } from "@/lib/tape";
import { formatDuration, useTape } from "@/lib/useTape";
import s from "./TrackMenu.module.css";

/** M 키 — 앨범 뒷면 같은 트랙리스트 */
export default function TrackMenu() {
  const snap = useTape();
  const [durations, setDurations] = useState<number[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (snap.menu) {
      opener.current = document.activeElement;
      setDurations(tape.durations());
      requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>("[data-current]")?.focus());
    } else if (opener.current instanceof HTMLElement) {
      opener.current.focus();
      opener.current = null;
    }
  }, [snap.menu]);

  const total = durations.reduce((a, b) => a + b, 0);

  return (
    <div className={s.root} data-open={snap.menu || undefined} inert={!snap.menu}>
      <button className={s.scrim} tabIndex={-1} aria-label="닫기" onClick={() => tape.toggleMenu(false)} />
      <div ref={panel} className={s.panel} role="dialog" aria-modal="true" aria-label="트랙리스트">
        <header className={s.head}>
          <span>SIDE A — TRACKLIST</span>
          <span>{total ? formatDuration(total) : ""}</span>
        </header>
        <ol className={s.list}>
          {tracks.map((t, i) => (
            <li key={t.id} style={{ ["--c" as string]: t.color, ["--i" as string]: i }}>
              <button
                tabIndex={snap.menu ? 0 : -1}
                data-current={i === snap.track || undefined}
                onClick={() => {
                  tape.goTo(i);
                  tape.toggleMenu(false);
                }}
              >
                <span className={s.no}>{String(i).padStart(2, "0")}</span>
                <span className={s.dot} />
                <span className={s.name}>{t.title}</span>
                <span className={s.dur}>{durations[i] ? formatDuration(durations[i]) : ""}</span>
              </button>
            </li>
          ))}
        </ol>
        <footer className={s.foot}>
          <span>
            <kbd>M</kbd> 닫기 · <kbd>Esc</kbd>
          </span>
          <button tabIndex={snap.menu ? 0 : -1} className={s.close} onClick={() => tape.toggleMenu(false)}>
            CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
}
