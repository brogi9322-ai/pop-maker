# Sprint Planner 메모리

이 파일은 sprint-planner 에이전트의 영구 메모리입니다.
프로젝트 진행 상황, 기술 스택, 패턴 등을 기록합니다.

---

## 프로젝트 기본 정보

- **프로젝트명**: POP 제작기 (pop-maker)
- **목적**: 밴플러스 사용 약사들이 POP 광고물을 디자인 경험 없이 빠르게 만들어 출력
- **저장소**: https://github.com/brogi9322-ai/pop-maker.git
- **배포**: Firebase Hosting (Spark 무료 플랜)

## 기술 스택

- **프론트엔드**: React 19 + Vite 8
- **데이터베이스**: Firebase Firestore
- **파일 저장소**: Firebase Storage
- **인증**: Firebase Auth (관리자) + 사업자번호+ID (사용자, 추후 Auth 전환 예정)
- **서버 로직**: Firebase Functions (Node.js) — Blaze 플랜 필요
- **내보내기**: html2canvas + jsPDF
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`, 브라우저 직접 호출, Sprint 9~)

## 스프린트 현황

| 스프린트 | 목표 | 상태 | 완료일 |
|---------|------|------|--------|
| Sprint 1 | 기본 제공 템플릿 10종 + 개발 프로세스 수립 | ✅ 완료 | 2026-03-15 이전 |
| Sprint 2 | Undo/Redo, 레이어 패널, 탭 전환, 캔버스 직접 입력 | ✅ 완료 | 2026-03-15 |
| Sprint 3 | 내보내기 최적화 + Firebase Hosting 배포 | ✅ 완료 | 2026-03-15 |
| Sprint 4 | 반응형 모바일 지원 | ✅ 완료 | 2026-03-15 |
| Sprint 5 | 공유 + UI 폴리싱 | ✅ 완료 | 2026-03-15 |
| Sprint 6 | 테스트 커버리지 확대 + CI/CD 개선 | ✅ 완료 | 2026-03-15 |
| Sprint 7 | Playwright E2E 테스트 도입 — 배포 후 검증 자동화 | ✅ 완료 | 2026-03-15 |
| Sprint 8 | 테스트 커버리지 확대 및 CI/CD 자동화 | ✅ 완료 | 2026-03-16 |

| Sprint 9 | Claude AI를 이용한 SVG 에셋 생성 | ✅ 완료 | 2026-03-16 |

**다음 스프린트 번호: 10**

## 브랜치 전략

- `sprint{n}` → `develop` PR → QA → `main` 배포
- `develop` → `main` merge는 deploy-prod agent 사용
- worktree 사용 금지

## 주요 아키텍처 결정

- 캔버스는 Fabric.js 대신 **커스텀 HTML/CSS 렌더러** 사용 (직접 구현)
- Undo/Redo는 `useHistory` 커스텀 훅으로 구현 (최대 50단계)
  - `pushSnapshot`: 이산 액션용
  - `startDrag` + `commitDrag`: 드래그/리사이즈 완료 시 히스토리 기록
- elements에 `locked`, `hidden`, `name` 속성 추가됨 (Sprint 2~)
- Firebase Functions는 Spark 무료 플랜 미지원 → Blaze 전환 필요 (관리자 API 구현 시)
- **Claude API 직접 호출 (Sprint 9)**: Spark 플랜 유지를 위해 Firebase Functions 프록시 없이 브라우저에서 직접 호출. `dangerouslyAllowBrowser: true` 옵션 사용. 키 노출 리스크 인지하며 의도적 결정. (향후 Blaze 전환 시 Functions 프록시로 마이그레이션 예정)

## 반복 주의사항

- `useEffect` 내 `setState` 직접 호출 → lint 오류 발생 (Sprint 2 수정 사례)
- `useCallback` 의존성 배열 누락 → exhaustive-deps 경고 발생
- Firestore 문서에 base64 이미지 직접 저장 금지 (1MB 제한) → Storage URL 참조
- Playwright E2E 파일(`e2e/*.spec.js`)은 Vitest가 수집하면 오류 발생 → `vite.config.js`의 `test.exclude`에 `e2e/**` 패턴 추가 필수 (Sprint 7 수정 사례)
- Playwright 및 Node.js 환경 파일은 ESLint의 browser globals 설정과 충돌 → `eslint.config.js`의 `globalIgnores`에 `e2e/`, `playwright.config.js` 추가 필수 (Sprint 7 수정 사례)
- `renderHook`에서 여러 번 `addText()` 등 elements 클로저를 사용하는 함수를 연속 호출할 때 stale closure 문제 발생 → 각 호출을 별도 `act()` 블록으로 분리해야 함 (Sprint 8 테스트 작성 사례)
- `window.matchMedia`는 jsdom에서 미구현 → `src/test/setup.js`에 목 추가 필수 (Sprint 8 발견)
- DOMPurify SVG sanitize 시 `USE_PROFILES: { svg: true, svgFilters: true }` 옵션 필수 — 없으면 SVG 속성이 제거됨 (Sprint 9 계획 시 파악)
- `vi.mock('@anthropic-ai/sdk')`에서 `vi.fn().mockImplementation()`은 constructor로 사용 불가 → `class MockAnthropic { constructor() {...} }` 패턴으로 목킹해야 함 (Sprint 9 테스트 작성 사례)
- Anthropic SDK는 `dangerouslyAllowBrowser: true` 없이 브라우저에서 사용 시 에러 발생 — 이유 주석 필수

## Sprint 9 완료 요약 (2026-03-16)

- ✅ `@anthropic-ai/sdk` 설치, `src/utils/claudeSvg.js` 신규 생성 (API 호출 + DOMPurify sanitize + base64 URL)
- ✅ `src/hooks/useAiAssets.js` 신규 생성 (localStorage 영속, 최대 50개)
- ✅ `AssetPanel.jsx` "AI 생성" 탭 UI 추가
- ✅ `EditorContext.jsx` handleGenerateAsset / handleRemoveAiAsset 추가
- ✅ 테스트 257개 통과 (신규 33개: claudeSvg 9, useAiAssets 13, AssetPanel AI 11)
- ✅ `.env.example`, `docs/prd.md`, `docs/setup-guide.md`, `CLAUDE.md` 업데이트
- ⬜ Firebase Hosting 프리뷰 채널 CI 통합 → Sprint 10 이월

PR: https://github.com/brogi9322-ai/pop-maker/pull/18

## Sprint 9 계획 요약 (2026-03-16 수립)

**목표**: Claude AI로 텍스트 → SVG 에셋 생성, AssetPanel "AI 생성" 탭에 추가

**신규 파일**:
- `src/utils/claudeSvg.js` — API 호출 + SVG 추출 + sanitize + data URL 변환
- `src/hooks/useAiAssets.js` — AI 에셋 상태 관리 (localStorage 영속)
- `src/utils/claudeSvg.test.js`, `src/hooks/useAiAssets.test.js` — 테스트

**수정 파일**:
- `src/components/AssetPanel.jsx` — "AI 생성" 탭 UI 추가
- `.env.example` — `VITE_CLAUDE_API_KEY` 추가
- `docs/prd.md` — 섹션 6.6 클라이언트 직접 호출 결정 반영
- `vite.config.js` — coverage.exclude 업데이트

**이월 항목**: Firebase Hosting 프리뷰 채널 CI 통합 (Sprint 7~9 이월)

## Sprint 8 완료 요약 (2026-03-16)

- ✅ Vitest 신규 테스트 7개 파일, 87개 케이스 추가 (전체 222개 테스트 통과)
  - `src/hooks/useAuth.test.js` (16개), `src/hooks/useEditor.test.js` (5개)
  - `src/components/TemplatePanel.test.jsx` (9개), `src/components/AssetPanel.test.jsx` (7개)
  - `src/components/PropsPanel.test.jsx` (13개), `src/components/SharePage.test.jsx` (9개)
  - `src/context/EditorContext.test.jsx` (28개)
- ✅ `src/test/setup.js`: `window.matchMedia` jsdom 목 추가
- ✅ `vite.config.js`: coverage.exclude에서 테스트 완료 파일 제거
- ✅ husky + lint-staged 설치: pre-commit 시 `eslint --fix` 자동 실행
- ✅ `docs/ci-policy.md`: 실제 스택(Vite/Vitest/Firebase) 기준으로 재작성
- 커버리지 결과: Lines 81.44%, Functions 75.51%, Branches 80.57%, Statements 81.58%
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 → Sprint 9 이월

PR: https://github.com/brogi9322-ai/pop-maker/pull/15
