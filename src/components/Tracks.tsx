import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { awards, profile, stage, tracks, type ProjectTrack, type Track } from "@/content/portfolio";
import HeroName from "./HeroName";
import HeroActions from "./HeroActions";
import SocialIcon from "./SocialIcon";
import Waveform from "./Waveform";
import s from "./Tracks.module.css";

// 모든 챕터는 같은 부품 다섯 개로만 짠다:
//   Section(틀) · Bar(트랙 머리 + 파형) · Head(제목 + 한 줄 소개) · Rows(이름표·값 줄) · Frame(이미지 틀)
// 글자 크기·굵기·여백은 globals.css의 토큰만 쓴다.

const num = (i: number) => String(i).padStart(2, "0");
/** 처음 화면에 들어올 때 한 번 떠오른다 (Boot의 IntersectionObserver). ms: 같은 묶음 안에서의 시차 */
const rv = (kind: "up" | "title" | "media" = "up", ms = 0) =>
  ({ "data-reveal": kind, style: { ["--rd" as string]: `${ms}ms` } as CSSProperties }) as const;

/* ---------- 부품 ---------- */

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

/** 챕터 머리: 트랙 번호 줄 + 파형. 모바일에선 챕터를 읽는 동안 화면 위에 붙어 있다. */
function Bar({ i, right, title }: { i: number; right: string; title: string }) {
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
          <span className={s.right}>{right}</span>
        </header>
        <Waveform seed={tracks[i].id} />
      </div>
    </>
  );
}

/** 제목 + 한 줄 소개 — 모든 챕터 공통. href가 있으면 제목이 링크 */
function Head({ title, lede, icon, href }: { title: string; lede: string; icon?: { i: number; src: string; logo?: boolean }; href?: string }) {
  return (
    <div className={s.headBlock}>
      <div className={s.titleRow}>
        {icon && (
          <span className={s.icon} data-icon={icon.i} data-logo={icon.logo || undefined}>
            <Image src={icon.src} alt="" width={96} height={96} loading="eager" />
          </span>
        )}
        <h2 className={s.title} data-scramble {...rv("title")}>
          {href ? (
            <a className={s.titleLink} href={href}>
              {title}
            </a>
          ) : (
            <span>{title}</span>
          )}
        </h2>
      </div>
      <p className={s.lede} {...rv("up", 80)}>
        {lede}
      </p>
    </div>
  );
}

type Row = { key: string; label: ReactNode; value: ReactNode; aside?: ReactNode; href?: string; top?: boolean };
/** 이름표·값 줄 — 이력, 프로젝트 정보, 한 일, 수상, 채널이 모두 이 한 가지 줄을 쓴다 */
function Rows({ rows, lw = "96px", size = "body", ...rest }: { rows: Row[]; lw?: string; size?: "body" | "lead"; "aria-label"?: string }) {
  return (
    <ul className={s.rows} data-size={size} style={{ ["--lw" as string]: lw } as CSSProperties} {...rest}>
      {rows.map((r, k) => {
        const inner = (
          <>
            <span className={s.rowLabel}>{r.label}</span>
            <span className={s.rowValue}>{r.value}</span>
            {r.aside !== undefined && <span className={s.rowAside}>{r.aside}</span>}
          </>
        );
        return (
          <li key={r.key} data-top={r.top || undefined} {...rv("up", 120 + Math.min(k, 5) * 50)}>
            {r.href ? (
              <a className={s.row} href={r.href} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div className={s.row}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 이미지 틀 — 비율 하나(16:10), 뒤는 트랙 색 판 */
function Frame({ t }: { t: ProjectTrack }) {
  if (!t.media) return null;
  return (
    <figure className={s.frame} data-kind={t.media.kind} {...rv("media", 220)}>
      {t.media.kind === "mockup" ? (
        <Image src={t.media.shot.src} alt={t.media.shot.alt} width={t.media.shot.width} height={t.media.shot.height} sizes="(max-width: 1100px) 92vw, 46vw" />
      ) : (
        t.media.shots.map((m, k) => (
          <Image key={m.src} src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width: 1100px) 30vw, 14vw" style={{ ["--k" as string]: k }} />
        ))
      )}
    </figure>
  );
}

const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className={s.link} href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

/* ---------- 챕터 ---------- */

function Intro({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={s.intro}>
      <div className={s.hero}>
        <HeroName first="Park" rest="Jun Hyeon" />
        <p className={s.subtitle}>{profile.nameKo}, 프론트엔드 개발자</p>
        <p className={s.heroLede}>{profile.lede}</p>
        <HeroActions />
      </div>

      <Bar i={i} right="소개" title="Park Jun Hyeon" />

      <ul className={s.principles}>
        {profile.principles.map((p, k) => (
          <li key={p.t} {...rv("up", k * 80)}>
            <h2>{p.t}</h2>
            <p>{p.d}</p>
          </li>
        ))}
      </ul>

      <div className={s.credits}>
        <figure className={s.photo} {...rv("media", 120)}>
          <Image src={profile.photo} alt={`${profile.nameKo} 프로필 사진`} width={413} height={531} priority />
        </figure>
        <Rows rows={profile.credits.map((c) => ({ key: c.k, label: c.k, value: c.v }))} />
      </div>
    </Section>
  );
}

function Project({ t, i }: { t: ProjectTrack; i: number }) {
  return (
    <Section t={t} i={i}>
      <Bar i={i} right={t.period} title={t.title} />
      <Head title={t.title} lede={t.tagline} icon={{ i, src: t.icon, logo: t.id === "sfoodgo" }} />

      <dl className={s.facts} style={{ ["--n" as string]: t.facts.length }}>
        {t.facts.map((f, k) => (
          <div key={f.v + f.l} {...rv("up", 160 + k * 70)}>
            <dt>{f.v}</dt>
            <dd>{f.l}</dd>
          </div>
        ))}
      </dl>

      <Frame t={t} />

      <div className={s.body}>
        <Rows lw="32px" rows={t.did.map((d, k) => ({ key: d, label: num(k + 1), value: d }))} />
        <Rows
          lw="56px"
          rows={[
            { key: "role", label: "역할", value: t.role },
            { key: "stack", label: "기술", value: t.stack.join(", ") },
            {
              key: "links",
              label: "링크",
              value: (
                <span className={s.links}>
                  {t.links.map((l) => (
                    <Link key={l.href} href={l.href}>
                      {l.label}
                    </Link>
                  ))}
                  {t.notice && <span className={s.notice}>{t.notice}</span>}
                </span>
              ),
            },
          ]}
        />
      </div>
    </Section>
  );
}

function Awards({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i}>
      <Bar i={i} right="2023 – 2024" title="Awards" />
      <Head title="Awards" lede="해커톤과 공모전에서 아홉 번 수상했고, 그중 세 번은 1등이었습니다." />
      <Rows
        rows={awards.map((a) => ({
          key: a.event,
          label: a.date,
          value: (
            <>
              {a.event}
              <small className={s.sub}>{a.work}</small>
            </>
          ),
          aside: a.prize,
          top: a.top,
        }))}
      />
    </Section>
  );
}

function Stage({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i}>
      <Bar i={i} right="발표와 전시" title="On stage" />
      <Head title="On stage" lede="만든 것을 직접 설명하는 자리에 자주 섰습니다." />
      <ul className={s.cards}>
        {stage.map((a, k) => (
          <li key={a.title} className={s.card} {...rv("up", 140 + (k % 2) * 90)}>
            {a.photo && (
              <div className={s.cardPhoto}>
                <Image
                  src={a.photo}
                  alt=""
                  width={a.photo.includes("counterspell") ? 600 : 1200}
                  height={a.photo.includes("counterspell") ? 235 : 751}
                  sizes="(max-width: 1100px) 92vw, 28vw"
                />
              </div>
            )}
            <span className={s.rowLabel}>{a.date}</span>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
            {a.link && <Link href={a.link.href}>{a.link.label}</Link>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Contact({ i }: { i: number }) {
  const t = tracks[i];
  return (
    <Section t={t} i={i} className={s.contact}>
      <Bar i={i} right="Side A 끝" title="연락하기" />
      <Head title={profile.email} href={`mailto:${profile.email}`} lede="다음 트랙을 같이 만들 분을 기다립니다." />
      <Rows
        size="lead"
        lw="40px"
        aria-label="다른 채널"
        rows={profile.socials.map((x) => ({
          key: x.name,
          href: x.href,
          label: <SocialIcon name={x.name} className={s.socialIcon} />,
          value: x.name,
          aside: (
            <>
              {x.handle}
              <span className={s.jack} aria-hidden />
            </>
          ),
        }))}
      />
      <footer className={s.footer}>
        <span>© 2026 {profile.nameEn}</span>
        <Link href="https://github.com/4rNe5/recortfolio">이 사이트의 소스</Link>
        <span>휴대용 필드 레코더에서 영감을 받아 만들었습니다.</span>
      </footer>
    </Section>
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
