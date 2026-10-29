// 포트폴리오 콘텐츠 — 자소서(CV 1.3 PDF)·Figma(4rNe5_CV-Portfoilo)·GitHub 저장소에서 옮긴 내용.
// 문장 안의 **굵게** 표기는 원본 자소서의 강조를 그대로 옮긴 것이다.

export type Link = { label: string; href: string; note?: string };

export type Position = {
  label: string; // "Position #1"
  title: string;
  main?: boolean;
  points: string[];
};

export type Media =
  | { kind: "mockup"; src: string; width: number; height: number; alt: string }
  | { kind: "screens"; items: { src: string; width: number; height: number; alt: string }[] };

export type ProjectTrack = {
  kind: "project";
  id: string;
  title: string;
  display: string; // OLED에 표시할 대문자 이름
  color: string;
  ink: string; // color 위 글자색
  icon: string;
  period: string;
  role: string;
  summary: string;
  intro: string[];
  stack: string[];
  positions: Position[];
  links: Link[];
  notice?: string;
  media?: Media;
};

export type IntroTrack = { kind: "intro"; id: string; title: string; display: string; color: string; ink: string };
export type AwardsTrack = { kind: "awards"; id: string; title: string; display: string; color: string; ink: string };
export type StageTrack = { kind: "stage"; id: string; title: string; display: string; color: string; ink: string };
export type ContactTrack = { kind: "contact"; id: string; title: string; display: string; color: string; ink: string };

export type Track = IntroTrack | ProjectTrack | AwardsTrack | StageTrack | ContactTrack;

export const profile = {
  nameKo: "박준현",
  nameEn: "Park Jun Hyeon",
  handle: "4rNe5",
  role: "Front-End Developer",
  email: "me@4rne5.dev",
  github: "https://github.com/4rNe5",
  photo: "/assets/profile.jpg",
  about: [
    "안녕하세요,\n**서비스의 본질에 집중**하는 개발자 박준현 입니다.\n**App, Web** 등의 **Front-End**와 **UI / UX 기술**에 관심을 가지고 활동합니다.\n**‘사용자 경험은 사소한 코드 한 줄에서 나온다’**라는 생각으로 개발에 임하고 있습니다.",
    "주어진 일에 대해서는 **책임감과 사명감**을 가지고\n제가 이끌어 낼 수 있는 **최고의 효율, 최대한의 결과**를 만들어냅니다.",
    "개발뿐만 아니라, **디자인, PM** 등 다양한 포지션의 직무를 **직접 맡아 리드해본 경험**으로\n다른 포지션의 **팀원과의 협업과 소통을 원활**하게 진행할 수 있습니다.",
    "그리고 이를 맡은 일을 할 때 서비스에 역량껏 녹여내려 노력하여,\n제가 맡은 **서비스 전체의 지속적인 발전을 추구**합니다.",
  ],
  stack: {
    primary: ["TypeScript", "JavaScript", "React Native", "Expo", "EAS", "Next.js", "React", "Vite", "CSS", "SCSS", "Swift", "SwiftUI", "Figma"],
    secondary: ["Python", "HTML", "TailWindCSS", "Zustand", "Socket.IO", "STOMP", "WebPack", "FireBase", "Rive", "KingFisher", "Tuist"],
  },
  experience: [
    {
      period: "2023.11 — 현재",
      title: "앱 / 웹 외주 개발자",
      sub: "프리랜서 활동",
      recent: true,
      points: [
        "웹과 앱 분야의 프리랜서 외주 개발자로 약 2년간 활동, 많은 개발 요청과 오퍼를 받았습니다.",
        "이 과정을 통해 학생으로써 쌓기 힘든 회사의 관점에서 서비스를 보는 방법 등의 스킬을 얻었습니다.",
        "다양한 프로젝트에서 기획과 디자인, Front-End를 전부 리드하여 작업, 개발하였습니다.",
      ],
    },
    {
      period: "2024.11 — 2025.01",
      title: "LabConf 컨퍼런스 운영진",
      sub: "프리랜서 활동",
      points: [
        "2400명 규모의 개발자 커뮤니티인 Coding Lab의 컨퍼런스 운영진으로 활동하였습니다.",
        "배너 디자인과 같은 그래픽 작업이 필요한 부분에 투입되어 디자이너로서의 역량을 길렀습니다.",
      ],
    },
  ],
};

export const tracks: Track[] = [
  { kind: "intro", id: "intro", title: "Intro", display: "PARK JUN HYEON", color: "#ff5a1f", ink: "#ffffff" },
  {
    kind: "project",
    id: "jobanswer",
    title: "jobanswer",
    display: "JOBANSWER",
    color: "#00d981",
    ink: "#03241a",
    icon: "/assets/jobanswer-icon.png",
    period: "2025.09 — 2025.12",
    role: "FE (App) & QA",
    summary: "말하기 음성의 내용과 구조를 실시간으로 분석·교정하는 AI 취업 면접 코칭 앱",
    notice: "회사 내부 코드이므로 저장소는 공개하지 않습니다.",
    intro: [
      "대한민국 많은 청년들의 고민거리, ‘**취업 면접**’.\n보통 서류를 넘겼다면, 취업을 위해 두번째로 넘어야만 할 관문입니다.\n또, 슬프게도 **많은 사람들이 좌절하는 관문**이지요.\n하지만, 막상 취준을 해보면 **면접을 연습하기는 매우 비싸고, 어렵습니다**.",
      "이에, 저희 회사는 기존에 운영중인 입시 면접 코칭 서비스, ‘잡앤써’ 프로젝트를 통해서 얻은 **말하기 음성으로 내용과 구조를 분석하고, 교정해주는 기술**이 있었습니다.",
      "이를 이용해 취업면접 자료를 연구, 말하는 내용을 분석해서 실시간으로 말하기의 구조와 내용을 더 탄탄하게 잡아주는 서비스를 기획했고, 그 서비스가 바로 **jobanswer** 입니다.",
    ],
    stack: ["React Native", "Lottie", "STT (Speech-To-Text)", "TypeScript", "React Navigation", "AsyncStorage", "i18n", "Notifee", "react-native-spotlight-tour"],
    positions: [
      {
        label: "Position #1",
        title: "jobanswer Front-End 개발",
        main: true,
        points: [
          "다양한 **라이브러리와 기술을 적용하기 위해** Expo 기반이 아닌, **순정 React Native를 통해 개발을 진행**했습니다.",
          "다양한 **Lottie Animation Asset을 이용**해, **시각적 경험의 강조**와 **부드러운 디자인 구현에 집중**했습니다.",
          "**On-device STT와, API를 이용한 Clova STT 모델을 이용한 STT 구현**, 그리고 이를 개발중에 음성을 녹음하는 라이브러리 **내부 코드의 문제가 발생**해, 이를 수정하며 **라이브러리를 커스터마이징 할 수 있는 경험**을 얻었습니다.",
          "**Tour 라이브러리를 활용**해, 서비스의 사용법을 간단히 숙지할 수 있도록 하는 **튜토리얼 기능을 구현**했습니다.",
          "간편한 고객 문의사항 처리를 위해, **ChannelTalk 서비스를 이용**, ChannelTalk 공식 라이브러리를 이용해 **서비스 내부에서 ChannelTalk 채널로 바로 문의를 할 수 있도록 하는 기능을 구현**했습니다.",
          "React Native SVG 라이브러리를 이용해 **각 질문 토픽에 대한 훈련 진행도 길을** 디자인 상 포인트를 기점으로 **Split**, **색이 바뀌도록 UI를 구성**해 **진행사항을 한눈에 볼 수 있도록 시각화**했습니다.",
        ],
      },
      {
        label: "Position #2",
        title: "jobanswer QA 포지션",
        points: [
          "서비스 출시 전 내부 베타테스트부터, **QA를 주도하여 체크 항목을 작성**하고, 원활히 우선순위가 전달되도록 **사내 테스트 피드백 구조 개선에 기여**했습니다.",
        ],
      },
    ],
    links: [{ label: "App Store", href: "https://apps.apple.com/ch/app/%EC%9E%A1%EC%95%A4%EC%8D%A8/id6755668986" }],
    media: {
      kind: "screens",
      items: [
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
    period: "2024.08 — 2024.09",
    role: "기획 & FE & BE & 디자인 (1인 개발)",
    summary: "리듬게이머를 위한 반응속도 측정 & 랭킹 앱",
    intro: [
      "저는 한 게임의 랭커를 노려볼 정도로 리듬게임을 좋아합니다.\n그렇게 커뮤니티를 둘러보던 어느날, 저는 **하나의 유행**을 발견합니다.",
      "24년 8월, 리듬게이머 사이에서는 **반응속도 측정**이 유행했습니다.\n다들 본인의 **측정결과를 X나 커뮤니티 등에 공유**하는 상황을 보다보니,\n이 측정기가 복잡한 서비스가 아닐 것 같다는 생각이 들었습니다.",
      "이때, 이런 반짝하는 수요를 노려보고자 **빠르게 개발해서, 바로 배포할 수 있는 서비스**를 만들어보자고 생각하여,\n빠르게 **반응속도 측정 & 랭킹 서비스**를 디자인, 개발하여 출시 하였습니다.",
      "그렇게 만들어진 앱이 바로, **탁!** 입니다.",
    ],
    stack: ["React Native (Expo)", "EAS", "PocketBase", "TypeScript", "React Navigation", "AsyncStorage"],
    positions: [
      {
        label: "Position #1",
        title: "탁! Front-End 개발",
        main: true,
        points: [
          "**디바이스별 지연시간을 보정**하는 정밀 **타이밍 조정 로직**을 구현하여 약 **60ms의 측정 정확도 개선**을 달성했습니다.",
          "공공 LeaderBoard 시스템에서 **적절한 콘텐츠를 보장**하기 위한 **로컬 비속어 필터링을 구현**했습니다.",
          "**useFocusEffect**를 통해 관련 **화면이 활성화될 때만 새로고침**하는 전략으로 **불필요한 API 호출을 감소**시켰습니다.",
          "**최소 임계값 검증**을 통해 인위적으로 빠른 반응 시간 제출을 감지하고 방지하는 **부정 방지 조치를 설계**했습니다.",
        ],
      },
      {
        label: "Position #2",
        title: "탁! Back-End 개발",
        points: [
          "프론트엔드 서비스에 더 집중하기 위해 고효율의 **Pocketbase를 도입, 배포**하여 **Back-End**를 구축하였습니다.",
          "**Fly.io 서비스**를 이용해서 배포, **적은 비용**으로 2개의 인스턴스로 **Back-up 인스턴스까지 구축**하였습니다.",
        ],
      },
      {
        label: "Position #3",
        title: "탁! UI & UX 개발",
        points: [
          "App Store **Promotion 이미지**, **UI & UX 디자인**을 전부 작업하였습니다.",
          "서비스가 단순한 만큼 랭커 강조나, 다단계 상호작용 Flow 등 **직관적인 시각적 피드백 & 간결함에 집중**했습니다.",
        ],
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/4rNe5/reaction-counter-app" },
      { label: "App Store", href: "https://apps.apple.com/cz/app/%ED%83%81/id6670382941" },
    ],
    media: { kind: "mockup", src: "/assets/ttak-mockup.png", width: 1400, height: 1050, alt: "탁! 앱 화면 목업" },
  },
  {
    kind: "project",
    id: "sfoodgo",
    title: "SFOODGO",
    display: "SFOODGO",
    color: "#1154b9",
    ink: "#ffffff",
    icon: "/assets/sfoodgo-logo.svg",
    period: "2025.01 — 2025.04",
    role: "FE 작업 & 디자인 부분 1인 작업",
    summary: "외국인 여행객을 위한 자동 번역 배달 대행 플랫폼 (PWA)",
    notice: "외주 프로젝트로, 보안상의 이유로 소스를 공개하지 않습니다.",
    intro: [
      "다들 배달 음식, 자주 드시나요?\n저희에게는 배민, Coupang Eats 등의 다양한 배달 서비스가 있습니다.\n늘 맛있는 음식을 집에서 먹고 싶을 때, 간단히 주문할 수 있지요.",
      "하지만, 외국인 여행객들에겐 이런 배달서비스가 없습니다.\n타지에 놀러 온 외국인들에게는 배달 서비스는 거대한 장벽이지요.",
      "이에, 외주 작업을 요청해주신 사장님께선 이 외국인 여행객들을 대상으로 현지 언어로의 자동 번역, 양자 간의 소통과 주문을 돕는 배달 대행 플랫폼의 개발을 요청해 주셨고, Web 플랫폼으로 해당 서비스를 개발하였습니다.",
      "이렇게 3개월의 개발과 연구 끝에, **SFOODGO**가 탄생하였습니다.",
    ],
    stack: ["Next.js", "Progressive Web App", "TypeScript", "ky", "Zustand", "SCSS", "React Slick", "Swiper", "GSAP", "Storybook", "React Responsive Modal"],
    positions: [
      {
        label: "Position #1",
        title: "SFOODGO Web 개발",
        main: true,
        points: [
          "**useRef를 이용한 위치 권한 요청 제한 로직**으로, 사용자 경험 저하를 줄이며 **위치 정보 접근성을 25% 향상**시켰습니다.",
          "GPS 위치 **정보 요청 시간 초과 및 오류 상황에 대한 점진적 대응 메커니즘**을 구현하여 **서비스 가용성을 개선**했습니다.",
          "**Zustand, localStorage를 결합한 지속 상태 관리 로직**으로 새로고침시 **데이터 일관성 & 로딩을 최적화**했습니다.",
          "Web에서 **이미지 업로드 시 MIME 타입 및 파일 크기 검증 로직을 구현**하여 **서버 부하를 30% 감소**시켰습니다.",
          "주소 등록 과정의 **단계별 사용자 경험 흐름을 체계적으로 설계**, 사용자 **배달 위치의 정확도를 40% 향상**시켰습니다.",
        ],
      },
      {
        label: "Position #2",
        title: "SFOODGO 디자인",
        points: [
          "**SFOODGO 로고, Web 디자인, Banner & Poster** 등을 전부 제작하였습니다.",
          "서비스가 **외국인 (베트남인)을 노린 만큼**, **베트남어를 사용**하고 **베트남 현지의 디자인 감성을 참고**하였습니다.",
          "**외국인들의 휴대폰 기종**이나 교체 주기 등을 참고하여, **반응형 디자인에 특히 신경써서 디자인**하였습니다.",
          "**음식에 집중**시키기 위해 **색상 등 시각적 자극을 줄이고**, **그림자 & 블러 효과를 주로 이용해서 디자인**하였습니다.",
        ],
      },
    ],
    links: [{ label: "sfoodgo.com", href: "https://sfoodgo.com" }],
    media: { kind: "mockup", src: "/assets/sfoodgo-mockup.png", width: 652, height: 884, alt: "SFOODGO 웹앱 화면 목업" },
  },
  {
    kind: "project",
    id: "palette",
    title: "Palette",
    display: "PALETTE",
    color: "#3f63fe",
    ink: "#ffffff",
    icon: "/assets/palette-icon.png",
    period: "2024.03 — 2024.11",
    role: "iOS & 디자인 & PM 담당",
    summary: "생성형 AI 기반 홍보물 제작 서비스 — iOS 클라이언트",
    intro: [
      "사람들은 수많은 상황에 **홍보물**을 만들고, 사용합니다.\n학생인 저희는 교내 대회 포스터, 어른들은 기업의 이벤트 배너 등,\n사람들은 다양한 상황에 홍보물을 만들고 사용하게 되지요.",
      "하지만, 이런 홍보물 하나를 만드는 작업은 **상당한 돈이나 시간**을 요합니다. 상당한 시간과 수고, 또는 돈이 필요하고, **만족스럽지 못한 경우가 많습니다**.",
      "저희는 이런 문제에 AI를 접목해서 해결하고자 하였습니다.\n훌륭한 창작능력에 **빠른 속도와 저렴한 가격을 가진 AI를 홍보물 제작에 이용**한다면 압도적인 경쟁력이 있지 않을까 생각했고,",
      "그 결과물이 바로, **Palette** 입니다.",
    ],
    stack: ["Swift", "SwiftUI", "Rive", "Socket.IO", "Alamofire", "KingFisher", "SwiftDotenv", "Tuist"],
    positions: [
      {
        label: "Position #1",
        title: "Palette iOS 개발",
        main: true,
        points: [
          "대용량의 홍보물을 불러와야 하는 상황에 맞춰 **관련 로직을 최적화**, 데이터 **로딩속도를 50% 이상 개선**시켰습니다.",
          "서비스의 **사용자 Flow에** 디자인을 지키며 **애니메이션, Haptic 등 다양한 사용자 경험 개선요소를 설계, 도입**하였습니다.",
          "**대기중의 사용자 경험**을 고려하여, 서버와 함께 **이용 대기열과 생성 과정 모니터링 기능**을 도입해 개선하였습니다.",
          "피드백을 통해, 채팅형 UI에서 **질의응답형 UI**로의 재개발을 단행, **생성물의 퀄리티와 UX 모두 개선에 성공**하였습니다.",
        ],
      },
      {
        label: "Position #2",
        title: "팀장 & PM",
        points: [
          "**AI 서비스 개발을 상정하고,** 프로젝트 팀원 **6인 (BE 2 & FE 4) 을 비교분석**하여 직접 영입했습니다.",
          "브레인스토밍을 통해 **팀원들과 아이디어를 도출**하고 고도화, **Palette 서비스를 기획하고 기능을 설계**했습니다.",
        ],
      },
      {
        label: "Position #3",
        title: "서비스 UI & UX 디자인",
        points: [
          "Palette의 **Mobile Client 디자인**, **Banner & Poster 디자인**, **Color 시스템**을 작업하였습니다.",
          "**애니메이션이나 Haptic** 등 **UX Flow의 디자인**에도 참여, 팀을 주도하였습니다.",
          "홍보물에 **UI가 묻히지 않도록** 전반적 색상을 **눈에 잘 들어오는 파란색 계열 색상을 찾아 사용**하였습니다.",
        ],
      },
    ],
    links: [{ label: "GitHub", href: "https://github.com/API-Team-Organization/Palette-iOS" }],
    media: { kind: "mockup", src: "/assets/palette-mockup.png", width: 680, height: 761, alt: "Palette iOS 앱 화면 목업" },
  },
  {
    kind: "project",
    id: "lightlib",
    title: "LightLib",
    display: "LIGHTLIB",
    color: "#f565a2",
    ink: "#2a0716",
    icon: "/assets/lightlib-icon.png",
    period: "2026.10 — 진행중",
    role: "Android · Flutter (1인 개발)",
    summary: "일본 라이트노벨을 위한 EPUB 서재 & 리더 — 기기 안에서 도는 LLM 번역",
    intro: [
      "외국어 원서를 그 자리에서 읽고 싶다는 생각에서 시작한 Android 전자책 앱입니다.\nOpenlibExtended를 포크해 **EPUB 리더, 서재, 번역 엔진을 새로 설계**했습니다.",
      "foliate-js 기반 리더로 책 고유의 레이아웃·이미지·**세로쓰기(縦書き)와 루비(후리가나)**를 그대로 렌더링하고,\n**Gemma 4를 휴대폰 안에서 직접 실행**해 문단 단위로 번역합니다. 번역 중 어떤 데이터도 기기를 떠나지 않습니다.",
      "모든 main 빌드는 CI에서 테스트·서명·릴리즈까지 자동으로 진행되고, 앱이 직접 새 빌드를 받아 **SHA-256 검증 후 업데이트**합니다.",
    ],
    stack: ["Flutter", "Dart", "foliate-js", "LiteRT-LM", "llama.cpp (llamadart)", "Gemma 4", "Gemini API", "GitHub Actions"],
    positions: [
      {
        label: "Position #1",
        title: "기기 내 번역 엔진",
        main: true,
        points: [
          "**Gemma 4 E2B/E4B를 LiteRT-LM GPU로 실행**하고, GPU를 쓸 수 없는 기기는 **llama.cpp CPU(GGUF)로 자동 전환**되도록 구성했습니다.",
          "여러 문단을 한 번에 요청하는 **배치 번역**으로 속도를 높이고, 잘못 돌아온 번역은 **품질 검사 후 재작성**합니다.",
          "책마다 인물·성별·지명·용어를 담는 **용어집**을 만들어, 이름이 책 전체에서 같은 표기로 읽히도록 했습니다.",
          "**발열과 배터리를 감시하며 쉬어 가는 백그라운드 번역**, 책 한 권을 끝까지 먼저 번역하는 기능, 번역본 EPUB 내보내기를 구현했습니다.",
        ],
      },
      {
        label: "Position #2",
        title: "클라우드 번역 & 앱 전반",
        points: [
          "**Gemini API 번역 엔진**을 추가해 기기 번역과 병행 — 번호 붙은 JSON 스키마로 응답 밀림을 감지해 다시 요청하고, 일일 한도를 다 쓰면 기기 번역으로 넘어갑니다.",
          "표지·읽기 상태·태그·장르를 다루는 서재, 독서 기록, **크기별 홈 화면 위젯**, 폴더블 대응 레이아웃을 만들었습니다.",
          "모델을 APK에서 분리해 **APK 크기를 141 MB → 43 MB**로 줄였고, **540개 이상의 테스트**를 CI에서 매 빌드마다 실행합니다.",
          "6개 언어 (English, 한국어, 日本語, Deutsch, Español, Français)를 지원합니다.",
        ],
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/4rNe5/LightLib" },
      { label: "Releases", href: "https://github.com/4rNe5/LightLib/releases/latest" },
    ],
    media: {
      kind: "screens",
      items: [
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
    role: "watchOS 및 디자인 작업 (1인 개발)",
    summary: "watchOS용 지뢰찾기 게임",
    intro: ["작은 손목 화면에서도 손맛 있게 즐길 수 있도록 만든 **watchOS용 지뢰찾기 게임**입니다."],
    stack: ["Swift", "SwiftUI", "WatchKit"],
    positions: [
      {
        label: "Position #1",
        title: "Small Minesweeper watchOS 개발",
        main: true,
        points: [
          "**제한된 화면에 최적화**된 UI/UX 설계",
          "**Digital Crown을 이용한 UI 전환** 사용.",
          "**Haptic Feedback**으로 사용자 경험 개선",
          "**첫 클릭 안전 기능과 빈 셀 자동 확장기능** 구현",
          "**유저 확보 전략** 수립으로 **2000+ 유저 달성.**",
        ],
      },
    ],
    links: [{ label: "GitHub", href: "https://github.com/4rNe5/minesweeper-watch" }],
  },
  {
    kind: "project",
    id: "turtlepods",
    title: "TurtlePods",
    display: "TURTLEPODS",
    color: "#38cc78",
    ink: "#05301a",
    icon: "/assets/turtlepods-icon.png",
    period: "2024.11",
    role: "iOS & 디자인 담당",
    summary: "AirPods를 이용한 목건강 관리 — 2024 CounterSpell Busan 해커톤 대상",
    intro: ["**AirPods**의 머리 움직임 센서로 목 자세와 스트레스 지수를 분석하는 목건강 관리 앱입니다."],
    stack: ["Swift", "SwiftUI", "CoreData", "CoreMotion", "HealthKit", "Charts", "Combine", "Rive"],
    positions: [
      {
        label: "Position #1",
        title: "TurtlePods iOS 개발",
        main: true,
        points: [
          "SwiftUI로 머리 움직임 시각화용 **수평계 제작**.",
          "AirPods 활용 **목 자세 & 수면패턴 분석 구현**",
          "수면 품질 점수화 & 맞춤 추천 엔진 구축",
          "SwiftUI & Combine 활용 **반응형 UI 구현**",
        ],
      },
    ],
    links: [{ label: "GitHub", href: "https://github.com/4rNe5/Neckhealth-App" }],
  },
  { kind: "awards", id: "awards", title: "Awards", display: "AWARDS", color: "#e8b100", ink: "#2a2000" },
  { kind: "stage", id: "stage", title: "Stage", display: "TALKS + EXPO", color: "#8a5cf6", ink: "#ffffff" },
  { kind: "contact", id: "contact", title: "Contact", display: "REC ME@4RNE5.DEV", color: "#ff3b1f", ink: "#ffffff" },
];

export const awards = [
  { date: "2023.11", event: "Software FUTURE & DREAM Challenge 2023", prize: "금상 (한국소프트웨어산업협회장상, 2등)", work: "원클릭 안전신문고 신고 서비스 Karabiner 개발" },
  { date: "2023.11", event: "2023 LG CNS AI Academy Challenge", prize: "최우수상 (2등)", work: "도심부 거리 쓰레기 관리 솔루션 로봇 TRAISH 개발" },
  { date: "2023.11", event: "AI Frontier Challenge 2023", prize: "최우수상 (2등)", work: "전문 폐 질환 진단 의료 AI CCA 및 서비스용 웹 개발" },
  { date: "2024.01", event: "2024 APPJAM 해커톤", prize: "미래산업부문 장려상", work: "AI 기반 심리치료 서비스 MIRACLE 개발" },
  { date: "2024.07", event: "2024 DGSW 교내 해커톤", prize: "장려상", work: "성소수자 중심 소통 플랫폼 Diverse 개발" },
  { date: "2024.08", event: "2024 Microsoft Hackers Ground 해커톤 in 의성", prize: "대상 (한국 MS 대표이사상, 1등)", work: "지역 잉여 농산물 나눔 & 판매 서비스 나누리 개발", top: true },
  { date: "2024.10", event: "2024 SK STA+C", prize: "생활정보부문 우수상", work: "원클릭 119 신고 서비스 SOS (Snap On Scene) 개발" },
  { date: "2024.10", event: "2024 DGSW 나르샤 프로젝트 최종 평가회", prize: "1등", work: "생성형 AI 기반 홍보물 제작 서비스 Palette 개발", top: true },
  { date: "2024.11", event: "2024 CounterSpell Busan 해커톤", prize: "대상 (1등)", work: "AirPods를 이용한 목 질환 & 스트레스 지수 분석 앱 TurtlePods 개발", top: true },
];

export const stage = [
  {
    date: "2023.08",
    type: "교외 엑스포 부스 출품 & 운영",
    title: "2023 대한민국 ICT 융합 엑스포",
    desc: "2023 DGSW 나르샤 프로젝트 서비스인 ‘Ubi’의 부스 운영 총괄로 관람객 접객, 서비스 시연, 기술 질문 응대 등을 하였습니다.",
  },
  {
    date: "2024.08",
    type: "대회 인터뷰",
    title: "2024 Microsoft Hackers Ground 해커톤 in 의성",
    desc: "대회 인터뷰 장면과 수상 장면입니다. (수상은 영상 5분부터 입니다)",
    photos: ["/assets/act-ms-1.jpg", "/assets/act-ms-2.jpg"],
    link: { label: "영상 보기", href: "https://m.site.naver.com/1Ddqc" },
  },
  {
    date: "2024.08",
    type: "대회 인터뷰",
    title: "2024 Counterspell Busan 해커톤",
    desc: "수상 관련 국제신문 뉴스 기사입니다. (팀명 : Snoo.py 부분)",
    photos: ["/assets/act-counterspell.jpg"],
    link: { label: "기사 보기", href: "https://m.site.naver.com/1DdAC" },
  },
  {
    date: "2024.10",
    type: "교외 엑스포 부스 출품 & 운영",
    title: "2024 FIX 대한민국 ICT 융합 엑스포",
    desc: "2024 DGSW 나르샤 프로젝트 서비스인 ‘Palette’의 부스 운영 총괄로 관람객 접객, 서비스 시연, 기술 질문 응대를 하였습니다.",
    photos: ["/assets/act-fix-1.jpg", "/assets/act-fix-2.jpg"],
    link: { label: "인터뷰 영상", href: "https://m.site.naver.com/1DdGS" },
  },
  {
    date: "2024.11",
    type: "교내 학생 특강 발표",
    title: "DGSW 학생 전문가 특강",
    desc: "‘프론트 개발자 독립 운동 : 의존성 제거하기’라는 세션으로 프론트 개발자 홀로 하나의 프로젝트의 모든 구성요소를 만드는 법을 강의했습니다.",
  },
  {
    date: "2024.12",
    type: "교외 엑스포 부스 출품 & 운영",
    title: "2024 대한민국 SoftWare 대전 (SoftWave)",
    desc: "2024 DGSW 나르샤 프로젝트 서비스인 ‘Palette’의 부스 운영 총괄로 관람객 접객, 서비스 시연, 기술 질문 응대를 하였습니다.",
  },
  {
    date: "2024.12",
    type: "교내 컨퍼런스 발표",
    title: "2024 WINTER B1CODE",
    desc: "‘협업툴과 협업에 대하여’라는 주제로 외주나 교내 프로젝트를 하면서 느끼고 배운 협업의 방법과 그 도구들에 대해 발표하였습니다.",
    photos: ["/assets/act-b1code-1.jpg", "/assets/act-b1code-2.jpg"],
    link: { label: "발표 영상", href: "https://m.site.naver.com/1Ddlo" },
  },
];
