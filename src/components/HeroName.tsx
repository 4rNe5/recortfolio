import s from "./Tracks.module.css";

/** 이름 타이틀 — 글자가 차례로 떠오르기만 하고, 굵기는 고정 (움직이는 굵기 효과 제거) */
export default function HeroName({ first, rest }: { first: string; rest: string }) {
  const split = (word: string, offset: number) =>
    Array.from(word).map((ch, i) => (
      <span key={i} data-l aria-hidden style={{ ["--d" as string]: `${(offset + i) * 28}ms` }}>
        {ch === " " ? "\u00a0" : ch}
      </span>
    ));

  return (
    <h1 className={s.name} aria-label={`${first} ${rest}`}>
      <span className={s.nameLine}>{split(first, 0)}</span>
      <span className={s.nameLine}>{split(rest, first.length)}</span>
    </h1>
  );
}
