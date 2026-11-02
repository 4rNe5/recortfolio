import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { awards, profile, stage, tracks, type ProjectTrack, type Track } from "@/content/portfolio";
import HeroActions from "./HeroActions";
import HeroName from "./HeroName";
import Recorder from "./Recorder";
import SocialIcon from "./SocialIcon";
import Waveform from "./Waveform";
import s from "./Tracks.module.css";

// 앨범 한 장. 첫 화면(녹음기 + 이름) → 재생하면 녹음기가 재생바로 접히고 음악 시각화가 켜진다.
// 프로젝트 트랙 = 고정된 화면 위에서 바뀌는 두 장면:
//   A. 트랙 카드 → 앱 아이콘·제목·소개 → 핵심 3개   B. 왼쪽 큰 목업 + 오른쪽 "한 일"이 하나씩   → 스택·링크
// 움직임은 Motion.tsx가 data-* 표시를 보고 붙인다. 이 파일은 서버에서 그리는 정지 상태(=모션 줄이기 상태).

const num = (i: number) => String(i).padStart(2, "0");
/** 처음 화면에 들어올 때 한 번 떠오른다 (Boot의 IntersectionObserver) */
const rv = (ms = 0) => ({ "data-reveal": "up", style: { ["--rd" as string]: `${ms}ms` } as CSSProperties }) as const;

function Section({ t, i, className, children }: { t: Track; i: number; className?: string; children: ReactNode }) {
  return (
    <section
      id={t.id}
      data-track={i}
      className={`${s.track} ${className ?? ""}`}
      style={{ "--c": t.color, "--ci": t.ink } as CSSProperties}
      data-mono={t.color === "#1f1f1f" || undefined}
    >
      {children}
    </section>
  );
}

/* ---------- 첫 화면: 지금과 같은 구도 — 왼쪽 녹음기, 오른쪽 이름 ---------- */
function Hero() {
  return (
    <div className={s.hero} data-hero>
      <div className={s.heroDeck}>
        <div className={s.heroSlot} data-hero-slot>
          <div className={s.heroDevice} id="deck" data-hero-device>
            <Recorder />
          </div>
        </div>
      </div>
      <div className={s.heroText} data-hero-text>
        <HeroName first="Park" rest="Jun Hyeon" />
        <p className={s.subtitle}>{profile.nameKo}, 프론트엔드 개발자</p>
        <p className={s.heroLede}>{profile.lede}</p>
        <HeroActions />
      </div>
    </div>
  );
}

/* ---------- 프로젝트 장면 A: 트랙 카드 → 정체 → 핵심 3개 (화면 고정) ---------- */
function SceneA({ t, i }: { t: ProjectTrack; i: number }) {
  return (
    <div className={s.sceneA} data-scene-a>
      <div className={s.aStage}>
        <p className={s.aNo} data-a-no>
          <span>Track {num(i)}</span>
          <span>{t.period}</span>
        </p>
        <h2 className={s.aTitle} data-a-title data-scramble style={{ ["--n" as string]: t.display.length } as CSSProperties}>
          <span>{t.display}</span>
        </h2>
        <div className={s.aIdent} data-a-ident>
          <span className={s.appIcon} data-logo={t.id === "sfoodgo" || undefined} data-a-icon>
            <Image src={t.icon} alt="" width={240} height={240} />
          </span>
          <h3 className={s.aName} data-a-line>
            {t.title}
          </h3>
          <p className={s.aLede} data-a-line>
            {t.tagline}
          </p>
        </div>
        <dl className={s.aFacts} style={{ ["--n" as string]: t.facts.length } as CSSProperties} data-a-facts>
          {t.facts.map((f) => (
            <div key={f.v + f.l} data-a-fact>
              <dt data-count aria-label={f.v}>
                {f.v}
              </dt>
              <dd>{f.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- 프로젝트 장면 B: 왼쪽(녹음기가 있던 자리) 큰 목업 + 오른쪽 "한 일" 하나씩 ---------- */
function Media({ t }: { t: ProjectTrack }) {
  const m = t.media;
  if (!m)
    return (
      <span className={s.bIcon} data-b-shot>
        <Image src={t.icon} alt={`${t.title} 아이콘`} width={480} height={480} />
      </span>
    );
  if (m.kind === "mockup")
    return <Image className={s.bMock} src={m.shot.src} alt={m.shot.alt} width={m.shot.width} height={m.shot.height} sizes="(max-width: 1099px) 90vw, 46vw" data-b-shot />;
  return (
    <span className={s.bScreens} style={{ ["--cols" as string]: m.shots.length } as CSSProperties}>
      {m.shots.map((sh, k) => (
        <Image key={sh.src} src={sh.src} alt={sh.alt} width={sh.width} height={sh.height} sizes="(max-width: 1099px) 30vw, 14vw" data-b-shot style={{ ["--k" as string]: k } as CSSProperties} />
      ))}
    </span>
  );
}

function SceneB({ t }: { t: ProjectTrack }) {
  return (
    <div className={s.sceneB} data-scene-b style={{ ["--items" as string]: t.did.length } as CSSProperties}>
      <div className={s.bStage}>
        <div className={s.bMedia} data-b-media>
          <span className={s.bWord} aria-hidden data-b-word>
            {t.display}
          </span>
          <div className={s.bMediaInner} data-b-inner>
            <Media t={t} />
          </div>
        </div>
        <div className={s.bText}>
          <p className={s.bCount} aria-hidden>
            <span data-b-current>01</span> / {num(t.did.length)}
            <span className={s.bRail}>
              <i data-b-rail />
            </span>
          </p>
          <ol className={s.bList}>
            {t.did.map((d, k) => (
              <li key={d} data-b-item>
                <span className={s.bNo}>{num(k + 1)}</span>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Credits({ t }: { t: ProjectTrack }) {
  return (
    <div className={s.credits} data-credits>
      <div data-credit>
        <h4>역할</h4>
        <p>{t.role}</p>
      </div>
      <div data-credit>
        <h4>기술</h4>
        <ul className={s.chips}>
          {t.stack.map((x) => (
            <li key={x} data-chip>
              {x}
            </li>
          ))}
        </ul>
      </div>
      <div data-credit>
        <h4>링크</h4>
        <p className={s.linkRow}>
          {t.links.map((l) => (
            <a key={l.href} className={s.pill} href={l.href} target="_blank" rel="noreferrer">
              {l.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </p>
        {t.notice && <p className={s.notice}>{t.notice}</p>}
      </div>
    </div>
  );
}

function Project({ t, i }: { t: ProjectTrack; i: number }) {
  return (
    <Section t={t} i={i} className={s.project}>
      <span className={s.waveAnchor} aria-hidden>
        <Waveform seed={t.id} count={64} />
      </span>
      <SceneA t={t} i={i} />
      <SceneB t={t} />
      <Credits t={t} />
    </Section>
  );
}

/* ---------- 소개 ---------- */
function Intro({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={s.intro}>
      <Hero />
      <div className={s.introBody}>
        <p className={s.eyebrow} {...rv()}>
          Track 00 — 소개
        </p>
        <span className={s.introWave} aria-hidden>
          <Waveform seed={t.id} count={128} />
        </span>
        <ul className={s.principles}>
          {profile.principles.map((p, k) => (
            <li key={p.t} {...rv(k * 90)}>
              <span className={s.principleNo}>{num(k + 1)}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </ul>
        <div className={s.about}>
          <figure className={s.photo} {...rv(80)}>
            <Image src={profile.photo} alt={`${profile.nameKo} 프로필 사진`} width={413} height={531} />
          </figure>
          <dl className={s.creditList}>
            {profile.credits.map((c, k) => (
              <div key={c.k} {...rv(120 + k * 50)}>
                <dt>{c.k}</dt>
                <dd>{c.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Side B: 수상 · 무대 · 연락 — 반전 색의 다른 판 ---------- */
function SideHead({ i, title, note }: { i: number; title: string; note: string }) {
  const b = i - tracks.findIndex((x) => x.kind === "awards") + 1;
  return (
    <header className={s.sideHead}>
      <p className={s.sideNo} {...rv()}>
        B{b} · Track {num(i)}
      </p>
      <h2 className={s.sideTitle} data-scramble {...rv(60)}>
        <span>{title}</span>
      </h2>
      <p className={s.sideNote} {...rv(120)}>
        {note}
      </p>
    </header>
  );
}

function Awards({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={s.side}>
      <span className={s.waveAnchor} aria-hidden>
        <Waveform seed={t.id} count={64} />
      </span>
      <div className={s.sideIntro} aria-hidden data-side-intro>
        <span>Side</span>
        <span>B</span>
      </div>
      <SideHead i={i} title="Awards" note="해커톤과 공모전에서 아홉 번 수상했고, 그중 세 번은 1등이었습니다." />
      <ol className={s.chart}>
        {awards.map((a, k) => (
          <li key={a.event} data-top={a.top || undefined} {...rv(Math.min(k, 6) * 40)}>
            <span className={s.chartRank}>{num(k + 1)}</span>
            <span className={s.chartMain}>
              <strong>{a.event}</strong>
              <small>{a.work}</small>
            </span>
            <span className={s.chartPrize}>{a.prize}</span>
            <span className={s.chartDate}>{a.date}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Stage({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={s.side}>
      <span className={s.waveAnchor} aria-hidden>
        <Waveform seed={t.id} count={64} />
      </span>
      <SideHead i={i} title="On stage" note="만든 것을 직접 설명하는 자리에 자주 섰습니다." />
      <div className={s.reel} data-reel>
        <ul className={s.reelTrack} data-reel-track>
          {stage.map((a) => (
            <li key={a.title} className={s.reelCard}>
              {a.photo ? (
                <div className={s.reelPhoto}>
                  <Image
                    src={a.photo}
                    alt=""
                    width={a.photo.includes("counterspell") ? 600 : 1200}
                    height={a.photo.includes("counterspell") ? 235 : 751}
                    sizes="(max-width: 1099px) 80vw, 34vw"
                  />
                </div>
              ) : (
                <div className={s.reelPhoto} data-empty aria-hidden>
                  <span>{a.title}</span>
                </div>
              )}
              <span className={s.reelDate}>{a.date}</span>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              {a.link && (
                <a className={s.reelLink} href={a.link.href} target="_blank" rel="noreferrer">
                  {a.link.label} <span aria-hidden>↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Contact({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={`${s.side} ${s.contact}`}>
      <span className={s.waveAnchor} aria-hidden>
        <Waveform seed={t.id} count={64} />
      </span>
      <SideHead i={i} title="연락하기" note="다음 트랙을 같이 만들 분을 기다립니다." />
      <a className={s.mail} href={`mailto:${profile.email}`} {...rv(80)}>
        <span className={s.recDot} aria-hidden />
        {profile.email}
      </a>
      <ul className={s.channels} aria-label="다른 채널">
        {profile.socials.map((x, k) => (
          <li key={x.name} {...rv(140 + k * 60)}>
            <a href={x.href} target="_blank" rel="noreferrer">
              <SocialIcon name={x.name} className={s.socialIcon} />
              <span className={s.chName}>{x.name}</span>
              <span className={s.chHandle}>{x.handle}</span>
              <span className={s.chArrow} aria-hidden>
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
      <footer className={s.footer}>
        <span>© 2026 {profile.nameEn}</span>
        <a href="https://github.com/4rNe5/recortfolio" target="_blank" rel="noreferrer">
          이 사이트의 소스
        </a>
        <span>휴대용 필드 레코더에서 영감을 받아 만들었습니다.</span>
      </footer>
    </Section>
  );
}

export default function Tracks() {
  const sideStart = tracks.findIndex((t) => t.kind === "awards");
  const render = (t: Track, i: number) => {
    switch (t.kind) {
      case "intro":
        return <Intro key={t.id} i={i} />;
      case "project":
        return <Project key={t.id} t={t} i={i} />;
      case "awards":
        return <Awards key={t.id} i={i} />;
      case "stage":
        return <Stage key={t.id} i={i} />;
      case "contact":
        return <Contact key={t.id} i={i} />;
    }
  };
  return (
    <>
      {tracks.slice(0, sideStart).map((t, k) => render(t, k))}
      <div className={s.sideB} data-sideb>
        {tracks.slice(sideStart).map((t, k) => render(t, sideStart + k))}
      </div>
    </>
  );
}
