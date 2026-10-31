"use client";

// 3D 녹음기 (three.js + React Three Fiber).
// 보이는 것만 3D로 그리고, 조작(휠·레버·키·페이더·노브)과 OLED 글자는 기존 DOM을 그대로 위에 겹친다.
// 정렬 원리: 3D 카메라와 CSS perspective를 같은 거리(D)로 맞추고, 기울기를 3D 모델과 DOM에 똑같이 준다.
// 좌표 단위는 기존 CSS와 같은 u(기기 폭 853u × 높이 1370u). 원점 = 기기 중심, y 위쪽, z 화면 밖.
// 화면은 필요할 때만 다시 그린다(frameloop="demand").

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { tracks } from "@/content/portfolio";
import { tape, type Frame } from "@/lib/tape";
import { useTape } from "@/lib/useTape";

export type Live = { lev: number; pressed: string | null };

export const DW = 853;
export const DH = 1370;
/** 카메라 거리(u) — CSS perspective도 같은 값(× 픽셀 배율)을 쓴다 */
export const CAM_D = 1800;
/** 그림자·기울기가 잘리지 않게 캔버스를 기기보다 이만큼(u) 넓힌다 */
export const MARGIN = 200;
const TILT_X = (7 * Math.PI) / 180;
const TILT_Y = (10 * Math.PI) / 180;
const DEPTH = 72; // 바디 두께
const MID = -DEPTH / 2; // 바디 두께 중앙 (옆면 부품의 z)

/** 기기 좌표(u, 왼쪽 위 원점) → 3D 좌표 */
const X = (x: number) => x - DW / 2;
const Y = (y: number) => DH / 2 - y;

/* ---------------- 모양 ---------------- */

function roundRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/** 앞면이 z=0에 오는 모서리 둥근 판. bevel만큼 모서리가 깎인다 */
function slab(w: number, h: number, r: number, depth: number, bevel = 2, segs = 4) {
  const g = new THREE.ExtrudeGeometry(roundRect(w - bevel * 2, h - bevel * 2, Math.max(0.5, r - bevel)), {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segs,
    curveSegments: 16,
  });
  g.translate(0, 0, -(depth - bevel));
  return g;
}

/* ---------------- 무늬(캔버스 텍스처) ---------------- */

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, color = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
/** 가로 결의 브러시드 알루미늄 (거칠기 지도) */
const brushed = () =>
  canvasTex(
    512,
    512,
    (c) => {
      c.fillStyle = "#8a8a8a";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3200; i++) {
        const y = Math.random() * 512;
        const v = 70 + Math.random() * 120;
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.globalAlpha = 0.35;
        c.fillRect(Math.random() * 512 - 200, y, 200 + Math.random() * 400, 1);
      }
    },
    false,
  );
/** 스핀 가공된 원판의 동심원 결 */
const rings = () =>
  canvasTex(
    1024,
    1024,
    (c) => {
      c.fillStyle = "#808080";
      c.fillRect(0, 0, 1024, 1024);
      for (let r = 4; r < 512; r += 2.2) {
        const v = 110 + Math.random() * 40;
        c.strokeStyle = `rgb(${v},${v},${v})`;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(512, 512, r, 0, Math.PI * 2);
        c.stroke();
      }
    },
    false,
  );
/** 노브의 다이아몬드 널링 — 피라미드 높이장에서 계산한 노멀맵 */
const knurl = () => {
  const N = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const c = cv.getContext("2d")!;
  const img = c.createImageData(N, N);
  const h = (x: number, y: number) => {
    // 한 칸 안에 다이아몬드 피라미드 하나 (45° 두 방향 홈)
    const a = (((x + y) / N) * 8) % 1;
    const b = (((x - y + N * 8) / N) * 8) % 1;
    return Math.min(a, 1 - a, b, 1 - b);
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = h(x + 1, y) - h(x - 1, y);
      const dy = h(x, y + 1) - h(x, y - 1);
      const s = 14; // 세기
      const nx = -dx * s;
      const ny = -dy * s;
      const nz = 1;
      const l = Math.hypot(nx, ny, nz);
      const i = (y * N + x) * 4;
      img.data[i] = ((nx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / l) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  c.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 2);
  t.anisotropy = 8;
  return t;
};

/** 스핀 가공 원판의 결 방향(원주 방향) — 빛이 원뿔 모양으로 번지는 반사(무드라이트)를 만든다 */
const spinDir = () => {
  const N = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const c = cv.getContext("2d")!;
  const img = c.createImageData(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = x / (N - 1) - 0.5;
      const dy = y / (N - 1) - 0.5;
      const l = Math.hypot(dx, dy) || 1;
      const i = (y * N + x) * 4;
      img.data[i] = ((-dy / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dx / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  c.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(cv);
};

const fontFamily = () => getComputedStyle(document.documentElement).getPropertyValue("--font-funnel").trim() || "sans-serif";

/** 바디 앞면 인쇄: 로고, 레버 옆 표시 */
function bodyPrint() {
  const k = 2;
  return canvasTex(DW * k, DH * k, (c) => {
    c.scale(k, k);
    c.fillStyle = "#2b2b2b";
    c.font = `300 60px ${fontFamily()}`;
    (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "-2.4px";
    c.textBaseline = "top";
    c.fillText("4rNe5", 109, 136);
    // 빨리감기 ▲▲ / 되감기 ▼ R
    c.fillStyle = "#9c9c9a";
    const tri = (x: number, y: number, up: boolean) => {
      c.beginPath();
      if (up) {
        c.moveTo(x, y);
        c.lineTo(x + 7, y + 11);
        c.lineTo(x - 7, y + 11);
      } else {
        c.moveTo(x - 7, y);
        c.lineTo(x + 7, y);
        c.lineTo(x, y + 11);
      }
      c.fill();
    };
    tri(90, 304, true);
    tri(90, 318, true);
    tri(90, 732, false);
    c.fillStyle = "#8f8f8d";
    c.font = `400 14px ${fontFamily()}`;
    c.textAlign = "center";
    c.fillText("R", 90, 747);
  });
}

/** 휠 인쇄: 대각선, FE / UX, 트랙 번호 ∞ M (휠과 같이 돈다) */
function wheelPrint(no: string) {
  const k = 2;
  const S = 718;
  return canvasTex(S * k, S * k, (c) => {
    c.scale(k, k);
    c.strokeStyle = "#4d4d4b";
    c.fillStyle = "#4d4d4b";
    c.lineWidth = 1.6;
    c.save();
    c.translate(S / 2, S / 2);
    c.rotate(-Math.PI / 4);
    c.beginPath();
    c.moveTo(-343, 0);
    c.lineTo(343, 0);
    c.stroke();
    c.restore();
    c.font = `400 24px ${fontFamily()}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const label = (x: number, y: number, draw: () => void) => {
      c.save();
      c.translate(x, y);
      c.rotate(Math.PI / 4);
      draw();
      c.restore();
    };
    label(197, 176, () => c.fillText("FE / UX", 0, 0));
    label(511, 483, () => {
      c.textAlign = "left";
      c.fillText(no, -46, 0);
      c.font = `400 26px ${fontFamily()}`;
      c.fillText("∞", -12, 0);
      c.font = `400 20px ${fontFamily()}`;
      c.lineWidth = 1.4;
      c.strokeRect(16, -11, 18, 22);
      c.fillText("M", 18, 1);
    });
  });
}

/** 작은 키 윗면 글자 (M, +, −) */
const keyLabel = (txt: string, color: string, size = 0.62) =>
  canvasTex(128, 128, (c) => {
    c.fillStyle = color;
    c.font = `500 ${Math.round(128 * size)}px ${fontFamily()}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(txt, 64, 70);
  });

/** 허브 윗면: 대각선으로 갈린 두 면 */
const hubTop = () =>
  canvasTex(512, 512, (c) => {
    c.save();
    c.translate(256, 256);
    c.rotate(-Math.PI / 4);
    let g = c.createLinearGradient(-256, 0, 256, 0);
    g.addColorStop(0, "#f2f2f0");
    g.addColorStop(1, "#cfcfcd");
    c.fillStyle = g;
    c.fillRect(-256, -256, 512, 256);
    g = c.createLinearGradient(-256, 0, 256, 0);
    g.addColorStop(0, "#a9a9a7");
    g.addColorStop(1, "#d9d9d7");
    c.fillStyle = g;
    c.fillRect(-256, 0, 512, 256);
    c.restore();
  });

/* ---------------- 장면 ---------------- */

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

type Props = { live: MutableRefObject<Live>; deviceEl: HTMLDivElement; onReady: () => void };

function Model({ live, deviceEl, onReady }: Props) {
  const snap = useTape();
  const { invalidate, camera, size, gl } = useThree();
  // 그림자는 처음과 크기가 바뀔 때만 굽는다 (매 프레임 굽지 않음 — 기울기 ±6°로는 거의 변하지 않는다)
  const shadowDirty = useRef(3);
  useEffect(() => {
    shadowDirty.current = 2;
    invalidate();
  }, [size, invalidate]);
  const root = useRef<THREE.Group>(null);
  const wheel = useRef<THREE.Group>(null);
  const lever = useRef<THREE.Group>(null);
  const leverBar = useRef<THREE.Group>(null);
  // 키 스프링 (눌림 깊이·속도) — 살짝 튕기며 돌아온다
  const springs = useRef<Record<string, { z: number; v: number }>>({});
  const cross = useRef<THREE.Mesh>(null);
  const fillL = useRef<THREE.Mesh>(null);
  const fillR = useRef<THREE.Mesh>(null);
  const keys = useRef<Record<string, THREE.Object3D | null>>({});
  const light = useRef<THREE.DirectionalLight>(null);
  const frame = useRef<Frame | null>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, lx: -0.5, ly: -0.6 });
  const ready = useRef(false);

  // 재질
  const mat = useMemo(() => {
    const rough = brushed();
    rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(2, 3);
    // 양극산화 알루미늄: 금속성을 절반쯤으로 — 정면에서 봐도 밝은 은색으로 남는다
    const alu = new THREE.MeshStandardMaterial({ color: "#cdcdca", metalness: 0.72, roughness: 0.5, roughnessMap: rough, envMapIntensity: 1.05 });
    const aluBright = new THREE.MeshStandardMaterial({ color: "#d8d8d5", metalness: 0.72, roughness: 0.32, envMapIntensity: 1.1 });
    // 키 윗면: 바디보다 살짝 밝고 무광
    const keyMat = new THREE.MeshStandardMaterial({ color: "#d6d6d3", metalness: 0.6, roughness: 0.5, roughnessMap: rough, envMapIntensity: 1 });
    const ringTex = rings();
    const wheelMat = new THREE.MeshPhysicalMaterial({
      color: "#d2d2cf",
      metalness: 0.9,
      roughness: 0.3,
      anisotropy: 0.9,
      anisotropyMap: spinDir(),
      bumpMap: ringTex,
      bumpScale: 0.35,
      envMapIntensity: 1.2,
    });
    const hubMat = new THREE.MeshStandardMaterial({ map: hubTop(), metalness: 0.6, roughness: 0.18, envMapIntensity: 1.25 });
    const dark = new THREE.MeshStandardMaterial({ color: "#2a2a29", metalness: 0.2, roughness: 0.75 });
    const groove = new THREE.MeshStandardMaterial({ color: "#7f7f7d", metalness: 0.6, roughness: 0.5 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#050505", metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 });
    const ink = new THREE.MeshStandardMaterial({ color: "#1d1d1d", roughness: 0.6 });
    const orange = new THREE.MeshPhysicalMaterial({ color: "#ff4d12", roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2, emissive: "#ff3a00", emissiveIntensity: 0.15 });
    const knob = new THREE.MeshStandardMaterial({
      color: "#bdbdbb",
      metalness: 0.95,
      roughness: 0.32,
      normalMap: knurl(),
      normalScale: new THREE.Vector2(1.4, 1.4),
      envMapIntensity: 1.25,
    });
    const knobCap = new THREE.MeshStandardMaterial({ color: "#c9c9c7", metalness: 0.95, roughness: 0.22, envMapIntensity: 1.3 });
    const print = new THREE.MeshBasicMaterial({ map: bodyPrint(), transparent: true, depthWrite: false });
    const accent = new THREE.MeshBasicMaterial({ color: "#ff5a1f" });
    const led = new THREE.MeshBasicMaterial({ color: "#9a9a98" });
    const mLabel = new THREE.MeshBasicMaterial({ map: keyLabel("M", "#ffffff"), transparent: true, depthWrite: false });
    const plusLabel = new THREE.MeshBasicMaterial({ map: keyLabel("+", "#6d6d6b", 0.5), transparent: true, depthWrite: false });
    const minusLabel = new THREE.MeshBasicMaterial({ map: keyLabel("−", "#6d6d6b", 0.5), transparent: true, depthWrite: false });
    return { alu, aluBright, keyMat, wheelMat, hubMat, dark, groove, glass, ink, orange, knob, knobCap, print, accent, led, mLabel, plusLabel, minusLabel };
  }, []);

  const wheelPrintMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(() => {
    const t = wheelPrint(String(snap.track).padStart(2, "0"));
    wheelPrintMat.map?.dispose();
    wheelPrintMat.map = t;
    wheelPrintMat.needsUpdate = true;
    invalidate();
  }, [snap.track, wheelPrintMat, invalidate]);

  // 글꼴이 늦게 오면 인쇄를 다시 그린다
  useEffect(() => {
    document.fonts?.ready.then(() => {
      mat.print.map?.dispose();
      mat.print.map = bodyPrint();
      mat.print.needsUpdate = true;
      invalidate();
    });
  }, [mat, invalidate]);

  // 강조색: 페이더 레벨과 사운드 LED
  useEffect(() => {
    const c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (c) mat.accent.color.set(c);
    mat.led.color.set(snap.sound ? mat.accent.color : new THREE.Color("#9a9a98"));
    invalidate();
  }, [snap.track, snap.sound, mat, invalidate]);

  // 카메라: 기기 중심을 정면에서, CSS perspective와 같은 거리
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const h = DH + MARGIN * 2;
    cam.fov = (2 * Math.atan(h / 2 / CAM_D) * 180) / Math.PI;
    cam.position.set(0, 0, CAM_D);
    cam.near = 100;
    cam.far = CAM_D * 3;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  // 테이프 프레임 → 휠 각도·페이더·레벨
  useEffect(
    () =>
      tape.onFrame((f) => {
        const p = frame.current;
        frame.current = f;
        if (!p || Math.abs(p.angle - f.angle) > 0.01 || Math.abs(p.progress - f.progress) > 1e-4 || Math.abs(p.level - f.level) > 0.004) invalidate();
      }),
    [invalidate],
  );

  // 포인터 → 기울기와 빛
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) {
      tilt.current.tx = 0.35;
      tilt.current.ty = -0.3;
      invalidate();
      return;
    }
    const move = (e: PointerEvent) => {
      const r = deviceEl.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.6)));
      tilt.current.tx = nx;
      tilt.current.ty = ny;
      invalidate();
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [deviceEl, invalidate]);

  useEffect(() => () => void (deviceEl.style.transform = ""), [deviceEl]);

  // 누르기·끌기·상태 변화가 있을 때만 다시 그린다
  useEffect(() => {
    const kick = () => invalidate();
    const ev = ["pointerdown", "pointerup", "pointermove", "keydown", "keyup"] as const;
    ev.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    return () => ev.forEach((e) => window.removeEventListener(e, kick));
  }, [invalidate]);
  useEffect(() => invalidate(), [snap.playing, snap.rec, invalidate]);

  useFrame((_, dt) => {
    const f = frame.current;
    const t = tilt.current;
    // 시간 기준으로 따라간다 — 느린 기기에서도 같은 시간에 자리 잡는다
    const ease = 1 - Math.exp(-Math.min(dt, 0.1) * 9);
    t.x += (t.tx - t.x) * ease;
    t.y += (t.ty - t.y) * ease;
    const moving = Math.abs(t.tx - t.x) + Math.abs(t.ty - t.y) > 0.002;
    const rx = t.y * TILT_X;
    const ry = t.x * TILT_Y;
    if (root.current) root.current.rotation.set(rx, ry, 0);
    // DOM 조작층도 같은 기울기 (CSS는 y축이 아래라 x 회전 부호가 반대)
    const px = (deviceEl.getBoundingClientRect().width / DW) * CAM_D;
    deviceEl.style.transform = `perspective(${px.toFixed(1)}px) rotateX(${(-rx).toFixed(5)}rad) rotateY(${ry.toFixed(5)}rad)`;
    // 반사광은 포인터 쪽 위에서 (그림자는 고정된 다른 빛이 만든다)
    if (light.current) light.current.position.set(-500 + t.x * 700, 700 - t.y * 500, 1400);

    if (f && wheel.current) wheel.current.rotation.z = (-f.angle * Math.PI) / 180;
    if (f && cross.current) cross.current.position.y = Y(937 + 9 + f.progress * (255 - 18));
    const lv = f?.level ?? 0;
    if (fillL.current) fillL.current.scale.y = Math.max(0.001, lv);
    if (fillR.current) fillR.current.scale.y = Math.max(0.001, lv * 0.9);
    // 레버: 바깥 막대·안쪽 팔·축이 한 덩어리로 위아래로 움직이고, 막대는 살짝 기운다
    const l = live.current.lev;
    if (lever.current) lever.current.position.y = 54 * l;
    if (leverBar.current) leverBar.current.rotation.z = (3 * l * Math.PI) / 180;

    // 키: 누르는 중 14u, 걸쇠(재생·녹음) 9u 들어가고, 놓으면 스프링으로 튕기며 돌아온다
    const pressed = live.current.pressed;
    const k = keys.current;
    let springing = false;
    const spring = (id: string, target: number, apply: (v: number) => void) => {
      const s = (springs.current[id] ??= { z: 0, v: 0 });
      const n = 4;
      const h = Math.min(dt, 0.05) / n;
      for (let i = 0; i < n; i++) {
        s.v += (900 * (target - s.z) - 34 * s.v) * h;
        s.z += s.v * h;
      }
      if (Math.abs(target - s.z) < 0.02 && Math.abs(s.v) < 0.5) s.z = target;
      else springing = true;
      apply(s.z);
    };
    spring("rec", pressed === "rec" ? -14 : snap.rec ? -9 : 0, (z) => k.rec && (k.rec.position.z = z));
    spring("play", pressed === "play" ? -14 : snap.playing ? -9 : 0, (z) => k.play && (k.play.position.z = z));
    spring("stop", pressed === "stop" ? -14 : 0, (z) => k.stop && (k.stop.position.z = z));
    spring("menu", pressed === "menu" ? -5 : 0, (z) => k.menu && (k.menu.position.z = z));
    spring("plus", pressed === "plus" ? -6 : 0, (z) => k.plus && (k.plus.position.z = z));
    spring("minus", pressed === "minus" ? -6 : 0, (z) => k.minus && (k.minus.position.z = z));
    spring("theme", pressed === "theme" ? -5 : 0, (z) => k.theme && (k.theme.position.x = z));

    if (moving || l !== 0 || pressed || springing) invalidate();
    if (shadowDirty.current > 0) {
      gl.shadowMap.needsUpdate = true;
      shadowDirty.current--;
      if (shadowDirty.current > 0) invalidate();
    }
    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(onReady);
    }
  });

  // 기하 (한 번만)
  const geo = useMemo(() => {
    return {
      body: slab(776, 1118, 26, DEPTH, 12, 8),
      // 트랜스포트 키: 바디 위로 30u 솟은 두꺼운 판, 모서리 5u 모따기
      key: slab(189, 276, 6, 48, 5, 5),
      keyStop: slab(190, 276, 6, 48, 5, 5),
      transportBase: new THREE.PlaneGeometry(578, 276),
      wheel: new THREE.CylinderGeometry(359, 359, 10, 160),
      wheelRim: new THREE.TorusGeometry(357, 2.4, 12, 160),
      groove: new THREE.CylinderGeometry(364, 364, 2, 160),
      hub: new THREE.CylinderGeometry(93.5, 96, 12, 96),
      screw: new THREE.CylinderGeometry(5, 5, 3, 20),
      round: new THREE.CylinderGeometry(32, 30, 4, 48),
      ledDot: new THREE.CircleGeometry(4, 24),
      pm: slab(176, 76, 38, 6, 2),
      pmKey: new THREE.SphereGeometry(30, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      pmStem: new THREE.CylinderGeometry(30, 30, 6, 40),
      mkey: slab(28, 28, 3, 16, 2, 3),
      side1: slab(10, 150, 4, 30, 1.5),
      side2: slab(10, 88, 4, 30, 1.5),
      side3: slab(10, 76, 4, 30, 1.5),
      recTab: slab(22, 167, 8, 30, 2),
      oled: slab(182, 100, 12, 3, 1),
      mic: new THREE.CircleGeometry(4.5, 20),
      slot: slab(11, 255, 5.5, 2, 0.6),
      fill: new THREE.PlaneGeometry(7, 247).translate(0, 123.5, 0), // 아래쪽 기준으로 늘어난다
      cross: new THREE.BoxGeometry(94, 3, 3),
      antenna: new THREE.CapsuleGeometry(8, 90, 8, 24),
      leverBar: new THREE.CapsuleGeometry(13, 562, 8, 32),
      leverArm: new THREE.CapsuleGeometry(12, 30, 8, 24),
      leverSlot: new THREE.BoxGeometry(10, 24 + 54 * 2 + 8, 30),
      pivot: new THREE.SphereGeometry(9, 24, 16),
      // 노브: 양 끝을 모따기한 원통(선반 가공 단면) + 널링된 옆면
      knobBody: new THREE.LatheGeometry(
        [
          [0, -65.5],
          [70, -65.5],
          [74, -64.5],
          [77.5, -61],
          [78.5, -57],
          [78.5, 57],
          [77.5, 61],
          [74, 64.5],
          [70, 65.5],
          [0, 65.5],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        128,
      ),
      knobKnurl: new THREE.CylinderGeometry(78.7, 78.7, 106, 128, 1, true),
      knobRing: new THREE.TorusGeometry(78.6, 1.1, 8, 128),
      neck: new THREE.CylinderGeometry(18, 18, 30, 32),
      shadow: new THREE.PlaneGeometry(4000, 4000),
      print: new THREE.PlaneGeometry(DW, DH),
      wheelPrint: new THREE.PlaneGeometry(718, 718),
      tri: (() => {
        const s = new THREE.Shape();
        s.moveTo(-8.5, 11.5);
        s.lineTo(11.5, 0);
        s.lineTo(-8.5, -11.5);
        s.closePath();
        return new THREE.ShapeGeometry(s);
      })(),
      square: new THREE.PlaneGeometry(19, 19),
      dot: new THREE.CircleGeometry(12, 32),
      label: new THREE.PlaneGeometry(26, 26),
    };
  }, []);

  const W = 458; // 휠 중심 (기기 좌표)
  const WY = 553;
  const keyX = [67 + 94.5, 67 + 194 + 94.5, 67 + 388 + 95];
  const keyY = 934 + 138;
  const symY = 934 + 58 + 12;

  return (
    <>
      <hemisphereLight args={["#ffffff", "#8a8a88", 0.45]} />
      {/* 왼쪽 위에서 넓게 비추는 조명 — 판 위에 은은한 밝기 차이를 만든다 */}
      <spotLight position={[-700, 1100, 900]} angle={0.75} penumbra={1} decay={0} intensity={0.9} />
      <directionalLight ref={light} intensity={0.75} position={[-500, 700, 1400]} />
      {/* 오른쪽 아래에서 모서리를 짚는 약한 역광 — 두께가 읽히게 */}
      <directionalLight intensity={0.35} position={[900, -300, 500]} />
      <directionalLight
        intensity={0.55}
        position={[-500, 700, 1400]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={10}
        shadow-blurSamples={10}
        shadow-camera-left={-900}
        shadow-camera-right={900}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
        shadow-camera-near={100}
        shadow-camera-far={4000}
      />
      {/* 그림자를 받는 투명 바닥 */}
      <mesh geometry={geo.shadow} position={[0, 0, -DEPTH - 90]} receiveShadow>
        <shadowMaterial transparent opacity={0.16} />
      </mesh>

      <group ref={root}>
        {/* 바디 */}
        <mesh geometry={geo.body} material={mat.alu} position={[X(455), Y(651), 0]} castShadow receiveShadow />
        <mesh geometry={geo.print} material={mat.print} position={[0, 0, 0.25]} />

        {/* 안테나 */}
        <mesh geometry={geo.antenna} material={mat.aluBright} position={[X(180), Y(50), MID]} castShadow />

        {/* 마이크 구멍 */}
        <mesh geometry={geo.mic} material={mat.dark} position={[X(327.5), Y(158.5), 0.3]} />
        <mesh geometry={geo.mic} material={mat.groove} position={[X(453.5), Y(158.5), 0.3]} />

        {/* OLED 유리 (글자는 DOM) */}
        <mesh geometry={geo.oled} material={mat.glass} position={[X(729), Y(168), 1.2]} />

        {/* M 키 */}
        <group ref={(o) => void (keys.current.menu = o)}>
          <mesh geometry={geo.mkey} material={mat.orange} position={[X(812), Y(321), 9]} castShadow />
          <mesh geometry={geo.label} material={mat.mLabel} position={[X(812), Y(321), 9.2]} scale={0.9} />
        </group>

        {/* 측면 키 */}
        <group ref={(o) => void (keys.current.theme = o)}>
          <mesh geometry={geo.side1} material={mat.aluBright} position={[X(846), Y(327), MID + 15]} castShadow />
        </group>
        <mesh geometry={geo.side2} material={mat.aluBright} position={[X(846), Y(484), MID + 15]} castShadow />
        <mesh geometry={geo.side3} material={mat.aluBright} position={[X(846), Y(617), MID + 15]} castShadow />

        {/* 레버: 바디 옆면의 홈을 따라 막대·팔·축이 함께 오르내린다 */}
        <mesh geometry={geo.leverSlot} material={mat.dark} position={[X(66), Y(544), MID]} />
        <group ref={lever}>
          <group ref={leverBar} position={[X(20), Y(543), MID]}>
            <mesh geometry={geo.leverBar} material={mat.aluBright} castShadow />
          </group>
          <mesh geometry={geo.leverArm} material={mat.alu} position={[X(48), Y(544), MID]} rotation={[0, 0, Math.PI / 2]} castShadow />
          <mesh geometry={geo.pivot} material={mat.aluBright} position={[X(30), Y(544), MID + 8]} />
        </group>

        {/* 조그 휠 */}
        <mesh geometry={geo.groove} material={mat.dark} position={[X(W), Y(WY), 0.5]} rotation={[Math.PI / 2, 0, 0]} />
        <group ref={wheel} position={[X(W), Y(WY), 0]}>
          <mesh geometry={geo.wheel} material={mat.wheelMat} position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow />
          <mesh geometry={geo.wheelRim} material={mat.aluBright} position={[0, 0, 7.6]} />
          <mesh geometry={geo.wheelPrint} material={wheelPrintMat} position={[0, 0, 8.2]} />
          <mesh geometry={geo.hub} material={mat.hubMat} position={[0, 0, 14]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          {[
            [-18, -61],
            [-47, 44],
            [59, 16],
          ].map(([dx, dy], n) => (
            <mesh key={n} geometry={geo.screw} material={mat.aluBright} position={[dx, -dy, 20.6]} rotation={[Math.PI / 2, 0, 0]} />
          ))}
        </group>

        {/* 사운드 버튼 (오목) + LED */}
        <mesh geometry={geo.round} material={mat.groove} position={[X(159), Y(860), -1]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={geo.ledDot} material={mat.led} position={[X(159), Y(860), 1.2]} />

        {/* +/− */}
        <mesh geometry={geo.pm} material={mat.groove} position={[X(747), Y(842), 0.5]} rotation={[0, 0, Math.PI / 4]} />
        <group ref={(o) => void (keys.current.plus = o)}>
          <mesh geometry={geo.pmStem} material={mat.aluBright} position={[X(781), Y(806), 3]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={geo.pmKey} material={mat.aluBright} position={[X(781), Y(806), 6]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.4, 1]} castShadow />
          <mesh geometry={geo.label} material={mat.plusLabel} position={[X(781), Y(806), 18.2]} />
        </group>
        <group ref={(o) => void (keys.current.minus = o)}>
          <mesh geometry={geo.pmStem} material={mat.aluBright} position={[X(711), Y(875), 3]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={geo.pmKey} material={mat.aluBright} position={[X(711), Y(875), 6]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.4, 1]} castShadow />
          <mesh geometry={geo.label} material={mat.minusLabel} position={[X(711), Y(875), 18.2]} />
        </group>

        {/* 트랜스포트 키 */}
        <mesh geometry={geo.transportBase} material={mat.dark} position={[X(67 + 289), Y(1072), 0.3]} />
        <mesh geometry={geo.recTab} material={mat.aluBright} position={[X(57), Y(1046), MID + 15]} castShadow />
        {(["rec", "play", "stop"] as const).map((id, n) => (
          <group key={id} ref={(o) => void (keys.current[id] = o)}>
            <mesh geometry={id === "stop" ? geo.keyStop : geo.key} material={mat.keyMat} position={[X(keyX[n]), Y(keyY), 30]} castShadow receiveShadow />
            {id === "rec" && <mesh geometry={geo.dot} material={mat.orange} position={[X(keyX[n]), Y(symY), 30.3]} />}
            {id === "play" && <mesh geometry={geo.tri} material={mat.ink} position={[X(keyX[n]) + 1.5, Y(symY), 30.3]} />}
            {id === "stop" && <mesh geometry={geo.square} material={mat.ink} position={[X(keyX[n]), Y(symY), 30.3]} />}
          </group>
        ))}

        {/* 페이더: 홈 둘, 레벨, 가로 막대 */}
        {[719, 773].map((x, n) => (
          <group key={x}>
            <mesh geometry={geo.slot} material={mat.dark} position={[X(x), Y(1064.5), 0.6]} />
            <mesh
              ref={n === 0 ? fillL : fillR}
              geometry={geo.fill}
              material={mat.accent}
              position={[X(x), Y(1188), 0.9]}
            />
          </group>
        ))}
        <mesh ref={cross} geometry={geo.cross} material={mat.ink} position={[X(746), Y(946), 3]} castShadow />

        {/* 볼륨 노브 */}
        <mesh geometry={geo.neck} material={mat.groove} position={[X(721), Y(1222), MID]} />
        <group position={[X(747.5), Y(1299.5), MID]}>
          <mesh geometry={geo.knobBody} material={mat.knobCap} castShadow />
          <mesh geometry={geo.knobKnurl} material={mat.knob} />
          <mesh geometry={geo.knobRing} material={mat.knobCap} position={[0, 53, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.knobRing} material={mat.knobCap} position={[0, -53, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </group>
    </>
  );
}

export default function Device3D(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      shadows="variance"
      onCreated={({ gl }) => {
        // 색을 덜 바래게: 중립 톤 매핑, 노출 살짝 낮게
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
        gl.shadowMap.autoUpdate = false;
      }}
      dpr={[1, typeof window !== "undefined" && window.matchMedia("(hover: none)").matches ? 1.75 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, CAM_D], near: 100, far: CAM_D * 3 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Env />
      <Model {...props} />
    </Canvas>
  );
}
