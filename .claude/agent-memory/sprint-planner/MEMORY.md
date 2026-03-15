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
- **AI**: Anthropic Claude API (예정, Functions 프록시 경유)

## 스프린트 현황

| 스프린트 | 목표 | 상태 | 완료일 |
|---------|------|------|--------|
| Sprint 1 | 기본 제공 템플릿 10종 + 개발 프로세스 수립 | ✅ 완료 | 2026-03-15 이전 |
| Sprint 2 | Undo/Redo, 레이어 패널, 탭 전환, 캔버스 직접 입력 | ✅ 완료 | 2026-03-15 |
| Sprint 3 | 내보내기 최적화 + Firebase Hosting 배포 | ✅ 완료 | 2026-03-15 |
| Sprint 4 | AI 이미지 생성 (Claude API + Functions) | ✅ 완료 | 2026-03-15 |
| Sprint 5 | 공유 + UI 폴리싱 | ✅ 완료 | 2026-03-15 |
| Sprint 6 | 테스트 커버리지 확대 + CI/CD 개선 | ✅ 완료 | 2026-03-15 |
| Sprint 7 | Playwright E2E 테스트 도입 — 배포 후 검증 자동화 | 🔄 진행 중 | — |

**다음 스프린트 번호: 8**

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
- Claude API 키는 Functions 프록시 경유 필수 (클라이언트 직접 노출 금지)

## 반복 주의사항

- `useEffect` 내 `setState` 직접 호출 → lint 오류 발생 (Sprint 2 수정 사례)
- `useCallback` 의존성 배열 누락 → exhaustive-deps 경고 발생
- Firestore 문서에 base64 이미지 직접 저장 금지 (1MB 제한) → Storage URL 참조

## Sprint 5 완료 요약 (2026-03-15)

- ✅ 공개 템플릿 공유 (`isPublic` + `/share/:id` 읽기 전용 미리보기)
- ✅ 온보딩 힌트 (localStorage `onboardingDone` 저장)
- ✅ 로딩 상태 개선 (savingOp 상태 + 전체화면 오버레이)
- ✅ 에러 메시지 구체화 (`getErrorMessage` 함수, EditorContext)
- ✅ EditorContext 분리 (`src/context/EditorContext.jsx`)
- ⬜ Firestore 보안 규칙 파일 업데이트 — 다음 배포 시 반영 필요
- ⬜ 모바일 미리보기 전용 뷰 — Sprint 6으로 이월

PR: https://github.com/brogi9322-ai/pop-maker/pull/9

## Sprint 6 완료 요약 (2026-03-15)

- ✅ 신규 테스트 5개 파일 추가 (135개 테스트 전체 통과)
  - `src/utils/id.test.js`, `src/utils/storage.test.js`
  - `src/components/BanplusModal.test.jsx`, `src/components/SavedTemplatesModal.test.jsx`
  - `src/components/LayerPanel.test.jsx`
- ✅ `@vitest/coverage-v8` 패키지 추가
- ✅ `vite.config.js` 커버리지 임계값 추가 (lines 75%, branches 65%)
- ✅ `.github/workflows/ci.yml`: `npm run test:coverage` + artifact 업로드
- ✅ `eslint.config.js`: `coverage/` 폴더 제외
- ✅ 테스트 커버리지 실측: lines 86.02%, branches 85.25%, funcs 81.81%
- ✅ Firebase 목킹 패턴 확립 (`vi.mock('../firebase')` + `vi.mock('firebase/firestore')`)
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 → Sprint 7 이월

## Sprint 7 계획 요약 (2026-03-15)

### 목표: Playwright E2E 테스트 도입 — 배포 후 수동 검증 완전 자동화

### 주요 산출물

| 파일 | 내용 |
|------|------|
| `playwright.config.js` | baseURL(https://pop-maker-9209f.web.app), chromium + mobile-chrome 프로젝트, retries:2 |
| `e2e/smoke.spec.js` | 앱 접속 및 기본 UI 렌더링 검증 |
| `e2e/share.spec.js` | `/share/:id` 공개 페이지 접근 검증, `E2E_SHARE_ID` 미설정 시 graceful skip |
| `e2e/mobile.spec.js` | 375px 모바일 레이아웃 검증 (하단 탭, 패널 전환) |
| `.github/workflows/e2e.yml` | `master` push + `workflow_dispatch` 트리거, artifact 업로드 |

### E2E 테스트 범위 제한

- Firebase 인증 필요한 캔버스 편집/저장 흐름은 초기 범위 제외
- 모바일 터치 드래그 실제 동작 검증 제외 (Playwright 제한)
- 레이아웃 렌더링 검증에 집중

### Sprint 8 예정 (이번 Sprint 범위 아님)

- 모바일 미리보기 전용 뷰 (Sprint 5 이월)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)
- Firebase Blaze 플랜 전환
- Firestore 보안 규칙 파일 업데이트
- SharePage CSS 변수 마이그레이션
- Firebase 인증 기반 E2E 테스트 (캔버스 편집/저장 흐름)
