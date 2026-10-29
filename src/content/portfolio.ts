// 포트폴리오 콘텐츠 — 자소서(CV 1.3)·Figma·GitHub 저장소의 사실을 바탕으로,
// 문장을 옮기지 않고 "앨범" 형식에 맞게 짧게 다시 쓴 것.

export type Link = { label: string; href: string };
export type Fact = { v: string; l: string };
export type Shot = { src: string; width: number; height: number; alt: string };
export type Media = { kind: "mockup"; shot: Shot } | { kind: "screens"; shots: Shot[] };

type Base = { id: string; title: string; display: string; color: string; ink: string };

export type ProjectTrack = Base & {
  kind: "project";
  icon: string;
  period: string;
  role: string;
  tagline: string;
  facts: Fact[];
  did: string[];
  stack: string[];
  links: Link[];
  notice?: string;
  media?: Media;
};

export type Track =
  | (Base & { kind: "intro" })
  | ProjectTrack
  | (Base & { kind: "awards" })
  | (Base & { kind: "stage" })
  | (Base & { kind: "contact" });

export const profile = {
  nameKo: "박준현",
  nameEn: "Park Jun Hyeon",
  handle: "4rNe5",
  email: "me@4rne5.dev",
  github: "https://github.com/4rNe5",
  photo: "/assets/profile.jpg",
  // 기존 4rne5.dev 사이트에 있던 채널
  socials: [
    { name: "GitHub", handle: "4rNe5", href: "https://github.com/4rNe5" },
    { name: "LinkedIn", handle: "in/4rNe5", href: "https://www.linkedin.com/in/4rNe5" },
    { name: "Instagram", handle: "@4_rne5", href: "https://www.instagram.com/4_rne5/" },
    { name: "Telegram", handle: "@ar_oi_op", href: "https://t.me/ar_oi_op" },
    { name: "Discord", handle: "프로필 열기", href: "https://www.discord.com/users/796907962811285506" },
    { name: "Notion", handle: "이전 포트폴리오", href: "http://4rne5-portfolio.kro.kr" },
  ],
  lede: "앱과 웹의 프론트엔드, 그리고 그 위에서 느껴지는 사용자 경험을 만듭니다.",
  principles: [
    { t: "본질부터", d: "무엇을, 누구를 위해 만드는지 먼저 정하고 코드를 씁니다." },
    { t: "코드 한 줄의 경험", d: "사용자 경험은 사소한 코드 한 줄에서 갈린다고 믿습니다." },
    { t: "포지션을 넘나들며", d: "디자인과 PM을 직접 맡아 봐서, 다른 직군과 같은 언어로 일합니다." },
  ],
  credits: [
    { k: "역할", v: "앱·웹 프론트엔드, UI/UX 디자인" },
    { k: "활동", v: "(전) 프리랜서 앱·웹 개발자 (~ 2026.09) / (현) 대한민국 해군 SW개발병" },
    { k: "Main Skills", v: "TypeScript, React Native, Next.js, Swift, SwiftUI, Figma" },
    { k: "Sub Skills", v: "Expo, EAS, Zustand, Socket.IO, STOMP, Rive, Tuist, Firebase" },
    { k: "History", v: "[마스터웨이] 프론트엔드 개발자 재직(25.09 ~ 25.12)" },
  ],
};

export const tracks: Track[] = [
  { kind: "intro", id: "intro", title: "Intro", display: "PARK JUN HYEON", color: "#ff5a1f", ink: "#ffffff" },
  {
    kind: "project",
    id: "jobanswer",
    title: "jobanswer",
    display: "JOBANSWER",
    color: "#00c776",
    ink: "#03241a",
    icon: "/assets/jobanswer-icon.png",
    period: "2025.09 – 2025.12",
    role: "앱 프론트엔드, QA",
    tagline: "말하는 내용과 구조를 실시간으로 분석해 주는 AI 취업 면접 코치",
    facts: [
      { v: "2", l: "온디바이스와 Clova를 함께 쓰는 음성 인식 엔진" },
      { v: "QA", l: "출시 전 베타 테스트와 사내 피드백 흐름 리드" },
    ],
    did: [
      "Expo 대신 순정 React Native로 만들어, 필요한 네이티브 라이브러리를 직접 고쳐 쓸 수 있게 했습니다.",
      "녹음 라이브러리 내부의 버그를 찾아 패치하고, 온디바이스 STT와 Clova STT를 연결했습니다.",
      "Lottie 모션, 사용법 투어, 앱 안에서 바로 여는 ChannelTalk 문의를 넣었습니다.",
      "질문 토픽별 훈련 진행도를 SVG 길로 그려, 지나온 구간의 색이 바뀌게 했습니다.",
    ],
    stack: ["React Native", "TypeScript", "Lottie", "STT", "React Navigation", "i18n", "Notifee"],
    links: [{ label: "App Store", href: "https://apps.apple.com/ch/app/%EC%9E%A1%EC%95%A4%EC%8D%A8/id6755668986" }],
    notice: "회사 내부 코드라 저장소는 비공개입니다.",
    media: {
      kind: "screens",
      shots: [
        { src: "/assets/jobanswer-screen-1.png", width: 540, height: 995, alt: "jobanswer 면접 유형 선택 화면" },
        { src: "/assets/jobanswer-screen-2.png", width: 540, height: 995, alt: "jobanswer 훈련 진행도 지도 화면" },
      ],
    },
  },
  {
    kind: "project",
    id: "ttak",
    title: "탁!",
    display: "TTAK!",
    color: "#fe6d09",
    ink: "#ffffff",
    icon: "/assets/ttak-icon.png",
    period: "2024.08 – 2024.09",
    role: "1인 개발 — 기획, 디자인, 프론트, 백엔드",
    tagline: "리듬게이머 사이의 유행이 식기 전에 출시한 반응속도 측정·랭킹 앱",
    facts: [
      { v: "60ms", l: "기기별 입력 지연 보정으로 개선한 측정 정확도" },
      { v: "1인", l: "기획부터 앱스토어 출시까지" },
    ],
    did: [
      "기기마다 다른 입력 지연을 보정하는 타이밍 로직을 만들었습니다.",
      "공개 리더보드를 위해 로컬 비속어 필터와, 사람이 낼 수 없는 기록을 걸러내는 검증을 넣었습니다.",
      "화면이 보일 때만 새로고침해 불필요한 API 호출을 줄였습니다.",
      "PocketBase를 Fly.io 인스턴스 두 대에 올려, 적은 비용으로 백엔드와 백업을 꾸렸습니다.",
    ],
    stack: ["React Native", "Expo", "EAS", "PocketBase", "TypeScript"],
    links: [
      { label: "App Store", href: "https://apps.apple.com/cz/app/%ED%83%81/id6670382941" },
      { label: "GitHub", href: "https://github.com/4rNe5/reaction-counter-app" },
    ],
    media: { kind: "mockup", shot: { src: "/assets/ttak-mockup.png", width: 1400, height: 1050, alt: "탁! 앱 화면" } },
  },
  {
    kind: "project",
    id: "sfoodgo",
    title: "SFOODGO",
    display: "SFOODGO",
    color: "#1154b9",
    ink: "#ffffff",
    icon: "/assets/sfoodgo-logo.svg",
    period: "2025.01 – 2025.04",
    role: "프론트엔드, 디자인 (외주)",
    tagline: "한국을 찾은 외국인 여행객이 자기 언어로 주문하는 배달 대행 웹앱",
    facts: [
      { v: "+25%", l: "위치 정보 접근성" },
      { v: "−30%", l: "이미지 업로드 서버 부하" },
      { v: "+40%", l: "배달 위치 정확도" },
    ],
    did: [
      "위치 권한 요청 횟수를 제어하고, GPS 시간 초과와 오류에 단계적으로 대응하게 했습니다.",
      "주소 등록 흐름을 단계별로 다시 설계해 배달 위치를 정확하게 받습니다.",
      "업로드 전에 이미지의 형식과 크기를 검사하고, 새로고침해도 상태가 남도록 했습니다.",
      "로고부터 배너까지 맡아, 베트남 사용자에 맞춘 언어와 음식 사진이 돋보이는 절제된 UI로 만들었습니다.",
    ],
    stack: ["Next.js", "PWA", "TypeScript", "Zustand", "ky", "GSAP", "Storybook"],
    links: [{ label: "sfoodgo.com", href: "https://sfoodgo.com" }],
    notice: "외주 프로젝트라 소스는 비공개입니다.",
    media: { kind: "mockup", shot: { src: "/assets/sfoodgo-mockup.png", width: 652, height: 884, alt: "SFOODGO 웹앱 화면" } },
  },
  {
    kind: "project",
    id: "palette",
    title: "Palette",
    display: "PALETTE",
    color: "#3f63fe",
    ink: "#ffffff",
    icon: "/assets/palette-icon.png",
    period: "2024.03 – 2024.11",
    role: "팀장, PM, iOS, 디자인",
    tagline: "몇 가지 질문에 답하면 AI가 포스터와 배너를 만들어 주는 iOS 앱",
    facts: [
      { v: "50%+", l: "대용량 결과물 로딩 속도 개선" },
      { v: "6인", l: "직접 꾸린 팀 (백엔드 2, 프론트 4)" },
      { v: "1등", l: "2024 DGSW 나르샤 프로젝트 최종 평가회" },
    ],
    did: [
      "팀원을 직접 비교해 모으고, 브레인스토밍으로 서비스를 기획했습니다.",
      "생성 대기열과 진행 상황을 보여 줘, 기다리는 시간도 경험의 일부로 만들었습니다.",
      "피드백을 받아 채팅형 UI를 질의응답형으로 다시 만들어 결과물과 UX를 함께 끌어올렸습니다.",
      "앱 디자인과 컬러 시스템, 애니메이션·햅틱 흐름을 설계했습니다.",
    ],
    stack: ["Swift", "SwiftUI", "Rive", "Socket.IO", "Alamofire", "Tuist"],
    links: [{ label: "GitHub", href: "https://github.com/API-Team-Organization/Palette-iOS" }],
    media: { kind: "mockup", shot: { src: "/assets/palette-mockup.png", width: 680, height: 761, alt: "Palette iOS 앱 화면" } },
  },
  {
    kind: "project",
    id: "lightlib",
    title: "LightLib",
    display: "LIGHTLIB",
    color: "#ef4f97",
    ink: "#ffffff",
    icon: "/assets/lightlib-icon.png",
    period: "2026.10 – 진행 중",
    role: "1인 개발 — Android, Flutter",
    tagline: "일본어 서적 중심의 로컬 번역 내장 전자책 리더",
    facts: [
      { v: "On-device", l: "Gemma 4를 휴대폰에서 직접 실행하는 번역" },
      { v: "43MB", l: "모델을 분리해 141MB에서 줄인 APK" },
      { v: "540+", l: "빌드마다 CI에서 돌리는 테스트" },
    ],
    did: [
      "foliate-js 기반 리더로 세로쓰기와 후리가나까지 책의 조판을 그대로 보여 줍니다.",
      "GPU(LiteRT-LM)가 안 되면 CPU(llama.cpp)로 넘어가며, 여러 문단을 한 번에 번역하고 틀린 번역은 검사해 다시 씁니다.",
      "책마다 인물·용어 사전을 만들어 표기를 통일하고, One-Shot Example 등으로 일본 서적 특유의 문체를 살리는 번역기능을 만들었습니다.",
      "보다 나은 사용성을 위해 Gemini 엔진을 함께 두고, 앱이 새 빌드를 받아 SHA-256을 확인한 뒤 스스로 업데이트합니다.",
      "바이브 코딩과 CI / CD 환경을 구축해 컴퓨터 없이 사용중에 보이는 개선점 수정과 새로운 기능 반영을 매우 빠르게 할 수 있었습니다."
    ],
    stack: ["Flutter", "Dart", "foliate-js", "LiteRT-LM", "llama.cpp", "Gemini API", "GitHub Actions"],
    links: [
      { label: "GitHub", href: "https://github.com/4rNe5/LightLib" },
      { label: "최신 릴리스", href: "https://github.com/4rNe5/LightLib/releases/latest" },
    ],
    media: {
      kind: "screens",
      shots: [
        { src: "/assets/lightlib-library.jpg", width: 540, height: 1260, alt: "LightLib 서재 화면" },
        { src: "/assets/lightlib-reader.jpg", width: 540, height: 1260, alt: "LightLib 세로쓰기 리더 화면" },
        { src: "/assets/lightlib-search.jpg", width: 540, height: 1260, alt: "LightLib 검색 화면" },
      ],
    },
  },
  {
    kind: "project",
    id: "minesweeper",
    title: "Small Minesweeper",
    display: "MINESWEEPER",
    color: "#1f1f1f",
    ink: "#ffffff",
    icon: "/assets/minesweeper-icon.png",
    period: "2024.10",
    role: "1인 개발 — watchOS, 디자인",
    tagline: "손목 위에서 하는 지뢰찾기",
    facts: [{ v: "9,000+", l: "유저" }],
    did: [
      "Digital Crown으로 화면을 전환하고, 햅틱으로 손끝에 결과를 알려 줍니다.",
      "첫 칸은 항상 안전하고, 빈 칸은 자동으로 펼쳐집니다.",
    ],
    stack: ["Swift", "SwiftUI", "WatchKit"],
    links: [{ label: "GitHub", href: "https://github.com/4rNe5/minesweeper-watch" }],
  },
  {
    kind: "project",
    id: "turtlepods",
    title: "TurtlePods",
    display: "TURTLEPODS",
    color: "#2fb86a",
    ink: "#05301a",
    icon: "/assets/turtlepods-icon.png",
    period: "2024.11",
    role: "iOS, 디자인",
    tagline: "AirPods 센서로 목 자세를 지켜보는 앱",
    facts: [{ v: "대상", l: "2024 CounterSpell Busan 해커톤" }],
    did: [
      "머리 기울기를 보여 주는 수평계를 SwiftUI로 만들었습니다.",
      "목 자세와 수면 패턴을 분석해 점수와 맞춤 추천으로 돌려줍니다.",
    ],
    stack: ["Swift", "SwiftUI", "CoreMotion", "HealthKit", "Charts", "Combine"],
    links: [{ label: "GitHub", href: "https://github.com/4rNe5/Neckhealth-App" }],
  },
  { kind: "awards", id: "awards", title: "Awards", display: "AWARDS", color: "#d49a00", ink: "#2a2000" },
  { kind: "stage", id: "stage", title: "On stage", display: "ON STAGE", color: "#7c5cf0", ink: "#ffffff" },
  { kind: "contact", id: "contact", title: "Contact", display: "REC ME@4RNE5.DEV", color: "#ff3b1f", ink: "#ffffff" },
];

export const awards = [
  { date: "2024.11", event: "CounterSpell Busan 해커톤", prize: "대상", work: "TurtlePods", top: true },
  { date: "2024.10", event: "DGSW 나르샤 프로젝트 최종 평가회", prize: "1등", work: "Palette", top: true },
  { date: "2024.10", event: "SK STA+C", prize: "생활정보부문 우수상", work: "SOS — 원클릭 119 신고" },
  { date: "2024.08", event: "Microsoft Hackers Ground 해커톤 in 의성", prize: "대상 (한국 MS 대표이사상)", work: "나누리 — 잉여 농산물 나눔", top: true },
  { date: "2024.07", event: "DGSW 교내 해커톤", prize: "장려상", work: "Diverse — 성소수자 소통 플랫폼" },
  { date: "2024.01", event: "APPJAM 해커톤", prize: "미래산업부문 장려상", work: "MIRACLE — AI 심리치료" },
  { date: "2023.11", event: "Software FUTURE & DREAM Challenge", prize: "금상 (한국소프트웨어산업협회장상)", work: "Karabiner — 원클릭 안전신고" },
  { date: "2023.11", event: "LG CNS AI Academy Challenge", prize: "최우수상", work: "TRAISH — 거리 쓰레기 관리 로봇" },
  { date: "2023.11", event: "AI Frontier Challenge", prize: "최우수상", work: "CCA — 폐 질환 진단 AI" },
];

export const stage = [
  {
    date: "2024.12",
    title: "WINTER B1CODE",
    desc: "외주와 팀 프로젝트에서 배운 협업 방식과 도구에 대해 발표했습니다.",
    photo: "/assets/act-b1code-1.jpg",
    link: { label: "발표 영상", href: "https://m.site.naver.com/1Ddlo" },
  },
  {
    date: "2024.10, 2024.12",
    title: "FIX ICT 융합 엑스포, SoftWave",
    desc: "Palette 부스를 총괄해 시연하고 기술 질문에 답했습니다.",
    photo: "/assets/act-fix-1.jpg",
    link: { label: "인터뷰 영상", href: "https://m.site.naver.com/1DdGS" },
  },
  {
    date: "2024.08",
    title: "Microsoft Hackers Ground 수상 인터뷰",
    desc: "대상 수상과 인터뷰 장면입니다. 수상은 영상 5분부터 나옵니다.",
    photo: "/assets/act-ms-1.jpg",
    link: { label: "영상 보기", href: "https://m.site.naver.com/1Ddqc" },
  },
  {
    date: "2024.11",
    title: "CounterSpell Busan 기사",
    desc: "국제신문에 실린 수상 기사입니다. 팀 Snoo.py 부분을 봐 주세요.",
    photo: "/assets/act-counterspell.jpg",
    link: { label: "기사 보기", href: "https://m.site.naver.com/1DdAC" },
  },
  {
    date: "2024.11",
    title: "DGSW 학생 전문가 특강",
    desc: "‘프론트 개발자 독립 운동 — 의존성 제거하기’, 프론트엔드 개발자 혼자 서비스의 모든 구성요소를 만드는 법을 강의했습니다.",
  },
  {
    date: "2023.08",
    title: "대한민국 ICT 융합 엑스포",
    desc: "교내 프로젝트 Ubi의 부스를 총괄해 시연하고 기술 질문에 답했습니다.",
  },
];
