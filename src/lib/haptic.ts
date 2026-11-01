// 버튼·조작의 촉각 피드백.
// Android 등: Vibration API. iOS Safari(진동 API 없음): 숨긴 스위치 체크박스(<input type=checkbox switch>)를
// 토글하면 iOS 18+이 시스템 햅틱을 낸다 — 사용자 동작(클릭·탭) 안에서 부를 때만 울린다.

export type HapticKind = "tick" | "light" | "medium" | "heavy" | "rec";

const PATTERN: Record<HapticKind, number | number[]> = {
  tick: 4,
  light: 8,
  medium: 14,
  heavy: 22,
  rec: [10, 40, 10],
};

let last = 0;
let iosLabel: HTMLLabelElement | null = null;

function iosSwitch() {
  if (iosLabel) return iosLabel;
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.append(input);
  document.body.append(label);
  return (iosLabel = label);
}

/** 같은 동작에서 여러 번 불려도(전역 클릭 + 테이프 조작) 한 번만 울린다 */
export function haptic(kind: HapticKind = "light") {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (kind !== "tick" && now - last < 60) return;
  last = now;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(PATTERN[kind]);
    return;
  }
  // 진동 API가 없는 터치 기기 = iOS. 틱(휠 디텐트)은 사용자 동작 밖이라 iOS에선 울릴 수 없어 건너뛴다
  if (kind === "tick" || !window.matchMedia("(pointer: coarse)").matches) return;
  const prev = document.activeElement as HTMLElement | null;
  iosSwitch().click();
  if (prev && prev !== document.activeElement) prev.focus({ preventScroll: true });
}

/** 사이트 전체: 버튼·링크를 누르면 가볍게 울린다 */
export function installHaptics() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.("button, a[href], [role=button], [role=switch], summary");
    if (!el || el.closest("[data-haptic=off]") || (el as HTMLButtonElement).disabled) return;
    haptic("light");
  };
  // 버블 단계: 조작 자체가 고른 햅틱(REC 등)이 먼저 울리고, 이건 60ms 안이라 건너뛴다
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
