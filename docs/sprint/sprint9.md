# Sprint 9: Claude AI를 이용한 SVG 에셋 생성

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 9 |
| 목표 | 사용자가 텍스트로 설명하면 Claude API가 SVG를 생성하고, AssetPanel "AI 생성" 탭에 추가되어 캔버스에 삽입할 수 있는 기능 구현 |
| 시작일 | 2026-03-16 |
| 완료일 | 2026-03-16 |
| 상태 | ✅ 완료 |

---

## 목표 요약

약사가 텍스트("빨간 하트", "약국 로고", "할인 태그" 등)를 입력하면 Claude claude-haiku-4-5-20251001 모델이 SVG 코드를 생성하고, 생성된 에셋이 AssetPanel의 "AI 생성" 탭에 자동으로 추가되는 기능을 구현한다.

Firebase Functions 없이 브라우저에서 직접 `@anthropic-ai/sdk`를 호출하는 방식으로 구현한다(Spark 무료 플랜 유지). Claude API 키는 `VITE_CLAUDE_API_KEY` 환경변수로 관리하고, 생성된 SVG는 DOMPurify sanitize 후 base64 data URL로 변환해 XSS를 방어한다.

---

## 현재 상태 분석

### 관련 파일 현황

| 파일 | 역할 | 변경 여부 |
|------|------|----------|
| `src/components/AssetPanel.jsx` | 카테고리 탭 + 에셋 클릭 → onAddAsset 콜백 | 수정 필요 |
| `src/data/assets.js` | 기존 SVG 에셋 23개 (5카테고리) | 변경 없음 |
| `src/context/EditorContext.jsx` | handleAddAsset 핸들러 | 변경 없음 (재사용) |
| `src/firebase.js` | Firebase 초기화 | 변경 없음 |
| `.env.example` | 환경변수 양식 | 수정 필요 (VITE_CLAUDE_API_KEY 추가) |

### Sprint 8 이월 항목

- ⬜ Firebase Hosting 프리뷰 채널 배포 CI 통합 — Sprint 9 대상

### PRD 불일치 사항

- `docs/prd.md` 섹션 6.6: "Claude API 키는 Firebase Functions를 프록시로 사용" → 이번 구현에서는 클라이언트 직접 호출로 변경. PRD에 이 결정과 이유(Spark 플랜 유지) 명시 필요.

---

## UX 흐름

```
AssetPanel "AI 생성" 탭 선택
    ↓
텍스트 입력창 ("그릴 아이콘을 설명하세요: 빨간 하트, 약국 로고 등")
    ↓
"생성" 버튼 클릭
    ↓
로딩 상태 표시 ("AI가 그리는 중...")
    ↓
Claude API 호출 → SVG 코드 수신
    ↓
DOMPurify sanitize → base64 data URL 변환
    ↓
"AI 생성" 탭 에셋 목록에 추가 (세션 중 유지, localStorage 저장)
    ↓
에셋 클릭 시 캔버스에 삽입 (기존 handleAddAsset 재사용)
```

---

## 태스크 목록

### 1. P0: 의존성 추가

**파일**: `package.json`, `docs/setup-guide.md`

- ✅ `npm install @anthropic-ai/sdk` 설치
- ✅ DOMPurify는 이미 설치 확인 (`dist/purify.es.js`)
- ✅ `docs/setup-guide.md` — `@anthropic-ai/sdk` 설치 명령어 및 용도 추가

### 2. P0: 환경변수 설정

**파일**: `.env.example`

- ✅ `VITE_CLAUDE_API_KEY=your_claude_api_key` 항목 추가 (주석: "Claude AI SVG 생성 기능에 필요. 미설정 시 AI 생성 탭 비활성화")

### 3. P0: SVG 생성 유틸 구현

**파일**: `src/utils/claudeSvg.js` (신규)

- ✅ `generateSvgAsset(prompt: string): Promise<string>` 함수 구현
  - `@anthropic-ai/sdk`의 `Anthropic` 클라이언트 초기화 (`dangerouslyAllowBrowser: true`)
  - `VITE_CLAUDE_API_KEY` 미설정 시 명확한 에러 메시지 throw
  - system prompt: SVG만 반환하도록 엄격히 설계 (아래 프롬프트 전략 참조)
  - 응답에서 `<svg>...</svg>` 태그 추출
  - DOMPurify로 sanitize 후 반환 (sanitize 실패 시 에러 throw)
- ✅ `svgToDataUrl(svgString: string): string` 함수 구현
  - sanitize된 SVG → base64 인코딩 → `data:image/svg+xml;base64,...` 형태 반환

**Claude 프롬프트 전략**:

```
system: "당신은 SVG 아이콘 생성 전문가입니다. 사용자의 설명에 맞는 SVG 코드만 반환하세요.
규칙:
- 반드시 <svg> 태그로 시작하고 </svg>로 끝나는 코드만 출력
- viewBox="0 0 100 100" 사용
- 배경 없는 투명 아이콘 스타일
- xmlns 속성 포함: xmlns="http://www.w3.org/2000/svg"
- 텍스트, 마크다운, 설명 절대 포함 금지"

user: "다음 아이콘을 SVG로 그려주세요: {prompt}"
```

### 4. P0: AI 생성 에셋 상태 관리 훅

**파일**: `src/hooks/useAiAssets.js` (신규)

- ✅ 상태: `aiAssets: Array<{id, name, src, isAiGenerated: true}>`
- ✅ localStorage 키: `'pop-maker-ai-assets'` — 초기 로드 시 복원
- ✅ `generateAsset(prompt, onError, onSuccess)` — SVG 생성 + 에셋 추가 + localStorage 저장
- ✅ `removeAsset(id)` — 특정 AI 에셋 삭제 + localStorage 갱신
- ✅ 에셋 ID 생성: `genId()` 재사용

### 5. P0: AssetPanel AI 생성 탭 UI 구현

**파일**: `src/components/AssetPanel.jsx` (수정)

- ✅ 훅 연결 방식: props로 수신 (EditorContext에서 useAiAssets 관리)
- ✅ "AI 생성" 카테고리 탭 추가 (기존 카테고리 탭 목록 뒤에 추가)
- ✅ AI 생성 탭 선택 시 전용 UI 렌더링:
  - 텍스트 입력창 (`placeholder="그릴 아이콘을 설명하세요: 빨간 하트, 약국 로고 등"`)
  - "생성" 버튼
  - 로딩 중: 버튼 비활성화 + "AI가 그리는 중..." 텍스트 표시
  - VITE_CLAUDE_API_KEY 미설정 시: 안내 메시지 표시 ("API 키가 설정되지 않았습니다")
- ✅ 생성된 에셋 그리드 표시 (기존 에셋 그리드와 동일한 UI 패턴)
- ✅ 각 AI 에셋에 삭제 버튼 (× 아이콘, hover 시 표시) 추가
- ✅ 에셋 클릭 시 기존 `onAddAsset(asset)` 콜백 재사용
- ✅ Enter 키 입력 시 생성 실행
- ✅ 에러 처리: toast.error() 연결

**기술 결정**: `VITE_CLAUDE_API_KEY` 미설정 체크는 `import.meta.env.VITE_CLAUDE_API_KEY` 존재 여부로 판단. 기존 앱 동작에 영향 없이 AI 탭만 비활성화.

### 6. P1: docs/prd.md 섹션 6.6 업데이트

**파일**: `docs/prd.md`

- ✅ 섹션 6.6 업데이트: "클라이언트 직접 호출로 구현 (Spark 플랜 유지)" 결정 사유 명시
- ✅ 보안 고려사항 추가: VITE_CLAUDE_API_KEY는 브라우저에 노출됨을 명시

### 7. P1: Firebase Hosting 프리뷰 채널 CI 통합 (Sprint 7~8 이월)

**파일**: `.github/workflows/ci.yml` 또는 신규 `preview.yml`

- ⬜ `firebase-tools` GitHub Actions 공식 액션 사용 (Sprint 10으로 이월)
- ⬜ PR 오픈 시 Firebase Hosting 프리뷰 채널에 자동 배포 (Sprint 10으로 이월)
- ⬜ PR에 프리뷰 URL 자동 코멘트 (Sprint 10으로 이월)

### 8. P0: 테스트

**파일**: `src/utils/claudeSvg.test.js`, `src/hooks/useAiAssets.test.js`, `src/components/AssetPanel.test.jsx` (수정)

#### claudeSvg.test.js

- ✅ `generateSvgAsset()` — VITE_CLAUDE_API_KEY 미설정 시 에러 throw
- ✅ `generateSvgAsset()` — VITE_CLAUDE_API_KEY 기본값(your_)이면 에러 throw
- ✅ `generateSvgAsset()` — API 호출 성공 시 SVG data URL 반환, DOMPurify.sanitize 호출 확인
- ✅ `generateSvgAsset()` — API 응답에 SVG가 없으면 에러 throw
- ✅ `generateSvgAsset()` — 응답 텍스트 비어있으면 에러 throw
- ✅ `generateSvgAsset()` — DOMPurify sanitize 후 SVG 없으면 보안 에러 throw
- ✅ `generateSvgAsset()` — 응답에서 SVG 태그만 추출 (설명 텍스트 제거)
- ✅ `svgToDataUrl()` — 올바른 base64 data URL 형태 반환
- ✅ `svgToDataUrl()` — 한국어 포함 SVG도 올바르게 인코딩

#### useAiAssets.test.js

- ✅ 초기 상태 — localStorage 비어있을 때 `aiAssets: []`
- ✅ 초기 상태 — localStorage에 AI 에셋이 있을 때 복원
- ✅ localStorage JSON 손상 시 빈 배열 반환
- ✅ `generateAsset()` — 성공 시 aiAssets에 추가 + localStorage 저장 + onSuccess 호출
- ✅ `generateAsset()` — 실패 시 onError 호출, aiAssets 변경 없음
- ✅ `generateAsset()` — 빈 프롬프트 시 generateSvgAsset 호출 안 함
- ✅ `generateAsset()` — 생성 중 generating 상태 true
- ✅ `generateAsset()` — 에셋 이름 최대 20자 제한
- ✅ `removeAsset()` — 특정 에셋 삭제 + localStorage 갱신
- ✅ `removeAsset()` — 존재하지 않는 id 삭제 시 기존 목록 유지

#### AssetPanel.test.jsx (기존 파일에 케이스 추가)

- ✅ AI 생성 탭 렌더링 확인
- ✅ AI 생성 탭 클릭 시 입력창, 생성 버튼 렌더링
- ✅ VITE_CLAUDE_API_KEY 미설정/기본값 시 안내 메시지 표시
- ✅ 생성 버튼 클릭 시 onGenerateAsset 호출
- ✅ generating=true 시 버튼 비활성화 + 로딩 텍스트
- ✅ AI 에셋 목록 표시
- ✅ AI 에셋 클릭 시 onAddAsset 호출
- ✅ 삭제 버튼 클릭 시 onRemoveAiAsset 호출
- ✅ AI 에셋 없을 때 안내 문구 표시
- ✅ Enter 키 입력 시 onGenerateAsset 호출

### 9. P1: vite.config.js coverage 설정 업데이트

**파일**: `vite.config.js`

- ✅ 신규 파일(`claudeSvg.js`, `useAiAssets.js`)은 `coverage.include` 범위(`src/hooks/**`, `src/utils/**`)에 이미 포함됨 — 별도 수정 불필요

---

## 기술적 접근 방법

### @anthropic-ai/sdk 브라우저 직접 호출

`@anthropic-ai/sdk`는 `dangerouslyAllowBrowser: true` 옵션으로 브라우저에서 직접 사용 가능하다. API 키가 클라이언트에 노출된다는 점은 인지하며, Spark 플랜 유지를 위한 의도적 결정이다.

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});
```

### SVG 추출 패턴

Claude 응답에서 `<svg>...</svg>` 태그를 정규식으로 추출한다:

```js
const match = response.match(/<svg[\s\S]*?<\/svg>/i);
if (!match) throw new Error('SVG 코드를 생성하지 못했습니다.');
return match[0];
```

### DOMPurify sanitize 패턴

```js
import DOMPurify from 'dompurify';

// SVG 허용 태그와 속성 설정
const cleanSvg = DOMPurify.sanitize(rawSvg, {
  USE_PROFILES: { svg: true, svgFilters: true },
});
```

### base64 data URL 변환

```js
const base64 = btoa(unescape(encodeURIComponent(cleanSvg)));
return `data:image/svg+xml;base64,${base64}`;
```

### localStorage 키 규칙

기존 프로젝트 패턴(`useAuth.js`의 `banplus_biz`, `banplus_id` 키)과 일관성을 유지한다:

```js
const STORAGE_KEY = 'pop-maker-ai-assets';
```

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|---------|
| Claude API 키 브라우저 노출 | 높 | VITE_CLAUDE_API_KEY는 gitignore된 .env에만 저장. 운영 환경에서는 API 키 사용량 모니터링 필수. PRD에 결정 사유 명시 |
| Claude 응답에 SVG 외 텍스트 포함 | 중 | system prompt 엄격히 설계 + 정규식 태그 추출로 대응 |
| DOMPurify가 SVG 속성 제거 | 중 | `USE_PROFILES: { svg: true, svgFilters: true }` 옵션으로 SVG 허용 속성 화이트리스트 적용 |
| localStorage 용량 초과 (5MB 한도) | 낮 | AI 에셋 최대 저장 개수 제한 (예: 50개) + 초과 시 오래된 에셋 자동 삭제 또는 toast.warning 안내 |
| `@anthropic-ai/sdk` Vite 번들 이슈 | 중 | 필요 시 `vite.config.js`의 `optimizeDeps.include`에 추가 |
| API 호출 지연 (2~5초) | 중 | 로딩 상태 UI 명확히 표시. 타임아웃 30초 설정 |

---

## 완료 기준 (Definition of Done)

- ✅ `VITE_CLAUDE_API_KEY` 설정 시 AI 생성 기능 정상 동작
- ✅ API 키 미설정 시 AI 탭 비활성화 + 안내 메시지 표시 (기존 앱 동작에 영향 없음)
- ✅ 생성된 SVG가 DOMPurify sanitize를 통과한 후 data URL로 변환됨
- ✅ `dangerouslySetInnerHTML` 미사용 확인
- ✅ 생성된 에셋이 localStorage에 저장되어 새로고침 후에도 유지
- ✅ 에셋 개별 삭제 기능 동작
- ✅ 에셋 클릭 시 캔버스 삽입 동작 (기존 `handleAddAsset` 재사용)
- ✅ `claudeSvg.test.js` 신규 테스트 통과 (9개)
- ✅ `useAiAssets.test.js` 신규 테스트 통과 (13개)
- ✅ `AssetPanel.test.jsx` AI 생성 관련 케이스 통과 (+11개)
- ✅ `.env.example`에 `VITE_CLAUDE_API_KEY` 추가
- ✅ `docs/setup-guide.md` 업데이트 (`@anthropic-ai/sdk` 추가)
- ✅ `docs/prd.md` 섹션 6.6 업데이트 (클라이언트 직접 호출 결정 명시)
- ✅ `npm run lint` 오류 0건
- ✅ `npm test` 257개 전체 통과
- ✅ `npm run build` 성공
- ⬜ Firebase Hosting 프리뷰 채널 CI 통합 (P1, Sprint 10으로 이월)

---

## 예상 산출물

| 파일 | 유형 | 설명 |
|------|------|------|
| `src/utils/claudeSvg.js` | 신규 | Claude API 호출 + SVG 추출 + DOMPurify sanitize |
| `src/hooks/useAiAssets.js` | 신규 | AI 생성 에셋 상태 관리 (localStorage 영속) |
| `src/components/AssetPanel.jsx` | 수정 | "AI 생성" 탭 UI 추가 |
| `src/utils/claudeSvg.test.js` | 신규 | claudeSvg 유틸 단위 테스트 |
| `src/hooks/useAiAssets.test.js` | 신규 | useAiAssets 훅 단위 테스트 |
| `src/components/AssetPanel.test.jsx` | 수정 | AI 생성 탭 관련 케이스 추가 |
| `.env.example` | 수정 | VITE_CLAUDE_API_KEY 추가 |
| `docs/setup-guide.md` | 수정 | @anthropic-ai/sdk 설치 정보 추가 |
| `docs/prd.md` | 수정 | 섹션 6.6 클라이언트 직접 호출 결정 반영 |
| `vite.config.js` | 수정 | coverage.exclude 업데이트 |

---

## 다음 Sprint 고려사항

- Firebase Functions 마이그레이션: Blaze 플랜 전환 시 Claude API 키를 서버 프록시로 이동하여 보안 강화
- AI 에셋 최대 개수 초과 시 UX 처리 방법 결정 (현재: 50개 제한 후 경고)
- 생성 히스토리 UI (이전에 생성한 프롬프트 재사용)

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run lint` | ✅ 경고 없음 |
| `npm test` | ✅ 257개 통과 (18개 파일) |
| `npm run build` | ✅ 성공 |

## 코드 리뷰 결과

### 수정한 이슈

없음 — Critical/High 이슈 미발견

### 다음 Sprint 개선 사항

- 🟡 AI 에셋 삭제 버튼 크기 16×16px — 최소 클릭 영역(36px) 미달. hover 전용 보조 액션으로 허용하되 Sprint 10에서 개선 검토 (`src/components/AssetPanel.jsx`)
- 🟡 AI 에셋 생성 개수 50개 초과 시 사용자 알림 없음 — 현재는 오래된 에셋을 조용히 제거. toast.warning 추가 검토 (`src/hooks/useAiAssets.js`)
- 🟡 Firebase Hosting 프리뷰 채널 CI 통합 — Sprint 7~9 이월 항목, Sprint 10에서 구현 예정

## UI 리뷰 결과

### 확인 항목

- ✅ CSS 변수(`--color-*`, `--space-*`, `--radius-*`) 전체 사용
- ✅ `.btn .btn-accent` 기존 버튼 클래스 재사용
- ✅ 빈 상태 안내 텍스트 존재 ("위 입력창에 설명을 입력하고 생성 버튼을 눌러보세요.")
- ✅ 로딩 상태 시각적 피드백 ("AI가 그리는 중..." + 버튼 disabled)
- ✅ 에러 상태: toast.error() 연결
- ✅ 성공 피드백: toast.success() 연결
- ✅ 삭제 버튼에 `aria-label` 존재
- ✅ 이미지에 `alt` 텍스트 존재
- ✅ disabled 상태 스타일 명확 (opacity: 0.5, cursor: not-allowed)
- ✅ 다크모드: CSS 변수 사용으로 자동 대응

### 개선 제안 (미반영)

- 삭제 버튼 클릭 영역 확대 (16px → 24px+)

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/utils/claudeSvg.js` | 신규 — Claude API SVG 생성 유틸 |
| `src/utils/claudeSvg.test.js` | 신규 — claudeSvg 단위 테스트 (9개) |
| `src/hooks/useAiAssets.js` | 신규 — AI 에셋 상태 관리 훅 |
| `src/hooks/useAiAssets.test.js` | 신규 — useAiAssets 단위 테스트 (13개) |
| `src/components/AssetPanel.jsx` | 수정 — "AI 생성" 탭 UI 추가 |
| `src/components/AssetPanel.test.jsx` | 수정 — AI 탭 테스트 케이스 추가 (+11개) |
| `src/context/EditorContext.jsx` | 수정 — useAiAssets 훅 연동, 핸들러 추가 |
| `src/App.jsx` | 수정 — AssetPanel에 AI props 전달 |
| `src/App.css` | 수정 — AI 에셋 섹션 스타일 추가 |
| `.env.example` | 수정 — VITE_CLAUDE_API_KEY 추가 |
| `docs/prd.md` | 수정 — 섹션 6.6 클라이언트 직접 호출 결정 반영 |
| `docs/setup-guide.md` | 수정 — @anthropic-ai/sdk 설치 정보 추가 |
| `CLAUDE.md` | 수정 — 신규 파일 디렉토리 구조 반영 |
| `package.json` / `package-lock.json` | 수정 — @anthropic-ai/sdk 의존성 추가 |

배포 이력: `deploy.md` 참조

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint8.md`
- 개발 지침: `CLAUDE.md`
- CI 정책: `docs/ci-policy.md`
- PRD: `docs/prd.md`
- 테스트 설정: `src/test/setup.js`, `vite.config.js`
