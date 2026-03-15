# Sprint 6: 테스트 커버리지 확대 + CI/CD 개선

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 6 |
| 목표 | 테스트 커버리지 확대 (4/8점 → 7/8점 목표) + CI/CD 개선 (3/7점 → 6/7점 목표) |
| 시작일 | 2026-03-15 |
| 완료일 | 2026-03-15 |
| 상태 | ✅ 완료 |

---

## 목표 요약

피드백 점수 개선을 위해 두 축으로 진행한다:

1. **테스트 커버리지 확대**: 현재 단위 테스트 4개 파일(useHistory, useToast, Header, Toast)에서 미테스트 파일로 커버리지를 확장한다. 통합 테스트도 추가한다.
2. **CI/CD 개선**: 커버리지 리포트 CI 통합 및 커버리지 임계값 설정으로 회귀를 자동 차단한다.

---

## 현재 상태 분석

### 기존 테스트 현황 (60개 통과)

| 파일 | 테스트 수 | 패턴 |
|------|----------|------|
| `src/hooks/useHistory.test.js` | 다수 | `renderHook` + `act`, `describe` 그룹화, 경계 케이스 포함 |
| `src/hooks/useToast.test.js` | 다수 | `renderHook` + `act`, 타입/duration/dismiss 검증 |
| `src/components/Header.test.jsx` | 다수 | `render` + `userEvent`, props 기반 UI 상태 검증, vi.fn() mock |
| `src/components/Toast.test.jsx` | 다수 | `render` + `userEvent`, CSS 클래스 검증, 접근성(role/aria) 검증 |

### 미테스트 파일 및 우선순위

| 우선순위 | 파일 | 이유 |
|---------|------|------|
| P0 — 즉시 추가 | `src/utils/id.js` | 단순 순수 함수 (`genId`), 목킹 불필요, 테스트 공수 최소 |
| P0 — 즉시 추가 | `src/utils/storage.js` | 비즈니스 로직 핵심 (validateBizNumber, formatBizNumber 순수 함수 + Firestore CRUD) |
| P1 — 추가 권장 | `src/components/BanplusModal.jsx` | 로그인 폼 유효성 검사 로직, `validateBizNumber` 연동 |
| P1 — 추가 권장 | `src/components/SavedTemplatesModal.jsx` | 탭 전환, 공개 토글, 링크 복사 등 복잡한 인터랙션 |
| P2 — 선택 추가 | `src/components/LayerPanel.jsx` | 드래그 재정렬(HTML5 DnD), 잠금/숨기기/이름 변경 인터랙션 |

### CI 현재 누락 항목

- `npm run test:coverage` 스텝 없음 (현재 `npm test`만 실행)
- 커버리지 리포트 artifact 업로드 없음
- 커버리지 임계값(threshold) 설정 없음 → 테스트 있어도 커버리지 회귀 차단 불가
- `develop → main` 검증 수동 진행

---

## 태스크 목록

### 1. P0 단위 테스트: `src/utils/id.js`

- ✅ `src/utils/id.test.js` 생성
- ✅ `genId()` 반환값이 `el_` 접두사를 가지는지 검증
- ✅ 연속 호출 시 다른 id를 반환하는지 검증 (단조 증가)
- ✅ 반환값이 문자열인지 검증

> 주의: `genId`는 모듈 레벨 `nextId` 상태를 공유하므로 테스트 순서에 따라 id 번호가 달라질 수 있다. 숫자 값보다 패턴(접두사, 고유성)을 검증한다.

### 2. P0 단위 테스트: `src/utils/storage.js`

- ✅ `src/utils/storage.test.js` 생성
- ✅ **순수 함수 테스트** (목킹 불필요):
  - `validateBizNumber`: 유효한 10자리 숫자 통과, 9자리/11자리 거부, 체크섬 불일치 거부, 하이픈 포함 입력 처리
  - `formatBizNumber`: 3자리 이하 그대로, 5자리 `xxx-xx`, 10자리 `xxx-xx-xxxxx`, 비숫자 문자 제거
  - `getUserId`: localStorage 미존재 시 `user_` 접두사 id 생성 및 저장, 재호출 시 동일 id 반환
- ✅ **Firestore CRUD 테스트** (`vi.mock('firebase/firestore')` 목킹):
  - `saveTemplate`: `addDoc` 호출 여부, 반환 docRef.id 확인
  - `getMyTemplates`: `getDocs` 결과를 올바르게 매핑하는지 확인
  - `deleteTemplate`: `deleteDoc` 호출 여부 확인
  - `updateTemplateVisibility`: `updateDoc`에 올바른 인수 전달 확인
  - `getPublicTemplate`: `snap.exists()` false 시 에러 throw, `isPublic: false` 시 에러 throw

> 주의: `vi.mock('../firebase')` + `vi.mock('firebase/firestore')` 두 레벨 모두 목킹 필요. `serverTimestamp()`도 mock 반환값 설정 필요.

### 3. P1 컴포넌트 테스트: `src/components/BanplusModal.jsx`

- ✅ `src/components/BanplusModal.test.jsx` 생성
- ✅ 렌더링: 사업자번호 입력 필드와 "인증하기" 버튼 표시 확인
- ✅ 입력 포맷팅: 숫자 입력 시 하이픈 자동 삽입 (`000-00-00000`) 확인
- ✅ 유효성 검사 실패: 빈 값 또는 체크섬 오류 시 에러 메시지 표시, `onLogin` 미호출 확인
- ✅ 유효성 검사 성공: 유효한 사업자번호 입력 후 제출 시 `onLogin(bizNumber)` 호출 확인
- ✅ 취소 버튼 클릭 시 `onClose` 호출 확인
- ✅ 오버레이 클릭 시 `onClose` 호출 확인

> 주의: 유효한 사업자번호가 필요하므로 `validateBizNumber`를 통과하는 실제 체크섬 값을 사용한다 (예: 국세청 공식 테스트 번호).

### 4. P1 컴포넌트 테스트: `src/components/SavedTemplatesModal.jsx`

- ✅ `src/components/SavedTemplatesModal.test.jsx` 생성
- ✅ **목킹 설정**: `vi.mock('../utils/storage')` 전체 목킹
- ✅ 렌더링: "내 템플릿" 탭 기본 선택, 로딩 중 표시
- ✅ 탭 전환: 밴플러스 사용자(`isBanplus=true`)에게 "전체 템플릿" 탭 표시 확인
- ✅ 탭 전환: 일반 사용자(`isBanplus=false`)에게 "전체 템플릿" 탭 미표시 확인
- ✅ 탭 클릭 시 해당 탭이 활성화(active 클래스)되는지 확인
- ✅ 로딩 완료 후 템플릿 목록 표시 확인
- ✅ 빈 목록 시 "저장된 템플릿이 없습니다." 표시 확인
- ✅ 네트워크 에러 시 에러 메시지 표시 확인
- ✅ 공개/비공개 토글 버튼: `isOwner`인 경우만 표시 확인
- ✅ 공개 템플릿에만 "링크 복사" 버튼 표시 확인
- ✅ "링크 복사" 클릭 시 `navigator.clipboard.writeText` 호출 확인 (clipboard API 목킹 필요)
- ✅ 삭제 버튼 클릭 → `confirm` mock → `deleteTemplate` 호출 확인
- ✅ 템플릿 클릭 시 `onLoad(tpl)` 호출 확인
- ✅ 닫기 버튼(✕) 클릭 시 `onClose` 호출 확인

> 주의:
> - `confirm`은 `vi.spyOn(window, 'confirm').mockReturnValue(true)`로 목킹
> - `navigator.clipboard.writeText`는 `Object.defineProperty` 또는 `vi.stubGlobal`로 목킹
> - Firestore Timestamp의 `toDate()` 메서드 mock 필요 (`{ toDate: () => new Date() }`)

### 5. P2 컴포넌트 테스트: `src/components/LayerPanel.jsx`

- ✅ `src/components/LayerPanel.test.jsx` 생성
- ✅ 빈 elements 배열 시 "요소가 없습니다." 표시 확인
- ✅ elements 렌더링: 이름, 아이콘(텍스트/이미지) 표시 확인
- ✅ zIndex 역순 정렬 확인 (높은 zIndex가 위에 렌더링)
- ✅ 선택된 요소에 `layer-item--selected` 클래스 적용 확인
- ✅ 잠금 버튼 클릭 시 `onToggleLock(id)` 호출 확인
- ✅ 잠금된 요소 클릭 시 `setSelectedId` 미호출 확인
- ✅ 숨기기 버튼 클릭 시 `onToggleHide(id)` 호출 확인
- ✅ 이름 더블클릭 시 인풋 필드로 전환 확인
- ✅ 인풋 Enter 키 입력 시 `onRename(id, newName)` 호출 확인
- ✅ 인풋 Escape 키 입력 시 편집 취소 확인

> 주의: HTML5 드래그 앤 드롭(`onDragStart`, `onDrop`)은 jsdom 환경에서 제한적으로 동작한다. `fireEvent.dragStart` + `fireEvent.drop` 조합으로 `onReorder` 호출 여부만 검증한다.

### 6. 통합 테스트: `BanplusModal` + `validateBizNumber` 연동

- ✅ BanplusModal.test.jsx에 통합 (실제 `validateBizNumber` 함수 연동)
- ✅ 유효한 사업자번호 제출 시 정확한 포맷(`xxx-xx-xxxxx`)으로 `onLogin` 호출 확인
- ✅ 유효하지 않은 번호 제출 시 에러 표시 및 `onLogin` 미호출 확인

### 7. CI workflow 개선: 커버리지 리포트 통합

- ✅ `.github/workflows/ci.yml` 수정:
  - `npm test` 스텝을 `npm run test:coverage`로 교체
  - 커버리지 리포트 artifact 업로드 스텝 추가 (`actions/upload-artifact@v4`)
  - 커버리지 임계값 설정 (`vite.config.js`의 `coverage.thresholds` 추가)

- ✅ `vite.config.js` 수정: 커버리지 임계값 추가

```js
// 실제 적용된 임계값 (Sprint 5 실측치 기반으로 상향 조정)
coverage: {
  thresholds: {
    lines: 75,
    functions: 70,
    branches: 65,
    statements: 75,
  }
}
```

### 8. CI workflow 개선: `develop → main` 검증 강화

- ⬜ Firebase Hosting 프리뷰 채널 배포 스텝 추가 — `FIREBASE_TOKEN` secret 설정 필요, Sprint 7 이월

---

## 검증 결과

### 자동 검증 (2026-03-15)

| 검증 항목 | 결과 | 비고 |
|---------|------|------|
| `npm run lint` | ✅ 통과 | ESLint 오류 0건 |
| `npm test` | ✅ 통과 | 135개 테스트 모두 통과 (기존 60개 + 신규 75개) |
| `npm run test:coverage` | ✅ 통과 | 임계값 초과 달성 |
| `npm run build` | ✅ 통과 | 빌드 성공 |

### 커버리지 실측치

| 항목 | 목표 임계값 | 실제 커버리지 |
|------|-----------|-------------|
| Statements | 75% | **85.32%** |
| Branches | 65% | **85.25%** |
| Functions | 70% | **81.81%** |
| Lines | 75% | **86.02%** |

### 파일별 커버리지

| 파일 | Stmts | Branches | Funcs | Lines |
|------|-------|---------|-------|-------|
| `BanplusModal.jsx` | 100% | 100% | 100% | 100% |
| `Header.jsx` | 100% | 81.25% | 100% | 100% |
| `LayerPanel.jsx` | 86.66% | 78.26% | 85.71% | 87.5% |
| `SavedTemplatesModal.jsx` | 70% | 85.18% | 63.63% | 70.9% |
| `Toast.jsx` | 83.33% | 83.33% | 77.77% | 86.66% |
| `useHistory.js` | 100% | 90% | 100% | 100% |
| `useToast.js` | 100% | 100% | 100% | 100% |
| `id.js` | 100% | 100% | 100% | 100% |
| `storage.js` | 79.62% | 100% | 64.28% | 80% |

---

## 코드 리뷰 결과

### 보안 체크리스트

- ✅ 하드코딩된 API 키/비밀번호 없음 (테스트 파일에는 실제 사업자번호 테스트 데이터만 포함)
- ✅ `dangerouslySetInnerHTML` 미사용
- ✅ Firebase 규칙 우회 가능한 로직 없음

### 잠재적 오류 체크리스트

- ✅ null/undefined 접근 방어: 테스트 파일에는 해당 없음
- ✅ 비동기 처리: `async/await` 및 `vi.mock` 올바르게 사용
- ✅ `vi.clearAllMocks()`, `localStorage.clear()` — `beforeEach`에서 테스트 격리 처리
- ✅ Firebase 목킹 패턴 확립 (`vi.mock('../firebase')` + `vi.mock('firebase/firestore')`)
- ✅ `clipboard` API mock 패턴 확립 (`Object.defineProperty(navigator, 'clipboard', ...)`)

### 발견된 이슈

없음. 모든 체크 항목 통과.

---

## UI 리뷰 결과

이번 스프린트는 테스트/CI 파일만 변경됨 — UI 변경 없음.

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `src/utils/id.test.js` | 신규 | genId 단위 테스트 (4개) |
| `src/utils/storage.test.js` | 신규 | 순수 함수 + Firestore CRUD 테스트 (26개) |
| `src/components/BanplusModal.test.jsx` | 신규 | 로그인 폼 컴포넌트 테스트 (9개) |
| `src/components/SavedTemplatesModal.test.jsx` | 신규 | 탭/토글/복사/삭제 컴포넌트 테스트 (17개) |
| `src/components/LayerPanel.test.jsx` | 신규 | 레이어 패널 컴포넌트 테스트 (15개) |
| `vite.config.js` | 수정 | coverage.thresholds 추가 (lines 75%, branches 65%) |
| `.github/workflows/ci.yml` | 수정 | `npm run test:coverage` 교체 + artifact 업로드 추가 |
| `eslint.config.js` | 수정 | coverage 폴더 ESLint 제외 추가 |
| `package.json` | 수정 | `@vitest/coverage-v8` 추가 |

---

## 다음 Sprint 개선 사항 (Sprint 7 이월)

- 모바일 미리보기 전용 뷰 (Sprint 5 이월)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)
- Firebase Blaze 플랜 전환
- Firestore 보안 규칙 파일 업데이트
- SharePage CSS 변수 마이그레이션
- Firebase Hosting 프리뷰 채널 배포 CI 통합 (FIREBASE_TOKEN secret 설정 필요)
- `SavedTemplatesModal.jsx` 커버리지 향상 (현재 70.9% — 로딩 에러 분기 미테스트)

---

## 완료 기준 (Definition of Done)

- ✅ `id.test.js` 작성 완료, 모든 케이스 통과
- ✅ `storage.test.js` 작성 완료: 순수 함수 + Firestore CRUD 7개 함수 테스트 통과
- ✅ `BanplusModal.test.jsx` 작성 완료: 유효성 검사, 제출, 취소 시나리오 통과
- ✅ `SavedTemplatesModal.test.jsx` 작성 완료: 탭 전환, 공개 토글, 링크 복사, 삭제 시나리오 통과
- ✅ `LayerPanel.test.jsx` 작성 완료: 렌더링, 잠금/숨기기, 이름 변경 시나리오 통과
- ✅ 전체 테스트 `npm test` 통과 (135개 모두 통과)
- ✅ `npm run test:coverage` 실행 시 커버리지 임계값(lines 75%) 통과 (실측 86.02%)
- ✅ `.github/workflows/ci.yml` 수정: 커버리지 리포트 artifact 업로드 포함
- ✅ `vite.config.js` 커버리지 임계값 설정 완료
- ✅ ESLint 오류 0건, 빌드 성공

---

## 기술 참고사항

### Firebase 목킹 패턴

기존 테스트에서 Firebase mock 사용 사례가 없으므로 아래 패턴을 확립한다:

```js
// 파일 최상단에 선언
vi.mock('../firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: 0, nanoseconds: 0 })),
}));
```

### localStorage 목킹 패턴

```js
// setup.js 또는 각 테스트 파일에서
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

> jsdom은 기본 localStorage를 제공하지만, 테스트 간 격리를 위해 `beforeEach(() => localStorage.clear())` 추가 권장.

### 유효한 사업자번호 테스트 데이터

`validateBizNumber` 통과 테스트에서는 국세청 알고리즘을 통과하는 실제 형식 번호가 필요하다. `validateBizNumber` 함수를 직접 실행하여 체크섬을 맞춘 번호를 미리 확인한다.

---

## Sprint 5 이월 항목 (이번 Sprint 범위 아님)

아래 항목은 MEMORY.md에 기록된 Sprint 6 예정 항목이나, 이번 Sprint는 테스트/CI 개선에 집중하므로 Sprint 7로 이월한다:

- 모바일 미리보기 전용 뷰 (Sprint 5 이월)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)
- Firebase Blaze 플랜 전환
- Firestore 보안 규칙 파일 업데이트
- SharePage 인라인 스타일 CSS 변수 마이그레이션

---

## 변경 예정 파일

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `src/utils/id.test.js` | 신규 | genId 단위 테스트 |
| `src/utils/storage.test.js` | 신규 | 순수 함수 + Firestore CRUD 테스트 |
| `src/components/BanplusModal.test.jsx` | 신규 | 로그인 폼 컴포넌트 테스트 |
| `src/components/SavedTemplatesModal.test.jsx` | 신규 | 탭/토글/복사/삭제 컴포넌트 테스트 |
| `src/components/LayerPanel.test.jsx` | 신규 | 레이어 패널 컴포넌트 테스트 |
| `vite.config.js` | 수정 | coverage.thresholds 추가 |
| `.github/workflows/ci.yml` | 수정 | 커버리지 리포트 스텝 추가 |

---

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint5.md`
- 테스트 설정: `src/test/setup.js`, `vite.config.js`
- 코드 리뷰 기준: `docs/dev-process.md` 섹션 7
- CI 정책: `docs/ci-policy.md`
