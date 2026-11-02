"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dock } from "@/lib/dock";
import { tape } from "@/lib/tape";
import { viz } from "@/lib/viz";

// 스크롤 = 재생. Tracks.tsx의 data-* 표시에 GSAP ScrollTrigger 장면을 붙인다.
// 장면은 화면을 고정(pin)한 채 스크롤 진행에 묶여(scrub) 바뀌고, 음악 시각화(viz)를 같이 조종한다.
// 모션 줄이기면 아무것도 움직이지 않고(정지 배치), 녹음기는 화면 밖으로 나갈 때 재생바로 바뀐다.

const NUM = /([+\-−]?)(\d[\d,]*(?:\.\d+)?)/;
const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const vh = (k: number) => () => window.innerHeight * k;

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

/** 숫자 값이면 0부터 올라가는 카운터 (스크롤에 묶인 타임라인 안에서 쓴다) */
function counter(el: HTMLElement | null) {
  const text = el?.textContent ?? "";
  const m = text.match(NUM);
  if (!el || !m || m.index === undefined) return null;
  const raw = m[2];
  const target = Number(raw.replace(/,/g, ""));
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const comma = raw.includes(",");
  const head = text.slice(0, m.index) + m[1];
  const tail = text.slice(m.index + m[0].length);
  const obj = { v: 0 };
  const paint = () => {
    const n = obj.v.toFixed(decimals);
    el.textContent = head + (comma ? Number(n).toLocaleString("en-US") : n) + tail;
  };
  paint();
  return { obj, target, paint };
}

/** 첫 화면: 스크롤(또는 재생)하면 이름이 빠지고, 녹음기가 줄어들며 왼쪽 아래로 날아가
 *  조그 휠이 재생바의 미니 휠에 정확히 겹친 순간 재생바로 바뀐다. 동시에 음악 시각화가 켜진다. */
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
    const b = barWheel.getBoundingClientRect(); // 휠이 돌아가 있어도 가운데는 같다
    const s = barWheel.offsetWidth / recWheel.offsetWidth;
    const x0 = sl.left - h.left;
    const y0 = sl.top - h.top;
    return {
      s,
      x: b.left + b.width / 2 - x0 - (o.x + recWheel.offsetWidth / 2) * s,
      y: b.top + b.height / 2 - y0 - (o.y + recWheel.offsetHeight / 2) * s,
    };
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=70%",
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        dock.set(self.progress > 0.9);
        viz.on = gsap.utils.clamp(0, 1, (self.progress - 0.4) / 0.5);
      },
      onLeave: () => {
        dock.set(true);
        viz.on = 1;
      },
      onLeaveBack: () => {
        dock.set(false);
        viz.on = 0;
      },
    },
  });
  tl.to(qa("[data-hero-text]", hero), { autoAlpha: 0, y: -40, duration: 0.32, ease: "power1.in" }, 0)
    .fromTo(
      dev,
      { x: 0, y: 0, scale: 1 },
      { x: () => geo().x, y: () => geo().y, scale: () => geo().s, duration: 0.8, ease: "power2.inOut" },
      0.06,
    )
    .to(dev, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.86);
}

/** 장면 A: 원형 파형 한가운데 트랙 이름 → 이름이 위로 물러나며 앱 아이콘이 날아 들어오고 → 소개 → 핵심 3개가 하나씩 박힌다 */
function sceneA(sc: HTMLElement, desktop: boolean) {
  {
    const no = q("[data-a-no]", sc);
    const title = q("[data-a-title]", sc);
    const ident = q("[data-a-ident]", sc);
    const icon = q("[data-a-icon]", sc);
    const lines = qa("[data-a-line]", sc);
    const facts = qa("[data-a-fact]", sc);
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: sc,
        start: "top top",
        end: "+=190%",
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!self.isActive) return;
          const p = self.progress;
          viz.ring = p < 0.42 ? 1 : 0.3;
          viz.boost = p > 0.5 ? 0.45 : 0.15;
        },
        onLeave: () => {
          viz.ring = 0.12;
          viz.boost = 0;
        },
        onLeaveBack: () => {
          viz.ring = 0.12;
          viz.boost = 0;
        },
      },
    });
    tl.fromTo(no, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0)
      .fromTo(title, { autoAlpha: 0, scale: 0.5, filter: "blur(14px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.18 }, 0)
      .to(no, { autoAlpha: 0, duration: 0.06 }, 0.22)
      // 이름이 먼저 위로 물러난 뒤에 아이콘이 아래에서 올라온다 (서로 겹쳐 지나가지 않게)
      .to(title, { y: vh(desktop ? -0.36 : -0.34), scale: desktop ? 0.28 : 0.42, duration: 0.12, ease: "power2.inOut" }, 0.22)
      .fromTo(icon, { autoAlpha: 0, scale: 0.2, rotate: -28, y: vh(0.32) }, { autoAlpha: 1, scale: 1, rotate: 0, y: 0, duration: 0.16, ease: "back.out(1.5)" }, 0.32)
      .fromTo(lines, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.1 }, 0.36)
      .call(() => viz.hit(0.7), [], 0.34);
    // 핵심 3개: 데스크톱은 정체를 위로 밀어 올리고 아래에, 모바일은 정체를 비우고 그 자리에
    if (desktop) tl.to(ident, { y: vh(-0.13), scale: 0.78, duration: 0.12, ease: "power2.inOut" }, 0.5);
    else tl.to(ident, { autoAlpha: 0, y: vh(-0.08), duration: 0.1 }, 0.5);
    facts.forEach((f, k) => {
      const at = 0.56 + k * 0.1;
      tl.fromTo(f, { autoAlpha: 0, y: 70, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.1, ease: "back.out(1.6)" }, at).call(() => viz.hit(0.9), [], at + 0.02);
      const c = counter(q("[data-count]", f));
      if (c) tl.to(c.obj, { v: c.target, duration: 0.14, ease: "power3.out", onUpdate: c.paint }, at);
    });
    tl.to({}, { duration: 0.1 }, 0.92);
  }
}

/** 장면 B: 녹음기가 있던 왼쪽에 목업이 기울어진 채 날아와 서고, 오른쪽 "한 일"이 하나씩 넘어간다 — 넘어갈 때마다 목업이 돌고 커진다 */
function sceneB(sc: HTMLElement, desktop: boolean) {
  {
    const media = q("[data-b-media]", sc);
    const inner = q("[data-b-inner]", sc);
    const word = q("[data-b-word]", sc);
    const items = qa("[data-b-item]", sc);
    const cur = q("[data-b-current]", sc);
    const rail = q("[data-b-rail]", sc);
    const n = items.length;
    if (!n) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sc,
        start: "top top",
        end: () => `+=${n * 55 + 30}%`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!cur) return;
          const time = self.progress * tl.duration();
          cur.textContent = String(Math.min(n, Math.max(1, Math.floor(time + 0.25) + 1))).padStart(2, "0");
        },
      },
    });
    tl.fromTo(
      inner,
      { autoAlpha: 0, y: vh(0.4), rotateX: 50, rotateZ: -14, scale: 0.7 },
      { autoAlpha: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1, duration: 0.6, ease: "power3.out" },
      0,
    );
    // 트랙 색 판이 목업과 함께 펼쳐진다
    if (desktop && media) tl.fromTo(media, { "--panel": 0 }, { "--panel": 1, duration: 0.45, ease: "power2.out" }, 0);
    if (desktop && word) tl.fromTo(word, { xPercent: 22 }, { xPercent: -22, duration: n + 0.2, ease: "none" }, 0);
    if (rail) tl.fromTo(rail, { scaleX: 0 }, { scaleX: 1, duration: n, ease: "none" }, 0);
    items.forEach((it, k) => {
      const at = k === 0 ? 0.25 : k;
      tl.fromTo(it, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, at).call(() => viz.hit(0.55), [], at);
      if (k < n - 1) tl.to(it, { autoAlpha: 0, y: -70, duration: 0.25, ease: "power2.in" }, k + 0.72);
      if (k > 0)
        tl.to(
          inner,
          { rotateY: k % 2 ? -12 : 9, rotateZ: k % 2 ? 3 : -2, scale: 1 + 0.035 * k, y: vh(k % 2 ? -0.015 : 0.015), duration: 0.55, ease: "power2.inOut" },
          k - 0.15,
        );
    });
    tl.to({}, { duration: 0.2 }, n);
  }
}

/** 스택·링크: 칩이 사방에서 날아와 모인다 */
function credits(c: HTMLElement) {
  {
    gsap.from(qa("[data-credit]", c), {
      y: 50,
      autoAlpha: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: c, start: "top 85%", toggleActions: "play none none reverse" },
    });
    gsap.from(qa("[data-chip]", c), {
      x: () => gsap.utils.random(-260, 260),
      y: () => gsap.utils.random(80, 240),
      rotate: () => gsap.utils.random(-40, 40),
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.035,
      scrollTrigger: { trigger: c, start: "top 85%", toggleActions: "play none none reverse" },
    });
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
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add(
      // 조건 중 하나라도 맞아야 실행되므로 데스크톱·모바일을 둘 다 적는다
      { desktop: "(min-width: 1100px)", mobile: "(max-width: 1099px)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce) {
          // 움직임 없이: 녹음기가 화면 밖으로 나가면 재생바가 나타난다
          root.removeAttribute("data-motion");
          const dev = q("[data-hero-device]");
          if (!dev) return;
          const io = new IntersectionObserver(([e]) => dock.set(!e.isIntersecting));
          io.observe(dev);
          return () => io.disconnect();
        }
        // 장면을 한 화면에 겹쳐 두는 배치로 바꾼 뒤 잰다
        root.setAttribute("data-motion", "");
        // 고정 장면은 페이지 순서대로 만들어야 아래 장면의 위치가 위 장면의 고정 길이를 반영한다
        heroMorph();
        for (const el of qa("[data-scene-a], [data-scene-b], [data-credits]")) {
          if (el.hasAttribute("data-scene-a")) sceneA(el, desktop);
          else if (el.hasAttribute("data-scene-b")) sceneB(el, desktop);
          else credits(el);
        }
        sideB(desktop);
        ScrollTrigger.refresh();
        return () => root.removeAttribute("data-motion");
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
      viz.on = 0;
    };
  }, []);
  return null;
}
