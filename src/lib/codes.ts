import type { Track } from "@/content/portfolio";

// TE 제품 이름(op–1, tp–7)처럼 프로젝트마다 붙이는 모델 코드
const PREFIX: Record<string, string> = {
  jobanswer: "jb",
  ttak: "tk",
  sfoodgo: "sf",
  palette: "pl",
  lightlib: "ll",
  minesweeper: "ms",
  turtlepods: "tp",
};
export const codeOf = (t: Track, i: number) => `${PREFIX[t.id] ?? t.id.slice(0, 2)}–${String(i).padStart(2, "0")}`;

/** 도형 규칙: 소개 ○ · 프로젝트 ■ · 수상 ▲ · 발표 ◆ · 연락 ● */
export const SHAPE: Record<Track["kind"], "ring" | "square" | "triangle" | "diamond" | "circle"> = {
  intro: "ring",
  project: "square",
  awards: "triangle",
  stage: "diamond",
  contact: "circle",
};
