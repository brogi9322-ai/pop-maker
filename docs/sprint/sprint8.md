# Sprint 8: 테스트 커버리지 확대 및 CI/CD 자동화

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 8 |
| 목표 | 핵심 훅·컴포넌트·컨텍스트 테스트 추가로 커버리지 80%+ 안정화, pre-commit 자동화 구축 |
| 시작일 | 2026-03-16 |
| 완료일 | 2026-03-16 |
| 상태 | ✅ 완료 |

---

## 목표 요약

Sprint 6(단위/컴포넌트 테스트 기반 구축)과 Sprint 7(Playwright E2E 도입)에 이어, 테스트가 없던 핵심 7개 파일(`useAuth`, `useEditor`, `EditorContext`, `PropsPanel`, `TemplatePanel`, `AssetPanel`, `SharePage`)에 대해 Vitest 테스트를 추가한다.

동시에 `husky + lint-staged`를 통해 커밋 전 ESLint 자동 수정 워크플로를 구축하고, 프로젝트 실제 스택과 맞지 않던 `docs/ci-policy.md`를 재작성한다.

---

## 현재 상태 분석

### 기존 테스트 현황 (Sprint 6·7 완료 시점, 135개)

| 파일 | 테스트 수 | 비고 |
|------|----------|------|
| `src/hooks/useHistory.test.js` | 다수 | 완성도 높음 |
| `src/hooks/useToast.test.js` | 다수 | 완성도 높음 |
| `src/components/Header.test.jsx` | 다수 | 완성도 높음 |
| `src/components/Toast.test.jsx` | 다수 | 완성도 높음 |
| `src/utils/id.test.js` | 4 | Sprint 6 추가 |
| `src/utils/storage.test.js` | 26 | Sprint 6 추가 |
| `src/components/BanplusModal.test.jsx` | 9 | Sprint 6 추가 |
| `src/components/SavedTemplatesModal.test.jsx` | 17 | Sprint 6 추가 |
| `src/components/LayerPanel.test.jsx` | 15 | Sprint 6 추가 |

### 미테스트 핵심 파일

| 파일 | 누락 이유 | 우선순위 |
|------|----------|---------|
| `src/hooks/useAuth.js` | Sprint 6 범위 초과로 이월 | P0 |
| `src/hooks/useEditor.js` | Sprint 6 범위 초과로 이월 | P0 |
| `src/context/EditorContext.jsx` | 복잡도 높음, 패턴 확립 후 진행 예정 | P0 |
| `src/components/TemplatePanel.jsx` | 미루어짐 | P1 |
| `src/components/AssetPanel.jsx` | 미루어짐 | P1 |
| `src/components/PropsPanel.jsx` | 미루어짐 | P1 |
| `src/components/SharePage.jsx` | 비동기 + 라우터 mock 필요로 이월 | P1 |

### CI/CD 현재 누락 항목

- `docs/ci-policy.md` Docker/pytest/Lightsail 내용 → 실제 스택과 완전 불일치
- pre-commit hook 미설정 → lint 미수정 상태로 커밋 가능
- `coverage.exclude`에 테스트된 파일이 여전히 제외 목록에 포함됨

---

## 태스크 목록

### 1. P0: useAuth.js 단위 테스트

**파일**: `src/hooks/useAuth.test.js`

- ✅ 초기 상태 — localStorage 비어있을 때 `isBanplus: false`, `bizNumber: null`
- ✅ 초기 상태 — localStorage에 값이 있을 때 `isBanplus: true`, `bizNumber` 복원
- ✅ `login()` — 유효한 사업자번호 입력 시 `isBanplus: true`, localStorage 저장
- ✅ `login()` — 하이픈 포함 입력(`123-45-67890`)을 제거 후 검증 (숫자만 추출)
- ✅ `login()` — 유효하지 않은 번호 입력 시 `false` 반환, 상태 변경 없음
- ✅ `logout()` — `isBanplus: false` 설정, `bizNumber: null` 설정, localStorage 항목 삭제

> 기술: `renderHook`, jsdom localStorage. Firebase mock 불필요 (로컬 상태만 사용).

### 2. P0: useEditor.js 단위 테스트

**파일**: `src/hooks/useEditor.test.js`

- ✅ `EditorProvider` 외부에서 `useEditor()` 호출 시 에러 throw
- ✅ `EditorProvider` 내부에서 `useEditor()` 호출 시 context 객체 반환
- ✅ 반환된 context에 핵심 속성(`elements`, `selectedId`, `template`) 존재 확인
- ✅ 반환된 context에 핵심 핸들러(`addText`, `handleDelete`) 존재 확인

> 기술: `renderHook` + `wrapper: EditorProvider`. Firebase, html2canvas mock 필요.

### 3. P1: TemplatePanel.jsx 컴포넌트 테스트

**파일**: `src/components/TemplatePanel.test.jsx`

- ✅ 초기 렌더링 시 "전체" 탭이 선택된 상태로 모든 템플릿 표시
- ✅ 카테고리 탭 클릭 시 해당 카테고리의 템플릿만 필터링 표시
- ✅ 템플릿 클릭 시 `onSelect(template)` 콜백 호출
- ✅ 탭 전환 후 템플릿 클릭 시 해당 템플릿의 `onSelect` 호출

> 기술: `render` + `userEvent`, 실제 TEMPLATES 데이터 사용 (mock 불필요).

### 4. P1: AssetPanel.jsx 컴포넌트 테스트

**파일**: `src/components/AssetPanel.test.jsx`

- ✅ 초기 렌더링 시 첫 번째 카테고리 탭 활성화 및 해당 에셋 표시
- ✅ 카테고리 탭 클릭 시 해당 카테고리 에셋으로 전환
- ✅ 에셋 클릭 시 `onAddAsset(asset)` 콜백 호출
- ✅ `onAddAsset` 콜백에 올바른 에셋 객체(name, src) 전달 확인

> 기술: `render` + `userEvent`, 실제 ASSETS 데이터 사용.

### 5. P1: PropsPanel.jsx 컴포넌트 테스트

**파일**: `src/components/PropsPanel.test.jsx`

- ✅ `selected=null` 시 "요소를 선택하세요" 안내 메시지 표시
- ✅ 텍스트 요소 선택 시 텍스트 전용 속성(폰트, 크기, 색상) UI 렌더링
- ✅ 이미지 요소 선택 시 이미지 전용 속성(불투명도) UI 렌더링
- ✅ 삭제 버튼 클릭 시 `onDelete()` 콜백 호출
- ✅ 복제 버튼 클릭 시 `onDuplicate()` 콜백 호출
- ✅ 속성 변경 시 `onChange(updatedEl)` 콜백 호출

> 기술: `render` + `userEvent`, props로 `vi.fn()` 전달.

### 6. P1: SharePage.jsx 컴포넌트 테스트

**파일**: `src/components/SharePage.test.jsx`

- ✅ 로딩 상태 렌더링 확인 (데이터 fetch 중 로딩 UI)
- ✅ 에러 상태 렌더링 확인 (존재하지 않는 ID, 비공개 템플릿)
- ✅ 정상 상태에서 텍스트 요소 렌더링 확인
- ✅ 정상 상태에서 이미지 요소 렌더링 확인
- ✅ `hidden: true` 요소가 렌더링에서 제외되는지 확인

> 기술: `vi.mock('../utils/storage')`, `vi.mock('react-router-dom')` useParams mock, `waitFor`/`findByText` 비동기 검증.

### 7. P0: EditorContext.jsx 통합 테스트

**파일**: `src/context/EditorContext.test.jsx`

핵심 핸들러 중심의 통합 테스트:

- ✅ `handleSelectTemplate` — 템플릿 선택 시 elements 초기화, template 설정
- ✅ `addText` — 텍스트 요소 추가 및 selectedId 설정
- ✅ `handleAddAsset` — 에셋 요소 추가 및 selectedId 설정
- ✅ `handleChangeElement` — 요소 속성 변경 반영
- ✅ `handleDelete` — 선택된 요소 삭제, selectedId null
- ✅ `handleDuplicate` — 요소 복제 및 위치 오프셋 적용
- ✅ `handleBringFront` / `handleSendBack` — zIndex 증감
- ✅ `handleLayerReorder` — 두 요소의 zIndex 교환
- ✅ `handleToggleLock` / `handleToggleHide` — locked/hidden 토글
- ✅ `handleApplyCustomSize` — 유효한 크기 적용, 100 미만/2000 초과 시 toast.warning
- ✅ 키보드 단축키 `Ctrl+Z` — undo 동작
- ✅ 키보드 단축키 `Ctrl+Y` — redo 동작
- ✅ 키보드 단축키 `Delete` — 선택된 요소 삭제

> 기술: `renderHook` + `wrapper: EditorProvider`, `vi.mock(firebase)`, `vi.mock(storage)`, `vi.mock(html2canvas)`.

### 8. coverage 제외 목록 업데이트

**파일**: `vite.config.js`

- ✅ `coverage.exclude`에서 새로 테스트된 6개 파일 제거
  - `src/hooks/useAuth.js`
  - `src/hooks/useEditor.js`
  - `src/components/TemplatePanel.jsx`
  - `src/components/AssetPanel.jsx`
  - `src/components/PropsPanel.jsx`
  - `src/components/SharePage.jsx`
  - `src/context/EditorContext.jsx`
- ✅ `src/components/CanvasEditor.jsx` 제외 유지 (DOM 이벤트·드래그 복잡도로 jsdom 환경에서 테스트 어려움)
- ✅ 임계값 확인: Lines 75%, Functions 70%, Branches 65%, Statements 75%

### 9. ci-policy.md 재작성

**파일**: `docs/ci-policy.md`

- ✅ Docker/pytest/Lightsail 내용 전부 제거
- ✅ 실제 스택(Git 브랜치 전략, ci.yml/e2e.yml, Firebase Hosting, 커버리지 임계값) 기준 재작성

### 10. husky + lint-staged 설정

**파일**: `package.json`, `.husky/pre-commit`

- ✅ `npm install --save-dev husky lint-staged`
- ✅ `npx husky init` — `.husky/pre-commit` 생성
- ✅ pre-commit hook: `eslint --fix` 자동 실행 (prettier는 미설치이므로 제외)
- ✅ `package.json`에 lint-staged 설정 추가 (`*.{js,jsx}` 대상)

---

## 기술적 접근 방법

### EditorProvider wrapper 패턴

`useEditor`와 `EditorContext`를 테스트할 때, `EditorProvider`를 `wrapper`로 주입해야 한다. Firebase, html2canvas 등 외부 의존성은 모두 `vi.mock()`으로 격리한다.

```js
// EditorProvider wrapper 패턴
const wrapper = ({ children }) => <EditorProvider>{children}</EditorProvider>;
const { result } = renderHook(() => useEditor(), { wrapper });
```

### matchMedia mock

`EditorProvider`는 다크모드 초기화를 위해 `window.matchMedia`를 사용한다. jsdom은 이를 지원하지 않으므로 `src/test/setup.js`에 mock을 추가했다:

```js
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 | 결과 |
|--------|--------|---------|------|
| EditorContext 테스트 시 matchMedia 오류 | 높 | setup.js에 mock 추가 | ✅ 해결 |
| EditorContext 핸들러 클로저 stale 문제 | 중 | 각 act() 내에서 최신 result.current 참조 | ✅ 해결 |
| Firebase mock 중복 설정 | 낮 | 각 파일 독립성 유지 (공통화는 다음 Sprint) | ✅ 허용 |
| husky 설치 후 기존 커밋 플로우 변화 | 낮 | lint-staged가 staged 파일만 처리하므로 영향 최소화 | ✅ 문제 없음 |

---

## 완료 기준 (Definition of Done)

- ✅ `useAuth.test.js` 작성 완료: 16개 케이스 통과
- ✅ `useEditor.test.js` 작성 완료: 5개 케이스 통과
- ✅ `TemplatePanel.test.jsx` 작성 완료: 9개 케이스 통과
- ✅ `AssetPanel.test.jsx` 작성 완료: 7개 케이스 통과
- ✅ `PropsPanel.test.jsx` 작성 완료: 13개 케이스 통과
- ✅ `SharePage.test.jsx` 작성 완료: 9개 케이스 통과
- ✅ `EditorContext.test.jsx` 작성 완료: 28개 케이스 통과
- ✅ 전체 테스트 222개 통과 (기존 135개 + 신규 87개)
- ✅ `npm run test:coverage` 커버리지 임계값 전 항목 초과
- ✅ husky pre-commit 훅: 커밋 전 eslint --fix 자동 실행
- ✅ `docs/ci-policy.md` 실제 기술 스택 기준으로 재작성
- ✅ `npm run lint` 오류 0건, `npm run build` 성공
- ⬜ Firebase Hosting 프리뷰 채널 CI 통합 — Sprint 9 이월

---

## 검증 결과

### 자동 검증 (2026-03-16)

| 검증 항목 | 결과 | 비고 |
|---------|------|------|
| `npm run lint` | ✅ 통과 | ESLint 오류 0건 |
| `npm test` | ✅ 통과 | 222개 테스트 모두 통과 (16개 파일) |
| `npm run test:coverage` | ✅ 통과 | 임계값 전 항목 초과 |
| `npm run build` | ✅ 통과 | 빌드 성공 |

### 커버리지 실측치

| 항목 | 목표 임계값 | 실제 커버리지 |
|------|-----------|-------------|
| Lines | 75% | **81.44%** |
| Functions | 70% | **75.51%** |
| Branches | 65% | **80.57%** |
| Statements | 75% | **81.58%** |

---

## 코드 리뷰 결과

### 검토 항목 (Critical) — 이슈 없음

- 하드코딩된 API 키/토큰 없음 — 모든 Firebase 의존성은 `vi.mock()`으로 처리됨
- `dangerouslySetInnerHTML` 미사용
- null/undefined 방어 코드 적절히 적용됨 (테스트 팩토리 함수에서 기본값 제공)
- 모든 Firebase mock이 올바르게 분리되어 실제 Firestore/Storage 호출 없음
- `async/await` 누락 없음 (`waitFor` 패턴 적절히 사용)

### 다음 Sprint 개선 사항

- 🟡 Firebase mock 설정(`vi.mock('../firebase')`, `vi.mock('firebase/firestore')`)이 여러 테스트 파일에 중복됨 — `src/test/firebase-mocks.js` 공통 헬퍼로 추출 검토
- 🟡 `EditorContext.test.jsx`의 `handleSaveTemplate` / `handleSavePng` 통합 테스트 미포함 — html2canvas mock 환경에서 추가 가능
- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 (Sprint 7~8에서 이월됨) — Sprint 9 대상

---

## UI 리뷰 결과

이번 스프린트는 테스트 파일, 설정 파일, 문서 파일만 변경되었으며 JSX/CSS 파일 직접 수정 없음.
기존 컴포넌트(SharePage, TemplatePanel, AssetPanel, PropsPanel)에 대한 테스트를 추가하는 과정에서 렌더링 결과를 검증함으로써 간접적으로 UI 동작 확인 완료.

### 확인 항목

- SharePage: 로딩/에러/정상 상태가 각각 올바른 UI를 렌더링함
- TemplatePanel: 카테고리 탭 active 클래스 전환이 정상 동작
- AssetPanel: 카테고리 탭 전환 및 에셋 클릭 콜백 정상 동작
- PropsPanel: null 선택 시 안내 메시지, 텍스트/이미지 전용 UI 분기 정상 동작
- 숨김 요소(`hidden: true`)가 SharePage에서 렌더링되지 않음을 테스트로 검증

---

## 변경 파일

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `src/hooks/useAuth.test.js` | 신규 | useAuth 훅 단위 테스트 (16개 케이스) |
| `src/hooks/useEditor.test.js` | 신규 | useEditor 훅 단위 테스트 (5개 케이스) |
| `src/components/TemplatePanel.test.jsx` | 신규 | TemplatePanel 컴포넌트 테스트 (9개 케이스) |
| `src/components/AssetPanel.test.jsx` | 신규 | AssetPanel 컴포넌트 테스트 (7개 케이스) |
| `src/components/PropsPanel.test.jsx` | 신규 | PropsPanel 컴포넌트 테스트 (13개 케이스) |
| `src/components/SharePage.test.jsx` | 신규 | SharePage 컴포넌트 테스트 (9개 케이스) |
| `src/context/EditorContext.test.jsx` | 신규 | EditorContext 통합 테스트 (28개 케이스) |
| `src/test/setup.js` | 수정 | `window.matchMedia` jsdom mock 추가 |
| `vite.config.js` | 수정 | coverage.exclude 목록에서 테스트 완료 파일 제거 |
| `package.json` | 수정 | husky, lint-staged 의존성 추가 및 lint-staged 설정 추가 |
| `.husky/pre-commit` | 신규 | pre-commit 훅: npx lint-staged 실행 |
| `docs/ci-policy.md` | 재작성 | Docker/pytest 내용 제거, 실제 스택 기준 재작성 |

---

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint7.md`
- 테스트 설정: `src/test/setup.js`, `vite.config.js`
- 코드 리뷰 기준: `docs/dev-process.md`
- CI 정책: `docs/ci-policy.md`
- 배포 이력: `deploy.md` 및 `docs/deploy-history/` 참조
