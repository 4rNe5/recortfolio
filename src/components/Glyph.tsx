import type { CSSProperties } from "react";
import type { Track } from "@/content/portfolio";
import { SHAPE } from "@/lib/codes";

/** 섹션 종류를 나타내는 도형 하나 — 색은 트랙 색(--c)만 쓴다 */
export default function Glyph({ t, color }: { t: Track; color?: string }) {
  return (
    <span
      className="glyph"
      data-shape={SHAPE[t.kind]}
      style={color ? ({ ["--g" as string]: color } as CSSProperties) : undefined}
      aria-hidden
    />
  );
}
