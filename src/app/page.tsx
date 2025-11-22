"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type PressedKey = "rec" | "play" | "stop" | null;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const formatElapsed = (ms: number) => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hundredths = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${hundredths
    .toString()
    .padStart(2, "0")}`;
};

export default function Home() {
  const wheelRef = useRef<SVGGElement | null>(null);
  const knobRef = useRef<SVGGElement | null>(null);
  const sliderTrackRef = useRef<SVGLineElement | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [pressed, setPressed] = useState<PressedKey>(null);
  const [slider, setSlider] = useState(52);
  const [hoveringWheel, setHoveringWheel] = useState(false);

  const startTimestamp = useMemo(() => new Date(), []);
  const quarter = useMemo(
    () => Math.floor(startTimestamp.getMonth() / 3) + 1,
    [startTimestamp],
  );
  const dayLabel = useMemo(
    () =>
      startTimestamp.toLocaleDateString("en-US", {
        weekday: "short",
      }),
    [startTimestamp],
  );

  const wheelState = useRef({ angle: 0, velocity: 0.09 });
  const hoverWheel = useRef(false);
  const pressWheel = useRef(false);
  const knobPulse = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      setElapsed(performance.now() - start);
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf: number;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const state = wheelState.current;
      const friction = pressWheel.current ? 0.0033 : 0.0022;
      const drive = hoverWheel.current ? 0.0014 : 0.0006;

      state.velocity = Math.max(
        0.02,
        state.velocity * (1 - friction * dt) + drive * dt,
      );
      state.angle = (state.angle + state.velocity * dt) % 360;

      if (wheelRef.current) {
        wheelRef.current.style.setProperty("--angle", `${state.angle}deg`);
      }

      knobPulse.current = Math.max(0, knobPulse.current - 0.02 * dt);
      if (knobRef.current) {
        const knobAngle = state.angle * 0.2 + knobPulse.current;
        knobRef.current.style.setProperty("--angle", `${knobAngle}deg`);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const addImpulse = (strength = 0.22) => {
    wheelState.current.velocity += strength;
    knobPulse.current += strength * 12;
  };

  const handleWheelDown = (e: ReactPointerEvent<SVGGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pressWheel.current = true;
    addImpulse(0.28);
  };

  const handleWheelUp = (e: ReactPointerEvent<SVGGElement>) => {
    pressWheel.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleButtonDown = (key: PressedKey) => (e: ReactPointerEvent) => {
    e.preventDefault();
    setPressed(key);
    addImpulse(key === "play" ? 0.2 : 0.12);
  };

  const handleButtonUp = () => setPressed(null);

  const updateSlider = (clientY: number) => {
    const track = sliderTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    setSlider(ratio * 100);
  };

  const handleSliderDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    updateSlider(e.clientY);
    const move = (ev: globalThis.PointerEvent) => updateSlider(ev.clientY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const sliderTop = 140;
  const sliderBottom = 300;
  const sliderY = sliderBottom - ((slider / 100) * (sliderBottom - sliderTop));

  const timeLabel = formatElapsed(elapsed);

  return (
    <main className={styles.canvas}>
      <div className={styles.deviceWrap}>
        <svg
          className={styles.deviceSvg}
          viewBox="0 0 360 540"
          aria-label="Teenage Engineering TP-7 line study"
        >

          <rect
            x="60"
            y="60"
            width="240"
            height="360"
            rx="14"
            className={styles.body}
          />

          <g
            ref={wheelRef}
            className={`${styles.wheel} ${
              hoveringWheel ? styles.wheelHover : ""
            }`}
            onPointerEnter={() => {
              hoverWheel.current = true;
              setHoveringWheel(true);
            }}
            onPointerLeave={() => {
              hoverWheel.current = false;
              pressWheel.current = false;
              setHoveringWheel(false);
            }}
            onPointerDown={handleWheelDown}
            onPointerUp={handleWheelUp}
          >
            <circle cx="180" cy="200" r="112" className={styles.stroke} />
            <circle cx="180" cy="200" r="44" className={styles.stroke} />
            <circle cx="180" cy="200" r="12" className={styles.stroke} />
            <line
              x1="110"
              y1="130"
              x2="250"
              y2="270"
              className={styles.stroke}
            />
            <line
              x1="250"
              y1="150"
              x2="110"
              y2="250"
              className={styles.stroke}
            />
          </g>
            
          <g
            className={`${styles.button} ${
              pressed === "rec" ? styles.pressed : ""
            }`}
            transform="translate(78 360)"
            onPointerDown={handleButtonDown("rec")}
            onPointerUp={handleButtonUp}
            onPointerLeave={handleButtonUp}
          >
            <rect
              width="74"
              height="68"
              rx="6"
              className={styles.stroke}
            />
            <circle cx="20" cy="24" r="6" className={styles.stroke} />
          </g>

          <g
            className={`${styles.button} ${
              pressed === "play" ? styles.pressed : ""
            }`}
            transform="translate(152 360)"
            onPointerDown={handleButtonDown("play")}
            onPointerUp={handleButtonUp}
            onPointerLeave={handleButtonUp}
          >
            <rect
              width="74"
              height="68"
              rx="6"
              className={styles.stroke}
            />
            <path
              d="M28 21 L48 34 L28 47 Z"
              className={styles.stroke}
              fill="none"
            />
          </g>

          <g
            className={`${styles.button} ${
              pressed === "stop" ? styles.pressed : ""
            }`}
            transform="translate(226 360)"
            onPointerDown={handleButtonDown("stop")}
            onPointerUp={handleButtonUp}
            onPointerLeave={handleButtonUp}
          >
            <rect
              width="74"
              height="68"
              rx="6"
              className={styles.stroke}
            />
            <rect
              x="24"
              y="22"
              width="24"
              height="24"
              className={styles.stroke}
            />
          </g>


          <foreignObject x="235" y="66" width="60" height="32">
            <div className={styles.indicator}>
              <div className={styles.readout}>{timeLabel}</div>
              <div className={styles.meta}>
                <span>
                  {dayLabel} Q{quarter}
                </span>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    </main>
  );
}
