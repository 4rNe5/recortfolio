"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dock } from "@/lib/dock";
import { tape } from "@/lib/tape";

// 스크롤 = 재생. Tracks.tsx의 data-* 표시에 GSAP ScrollTrigger 장면을 붙인다.
// 모션 줄이기면 아무것도 움직이지 않고, 녹음기는 화면 밖으로 나갈 때 재생바로 바뀐다.

const NUM = /([+\-−]?)(\d[\d,]*(?:\.\d+)?)/;
const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/** el의 위치를 root 기준으로 — transform을 무시한 레이아웃 값 */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** 첫 화면: 스크롤(또는 재생)하는 동안 녹음기가 줄어들며 재생바 자리로 날아가,
 *  조그 휠이 재생바의 미니 휠 위에 정확히 겹친 순간 재생바로 바뀐다. 비운 자리는 이름이 좁혀 메운다. */
function heroMorph() {
  const hero = q("[data-hero]");
  const slot = q("[data-hero-slot]");
  const dev = q("[data-hero-device]");
  const recWheel = q("[data-rec-wheel]");
  const barWheel = q("[data-bar-wheel]");
  if (!hero || !slot || !dev || !recWheel || !barWheel) return;

  // 고정된 첫 화면 기준: 큰 휠 가운데 → 미니 휠 가운데, 두 휠 지름이 같아지는 배율
  const geo = () => {
    const h = hero.getBoundingClientRect();
    const sl = slot.getBoundingClientRect();
    const o = offsetIn(recWheel, dev);
    const b = barWheel.getBoundingClientRect(); // 휠은 돌아가 있어도 가운데는 같다
    const s = barWheel.offsetWidth / recWheel.offsetWidth;
    const x0 = sl.left - h.left;
    const y0 = sl.top - h.top;
    return {
      s,
      x: b.left + b.width / 2 - x0 - (o.x + recWheel.offsetWidth / 2) * s,
      y: b.top + b.height / 2 - y0 - (o.y + recWheel.offsetHeight / 2) * s,
    };
  };
  const left = q('[data-hero-name="left"]', hero);
  const right = q('[data-hero-name="right"]', hero);
  // 두 글자 덩어리 사이를 낱말 사이 간격(0.24em)만 남기고 좁힌다 — 양쪽이 반씩 다가간다
  const close = () => {
    if (!left || !right) return 0;
    const gap = right.offsetLeft - (left.offsetLeft + left.offsetWidth);
    const word = parseFloat(getComputedStyle(right).fontSize) * 0.24;
    return Math.max(0, (gap - word) / 2);
  };
  const desktop = window.matchMedia("(min-width: 1100px)").matches;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=75%",
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => dock.set(self.progress > 0.9),
      onLeave: () => dock.set(true),
      onLeaveBack: () => dock.set(false),
    },
  });
  tl.to(qa("[data-hero-text]", hero), { autoAlpha: 0, y: -28, duration: 0.3, ease: "power1.in" }, 0)
    .fromTo(
      dev,
      { x: 0, y: 0, scale: 1 },
      { x: () => geo().x, y: () => geo().y, scale: () => geo().s, duration: 0.8, ease: "power2.inOut" },
      0.06,
    )
    .to(dev, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.86);
  if (!desktop && left && right) {
    // 모바일: 녹음기가 떠난 자리로 이름이 내려와 화면 가운데에 선다
    const drop = () => {
      const h = hero.getBoundingClientRect();
      const a = left.getBoundingClientRect();
      const b = right.getBoundingClientRect();
      const mid = (a.top + b.bottom) / 2 - h.top;
      return hero.offsetHeight / 2 - mid;
    };
    tl.to([left, right], { y: () => drop(), duration: 0.6, ease: "power2.inOut" }, 0.3);
  }
  if (desktop) {
    // 녹음기가 빠진 자리를 이름이 좁혀 한 줄로 이어진다
    tl.to(left, { x: () => close(), duration: 0.6, ease: "power2.inOut" }, 0.3).to(right, { x: () => -close(), duration: 0.6, ease: "power2.inOut" }, 0.3);
  }
}

/** 트랙 카드: 들어올 때 이름이 떠오르고 파형이 왼쪽부터 그려진다, 나갈 때 위로 흐려진다 */
function cards() {
  for (const card of qa("[data-card]")) {
    const title = q("[data-card-title]", card);
    const meta = q("[data-card-meta]", card);
    const wave = q("[data-card-wave]", card);
    gsap
      .timeline({ scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .fromTo(title, { yPercent: 40, autoAlpha: 0, scale: 0.9 }, { yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.42, ease: "power2.out" }, 0)
      .fromTo(meta, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.12)
      .fromTo(wave, { clipPath: "inset(-50% 100% -50% 0)" }, { clipPath: "inset(-50% 0% -50% 0)", duration: 0.34, ease: "none" }, 0.16)
      .to([title, meta, wave], { yPercent: -30, autoAlpha: 0.1, duration: 0.4, ease: "power1.in" }, 0.6);
  }
}

/** 정체·수치·스택: 화면에 들어오면 아래에서 떠오른다 (스크롤을 되감으면 다시 숨는다) */
function rises() {
  const rise = (els: Element[], trigger: Element, extra: gsap.TweenVars = {}) =>
    gsap.from(els, {
      y: 56,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      ...extra,
      scrollTrigger: { trigger, start: "top 80%", toggleActions: "play none none reverse" },
    });
  for (const id of qa("[data-ident]")) {
    const [icon, ...rest] = qa("[data-ident-item]", id);
    gsap.from(icon, {
      scale: 0.5,
      rotate: -12,
      autoAlpha: 0,
      duration: 1.2,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: id, start: "top 80%", toggleActions: "play none none reverse" },
    });
    rise(rest, id, { delay: 0.15 });
  }
  for (const f of qa("[data-facts]")) rise(qa("[data-fact]", f), f, { stagger: 0.12 });
  for (const m of qa("[data-meta]")) rise(qa("[data-meta-item]", m), m);
}

/** 핵심 수치: 숫자가 0부터 올라간다 (숫자가 없는 값은 그대로) */
function counts() {
  for (const el of qa("[data-count]")) {
    const text = el.textContent ?? "";
    const m = text.match(NUM);
    if (!m || m.index === undefined) continue;
    const raw = m[2];
    const target = Number(raw.replace(/,/g, ""));
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const comma = raw.includes(",");
    const head = text.slice(0, m.index) + m[1];
    const tail = text.slice(m.index + m[0].length);
    const fmt = (v: number) => {
      const n = v.toFixed(decimals);
      return head + (comma ? Number(n).toLocaleString("en-US") : n) + tail;
    };
    const obj = { v: 0 };
    if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = fmt(0);
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => (el.textContent = fmt(obj.v)),
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }
}

/** 목업: 판이 펼쳐지고, 목업은 판보다 느리게(위로) 떠오르고, 뒤 글자는 옆으로 흐른다 */
function showcases(desktop: boolean) {
  for (const show of qa("[data-show]")) {
    const panel = q("[data-show-panel]", show);
    const word = q("[data-show-word]", show);
    const media = q("[data-show-media]", show);
    const shots = qa("[data-shot]", show);
    const tl = gsap.timeline({ scrollTrigger: { trigger: show, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    if (desktop && panel) tl.fromTo(panel, { scale: 0.86, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);
    if (desktop && word) tl.fromTo(word, { xPercent: 14 }, { xPercent: -14, duration: 1, ease: "none" }, 0);
    if (shots.length) {
      shots.forEach((sh, k) => tl.fromTo(sh, { yPercent: 18 + k * 10 }, { yPercent: -6 - k * 4, duration: 1, ease: "none" }, 0));
    } else if (media) {
      tl.fromTo(media, { yPercent: desktop ? 20 : 10 }, { yPercent: desktop ? -6 : -4, duration: 1, ease: "none" }, 0);
    }
  }
}

/** 한 일: 문장이 읽을 자리에 올 때 흐린 글자에서 진한 글자로 */
function dids() {
  for (const li of qa("[data-did-item]")) {
    gsap.fromTo(
      li,
      { autoAlpha: 0.14, y: 18 },
      { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: li, start: "top 88%", end: "top 58%", scrub: 0.4 } },
    );
  }
}

/** Side B: 큰 "SIDE B"가 양옆에서 모이고, 무대 카드는 스크롤에 맞춰 옆으로 흐른다 */
function sideB(desktop: boolean) {
  const intro = q("[data-side-intro]");
  if (intro) {
    const [a, b] = Array.from(intro.children);
    gsap
      .timeline({ scrollTrigger: { trigger: intro, start: "top bottom", end: "top 30%", scrub: 0.5 } })
      .fromTo(a, { xPercent: -40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: "power2.out" }, 0)
      .fromTo(b, { xPercent: 60, autoAlpha: 0, rotate: 20 }, { xPercent: 0, autoAlpha: 1, rotate: 0, ease: "power2.out" }, 0);
  }
  const reel = q("[data-reel]");
  const track = q("[data-reel-track]");
  if (desktop && reel && track) {
    const dist = () => {
      const cs = getComputedStyle(reel);
      const inner = reel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return Math.max(0, track.scrollWidth - inner);
    };
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: { trigger: reel, start: "center center", end: () => `+=${dist()}`, pin: true, scrub: 0.5, invalidateOnRefresh: true },
    });
  }
}

export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    let io: IntersectionObserver | null = null;

    mm.add(
      // 조건 중 하나라도 맞아야 실행되므로 데스크톱·모바일을 둘 다 적는다
      { desktop: "(min-width: 1100px)", mobile: "(max-width: 1099px)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce) {
          // 움직임 없이: 녹음기가 화면 밖으로 나가면 재생바가 나타난다
          const dev = q("[data-hero-device]");
          if (dev) {
            io = new IntersectionObserver(([e]) => dock.set(!e.isIntersecting));
            io.observe(dev);
          }
          return () => io?.disconnect();
        }
        heroMorph();
        cards();
        rises();
        counts();
        showcases(desktop);
        dids();
        sideB(desktop);
      },
    );

    // 고정 장면이 생기면 챕터 위치가 바뀐다 → 테이프가 다시 잰다
    const onRefresh = () => tape.measure();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    // 장면 전환(순간이동) 직후 새 위치의 장면 상태를 바로 맞춘다 — 전환 스냅샷이 옛 상태를 찍지 않게
    const onJump = () => ScrollTrigger.update();
    window.addEventListener("tape:jump", onJump);
    // 글꼴·이미지가 자리를 잡은 뒤 한 번 더
    const late = window.setTimeout(() => ScrollTrigger.refresh(), 800);
    return () => {
      window.clearTimeout(late);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("tape:jump", onJump);
      mm.revert();
      dock.set(false);
    };
  }, []);
  return null;
}
