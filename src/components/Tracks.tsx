import Image from "next/image";
import type { CSSProperties } from "react";
import { awards, profile, stage, tracks, type ProjectTrack, type Track } from "@/content/portfolio";
import Rich from "./Rich";
import Waveform from "./Waveform";
import s from "./Tracks.module.css";

const num = (i: number) => String(i).padStart(2, "0");
const vars = (t: Track) => ({ "--c": t.color, "--ci": t.ink }) as CSSProperties;
const mono = (t: Track) => (t.color === "#1f1f1f" ? { "data-mono": true } : {});
const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {});

function Head({ i, right }: { i: number; right: string }) {
  return (
    <header className={s.head} data-reveal>
      <span className={s.no}>
        <b>{num(i)}</b> / {num(tracks.length - 1)}
      </span>
      <span className={s.rule} />
      <span className={s.right}>{right}</span>
    </header>
  );
}

function Intro({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.intro}`} style={vars(t)}>
      <Head i={i} right="SIDE A — PORTFOLIO" />
      <div className={s.hero}>
        <p className={s.kicker} data-reveal>
          {profile.role} · {profile.handle}
        </p>
        <h1 className={s.name} data-reveal>
          <span>{profile.nameKo}</span>
          <span className={s.nameEn}>{profile.nameEn}</span>
        </h1>
        <p className={s.lede} data-reveal>
          사용자 경험은 사소한 코드 한 줄에서 나온다고 믿는 프론트엔드 개발자입니다.
          <br />
          왼쪽의 녹음기로 이 포트폴리오를 <em>재생</em>해 보세요.
        </p>
        <ul className={s.howto} data-reveal>
          <li>
            <kbd>휠</kbd> 드래그로 스크럽
          </li>
          <li>
            <kbd>▶</kbd> / <kbd>Space</kbd> 재생
          </li>
          <li>
            <kbd>←</kbd> <kbd>→</kbd> 트랙 이동
          </li>
          <li>
            <kbd>M</kbd> 트랙리스트
          </li>
          <li>
            <kbd>●</kbd> / <kbd>R</kbd> 연락하기
          </li>
        </ul>
      </div>
      <Waveform seed="intro" />

      <div className={s.profileGrid}>
        <figure className={s.photo} data-reveal>
          <Image src={profile.photo} alt={`${profile.nameKo} 프로필 사진`} width={413} height={531} priority />
          <figcaption>
            <span>{profile.nameEn.toUpperCase()}</span>
            <span>FE / UX</span>
          </figcaption>
        </figure>
        <div className={s.about}>
          <h2 className={s.label} data-reveal>
            자기소개 <span>/ About me</span>
          </h2>
          {profile.about.map((p, k) => (
            <p key={k} data-reveal>
              <Rich text={p} />
            </p>
          ))}
        </div>
      </div>

      <div className={s.block}>
        <h2 className={s.label} data-reveal>
          기술 <span>/ Tech-Stack</span>
        </h2>
        <ul className={s.chips} data-reveal>
          {profile.stack.primary.map((x) => (
            <li key={x} className={s.chipStrong}>
              {x}
            </li>
          ))}
          {profile.stack.secondary.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className={s.block}>
        <h2 className={s.label} data-reveal>
          업무 경험 <span>/ Experience</span>
        </h2>
        <ol className={s.jobs}>
          {profile.experience.map((j) => (
            <li key={j.title} className={s.job} data-reveal>
              <div className={s.jobMeta}>
                <span className={s.mono}>{j.period}</span>
                {j.recent && <span className={s.badge}>most recent</span>}
              </div>
              <div>
                <h3>{j.title}</h3>
                <p className={s.sub}>{j.sub}</p>
              </div>
              <ul className={s.points}>
                {j.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Media({ t }: { t: ProjectTrack }) {
  if (!t.media) return null;
  if (t.media.kind === "mockup") {
    return (
      <figure className={s.mockup} data-reveal>
        <Image src={t.media.src} alt={t.media.alt} width={t.media.width} height={t.media.height} sizes="(max-width: 1100px) 92vw, 46vw" />
      </figure>
    );
  }
  return (
    <figure className={s.screens} data-reveal>
      {t.media.items.map((m, k) => (
        <Image key={m.src} src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width: 1100px) 40vw, 16vw" style={{ ["--k" as string]: k }} />
      ))}
    </figure>
  );
}

function Project({ t, i }: { t: ProjectTrack; i: number }) {
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.project}`} style={vars(t)} {...mono(t)}>
      <Head i={i} right={t.period} />
      <Waveform seed={t.id} />
      <div className={s.titleRow} data-reveal>
        <span className={s.icon} data-logo={t.id === "sfoodgo" || undefined}>
          <Image src={t.icon} alt="" width={96} height={96} />
        </span>
        <div>
          <h2 className={s.title}>{t.title}</h2>
          <p className={s.summary}>{t.summary}</p>
        </div>
      </div>

      <dl className={s.meta} data-reveal>
        <div>
          <dt>ROLE</dt>
          <dd>{t.role}</dd>
        </div>
        <div>
          <dt>PERIOD</dt>
          <dd>{t.period}</dd>
        </div>
        <div>
          <dt>LINKS</dt>
          <dd className={s.links}>
            {t.links.map((l) => (
              <a key={l.href} href={l.href} {...ext(l.href)}>
                {l.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </dd>
        </div>
      </dl>
      {t.notice && (
        <p className={s.notice} data-reveal>
          {t.notice}
        </p>
      )}

      <Media t={t} />

      <div className={s.story}>
        <h3 className={s.label} data-reveal>
          프로젝트 소개 <span>/ About</span>
        </h3>
        {t.intro.map((p, k) => (
          <p key={k} data-reveal>
            <Rich text={p} />
          </p>
        ))}
      </div>

      <div className={s.block}>
        <h3 className={s.label} data-reveal>
          사용했던 기술 <span>/ Project Tech-Stack</span>
        </h3>
        <ul className={s.chips} data-reveal>
          {t.stack.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className={s.block}>
        <h3 className={s.label} data-reveal>
          역할 & 기여 <span>/ Position & Contribute</span>
        </h3>
        <ol className={s.positions}>
          {t.positions.map((p) => (
            <li key={p.title} className={s.position} data-reveal>
              <div className={s.posHead}>
                <span className={s.mono}>{p.label}</span>
                {p.main && <span className={s.badgeAccent}>Main Position</span>}
              </div>
              <h4>{p.title}</h4>
              <ul className={s.points}>
                {p.points.map((x) => (
                  <li key={x}>
                    <Rich text={x} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Awards({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.awards}`} style={vars(t)}>
      <Head i={i} right={`${awards.length} AWARDS · 2023 — 2024`} />
      <Waveform seed={t.id} />
      <h2 className={s.title} data-reveal>
        수상 <span className={s.titleEn}>Awards</span>
      </h2>
      <ol className={s.awardList}>
        {awards.map((a, k) => (
          <li key={a.event} className={s.award} data-top={a.top || undefined} data-reveal>
            <span className={s.awardNo}>{String.fromCharCode(65 + k)}</span>
            <span className={s.mono}>{a.date}</span>
            <div className={s.awardBody}>
              <h3>{a.event}</h3>
              <p>{a.work}</p>
            </div>
            <span className={s.prize}>{a.prize}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stage({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.stage}`} style={vars(t)}>
      <Head i={i} right="PRESENTATION & EXTERNAL" />
      <Waveform seed={t.id} />
      <h2 className={s.title} data-reveal>
        발표 & 대외 활동 <span className={s.titleEn}>Stage</span>
      </h2>
      <ol className={s.stageList}>
        {stage.map((a) => (
          <li key={a.title} className={s.stageItem} data-has-photo={a.photos ? true : undefined} data-reveal>
            {a.photos && (
              <div className={s.stagePhotos}>
                {a.photos.map((p) => (
                  <Image key={p} src={p} alt={`${a.title} 사진`} width={p.includes("counterspell") ? 600 : 1200} height={p.includes("counterspell") ? 235 : 751} sizes="(max-width: 1100px) 45vw, 22vw" />
                ))}
              </div>
            )}
            <div className={s.stageText}>
              <p className={s.mono}>
                {a.date} · {a.type}
              </p>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              {a.link && (
                <a className={s.stageLink} href={a.link.href} target="_blank" rel="noreferrer">
                  {a.link.label} <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Contact({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.contact}`} style={vars(t)}>
      <Head i={i} right="END OF SIDE A" />
      <Waveform seed={t.id} />
      <p className={s.kicker} data-reveal>
        ● REC — 함께 만들 다음 트랙을 기다립니다
      </p>
      <a className={s.mail} href={`mailto:${profile.email}`} data-reveal>
        {profile.email}
      </a>
      <ul className={s.contactLinks} data-reveal>
        <li>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub — 4rNe5 <span aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a href="https://github.com/4rNe5/recortfolio" target="_blank" rel="noreferrer">
            이 사이트의 소스 <span aria-hidden>↗</span>
          </a>
        </li>
      </ul>
      <footer className={s.footer}>
        <span>© {profile.nameEn}</span>
        <span>Recorded with Next.js · Inspired by a pocket field recorder</span>
      </footer>
    </section>
  );
}

export default function Tracks() {
  return (
    <>
      {tracks.map((t, i) => {
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
      })}
    </>
  );
}
