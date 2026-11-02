// 음악 시각화(Viz.tsx)를 장면(Motion.tsx)이 조종하는 값 — React 렌더 없이 매 프레임 읽는다.
export const viz = {
  /** 원형 파형 비중 0..1 (트랙 카드에서 1, 본문에선 낮게) */
  ring: 0,
  /** 장면이 더하는 세기 0..1 */
  boost: 0,
  /** 전체 보이기 0..1 (첫 화면에서는 꺼져 있다가 재생바로 바뀌며 켜진다) */
  on: 0,
  /** 순간 충격 — 수치가 박히거나 트랙이 바뀔 때 */
  kick: 0,
  hit(v = 1) {
    this.kick = Math.max(this.kick, v);
  },
};
