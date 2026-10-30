import type { Metadata, Viewport } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";

const display = Funnel_Display({ variable: "--font-funnel", subsets: ["latin"] });

// 미리보기 이미지가 절대 주소로 나가도록. Vercel에선 production 도메인(커스텀 도메인 포함)을 자동으로 따른다.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "박준현 — Front-End Developer Portfolio",
  description:
    "서비스의 본질에 집중하는 프론트엔드 개발자 박준현(4rNe5)의 포트폴리오. jobanswer, 탁!, SFOODGO, Palette, LightLib 등 대표 프로젝트를 녹음기처럼 재생해 보세요.",
  authors: [{ name: "Park Jun Hyeon", url: "https://github.com/4rNe5" }],
  openGraph: {
    title: "박준현 — Front-End Developer",
    description: "녹음기처럼 재생하는 포트폴리오 — App · Web Front-End · UI/UX",
    type: "website",
    locale: "ko_KR",
    siteName: "Park Jun Hyeon",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "박준현 — Front-End Developer",
    description: "녹음기처럼 재생하는 포트폴리오 — App · Web Front-End · UI/UX",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e8e4" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

// 첫 페인트 전에 저장된 테마를 적용하고, JS 사용 가능 표시를 남긴다 (깜빡임 방지)
const boot = `try{var d=document.documentElement;d.setAttribute('data-js','');var t=localStorage.getItem('recortfolio:theme');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);if(!sessionStorage.getItem('recortfolio:booted')){sessionStorage.setItem('recortfolio:booted','1');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.setAttribute('data-boot','')}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={display.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
