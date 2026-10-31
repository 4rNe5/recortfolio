// "테이프" 엔진 — 페이지 스크롤을 녹음기의 재생 위치로 다룬다.
// 휠·레버·페이더·트랜스포트 버튼은 모두 이 엔진을 통해 스크롤을 움직이고,
// 매 프레임 계산된 값(각도, 타임코드, 트랙 진행도)을 구독자에게 흘려보낸다.

import { tracks } from "@/content/portfolio";
import * as sound from "./sound";

export const SPEEDS = [0.5, 1, 1.5, 2, 3, 4] as const;
/** 1x 재생 속도 (px/s) */
export const BASE_PX_PER_SEC = 90;
/** 스크롤 1px 당 휠 회전각 */
export const DEG_PER_PX = 0.14;
/** 디텐트 간격 (도) */
const DETENT = 15;

export type Theme = "auto" | "light" | "dark";

/** View Transition — lib.dom 버전 차이를 피하려고 필요한 만큼만 선언 */
export type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };

export type Snapshot = {
  track: number;
  playing: boolean;
  rec: boolean;
  speedIndex: number;
  sound: boolean;
  volume: number;
  menu: boolean;
  theme: Theme;
  message: string | null;
  ready: boolean;
};

export type Frame = {
  scrollY: number;
  angle: number; // 휠 표시 각도
  seconds: number; // 테이프 시간
  progress: number; // 전체 진행도 0..1
  trackProgress: number; // 현재 트랙 진행도 0..1
  level: number; // 0..1 스크롤 속도 기반 레벨
};

const INITIAL: Snapshot = {
  track: 0,
  playing: false,
  rec: false,
  speedIndex: 1,
  sound: false,
  volume: 0.7,
  menu: false,
  theme: "auto",
  message: null,
  ready: false,
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * 임계감쇠 스프링 — 현재 속도(v)를 이어받아 목표(to)로 간다.
 * 스프링이 직접 to를 쫓으면 출발 순간 가속이 너무 커서, 한 번 걸러진 가상 목표(g)를 쫓게 해 부드럽게 출발한다.
 */
type Spring = { to: number; g: number; x: number; v: number; w: number; i: number };

class Tape {
  private snap: Snapshot = INITIAL;
  private listeners = new Set<() => void>();
  private frameListeners = new Set<(f: Frame) => void>();

  private sections: HTMLElement[] = [];
  private waves: (HTMLElement | null)[] = [];
  private tops: number[] = [];
  private raf = 0;
  private last = 0;
  private started = false;

  private playPos = 0;
  private spring: Spring | null = null;
  /** 장면 전환으로 가는 중인 트랙 (-1: 없음) */
  private pending = -1;
  private sceneToken = 0;
  /** 테이프 모터의 실제 속도(px/s) — 재생·정지 때 서서히 붙고 풀린다 */
  private motor = 0;
  /** 부호 있는 스크롤 속도(px/s) */
  private vel = 0;
  private lastP: number[] = [];
  private lastV = -1;
  private vSection = -1;
  private inertia = 0; // px/s
  private dragging = false;
  private lever = 0; // -1..1 (위 = 빨리감기)
  private leverSince = 0;
  private leverSeeked = false;
  private leverPeak = 0;
  private leverStartY = 0;
  private leverStartTrack = 0;

  private angle = 0;
  private lastDetent = 0;
  private lastTickAt = 0;
  private lastY = 0;
  private level = 0;
  private msgTimer: ReturnType<typeof setTimeout> | null = null;
  private reduced = false;

  frame: Frame = { scrollY: 0, angle: 0, seconds: 0, progress: 0, trackProgress: 0, level: 0 };

  // ---- 외부 스토어 (useSyncExternalStore) ----
  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };
  getSnapshot = () => this.snap;
  getServerSnapshot = () => INITIAL;
  onFrame(l: (f: Frame) => void) {
    this.frameListeners.add(l);
    l(this.frame);
    return () => {
      this.frameListeners.delete(l);
    };
  }
  private set(p: Partial<Snapshot>) {
    this.snap = { ...this.snap, ...p };
    this.listeners.forEach((l) => l());
  }

  // ---- 수명주기 ----
  start() {
    if (this.started) return () => {};
    this.started = true;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const saved = localStorage.getItem("recortfolio:theme") as Theme | null;
      if (saved === "light" || saved === "dark") this.applyTheme(saved, false);
    } catch {}
    this.measure();
    const ro = new ResizeObserver(() => this.measure());
    ro.observe(document.body);
    const cancel = () => {
      this.spring = null;
      if (!this.dragging) this.inertia = 0;
      // 정지 후 관성으로 미끄러지는 중이면 손을 대는 순간 멈춘다
      if (!this.snap.playing) this.motor = 0;
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", this.onKey);
    this.lastY = window.scrollY;
    this.angle = this.lastY * DEG_PER_PX;
    this.lastDetent = Math.floor(this.angle / DETENT);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.set({ ready: true });
    return () => {
      cancelAnimationFrame(this.raf);
      ro.disconnect();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", this.onKey);
      this.started = false;
    };
  }

  measure() {
    this.lastP = [];
    this.sections = Array.from(document.querySelectorAll<HTMLElement>("[data-track]"));
    this.waves = this.sections.map((s) => s.querySelector<HTMLElement>("[data-wave]"));
    this.tops = this.sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
  }

  /** 트랙별 길이(초) — 섹션 높이를 1x 재생 속도로 환산 */
  durations(): number[] {
    const end = document.documentElement.scrollHeight;
    return this.tops.map((t, i) => ((this.tops[i + 1] ?? end) - t) / BASE_PX_PER_SEC);
  }

  private maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  private trackTop(i: number) {
    const top = this.tops[i] ?? 0;
    return clamp(i === 0 ? 0 : top - 24, 0, this.maxScroll());
  }

  // ---- 메인 루프 ----
  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const max = this.maxScroll();
    let y = window.scrollY;
    let driven = false;

    if (this.spring) {
      const s = this.spring;
      s.g += (s.to - s.g) * (1 - Math.exp(-dt * s.w * 1.1));
      const h = dt / 4;
      for (let k = 0; k < 4; k++) {
        const a = s.w * s.w * (s.g - s.x) - 2 * s.w * s.v;
        s.v += a * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.to - s.x) < 1.5 && Math.abs(s.v) < 20) {
        s.x = s.to;
        this.spring = null;
      }
      y = clamp(s.x, 0, max);
      window.scrollTo(0, y);
      this.playPos = y;
      driven = true;
    } else if (this.inertia !== 0 && !this.dragging) {
      y = clamp(y + this.inertia * dt, 0, max);
      window.scrollTo(0, y);
      this.inertia *= Math.exp(-3.4 * dt);
      if (Math.abs(this.inertia) < 6 || y <= 0 || y >= max) this.inertia = 0;
      driven = true;
    }

    if (Math.abs(this.lever) > 0.18 && now - this.leverSince > 320) {
      const s = Math.sign(this.lever) * ((Math.abs(this.lever) - 0.18) / 0.82) ** 1.6 * 3200;
      y = clamp(y + s * dt, 0, max);
      window.scrollTo(0, y);
      this.leverSeeked = true;
      driven = true;
    }

    // 테이프 모터: 목표 속도로 서서히 붙고(약 0.7초), 멈추면 관성으로 풀린다(약 0.5초)
    const goal = this.snap.playing && !this.dragging && !this.spring ? BASE_PX_PER_SEC * SPEEDS[this.snap.speedIndex] : 0;
    if (this.reduced) this.motor = goal;
    else this.motor += (goal - this.motor) * (1 - Math.exp(-dt * (goal > this.motor ? 3.4 : 5)));
    if (goal === 0 && this.motor < 3) this.motor = 0;
    if (this.motor > 0 && !this.dragging && !this.spring) {
      if (Math.abs(y - this.playPos) > 4) this.playPos = y; // 사용자가 직접 스크롤한 경우 따라간다
      this.playPos += this.motor * dt;
      if (this.playPos >= max) {
        this.playPos = max;
        this.motor = 0;
        if (this.snap.playing) {
          this.set({ playing: false });
          this.flash("END OF TAPE");
        }
      }
      window.scrollTo(0, this.playPos);
      y = this.playPos;
      driven = true;
    }

    y = window.scrollY;
    const target = y * DEG_PER_PX;
    const k = this.dragging || this.reduced ? 1 : 1 - Math.exp(-dt * 16);
    this.angle += (target - this.angle) * k;

    // 레벨 미터: 스크롤 속도 + 재생 중 기본 레벨
    const sv = dt > 0 ? (y - this.lastY) / dt : 0;
    this.vel += (sv - this.vel) * 0.5;
    const v = Math.abs(sv);
    this.lastY = y;
    const run = clamp(this.motor / (BASE_PX_PER_SEC * SPEEDS[this.snap.speedIndex]), 0, 1);
    const base = run * (0.35 + 0.15 * Math.sin(now / 140) * Math.sin(now / 370));
    const want = clamp(Math.max(base, v / 2400), 0, 1);
    this.level += (want - this.level) * (1 - Math.exp(-dt * (want > this.level ? 30 : 5)));

    // 디텐트
    const d = Math.floor(this.angle / DETENT);
    if (d !== this.lastDetent) {
      this.lastDetent = d;
      if (now - this.lastTickAt > 28 && (this.dragging || driven || this.inertia)) {
        this.lastTickAt = now;
        if (this.snap.sound) sound.tick(this.dragging ? 1 : 0.5);
        if (this.dragging && navigator.vibrate) navigator.vibrate(4);
      }
    }

    // 현재 트랙
    const probe = y + window.innerHeight * 0.38;
    let i = 0;
    for (let j = 0; j < this.tops.length; j++) if (this.tops[j] <= probe) i = j;
    if (y >= max - 2) i = this.tops.length - 1;
    const start = this.tops[i] ?? 0;
    const end = this.tops[i + 1] ?? document.documentElement.scrollHeight;
    const tp = clamp((probe - start) / Math.max(1, end - start), 0, 1);
    for (let j = 0; j < this.sections.length; j++) {
      const p = j < i ? 1 : j > i ? 0 : y >= max - 2 ? 1 : tp;
      if (this.lastP[j] === undefined || Math.abs(p - this.lastP[j]) > 0.0004) {
        this.lastP[j] = p;
        this.sections[j].style.setProperty("--p", p.toFixed(4));
      }
    }
    // 속도 신호(--v)는 지금 트랙의 파형에만 — 빨리 감을 때 튄다 (재생 기본 레벨은 제외)
    const sec = this.waves[i];
    if (sec) {
      if (this.vSection !== i) {
        this.waves[this.vSection]?.style.setProperty("--v", "0");
        this.vSection = i;
        this.lastV = -1;
      }
      const lv = this.reduced ? 0 : clamp((this.level - 0.5) / 0.5, 0, 1);
      if (Math.abs(lv - this.lastV) > 0.01 || (lv === 0 && this.lastV !== 0)) {
        this.lastV = lv;
        sec.style.setProperty("--v", lv.toFixed(3));
      }
    }
    if (i !== this.snap.track && this.tops.length) this.changeTrack(i);
    if (this.pending === i) this.pending = -1;

    this.frame = {
      scrollY: y,
      angle: this.angle,
      seconds: y / BASE_PX_PER_SEC,
      progress: max ? y / max : 0,
      trackProgress: tp,
      level: this.level,
    };
    this.frameListeners.forEach((l) => l(this.frame));
    this.raf = requestAnimationFrame(this.loop);
  };

  private changeTrack(i: number) {
    const t = tracks[i];
    // 연락처 트랙을 벗어날 때만 REC 해제 (REC로 이동하는 도중 지나치는 트랙은 무시)
    const leftContact = this.snap.rec && tracks[this.snap.track]?.kind === "contact" && t?.kind !== "contact";
    this.set({ track: i, rec: leftContact ? false : this.snap.rec });
    this.refreshAccent();
    if (this.snap.sound) sound.chime(i);
    // 트랙이 바뀌는 순간을 연출하는 쪽(제목 섞임)에 알린다
    window.dispatchEvent(new CustomEvent("tape:track", { detail: { i } }));
  }

  private refreshAccent() {
    const t = tracks[this.snap.track];
    if (!t) return;
    const root = document.documentElement;
    const theme = root.getAttribute("data-theme");
    const dark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const mono = t.color === "#1f1f1f";
    root.style.setProperty("--accent", mono && dark ? "#ededeb" : t.color);
    root.style.setProperty("--accent-ink", mono && dark ? "#111111" : t.ink);
  }

  // ---- 조작 ----
  flash(msg: string, ms = 1400) {
    if (this.msgTimer) clearTimeout(this.msgTimer);
    this.set({ message: msg });
    this.msgTimer = setTimeout(() => this.set({ message: null }), ms);
  }

  private click(pitch = 1) {
    if (this.snap.sound) sound.thump(pitch);
    if (navigator.vibrate) navigator.vibrate(8);
  }

  goTo(i: number, opts: { silent?: boolean } = {}) {
    const n = clamp(i, 0, this.tops.length - 1);
    // 데스크톱에서 다른 챕터로 갈 때는 중간을 훑지 않고 장면을 바꾼다 (기기는 그대로)
    if (n !== this.base() && window.matchMedia("(min-width: 1100px)").matches && this.scene(n)) {
      if (!opts.silent) this.click(1.1);
      return;
    }
    const to = this.trackTop(n);
    const from = window.scrollY;
    const dist = Math.abs(to - from);
    this.inertia = 0;
    if (this.reduced || dist < 2) {
      window.scrollTo(0, to);
      this.spring = null;
      this.playPos = to;
    } else {
      // 먼 거리일수록 낮은 고유진동수 — 순간 속도가 과하지 않게 (도착까지 약 0.6~1.3초)
      const w = clamp(18 / (1 + dist / 3500), 6.5, 14);
      // 이미 움직이는 중이면(이동·관성·재생) 그 위치·속도를 이어받는다
      const s = this.spring;
      const x = s ? s.x : from;
      const g = s ? s.g : from;
      const v = clamp(s ? s.v : this.vel, -12000, 12000);
      this.spring = { to, g, x, v, w, i: n };
    }
    if (!opts.silent) this.click(1.1);
  }

  /** 즉시 이동 — 화면 전환 연출(View Transition) 안에서 쓴다 */
  jumpTo(i: number) {
    const to = this.trackTop(clamp(i, 0, this.tops.length - 1));
    this.spring = null;
    this.inertia = 0;
    this.motor = this.snap.playing ? this.motor : 0;
    window.scrollTo(0, to);
    this.playPos = to;
    this.lastY = to;
  }

  /** 이동 중이면 가고 있는 트랙을 기준으로 — 연타하면 그만큼 더 간다 */
  private base() {
    if (this.spring) return this.spring.i;
    if (this.pending >= 0) return this.pending;
    return this.snap.track;
  }

  /**
   * 장면 전환: 지금 화면은 진행 방향으로 살짝 밀리며 빠지고, 다음 챕터가 들어온다.
   * 왼쪽 기기는 고정. 들어온 챕터의 보이는 요소는 등장 연출을 다시 한 번 재생한다.
   * hooks — 재생목록이 표지 비행을 끼워 넣는 자리. View Transition을 못 쓰면 false.
   */
  scene(i: number, hooks: { before?: () => void; inside?: () => void; after?: () => void } = {}) {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (!doc.startViewTransition || this.reduced) return false;
    const n = clamp(i, 0, this.tops.length - 1);
    const root = document.documentElement;
    const token = ++this.sceneToken;
    root.classList.remove("vt-fwd", "vt-back");
    root.classList.add("vt-scene", n >= this.base() ? "vt-fwd" : "vt-back");
    hooks.before?.();
    this.pending = n;
    let replay: HTMLElement[] = [];
    const vt = doc.startViewTransition(() => {
      hooks.inside?.();
      this.jumpTo(n);
      const h = window.innerHeight;
      replay = Array.from(this.sections[n]?.querySelectorAll<HTMLElement>("[data-reveal]") ?? []).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < h && r.bottom > 0;
      });
      replay.forEach((el) => el.removeAttribute("data-shown"));
    });
    vt.ready
      .then(() => requestAnimationFrame(() => replay.forEach((el) => el.setAttribute("data-shown", ""))))
      .catch(() => replay.forEach((el) => el.setAttribute("data-shown", "")));
    vt.finished.finally(() => {
      if (token !== this.sceneToken) return;
      root.classList.remove("vt-scene", "vt-fwd", "vt-back");
      if (this.pending === n) this.pending = -1;
      hooks.after?.();
    });
    return true;
  }

  next() {
    this.goTo(this.base() + 1);
  }
  prev() {
    // 트랙 진행 중이면 트랙 처음으로, 처음이면 이전 트랙으로 (실제 플레이어와 같은 동작)
    if (this.spring) return this.goTo(this.spring.i - 1);
    const y = window.scrollY;
    const top = this.trackTop(this.snap.track);
    this.goTo(y - top > 80 ? this.snap.track : this.snap.track - 1);
  }

  togglePlay() {
    sound.unlock();
    const playing = !this.snap.playing;
    if (playing && window.scrollY >= this.maxScroll() - 2) {
      window.scrollTo(0, 0);
    }
    this.playPos = window.scrollY;
    this.spring = null;
    this.set({ playing });
    this.click(playing ? 1.2 : 0.9);
    this.flash(playing ? `PLAY ${SPEEDS[this.snap.speedIndex]}X` : "PAUSE");
  }

  stop() {
    const wasStopped = !this.snap.playing;
    this.set({ playing: false, rec: false });
    this.click(0.8);
    if (wasStopped && window.scrollY > 0) {
      this.goTo(0, { silent: true });
      this.flash("RETURN TO ZERO");
    } else {
      this.flash("STOP");
    }
  }

  rec() {
    sound.unlock();
    const contact = tracks.findIndex((t) => t.kind === "contact");
    if (this.snap.rec && this.snap.track === contact) {
      window.location.href = "mailto:me@4rne5.dev";
      return;
    }
    this.set({ rec: true, playing: false });
    if (this.snap.sound) sound.beep();
    if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
    this.goTo(contact, { silent: true });
    this.flash("● REC — PRESS AGAIN TO MAIL", 2400);
  }

  speed(delta: number) {
    const speedIndex = clamp(this.snap.speedIndex + delta, 0, SPEEDS.length - 1);
    this.set({ speedIndex });
    this.click(1 + delta * 0.1);
    this.flash(`SPEED ${SPEEDS[speedIndex]}X`);
  }

  toggleSound() {
    const s = !this.snap.sound;
    if (s) {
      sound.unlock();
      sound.setVolume(this.snap.volume);
    }
    this.set({ sound: s });
    if (s) sound.thump();
    this.flash(s ? "SOUND ON" : "SOUND OFF");
  }

  setVolume(v: number) {
    const volume = clamp(v, 0, 1);
    sound.setVolume(volume);
    const turnOn = !this.snap.sound && volume > 0;
    this.set({ volume, sound: turnOn ? true : this.snap.sound && volume > 0 });
    this.flash(`VOL ${Math.round(volume * 100)}`, 900);
  }

  toggleMenu(open?: boolean) {
    const menu = open ?? !this.snap.menu;
    this.set({ menu });
    this.click(1.3);
  }

  /** origin: 새 테마가 원으로 퍼져 나갈 화면 좌표(누른 키 위치) */
  cycleTheme(origin?: { x: number; y: number }) {
    const order: Theme[] = ["auto", "light", "dark"];
    const next = order[(order.indexOf(this.snap.theme) + 1) % order.length];
    const apply = () => {
      this.applyTheme(next, true);
      this.refreshAccent();
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (origin && doc.startViewTransition && !this.reduced) {
      const root = document.documentElement;
      root.classList.add("vt-theme");
      const vt = doc.startViewTransition(apply);
      vt.ready
        .then(() => {
          const { x, y } = origin;
          const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 720, easing: "cubic-bezier(0.3, 0.6, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => {});
      vt.finished.finally(() => root.classList.remove("vt-theme"));
    } else apply();
    this.click(1.4);
    this.flash(`THEME ${next.toUpperCase()}`);
  }

  private applyTheme(theme: Theme, persist: boolean) {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    if (persist) {
      try {
        if (theme === "auto") localStorage.removeItem("recortfolio:theme");
        else localStorage.setItem("recortfolio:theme", theme);
      } catch {}
    }
    this.set({ theme });
  }

  // 휠 드래그 (각도 단위)
  dragStart() {
    sound.unlock();
    this.dragging = true;
    this.spring = null;
    this.inertia = 0;
    this.motor = 0;
  }
  dragBy(deg: number) {
    const y = clamp(window.scrollY + deg / DEG_PER_PX, 0, this.maxScroll());
    window.scrollTo(0, y);
    this.playPos = y;
  }
  dragEnd(degPerSec: number) {
    this.dragging = false;
    this.inertia = clamp(degPerSec / DEG_PER_PX, -9000, 9000);
  }

  // 페이더: 전체 테이프 위치 스크럽
  scrubTo(p: number) {
    this.spring = null;
    this.inertia = 0;
    const y = clamp(p, 0, 1) * this.maxScroll();
    window.scrollTo(0, y);
    this.playPos = y;
  }

  // 레버
  /** t: 입력 이벤트의 timeStamp — 화면이 버벅여도 누른 시간을 정확히 잰다 */
  leverStart(t = performance.now()) {
    sound.unlock();
    this.leverSince = t;
    this.leverSeeked = false;
    this.leverPeak = 0;
    this.leverStartY = window.scrollY;
    this.leverStartTrack = this.snap.track;
    this.spring = null;
  }
  leverMove(v: number) {
    const prev = this.lever;
    this.lever = clamp(v, -1, 1);
    if (Math.abs(this.lever) > Math.abs(this.leverPeak)) this.leverPeak = this.lever;
    if (Math.abs(prev) < 0.5 && Math.abs(this.lever) >= 0.5 && this.snap.sound) sound.tick(1);
    if (Math.abs(this.lever) > 0.2 && performance.now() - this.leverSince > 320 && !this.leverSeeked) {
      this.flash(this.lever > 0 ? "▶▶ FAST FORWARD" : "◀◀ REWIND", 900);
    }
  }
  leverEnd(t = performance.now()) {
    const peak = this.leverPeak;
    this.lever = 0;
    const flick = t - this.leverSince < 300 || !this.leverSeeked;
    if (flick && Math.abs(peak) > 0.4) {
      // 짧게 튕김: 누르기 시작한 시점 기준으로 트랙 이동 (그 사이 감긴 만큼은 되돌린다)
      window.scrollTo(0, this.leverStartY);
      const i = this.leverStartTrack;
      if (peak > 0) this.goTo(i + 1);
      else this.goTo(this.leverStartY - this.trackTop(i) > 80 ? i : i - 1);
      return;
    }
    this.playPos = window.scrollY;
  }

  private onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onControl = el && /^(BUTTON|A)$/.test(el.tagName);
    // 재생목록이 열려 있으면 그쪽이 키를 받는다 (닫기만 여기서 처리)
    if (this.snap.menu && !["Escape", "m", "M"].includes(e.key)) return;
    switch (e.key) {
      case " ":
        if (onControl) return;
        e.preventDefault();
        this.togglePlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.next();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.prev();
        break;
      case "r":
      case "R":
        this.rec();
        break;
      case "m":
      case "M":
        this.toggleMenu();
        break;
      case "Escape":
        if (this.snap.menu) this.toggleMenu(false);
        break;
      case "+":
      case "=":
        this.speed(1);
        break;
      case "-":
        this.speed(-1);
        break;
    }
  };
}

export const tape = new Tape();
