# recortfolio

포켓 필드 레코더의 조작계를 그대로 옮긴, **재생하는 포트폴리오** — 박준현 (4rNe5), Front-End Developer.

페이지 스크롤이 곧 테이프입니다. 조그 휠·레버·페이더·트랜스포트 버튼이 모두 같은 "테이프 위치"를 움직이고, OLED에는 재생 시간과 현재 트랙이 표시됩니다.

## 조작

| 조작계 | 동작 |
|---|---|
| 조그 휠 | 드래그해서 스크럽 (관성 + 15° 디텐트). 가운데 허브 탭 = 재생/일시정지 |
| 왼쪽 레버 | 짧게 튕기면 이전/다음 트랙, 누르고 있으면 빨리감기(위)·되감기(아래) |
| ● REC | 연락처 트랙으로 이동, 한 번 더 누르면 메일 작성 |
| ▶ PLAY | 자동 재생 (휠이 모터처럼 돌아감) |
| ■ STOP | 정지, 한 번 더 누르면 처음으로 |
| + / − | 재생 속도 0.5x ~ 4x |
| 페이더 | 테이프 전체 위치 스크럽 + 레벨 미터 |
| 볼륨 노브 | 드래그로 볼륨 (사운드 자동 켜짐) |
| 라운드 버튼 | 사운드 켜기/끄기 (기본 꺼짐) |
| M 키 | 트랙리스트 |
| 측면 키 | 테마 (auto → light → dark) |

키보드: `Space` 재생 · `←` `→` 트랙 · `M` 트랙리스트 · `R` REC · `+` `-` 속도 · `Esc` 닫기
모바일: 기기가 화면 밖으로 나가면 하단 미니 트랜스포트가 나타납니다.

## 구조

```
src/
├─ app/                 layout(폰트·메타·테마 부트), page(2단 레이아웃), globals.css
├─ content/portfolio.ts 모든 텍스트·프로젝트·수상·발표 데이터 (여기만 고치면 됨)
├─ lib/
│  ├─ tape.ts           테이프 엔진 — 스크롤↔휠 각도, 재생, 관성, 레버 탐색, 트랙 감지
│  ├─ sound.ts          WebAudio 클릭·차임 (외부 음원 없음)
│  └─ useTape.ts        useSyncExternalStore 훅, 프레임 구독
└─ components/
   ├─ Recorder.tsx      기기 본체 (CSS만으로 그린 알루미늄 바디, 단위 u = 기기폭/853)
   ├─ Tracks.tsx        트랙(섹션) 라이너 노트
   ├─ TrackMenu.tsx     M 키 트랙리스트
   ├─ MiniDeck.tsx      모바일 하단 바
   └─ Waveform.tsx      트랙 id로 결정되는 파형, 재생 위치(--p)만큼 채워짐
```

- 매 프레임 값(각도·타임코드·레벨)은 React 렌더 없이 ref로 DOM에 직접 씁니다.
- `prefers-reduced-motion`이면 관성·트윈·등장 애니메이션을 끕니다.
- 에셋은 `public/assets/` — 자소서 Figma 파일과 각 프로젝트 저장소에서 가져왔습니다.

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Next.js 16.4 · React 19.3 · TypeScript · CSS Modules (외부 UI 라이브러리 없음)
