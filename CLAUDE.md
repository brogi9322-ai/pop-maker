# pop-maker (POP 제작기)

밴플러스 사용 약사들이 디자인 경험 없이 POP(Point of Purchase) 광고물을 빠르게 제작·저장·출력할 수 있는 캔버스 에디터 웹 앱.

## 저장소

- **원격 저장소**: https://github.com/brogi9322-ai/pop-maker.git

## 기술 스택

- **프레임워크**: React 19 + Vite 8
- **캔버스**: 커스텀 HTML/CSS 렌더러 (직접 구현, Fabric.js 미사용)
- **데이터베이스**: Firebase Firestore
- **파일 저장소**: Firebase Storage
- **인증**: Firebase Auth (관리자) + 사업자번호+ID (사용자, 추후 Auth 전환 예정)
- **서버 로직**: Firebase Functions (Node.js) — Claude API 프록시 용도, Blaze 플랜 필요
- **내보내기**: html2canvas + jsPDF
- **배포**: Firebase Hosting (Spark 무료 플랜)

## 주요 명령어

```bash
npm run dev           # 개발 서버 실행 (localhost:5173)
npm run build         # 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기
npm run lint          # ESLint 실행
npm test              # 테스트 1회 실행 (CI용)
npm run test:watch    # 파일 변경 감지 테스트 (개발 중)
npm run test:coverage # 커버리지 리포트 생성
```

## 디렉토리 구조

```
src/
├── components/
│   ├── CanvasEditor.jsx      # 커스텀 캔버스 편집기 (드래그/리사이즈/선택)
│   ├── TemplatePanel.jsx     # 템플릿 선택 패널
│   ├── PropsPanel.jsx        # 객체 속성 편집 패널
│   ├── Header.jsx            # 헤더 (저장/내보내기 버튼)
│   ├── BanplusModal.jsx      # 반플러스 관련 모달
│   ├── SavedTemplatesModal.jsx  # 저장된 템플릿 모달 (공개/비공개 토글, 공유 링크)
│   ├── SharePage.jsx         # 공유 링크 읽기 전용 미리보기 (/share/:id)
│   ├── LayerPanel.jsx        # 레이어 패널 (드래그 재정렬, 잠금/숨기기)
│   ├── AssetPanel.jsx        # 에셋 패널 (약국 SVG 아이콘 라이브러리)
│   └── Toast.jsx             # 토스트 알림 컴포넌트
├── context/
│   └── EditorContext.jsx     # EditorProvider — 전체 에디터 상태 및 핸들러 관리
├── hooks/
│   ├── useAuth.js            # Firebase 인증 훅
│   ├── useEditor.js          # useEditor 커스텀 훅 (EditorContext 소비)
│   ├── useHistory.js         # Undo/Redo 히스토리 커스텀 훅
│   └── useToast.js           # 토스트 알림 커스텀 훅
├── utils/
│   ├── id.js                 # genId — 요소 고유 ID 생성 유틸
│   └── storage.js            # Firestore 저장/불러오기 유틸
├── data/
│   ├── templates.js          # 기본 템플릿 데이터
│   └── assets.js             # 약국 SVG 에셋 데이터 (23개, 5카테고리)
├── firebase.js               # Firebase 초기화
├── App.jsx                   # 루트 컴포넌트
└── main.jsx                  # 엔트리포인트
```

## 언어 및 커뮤니케이션 규칙

- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)

### 커밋 메시지 형식

```
<타입>: <변경 내용 요약 (한국어)>

[본문 — 필요 시]
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

| 타입 | 사용 시점 |
|------|----------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서/주석 변경 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | 포맷, 들여쓰기 등 스타일만 변경 |
| `chore` | 빌드 설정, 패키지, 기타 잡무 |
| `init` | 초기 설정/세팅 |

## Git 브랜치 전략

### Sprint 흐름 (기능 개발)
```
sprint{n}  →  PR to develop  →  검증  →  PR to main  →  배포
```

### Hotfix 흐름 (긴급 패치)
```
hotfix/*  →  PR to main  →  배포  →  main을 develop에 역머지
```

- `sprint{n}`: 스프린트 단위 개발 브랜치
- `develop`: 스테이징 통합 브랜치
- `main`: 프로덕션 브랜치
- `hotfix/*`: 긴급 운영 패치 (main 기반 분기)

자세한 CI/CD 정책은 `docs/ci-policy.md` 참조. 개발 프로세스 전체는 `docs/dev-process.md` 참조.

## Bash 명령 실행 규칙

- Bash 명령 실행 시 `cd /path &&` 접두사를 사용하지 마세요. 작업 디렉토리가 이미 프로젝트 루트로 설정되어 있습니다.
- 특히 git 명령은 반드시 `git ...` 형태로 직접 실행하세요. (`cd ... && git ...` 금지)

## 개발 시 유의사항

- **plan 모드에서 수정사항을 받으면 반드시 Hotfix vs Sprint 의사결정을 먼저 수행합니다:**
  1. 수정사항의 긴급도, 변경 범위, 의존성 추가 여부를 분석합니다.
  2. 아래 기준에 따라 Hotfix 또는 Sprint를 추천합니다.
  3. 사용자의 최종 결정을 받은 후 해당 프로세스를 따릅니다.

  **Hotfix 추천 기준** (모두 충족 시):
  - 프로덕션 장애/버그이거나, 변경 범위가 파일 3개 이하 & 코드 50줄 이하
  - 새 의존성(npm) 추가 없음

  **Sprint 추천 기준** (하나라도 해당 시):
  - 새 기능 추가 또는 여러 모듈에 걸친 작업
  - 새 의존성 추가 필요
  - 파일 4개 이상 또는 코드 50줄 초과 변경

- sprint 관련 문서 구조:
  - 스프린트 계획/완료 문서: `docs/sprint/sprint{n}.md`
  - 스프린트 첨부 파일 (스크린샷 등): `docs/sprint/sprint{n}/`

- sprint 개발이 plan 모드로 진행될 때는 다음을 꼭 준수합니다.
  - sprint가 새로 시작될 때는 새로 branch를 `sprint{n}` 이름으로 생성하고 해당 브랜치에서 작업해주세요. (worktree 사용하지 말아주세요)
  - 다음과 같이 agent를 활용합니다.
    1. sprint-planner agent가 계획 수립 작업을 수행하도록 해주세요.
    2. 스프린트 구현이 완료되면 sprint-close agent를 사용하여 마무리 작업(ROADMAP 업데이트, PR 생성, 코드 리뷰)을 수행해주세요.
    3. sprint-close agent는 **`develop` 브랜치로 PR**을 생성합니다. (main이 아닌 develop)
    4. `develop` → `main` merge는 별도 확인 후 deploy-prod agent를 사용합니다.

- hotfix 개발이 plan 모드로 진행될 때는 다음을 꼭 준수합니다.
  - `main` 기반으로 `hotfix/{설명}` 브랜치를 생성합니다. (worktree 사용하지 말아주세요)
  - 구현 완료 후 hotfix-close agent를 사용하여 마무리 작업(PR to main, deploy.md 기록)을 수행합니다.

- **커밋 전 코드 리뷰 및 검증을 반드시 수행합니다:**
  1. 변경된 파일 전체를 읽고 아래 체크리스트를 항목별로 검토합니다.
  2. `npm run lint` → `npm test` → `npm run build` 순서로 실행하여 모두 통과하는지 확인합니다.
  3. 문제 발견 즉시 수정하고, 수정 후 재검증합니다.
  4. 새 기능을 추가했다면 관련 테스트도 함께 작성합니다 (hooks/utils는 필수, components는 권장).

  **🔴 Critical — 발견 즉시 수정 (커밋 차단)**

  보안:
  - 하드코딩된 API 키, 비밀번호, 토큰, Firebase 설정값 없음
  - `dangerouslySetInnerHTML` 미사용 (XSS 위험)
  - Claude API 키가 클라이언트 코드에 노출되지 않음
  - Firebase Security Rules 우회 가능한 로직 없음

  런타임 에러:
  - `null` / `undefined` 접근 전 방어 코드 존재 (`?.`, `??`, 조건문)
  - 배열 메서드(`.map`, `.filter`) 호출 전 배열 여부 확인
  - `try/catch` 없는 Firestore/Storage 호출 없음
  - `async` 함수 내 모든 `await` 누락 없음
  - Firestore 문서에 base64 이미지 직접 저장 없음 (1MB 제한 → Storage URL 사용)

  메모리 누수:
  - `addEventListener` → 대응하는 `removeEventListener` 존재
  - `setInterval`/`setTimeout` → `useEffect` 클린업에서 clear
  - 클린업 없는 `useEffect` 없음

  **🟠 High — 수정 강력 권장**

  React 패턴:
  - `useEffect` 내 직접 `setState` 호출 없음 (무한 리렌더링 위험)
  - `useCallback`/`useMemo`/`useEffect` 의존성 배열 완전히 명시
  - `key` prop이 배열 index가 아닌 고유 id 사용

  에러 처리:
  - 모든 비동기 작업에 사용자 에러 피드백 존재 (`toast.error()` 사용, `alert()` 금지)
  - 네트워크 실패 시 빈 화면이 아닌 에러 상태 표시
  - 에러 메시지가 구체적임 (❌ "오류 발생" → ✅ "이미지 크기가 5MB를 초과했습니다")
  - 성공 피드백 존재 (`toast.success()`)

  **🟡 Medium — 코드 품질 (다음 Sprint 개선 가능)**

  코드 가독성:
  - 함수/변수명이 역할을 명확히 설명함 (`data` → `canvasElements`, `fn` → `handleSave`)
  - 한 함수가 한 가지 역할만 수행 (20줄 초과 시 분리 검토)
  - 복잡한 조건문에 의미 있는 변수명으로 의도 표현
    ```js
    // ❌ if (el && el.type === 'text' && !el.locked && !el.hidden)
    // ✅ const isEditableText = el?.type === 'text' && !el.locked && !el.hidden;
    ```
  - 중첩 삼항 연산자 없음 (2단계 이상)
  - 한국어 주석은 "왜"를 설명 (코드가 이미 말하는 "무엇"은 불필요)

  코드 일관성:
  - 같은 기능 코드가 3회 이상 중복 시 추출 검토
  - 파일 내 코딩 스타일이 기존 패턴과 일치 (화살표 함수 / function 선언 혼용 금지)
  - 상수는 파일 상단에 모아 선언 (매직 넘버/문자열 인라인 금지)
  - CSS는 CSS 변수(`--color-*`, `--space-*`) 사용, 하드코딩 금지

  자세한 리뷰 기준은 `.claude/agents/sprint-close.md` 참조.

- **sprint 구현이 완료되면 반드시 sprint-close 에이전트를 자동으로 실행합니다:**
  - 별도 요청이 없어도 구현 완료 후 자동으로 sprint-close를 실행합니다.
  - sprint-close 내에 UI 리뷰가 포함되어 있습니다 (별도 요청 불필요).
  - 순서: 코드 리뷰 → UI 리뷰 → lint/test/build → sprint 문서 기록 → ROADMAP 업데이트 → PR 생성

- **모든 개발 과정은 커밋 이력과 문서로 추적 가능해야 합니다:**
  - 커밋 메시지는 "무엇을 왜 변경했는지" 명확히 기술합니다.
  - `docs/sprint/sprint{N}.md`에 코드 리뷰 결과, UI 리뷰 결과, 검증 결과를 기록합니다.
  - PR 본문에 변경 파일 목록, 검증 결과, 수동 검증 항목을 포함합니다.
  - 발견된 버그/이슈는 수정 내용과 함께 sprint 문서에 기록합니다.
  - 다음 Sprint 개선 사항도 sprint 문서에 남겨 추후 참조할 수 있게 합니다.

- **개발 시 코드 가독성, 일관성, 에러 처리를 항상 염두에 둡니다:**
  - 함수/변수명은 역할을 명확히 설명하는 이름 사용
  - 같은 패턴이 3회 이상 반복되면 추출을 검토
  - 모든 비동기 작업에 `try/catch` + `toast.error()` 필수
  - 성공 피드백도 빠짐없이 제공 (`toast.success()`)
  - CSS는 반드시 CSS 변수(`var(--color-*)`, `var(--space-*)`) 사용

- **새 기능 요청 시 다음 순서를 따릅니다:**
  1. ROADMAP.md에 해당 기능이 없으면 아래 기준으로 Sprint에 배정 후 추가
  2. `docs/sprint/sprint{n}.md`에 세부 태스크 추가 (없으면 신규 생성)
  3. Hotfix vs Sprint 판단 후 브랜치 생성 및 구현 시작

  **Sprint 배정 기준**:
  - 현재 진행 중인 Sprint 범위에 맞으면 → 해당 Sprint에 추가
  - 범위를 벗어나거나 새 Sprint가 필요하면 → 다음 Sprint 번호로 신규 배정
  - 긴급 버그/장애면 → Hotfix로 처리 (ROADMAP 업데이트 불필요)

- **sprint 시작 시 ROADMAP.md 상태를 🔄 진행 중으로 업데이트합니다:**
  - `docs/sprint/sprint{n}.md` 신규 생성 (목표, 태스크 목록, 완료 기준 포함)
  - sprint 완료 시 ✅ 완료로 변경 및 진행률 업데이트

- **새 컴포넌트/파일 추가 시 CLAUDE.md 디렉토리 구조를 업데이트합니다:**
  - `src/` 하위에 새 파일이 생기면 해당 섹션에 파일명과 역할 추가

- **새 npm 패키지 추가 시 docs/setup-guide.md를 업데이트합니다:**
  - 패키지명, 용도, 설치 명령어를 사전 요구사항 또는 관련 섹션에 기재

- **환경변수 추가 시 .env.example을 반드시 동기화합니다:**
  - 실제 값은 제외하고 키 이름과 설명(주석)만 추가
  - `.env`는 gitignore 대상이므로 `.env.example`이 유일한 공유 기준

- **develop, main 브랜치에 직접 push 금지:**
  - 모든 변경은 `sprint{n}` 또는 `hotfix/*` 브랜치를 통해 PR로 반영

- 체크리스트 작성 형식:
  - 완료 항목: `- ✅ 항목 내용`
  - 미완료 항목: `- ⬜ 항목 내용`

## 테스트

### 스택

- **Vitest**: Vite 네이티브 테스트 러너 (vite.config.js에 설정)
- **@testing-library/react**: 컴포넌트 렌더링 및 DOM 쿼리
- **@testing-library/user-event**: 실제 사용자 인터랙션 시뮬레이션
- **@testing-library/jest-dom**: `toBeInTheDocument()` 등 DOM 매처

### 파일 위치 규칙

- 테스트 파일은 테스트 대상 파일과 **같은 디렉토리**에 배치
- 파일명: `{소스파일명}.test.{js|jsx}`
  - 예: `useHistory.js` → `useHistory.test.js`
  - 예: `Toast.jsx` → `Toast.test.jsx`
- 공통 setup은 `src/test/setup.js` (jest-dom import)

### 계층별 테스트 전략

| 계층 | 테스트 종류 | 우선순위 | 도구 |
|------|-----------|---------|------|
| `src/hooks/` | 단위 테스트 (순수 로직) | **필수** | `renderHook`, `act` |
| `src/components/` | 컴포넌트 테스트 (렌더링 + 이벤트) | **권장** | `render`, `userEvent` |
| `src/utils/` | 단위 테스트 (순수 함수) | **필수** | 일반 vitest |
| `src/App.jsx` | 통합 테스트 | 선택 (복잡도 고려) | `render` + mock |

### 작성 규칙

- **훅 테스트**: `renderHook` + `act`로 상태 변화 검증. Firebase 등 외부 의존성은 `vi.mock()`으로 목킹
- **컴포넌트 테스트**: 구현 세부사항(state, ref)이 아닌 **사용자가 보는 것**(텍스트, 버튼 활성화, aria 속성)을 검증
- **이벤트 테스트**: `fireEvent` 대신 `userEvent` 사용 (실제 브라우저 동작과 가까움)
- **타이머가 있는 테스트**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` 사용 후 `vi.useRealTimers()`로 복원

### 커밋 전 검증 순서

```
npm run lint    # 1. 린트 통과
npm test        # 2. 테스트 통과
npm run build   # 3. 빌드 성공
```

### Firebase 목킹 패턴

Firebase SDK는 테스트에서 직접 호출하지 않고 항상 목킹합니다:

```js
vi.mock('../firebase', () => ({
  db: {},
  auth: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  // ...
}));
```

## 컨벤션

- 컴포넌트 파일명: PascalCase (`.jsx`)
- 훅/유틸/데이터 파일명: camelCase (`.js`)
- Firebase 설정은 `src/firebase.js`에서 관리 (`VITE_` 환경변수 사용)
- 캔버스 요소는 `CanvasEditor` 컴포넌트 내부에서 직접 DOM 이벤트로 관리
