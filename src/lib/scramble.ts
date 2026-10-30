// 챕터 제목이 OLED처럼 한 번 섞였다가 왼쪽부터 맞춰지는 연출.
// 원문은 그대로 두고(레이아웃·스크린리더 불변) 위에 겹친 층에서만 글자를 바꾼다.

const UPPER = "ABCDEFGHJKLMNPRSTUVWXYZ";
const LOWER = "abcdeghkmnopqrsuvwxyz";
const DIGIT = "0123456789";
const HANGUL = "가나다라마바사아자차카타파하";
const SIGN = "#%&*+/=<>";

const pick = (s: string) => s[(Math.random() * s.length) | 0];
function glyph(ch: string) {
  if (/\s/.test(ch)) return ch;
  if (/[A-Z]/.test(ch)) return Math.random() < 0.15 ? pick(SIGN) : pick(UPPER);
  if (/[a-z]/.test(ch)) return pick(LOWER);
  if (/[0-9]/.test(ch)) return pick(DIGIT);
  if (/[가-힣]/.test(ch)) return pick(HANGUL);
  return pick(SIGN);
}

const running = new WeakMap<HTMLElement, () => void>();

export function scramble(el: HTMLElement, dur = 560) {
  running.get(el)?.();
  const src = el.firstElementChild as HTMLElement | null;
  const text = src?.textContent ?? "";
  if (!src || !text.trim()) return;

  const layer = document.createElement("span");
  layer.className = "scr";
  layer.setAttribute("aria-hidden", "true");
  el.appendChild(layer);
  el.setAttribute("data-scrambling", "");

  const chars = [...text];
  // 왼쪽부터 차례로 맞춰지되, 글자마다 살짝 흔들린 시점에
  const at = chars.map((_, i) => dur * (0.3 + 0.7 * (i / Math.max(1, chars.length - 1))) + (Math.random() - 0.5) * 60);
  const t0 = performance.now();
  let lastSwap = 0;
  let raf = 0;
  let out = chars.map(glyph);

  const done = () => {
    cancelAnimationFrame(raf);
    layer.remove();
    el.removeAttribute("data-scrambling");
    running.delete(el);
  };
  const step = (now: number) => {
    const t = now - t0;
    if (t >= dur + 40) return done();
    if (now - lastSwap > 48) {
      lastSwap = now;
      out = chars.map((ch, i) => (t >= at[i] ? ch : glyph(ch)));
      layer.textContent = out.join("");
    }
    raf = requestAnimationFrame(step);
  };
  layer.textContent = out.join("");
  raf = requestAnimationFrame(step);
  running.set(el, done);
}
