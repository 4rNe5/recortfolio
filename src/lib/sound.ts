// 작은 WebAudio 신시사이저 — 휠 디텐트, 버튼, 트랙 전환 소리. 사용자가 켜기 전에는 소리를 내지 않는다.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setVolume(v: number) {
  ensure();
  if (master && ctx) master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.9, ctx.currentTime, 0.02);
}

/** 휠 디텐트: 짧고 건조한 금속성 클릭 */
export function tick(strength = 1) {
  const c = ensure();
  if (!c || !master || !noise) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3200 + Math.random() * 600;
  bp.Q.value = 6;
  const g = c.createGain();
  g.gain.setValueAtTime(0.35 * strength, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + 0.05);
}

/** 버튼: 낮은 기계식 '툭' */
export function thump(pitch = 1) {
  const c = ensure();
  if (!c || !master) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(190 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(55 * pitch, t + 0.06);
  const g = c.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.1);
  tick(0.6);
}

/** 트랙 전환: 트랙 번호에 따라 음이 바뀌는 두 음 차임 */
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
export function chime(index: number) {
  const c = ensure();
  if (!c || !master) return;
  const t = c.currentTime;
  const base = 392 * 2 ** (SCALE[index % SCALE.length] / 12);
  [base, base * 1.5].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = c.createGain();
    const s = t + i * 0.07;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.12, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
    o.connect(g).connect(master!);
    o.start(s);
    o.stop(s + 0.55);
  });
}

/** REC 비프 */
export function beep() {
  const c = ensure();
  if (!c || !master) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.value = 1320;
  const g = c.createGain();
  g.gain.setValueAtTime(0.06, t);
  g.gain.setValueAtTime(0.0001, t + 0.08);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.1);
}

export function unlock() {
  ensure();
}
