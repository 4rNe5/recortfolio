// 챕터 제목이 OLED처럼 한 번 섞였다가 왼쪽부터 맞춰지는 연출.
// 원문은 그대로 두고(레이아웃·스크린리더 불변) 위에 겹친 층에서만 글자를 바꾼다.
// 겹친 층이 원문과 다른 자리에서 줄을 바꾸면 아랫줄로 번져 보이므로,
// ① 원래 글자마다 그 폭의 칸을 만들어 섞인 글자를 넣고(전체 폭·줄바꿈 불변) ② 폭이 비슷한 글자로만 바꾸고
// ③ 층을 제목 칸 밖으로 못 나가게 자른다 (CSS: .scr).

// 폭이 비슷한 글자끼리 묶음
const POOLS = [
  "iljtfr!|.,:;'", // 좁은 글자
  "mw", // 넓은 소문자
  "MW", // 넓은 대문자
  "abcdeghknopqsuvxyz", // 보통 소문자 (폭 차이가 작은 것만)
  "ABCDEFGHKLNOPQRSTUVXYZ", // 보통 대문자
  "0123456789",
];
const HANGUL = "가나다라마바사아자차카타파하";

const pick = (s: string) => s[(Math.random() * s.length) | 0];
function glyph(ch: string) {
  if (/\s/.test(ch)) return ch;
  if (/[가-힣]/.test(ch)) return pick(HANGUL);
  const pool = POOLS.find((p) => p.includes(ch));
  return pool ? pick(pool) : ch;
}

const running = new WeakMap<HTMLElement, () => void>();

export function scramble(el: HTMLElement, dur = 400) {
  running.get(el)?.();
  const src = el.firstElementChild as HTMLElement | null;
  const node = src?.firstChild;
  const text = src?.textContent ?? "";
  if (!src || !node || node.nodeType !== Node.TEXT_NODE || !text.trim()) return;

  // 원래 글자 하나하나의 폭을 재서, 섞이는 글자를 그 폭의 칸에 넣는다 → 전체 폭·줄바꿈이 원문과 같다
  const chars = [...text];
  const range = document.createRange();
  const widths: number[] = [];
  let off = 0;
  for (const ch of chars) {
    range.setStart(node, off);
    range.setEnd(node, off + ch.length);
    widths.push(range.getBoundingClientRect().width);
    off += ch.length;
  }

  const layer = document.createElement("span");
  layer.className = "scr";
  layer.setAttribute("aria-hidden", "true");
  const cells: (HTMLSpanElement | null)[] = [];
  let word: HTMLSpanElement | null = null;
  chars.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      word = null;
      layer.append(ch);
      cells.push(null);
      return;
    }
    if (!word) {
      word = document.createElement("span");
      word.style.whiteSpace = "nowrap";
      layer.append(word);
    }
    const cell = document.createElement("span");
    cell.style.cssText = `display:inline-block;width:${widths[i]}px;text-align:center;white-space:pre`;
    word.append(cell);
    cells.push(cell);
  });
  el.appendChild(layer);
  el.setAttribute("data-scrambling", "");

  // 왼쪽부터 차례로 맞춰진다
  const at = chars.map((_, i) => dur * (0.25 + 0.75 * (i / Math.max(1, chars.length - 1))));
  const t0 = performance.now();
  let lastSwap = 0;
  let raf = 0;
  const paint = (t: number) =>
    cells.forEach((cell, i) => {
      if (cell) cell.textContent = t >= at[i] ? chars[i] : glyph(chars[i]);
    });

  const done = () => {
    cancelAnimationFrame(raf);
    layer.remove();
    el.removeAttribute("data-scrambling");
    running.delete(el);
  };
  const step = (now: number) => {
    const t = now - t0;
    if (t >= dur + 30) return done();
    if (now - lastSwap > 50) {
      lastSwap = now;
      paint(t);
    }
    raf = requestAnimationFrame(step);
  };
  paint(0);
  raf = requestAnimationFrame(step);
  running.set(el, done);
}
