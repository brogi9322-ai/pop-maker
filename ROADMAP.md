# 🗺️ 프로젝트 로드맵

## 개요

- **프로젝트 목표**: 밴플러스 사용 약사들이 디자인 경험 없이 POP 광고물을 빠르게 제작·저장·출력할 수 있는 캔버스 에디터
- **배포**: Firebase Hosting (무료 플랜)
- **현재 진행 단계**: Phase 1 — 메인 에디터 완성

## 진행 상태 범례

- ✅ 완료
- 🔄 진행 중
- 📋 예정
- ⏸️ 보류

---

## 📊 프로젝트 현황 대시보드

| 항목 | 내용 |
|------|------|
| 전체 진행률 | 100% (Phase 1) |
| 현재 Phase | Phase 1 |
| 현재 Sprint | Sprint 8 ✅ 완료 |

---

## Phase 0: 프로젝트 초기 설정 ✅

- ✅ React 19 + Vite 8 프로젝트 세팅
- ✅ Firebase 연동 (Auth, Firestore)
- ✅ 캔버스 기본 에디터 구현
- ✅ 기본 컴포넌트 구조 (CanvasEditor, TemplatePanel, PropsPanel, Header)
- ✅ 기본 템플릿 저장/불러오기 (Firebase)
- ✅ Claude Code 에이전트 설정

---

## Phase 1: 메인 에디터 완성 🔄

> 실제 약사가 사용할 수 있는 수준의 편집 기능 완성

### Sprint 1: 기본 제공 템플릿 + 개발 프로세스 수립 ✅

- ✅ 사이트 기본 제공 디자인 템플릿 10개 (일반 5 + 약국 5)
- ✅ TemplatePanel 기본 디자인 / 배경 스타일 탭 분리
- ✅ 개발 지침 수립 (코드 리뷰, 브랜치 전략 등)
- ✅ 코드 리뷰 후 버그 4건 수정

### Sprint 2: 핵심 UX 기능 (P0) ✅

- ✅ Undo/Redo — 커스텀 히스토리 훅 + Ctrl+Z/Y 단축키
- ✅ 레이어 패널 — 드래그 재정렬, 잠금/숨기기, 이름 변경
- ✅ 3패널 레이아웃 개선 — 좌: 템플릿/레이어 탭 | 중: 캔버스 | 우: 속성 패널
- ✅ 캔버스 규격 프리셋 + 직접 입력

### Sprint 3: 내보내기 + Firebase Hosting 배포 (P0) ✅

- ✅ PNG 내보내기 최적화 (scale:2, 날짜 파일명)
- ✅ PDF 내보내기 품질 개선 (mm 단위 변환)
- ✅ Firebase Hosting 배포 설정 → https://pop-maker-9209f.web.app
- ✅ JSON 템플릿 내보내기/가져오기
- ✅ 인라인 텍스트 편집 (더블클릭)
- ✅ 캔버스 경계 클램핑, 사이즈 변경 시 비례 이동
- ✅ Ctrl+C/V 복사·붙여넣기, Delete/Backspace 삭제
- ✅ 에셋 패널 (약국 SVG 아이콘 23개)
- ✅ 토스트 UI + 디자인 시스템 (CSS 변수, 다크모드)

### Sprint 4: 반응형 모바일 지원 (P1) ✅

- ✅ 모바일 하단 탭 네비게이션 (패널 | 캔버스 | 속성)
- ✅ 사이드바 모바일 표시/숨김 (mobile-active 클래스)
- ✅ 터치 드래그 지원 (CanvasEditor 터치 이벤트)
- ✅ 태블릿 사이드바 너비 자동 축소 (769~1024px)
- ✅ Firebase Hosting 재배포

### Sprint 5: 공유 + UI 폴리싱 (P2) ✅

- ✅ 공개 템플릿 공유 (`isPublic` 플래그 + 공유 링크 `/share/:id`)
- ⬜ Firestore 보안 규칙 파일 업데이트 (다음 배포 시 반영)
- ⬜ 모바일 미리보기 (Sprint 7으로 이월)
- ✅ UI 폴리싱 — 온보딩 힌트 (빈 캔버스 진입 시 사용 가이드)
- ✅ UI 폴리싱 — 로딩 상태 개선 (저장/내보내기 중 시각적 피드백)
- ✅ UI 폴리싱 — 에러 메시지 구체화 (상황별 구체적 안내 메시지)

### Sprint 6: 테스트 커버리지 확대 + CI/CD 개선 ✅

- ✅ 단위 테스트 추가: `id.js` (genId 함수)
- ✅ 단위 테스트 추가: `storage.js` (순수 함수 + Firestore CRUD, Firebase 목킹)
- ✅ 컴포넌트 테스트 추가: `BanplusModal.jsx` (로그인 폼, 유효성 검사 연동)
- ✅ 컴포넌트 테스트 추가: `SavedTemplatesModal.jsx` (탭 전환, 공개 토글, 링크 복사)
- ✅ 컴포넌트 테스트 추가: `LayerPanel.jsx` (잠금/숨기기/이름 변경)
- ✅ CI 개선: 커버리지 리포트 artifact 업로드, 커버리지 임계값(lines 75%) 설정
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 → Sprint 7 이월

### Sprint 7: Playwright E2E 테스트 도입 — 배포 후 검증 자동화 ✅

- ✅ `@playwright/test` 의존성 추가 및 `playwright.config.js` 설정
- ✅ `e2e/smoke.spec.js` — 앱 접속, 기본 UI 렌더링 검증 (6개 테스트)
- ✅ `e2e/share.spec.js` — `/share/:id` 공개 페이지 접근 검증 (E2E_SHARE_ID 미설정 시 graceful skip)
- ✅ `e2e/mobile.spec.js` — 375px 모바일 레이아웃 검증 (4개 테스트, 가로 스크롤 테스트는 Sprint 8 이월)
- ✅ `.github/workflows/e2e.yml` — 배포 완료 후 E2E 자동 실행 CI workflow
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 → Sprint 8 이월

### Sprint 8: 테스트 커버리지 확대 및 CI/CD 자동화 ✅

- ✅ 단위 테스트 추가: `useAuth.js` (16개 케이스 — localStorage, login, logout)
- ✅ 단위 테스트 추가: `useEditor.js` (5개 케이스 — context 반환, 에러 throw)
- ✅ 컴포넌트 테스트 추가: `TemplatePanel.jsx` (9개 케이스 — 카테고리 필터, 선택 콜백)
- ✅ 컴포넌트 테스트 추가: `AssetPanel.jsx` (7개 케이스 — 탭 전환, 에셋 클릭)
- ✅ 컴포넌트 테스트 추가: `PropsPanel.jsx` (13개 케이스 — null 선택, 텍스트/이미지 UI)
- ✅ 컴포넌트 테스트 추가: `SharePage.jsx` (9개 케이스 — 로딩/에러/정상/숨김 처리)
- ✅ 통합 테스트 추가: `EditorContext.jsx` (28개 케이스 — 핸들러, 키보드 단축키)
- ✅ husky + lint-staged: pre-commit 시 eslint --fix 자동 실행
- ✅ `docs/ci-policy.md` 재작성: 실제 스택(Vite/Vitest/Firebase) 기준으로 정확히 기술
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 → Sprint 9 이월

---

## Phase 2: 안정화 & 확장 📋

- 📋 사용자 템플릿 갤러리 페이지
- 📋 이미지 에셋 라이브러리 (자주 쓰는 이미지 저장)
- 📋 인쇄 최적화 (실제 mm 단위 출력)
- 📋 밴플러스 서버 연동 (사업자번호 실인증)

---

## ⚠️ 리스크 및 완화 전략

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|----------|
| AI API 응답 지연/실패 | 중 | 재시도 버튼 + 캔버스 상태 유지 |
| 히스토리 메모리 과다 | 중 | 50단계 이상 자동 삭제 |
| Firebase 무료 플랜 쿼터 초과 | 낮 | 초기 사용자 규모에서는 미해당, 증가 시 Blaze 플랜 전환 |
| 내보내기 속도 (html2canvas) | 중 | `canvas.toDataURL()` 우선 사용 |
| 프론트엔드 Claude API 키 노출 | 높 | AI 기능 구현 시 프록시 서버(Firebase Functions) 경유 |

---

## 📈 마일스톤

| 마일스톤 | 상태 |
|---------|------|
| Phase 1 편집 기능 완성 | 🔄 진행 중 |
| MVP Firebase Hosting 배포 | ✅ 완료 (https://pop-maker-9209f.web.app) |
| AI 이미지 생성 기능 추가 | 📋 예정 |
| 밴플러스 서버 실인증 연동 | 📋 예정 |

---

## 🔮 향후 계획 (Backlog)

- 실시간 협업 편집 (Firestore realtime)
- 인쇄소 직접 연동 API
- 밴플러스 기존 이미지 에셋 서버 연동
