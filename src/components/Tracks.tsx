import Image from "next/image";
import type { CSSProperties } from "react";
import { awards, profile, stage, tracks, type ProjectTrack, type Track } from "@/content/portfolio";
import HeroName from "./HeroName";
import HeroActions from "./HeroActions";
import Waveform from "./Waveform";
import s from "./Tracks.module.css";

const num = (i: number) => String(i).padStart(2, "0");
const vars = (t: Track) => ({ "--c": t.color, "--ci": t.ink }) as CSSProperties;
const mono = (t: Track) => (t.color === "#1f1f1f" ? { "data-mono": true } : {});

/** 챕터 머리: 트랙 번호 줄 + 파형. 모바일에선 챕터를 읽는 동안 화면 위에 붙어 있다. */
function Bar({ i, right, title }: { i: number; right?: string; title: string }) {
  return (
    <>
      <span className={s.sentinel} data-sentinel aria-hidden />
      <div className={s.bar}>
        <header className={s.head}>
          <span className={s.no}>Track {num(i)}</span>
          <span className={s.stuckTitle} aria-hidden>
            {title}
          </span>
          <span className={s.rule} />
          {right && <span className={s.right}>{right}</span>}
        </header>
        <Waveform seed={tracks[i].id} />
      </div>
    </>
  );
}

function Intro({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.intro}`} style={vars(t)}>
      <div className={s.hero}>
        <HeroName first="Park" rest="Jun Hyeon" />
        <p className={s.subtitle}>{profile.nameKo}, 프론트엔드 개발자</p>
        <p className={s.lede}>{profile.lede}</p>
        <HeroActions />
      </div>

      <Bar i={i} right="소개" title="Park Jun Hyeon" />

      <ul className={s.principles}>
        {profile.principles.map((p) => (
          <li key={p.t}>
            <h2>{p.t}</h2>
            <p>{p.d}</p>
          </li>
        ))}
      </ul>

      <div className={s.credits}>
        <figure className={s.photo}>
          <Image src={profile.photo} alt={`${profile.nameKo} 프로필 사진`} width={413} height={531} priority />
        </figure>
        <dl className={s.creditList}>
          {profile.credits.map((c) => (
            <div key={c.k}>
              <dt>{c.k}</dt>
              <dd>{c.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Media({ t }: { t: ProjectTrack }) {
  if (!t.media) return null;
  if (t.media.kind === "mockup") {
    const m = t.media.shot;
    return (
      <figure className={s.mockup}>
        <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width: 1100px) 92vw, 46vw" />
      </figure>
    );
  }
  return (
    <figure className={s.screens}>
      {t.media.shots.map((m, k) => (
        <Image key={m.src} src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width: 1100px) 40vw, 16vw" style={{ ["--k" as string]: k }} />
      ))}
    </figure>
  );
}

function Project({ t, i }: { t: ProjectTrack; i: number }) {
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.project}`} style={vars(t)} {...mono(t)}>
      <Bar i={i} right={t.period} title={t.title} />

      <div className={s.titleRow}>
        <span className={s.icon} data-icon={i} data-logo={t.id === "sfoodgo" || undefined}>
          <Image src={t.icon} alt="" width={96} height={96} loading="eager" />
        </span>
        <h2 className={s.title}>{t.title}</h2>
      </div>
      <p className={s.tagline}>{t.tagline}</p>

      <dl className={s.facts} style={{ ["--n" as string]: t.facts.length }}>
        {t.facts.map((f) => (
          <div key={f.v + f.l}>
            <dt>{f.v}</dt>
            <dd>{f.l}</dd>
          </div>
        ))}
      </dl>

      <Media t={t} />

      <div className={s.body}>
        <ul className={s.did}>
          {t.did.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <dl className={s.side}>
          <div>
            <dt>역할</dt>
            <dd>{t.role}</dd>
          </div>
          <div>
            <dt>사용 기술</dt>
            <dd>{t.stack.join(", ")}</dd>
          </div>
          <div>
            <dt>링크</dt>
            <dd className={s.links}>
              {t.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
              {t.notice && <span className={s.notice}>{t.notice}</span>}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Awards({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.awards}`} style={vars(t)}>
      <Bar i={i} right="2023 – 2024" title="Awards" />
      <h2 className={s.title}>Awards</h2>
      <p className={s.tagline}>해커톤과 공모전에서 아홉 번 수상했고, 그중 세 번은 1등이었습니다.</p>
      <ol className={s.awardList}>
        {awards.map((a) => (
          <li key={a.event} className={s.award} data-top={a.top || undefined}>
            <span className={s.date}>{a.date}</span>
            <span className={s.event}>
              {a.event}
              <small>{a.work}</small>
            </span>
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
      <Bar i={i} right="발표와 전시" title="On stage" />
      <h2 className={s.title}>On stage</h2>
      <p className={s.tagline}>만든 것을 직접 설명하는 자리에 자주 섰습니다.</p>
      <ul className={s.stageList}>
        {stage.map((a) => (
          <li key={a.title} className={s.stageItem}>
            {a.photo && (
              <div className={s.stagePhoto}>
                <Image
                  src={a.photo}
                  alt=""
                  width={a.photo.includes("counterspell") ? 600 : 1200}
                  height={a.photo.includes("counterspell") ? 235 : 751}
                  sizes="(max-width: 1100px) 92vw, 28vw"
                />
              </div>
            )}
            <p className={s.date}>{a.date}</p>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
            {a.link && (
              <a href={a.link.href} target="_blank" rel="noreferrer">
                {a.link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <section id={t.id} data-track={i} className={`${s.track} ${s.contact}`} style={vars(t)}>
      <Bar i={i} right="Side A 끝" title="연락하기" />
      <p className={s.tagline}>다음 트랙을 같이 만들 분을 기다립니다.</p>
      <a className={s.mail} href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <ul className={s.socials} aria-label="다른 채널">
        {profile.socials.map((x) => (
          <li key={x.name}>
            <a href={x.href} target="_blank" rel="noreferrer">
              <span className={s.socialName}>{x.name}</span>
              <span className={s.socialHandle}>{x.handle}</span>
              <span className={s.jack} aria-hidden />
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
