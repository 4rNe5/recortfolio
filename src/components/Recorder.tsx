"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { tracks } from "@/content/portfolio";
import { tape, type Frame } from "@/lib/tape";
import { formatTime, useFrame, useTape } from "@/lib/useTape";
import s from "./Recorder.module.css";

const HINTS: Record<string, string> = {
  wheel: "조그 휠을 돌려서 앞뒤로 감아 보세요",
  hub: "가운데를 누르면 재생하거나 멈춥니다",
  lever: "레버를 튕기면 트랙을 넘기고, 누르고 있으면 빨리 감습니다",
  rec: "연락처로 이동합니다. 한 번 더 누르면 메일을 씁니다",
  play: "포트폴리오를 처음부터 재생합니다",
  stop: "멈춥니다. 한 번 더 누르면 처음으로 돌아갑니다",
  fader: "페이더를 끌어서 전체를 훑어보세요",
  plus: "재생 속도를 올립니다",
  minus: "재생 속도를 내립니다",
  knob: "노브를 끌어서 볼륨을 조절합니다",
  sound: "소리를 켜거나 끕니다",
  menu: "트랙리스트를 엽니다",
  theme: "밝은 테마와 어두운 테마를 바꿉니다",
};

const norm = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

export default function Recorder() {
  const snap = useTape();
  const [hint, setHint] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const deviceRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const screwRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const faderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const levelL = useRef<HTMLDivElement>(null);
  const levelR = useRef<HTMLDivElement>(null);
  const lastTime = useRef("");

  const onFrame = useCallback((f: Frame) => {
    const a = `${f.angle.toFixed(2)}deg`;
    rotorRef.current?.style.setProperty("--angle", a);
    screwRef.current?.style.setProperty("--angle", a);
    const t = formatTime(f.seconds);
    if (t !== lastTime.current && timeRef.current) {
      lastTime.current = t;
      timeRef.current.textContent = t;
    }
    handleRef.current?.style.setProperty("--pos", f.progress.toFixed(4));
    levelL.current?.style.setProperty("--lv", f.level.toFixed(3));
    levelR.current?.style.setProperty("--lv", (f.level * (0.82 + 0.18 * Math.sin(f.seconds * 3.1))).toFixed(3));
  }, []);
  useFrame(onFrame);

  // ---- 빛: 포인터 위치를 광원으로 삼아 알루미늄 반사를 움직인다 ----
  useEffect(() => {
    const el = deviceRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cur = { x: 28, y: 14, a: 225 };
    const goal = { ...cur };
    let raf = 0;
    const tick = () => {
      cur.x += (goal.x - cur.x) * 0.12;
      cur.y += (goal.y - cur.y) * 0.12;
      let da = goal.a - cur.a;
      da = ((((da + 180) % 360) + 360) % 360) - 180;
      cur.a += da * 0.12;
      el.style.setProperty("--lx", `${cur.x.toFixed(1)}%`);
      el.style.setProperty("--ly", `${cur.y.toFixed(1)}%`);
      el.style.setProperty("--la", `${cur.a.toFixed(1)}deg`);
      raf = Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) + Math.abs(da) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      goal.x = Math.max(-30, Math.min(130, x));
      goal.y = Math.max(-30, Math.min(130, y));
      goal.a = (Math.atan2(e.clientY - (r.top + r.height * 0.36), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- 휠 ----
  const wheel = useRef<{ cx: number; cy: number; a: number; total: number; t0: number; samples: [number, number][]; onHub: boolean } | null>(null);
  const angleAt = (e: RPE, cx: number, cy: number) => (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;

  const wheelDown = (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    e.currentTarget.setPointerCapture(e.pointerId);
    wheel.current = { cx, cy, a: angleAt(e, cx, cy), total: 0, t0: performance.now(), samples: [], onHub: dist < r.width * 0.16 };
    tape.dragStart();
  };
  const wheelMove = (e: RPE<HTMLDivElement>) => {
    const w = wheel.current;
    if (!w) return;
    const a = angleAt(e, w.cx, w.cy);
    const d = norm(a - w.a);
    w.a = a;
    w.total += Math.abs(d);
    const now = performance.now();
    w.samples.push([now, d]);
    while (w.samples.length && now - w.samples[0][0] > 90) w.samples.shift();
    tape.dragBy(d);
  };
  const wheelUp = (e: RPE<HTMLDivElement>) => {
    const w = wheel.current;
    if (!w) return;
    wheel.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const now = performance.now();
    const recent = w.samples.filter(([t]) => now - t < 90);
    const span = recent.length > 1 ? (now - recent[0][0]) / 1000 : 0;
    const v = span > 0.008 ? recent.reduce((acc, [, d]) => acc + d, 0) / span : 0;
    tape.dragEnd(v);
    if (w.onHub && w.total < 3 && now - w.t0 < 300) tape.togglePlay();
  };
  const wheelKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      tape.next();
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      tape.prev();
    } else if (e.key === "Enter") {
      tape.togglePlay();
    }
  };

  // ---- 레버 ----
  const leverRef = useRef<HTMLDivElement>(null);
  const lever = useRef<{ y: number; range: number } | null>(null);
  const [leverOn, setLeverOn] = useState(false);
  const leverDown = (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lever.current = { y: e.clientY, range: e.currentTarget.getBoundingClientRect().height * 0.16 };
    setLeverOn(true);
    tape.leverStart(e.timeStamp);
  };
  const leverMove = (e: RPE<HTMLDivElement>) => {
    const l = lever.current;
    if (!l) return;
    const v = Math.max(-1, Math.min(1, (l.y - e.clientY) / l.range));
    leverRef.current?.style.setProperty("--lev", v.toFixed(3));
    tape.leverMove(v);
  };
  const leverUp = (e: RPE<HTMLDivElement>) => {
    if (!lever.current) return;
    lever.current = null;
    setLeverOn(false);
    leverRef.current?.style.setProperty("--lev", "0");
    tape.leverEnd(e.timeStamp);
  };

  // ---- 페이더 ----
  const faderDrag = useRef(false);
  const faderAt = (e: RPE) => {
    const r = faderRef.current!.getBoundingClientRect();
    tape.scrubTo((e.clientY - r.top) / r.height);
  };
  const faderDown = (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    faderDrag.current = true;
    faderAt(e);
  };
  const faderMove = (e: RPE<HTMLDivElement>) => faderDrag.current && faderAt(e);
  const faderUp = () => (faderDrag.current = false);

  // ---- 볼륨 노브 ----
  const knob = useRef<{ x: number; y: number; v: number } | null>(null);
  const knobDown = (e: RPE<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    knob.current = { x: e.clientX, y: e.clientY, v: snap.volume };
  };
  const knobMove = (e: RPE<HTMLDivElement>) => {
    const k = knob.current;
    if (!k) return;
    const d = (e.clientX - k.x - (e.clientY - k.y)) / 220;
    tape.setVolume(k.v + d);
  };
  const knobUp = () => (knob.current = null);
  const knobKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      tape.setVolume(snap.volume + 0.1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      tape.setVolume(snap.volume - 0.1);
    }
  };

  const press = (id: string) => ({
    onPointerDown: () => setPressed(id),
    onPointerUp: () => setPressed(null),
    onPointerLeave: () => setPressed((p) => (p === id ? null : p)),
    onPointerEnter: () => setHint(HINTS[id]),
    onFocus: () => setHint(HINTS[id]),
    onBlur: () => setHint(null),
  });
  const hover = (id: string) => ({
    onPointerEnter: () => setHint(HINTS[id]),
    onPointerLeave: () => setHint(null),
    onFocus: () => setHint(HINTS[id]),
    onBlur: () => setHint(null),
  });

  const t = tracks[snap.track];
  const no = String(snap.track).padStart(2, "0");
  const line = snap.message ?? t.display;
  const contactIndex = tracks.findIndex((x) => x.kind === "contact");

  return (
    <figure className={s.wrap} aria-label="녹음기 인터페이스 — 포트폴리오 내비게이션">
      <div ref={deviceRef} className={s.device} data-playing={snap.playing || undefined} data-rec={snap.rec || undefined}>
        <div className={s.antenna} aria-hidden />

        {/* 왼쪽 레버: 위 = 빨리감기, 아래 = 되감기 */}
        <div
          ref={leverRef}
          className={s.lever}
          data-active={leverOn || undefined}
          role="slider"
          aria-label="빨리감기 / 되감기 레버"
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={0}
          tabIndex={0}
          onPointerDown={leverDown}
          onPointerMove={leverMove}
          onPointerUp={leverUp}
          onPointerCancel={leverUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              e.stopPropagation();
              tape.next();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              e.stopPropagation();
              tape.prev();
            }
          }}
          {...hover("lever")}
        >
          <div className={s.leverBar} />
          <div className={s.leverArm} />
          <div className={s.leverPivot} />
        </div>

        <div className={s.body}>
          <div className={s.grain} aria-hidden />
          <div className={s.light} aria-hidden />
          <span className={s.label} aria-hidden>
            4rNe5
          </span>
          <span className={`${s.mic} ${s.micA}`} aria-hidden />
          <span className={`${s.mic} ${s.micB}`} aria-hidden />

          {/* OLED */}
          <div className={s.oled} role="status" aria-live="polite" aria-label={`트랙 ${no} ${t.title}`}>
            <div className={s.oledTop}>
              <span className={s.oledTime} ref={timeRef}>
                0.00.00
              </span>
              <span className={s.oledState} data-state={snap.rec ? "rec" : snap.playing ? "play" : "stop"} aria-hidden />
            </div>
            <div className={s.oledBottom}>
              <span className={s.oledLine}>
                <span key={line} className={line.length > 10 ? s.marquee : undefined} data-text={line}>
                  {line}
                </span>
              </span>
              <span className={s.oledNo}>{no}</span>
            </div>
            <span className={s.oledBoot} aria-hidden />
          </div>

          <button className={s.mKey} aria-label="트랙리스트 열기" onClick={() => tape.toggleMenu()} {...press("menu")}>
            M
          </button>

          <button className={`${s.side} ${s.side1}`} aria-label="테마 전환" onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              tape.cycleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }} {...press("theme")} />
          <span className={`${s.side} ${s.side2}`} aria-hidden />
          <span className={`${s.side} ${s.side3}`} aria-hidden />

          <span className={s.ffMark} aria-hidden>
            <i />
            <i />
          </span>
          <span className={s.rwMark} aria-hidden>
            <i />R
          </span>

          {/* 조그 휠 */}
          <div
            className={s.wheel}
            role="slider"
            tabIndex={0}
            aria-label="조그 휠 — 트랙 이동"
            aria-valuemin={0}
            aria-valuemax={tracks.length - 1}
            aria-valuenow={snap.track}
            aria-valuetext={`${no} ${t.title}`}
            onPointerDown={wheelDown}
            onPointerMove={wheelMove}
            onPointerUp={wheelUp}
            onPointerCancel={wheelUp}
            onKeyDown={wheelKey}
            onPointerEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const hub = Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) < r.width * 0.16;
              setHint(HINTS[hub ? "hub" : "wheel"]);
            }}
            onPointerLeave={() => setHint(null)}
            onFocus={() => setHint(HINTS.wheel)}
            onBlur={() => setHint(null)}
          >
            <div className={s.wheelSheen} aria-hidden />
            <div ref={rotorRef} className={s.rotor} aria-hidden>
              <span className={s.diag} />
              <span className={s.spec}>FE / UX</span>
              <span className={s.spec2}>
                {no} <b>∞</b> <em>M</em>
              </span>
            </div>
            <div className={s.hub} aria-hidden>
              <div className={s.hubShine} />
            </div>
            <div ref={screwRef} className={`${s.rotorTop} ${s.screws}`} aria-hidden>
              <i />
              <i />
              <i />
            </div>
          </div>

          <button
            className={s.round}
            data-on={snap.sound || undefined}
            aria-label={snap.sound ? "소리 끄기" : "소리 켜기"}
            aria-pressed={snap.sound}
            onClick={() => tape.toggleSound()}
            {...press("sound")}
          />

          <div className={s.pm} aria-hidden />
          <button className={`${s.pmKey} ${s.plus}`} aria-label="재생 속도 올리기" onClick={() => tape.speed(1)} {...press("plus")}>
            +
          </button>
          <button className={`${s.pmKey} ${s.minus}`} aria-label="재생 속도 내리기" onClick={() => tape.speed(-1)} {...press("minus")}>
            −
          </button>

          {/* 트랜스포트 */}
          <div className={s.transport}>
            <button
              className={`${s.key} ${s.keyRec}`}
              data-down={pressed === "rec" || undefined}
              data-latched={snap.rec || undefined}
              aria-label={snap.rec && snap.track === contactIndex ? "메일 작성" : "녹음 — 연락처로 이동"}
              onClick={() => tape.rec()}
              {...press("rec")}
            >
              <span className={s.symRec} />
            </button>
            <button
              className={`${s.key} ${s.keyPlay}`}
              data-down={pressed === "play" || undefined}
              data-latched={snap.playing || undefined}
              aria-label={snap.playing ? "일시정지" : "재생"}
              aria-pressed={snap.playing}
              onClick={() => tape.togglePlay()}
              {...press("play")}
            >
              <span className={s.symPlay} />
            </button>
            <button
              className={`${s.key} ${s.keyStop}`}
              data-down={pressed === "stop" || undefined}
              aria-label="정지"
              onClick={() => tape.stop()}
              {...press("stop")}
            >
              <span className={s.symStop} />
            </button>
            <span className={s.recTab} aria-hidden />
          </div>

          {/* 페이더 */}
          <div
            ref={faderRef}
            className={s.fader}
            role="slider"
            aria-label="테이프 위치"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            tabIndex={-1}
            onPointerDown={faderDown}
            onPointerMove={faderMove}
            onPointerUp={faderUp}
            onPointerCancel={faderUp}
            {...hover("fader")}
          >
            <span className={s.slot}>
              <i ref={levelL} />
            </span>
            <span className={s.slot}>
              <i ref={levelR} />
            </span>
            <div ref={handleRef} className={s.cross} />
          </div>
        </div>

        {/* 볼륨 노브 */}
        <div className={s.knobNeck} aria-hidden />
        <div
          className={s.knob}
          role="slider"
          tabIndex={0}
          aria-label="볼륨"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(snap.volume * 100)}
          style={{ ["--vol" as string]: snap.volume }}
          onPointerDown={knobDown}
          onPointerMove={knobMove}
          onPointerUp={knobUp}
          onPointerCancel={knobUp}
          onKeyDown={knobKey}
          {...hover("knob")}
        />
      </div>

      <figcaption className={s.hint} aria-hidden>
        {hint ? (
          <span key={hint}>{hint}</span>
        ) : (
          <span key="idle">
            <span className={s.hintKb}>{snap.ready ? "휠을 돌리거나 ▶를 눌러 보세요. 키보드는 Space, ←, →, M, R" : "테이프를 감는 중"}</span>
            <span className={s.hintTouch}>{snap.ready ? "휠을 돌리거나 ▶를 눌러 보세요" : "테이프를 감는 중"}</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
