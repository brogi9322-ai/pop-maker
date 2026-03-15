# Sprint 7: Playwright E2E 테스트 도입 — 배포 후 검증 자동화

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 7 |
| 목표 | Playwright E2E 테스트 도입으로 프로덕션 배포 후 수동 검증을 완전 자동화 |
| 시작일 | 2026-03-15 |
| 완료일 | — |
| 상태 | 🔄 진행 중 |

---

## 목표 요약

현재 Firebase Hosting 배포(`https://pop-maker-9209f.web.app`) 이후 다음 항목을 수동으로 확인하고 있다:

1. 앱 접속 및 기본 UI 렌더링
2. 캔버스 편집 기본 흐름 (요소 추가 → 이동 → 저장)
3. 공유 링크 `/share/:id` 접근
4. 모바일(375px) 터치 드래그 동작

이번 Sprint에서는 `@playwright/test`를 도입하여 smoke test를 자동화하고, `.github/workflows/e2e.yml` CI workflow를 추가하여 배포 완료 후 E2E가 자동 실행되도록 한다.

Firebase 인증이 필요한 편집/저장 흐름은 초기 구현 범위에서 제외하고, 인증 없이 접근 가능한 퍼블릭 페이지 검증에 집중한다.

---

## 구현 범위

### 포함 항목

- `@playwright/test` 의존성 추가 및 `playwright.config.js` 설정
- `e2e/` 디렉토리 신규 생성 및 smoke test 3개 파일 작성
  - `smoke.spec.js` — 앱 접속, 기본 UI 요소 렌더링 확인
  - `share.spec.js` — `/share/:id` 공개 페이지 접근 및 읽기 전용 UI 확인
  - `mobile.spec.js` — 375px 모바일 뷰포트 레이아웃 확인
- `.github/workflows/e2e.yml` CI workflow 추가 (Firebase Hosting 배포 완료 후 자동 실행)
- Firebase Hosting 프리뷰 채널 배포 CI 통합 (Sprint 6 이월 항목)
- `package.json`에 `test:e2e` 스크립트 추가

### 제외 항목 (향후 Sprint로 이월)

- Firebase 인증이 필요한 캔버스 편집/저장 E2E 테스트 (인증 세션 설정 필요)
- 터치 드래그 실제 동작 검증 (Playwright 모바일 에뮬레이션 제한)
- CI 실패 시 Slack/이메일 알림 연동
- 모바일 미리보기 전용 뷰 (Sprint 5 이월 유지)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)

---

## 태스크 목록

### 1. 의존성 추가 및 기본 설정

#### 1-1. `@playwright/test` 설치 및 브라우저 설치

- ⬜ `npm install --save-dev @playwright/test` 실행
- ⬜ `npx playwright install --with-deps chromium` 실행 (CI에서는 workflow에서 처리)
- ⬜ `package.json`에 스크립트 추가:
  ```json
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
  ```
- ⬜ `docs/setup-guide.md` 업데이트: Playwright 패키지 및 브라우저 설치 안내 추가

#### 1-2. `playwright.config.js` 작성

- ⬜ 프로젝트 루트에 `playwright.config.js` 생성
- ⬜ 설정 항목:
  - `baseURL`: `https://pop-maker-9209f.web.app`
  - `testDir`: `./e2e`
  - `timeout`: 30000ms (네트워크 지연 고려)
  - `retries`: 2 (CI 환경 네트워크 불안정 대응)
  - 프로젝트(브라우저) 정의:
    - `chromium` — 데스크톱 기본
    - `mobile-chrome` — `devices['Pixel 5']` (375px 상당) 모바일 에뮬레이션
  - `reporter`: `['html', { outputFolder: 'playwright-report' }]`
  - CI 환경(`process.env.CI`)에서 `headless: true` 강제, `forbidOnly: true` 설정

```js
// playwright.config.js 주요 구조 (참고)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://pop-maker-9209f.web.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

---

### 2. E2E 테스트 파일 작성

#### 2-1. `e2e/smoke.spec.js` — 앱 접속 및 기본 UI 렌더링

**검증 목표**: 앱이 정상 접속되고 주요 UI 요소가 렌더링되는지 확인

- ⬜ 앱 접속 시 HTTP 200 응답 확인 (`page.goto('/')`)
- ⬜ 페이지 타이틀 확인 (`POP 제작기` 포함 여부)
- ⬜ 헤더 영역 렌더링 확인 (저장 버튼, 내보내기 버튼 등 주요 액션)
- ⬜ 좌측 패널(템플릿/레이어 탭) 렌더링 확인
- ⬜ 중앙 캔버스 영역 렌더링 확인
- ⬜ 우측 속성 패널 렌더링 확인
- ⬜ 인증 없이 접근 시 BanplusModal 또는 초기 안내 표시 확인

> 주의: 인증 상태에 따라 표시되는 UI가 다를 수 있으므로, 인증 모달이 표시되는 경우도 정상 케이스로 처리한다.

#### 2-2. `e2e/share.spec.js` — `/share/:id` 공개 페이지 접근

**검증 목표**: 공유 링크가 인증 없이 접근 가능하고 읽기 전용 미리보기가 렌더링되는지 확인

- ⬜ **사전 조건**: 테스트용 공개 템플릿 ID를 `playwright.config.js`에 환경변수(`E2E_SHARE_ID`)로 관리
  - CI에서는 GitHub Secret `E2E_SHARE_ID`로 주입
  - 미설정 시 테스트 skip (`test.skip(!process.env.E2E_SHARE_ID, 'E2E_SHARE_ID not set')`)
- ⬜ `/share/{E2E_SHARE_ID}` 접근 시 HTTP 200 응답 확인
- ⬜ 읽기 전용 미리보기 캔버스 영역 렌더링 확인
- ⬜ 편집 불가 확인 — 편집 버튼/수정 UI가 표시되지 않음
- ⬜ 존재하지 않는 ID(`/share/nonexistent-id-12345`) 접근 시 에러 메시지 또는 404 처리 확인
- ⬜ 비공개 템플릿 ID 접근 시 접근 거부 메시지 확인 (별도 테스트용 비공개 ID 필요 시 skip 처리)

#### 2-3. `e2e/mobile.spec.js` — 375px 모바일 레이아웃 확인

**검증 목표**: 모바일 뷰포트에서 레이아웃이 올바르게 렌더링되는지 확인

- ⬜ `devices['Pixel 5']` 뷰포트(393x851)에서 앱 접속 확인
- ⬜ 모바일 하단 탭 네비게이션 렌더링 확인 (패널 | 캔버스 | 속성)
- ⬜ 데스크톱 사이드바가 숨김 처리되는지 확인 (`.sidebar`의 `mobile-active` 클래스 부재)
- ⬜ 하단 탭 클릭 시 해당 패널이 활성화되는지 확인 (`mobile-active` 클래스 토글)
- ⬜ 중앙 캔버스 탭 클릭 시 캔버스 영역이 전면에 표시되는지 확인
- ⬜ 가로 스크롤 없음 확인 (`document.body.scrollWidth <= viewport.width`)

> 주의: 실제 터치 드래그(객체 이동) 동작은 Playwright `page.touchscreen.tap()` API로 시뮬레이션 가능하나, 캔버스 내부 상태 검증이 복잡하므로 레이아웃 렌더링 검증에 집중한다.

---

### 3. `.github/workflows/e2e.yml` CI workflow 작성

**목표**: Firebase Hosting 배포 완료 후 E2E smoke test를 자동 실행하고 결과를 artifact로 저장

- ⬜ `.github/workflows/e2e.yml` 신규 생성
- ⬜ 트리거 조건:
  - `workflow_dispatch` (수동 실행)
  - `push` to `master` (배포 완료 후 자동 실행 고려)
- ⬜ 주요 스텝:
  1. `actions/checkout@v4`
  2. Node.js 20 설정 (`actions/setup-node@v4`, `cache: 'npm'`)
  3. `npm ci`
  4. Playwright 브라우저 설치 (`npx playwright install --with-deps chromium`)
  5. `npm run test:e2e` 실행 (환경변수 주입 포함)
  6. Playwright 리포트 artifact 업로드 (`actions/upload-artifact@v4`, `retention-days: 7`)
  7. 실패 시에도 artifact 업로드 (`if: always()`)
- ⬜ 환경변수 설정:
  - `E2E_SHARE_ID`: GitHub Secret `E2E_SHARE_ID`로 주입

```yaml
# e2e.yml 주요 구조 (참고)
name: E2E Tests

on:
  workflow_dispatch:
  push:
    branches: [master]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          E2E_SHARE_ID: ${{ secrets.E2E_SHARE_ID }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

### 4. Firebase Hosting 프리뷰 채널 배포 CI 통합 (Sprint 6 이월)

- ⬜ `firebase-tools` CLI 설치 및 `FIREBASE_TOKEN` GitHub Secret 설정 확인
- ⬜ `.github/workflows/ci.yml`에 프리뷰 채널 배포 스텝 추가:
  - PR 열릴 때 Firebase Hosting 프리뷰 채널 자동 배포
  - 배포 URL을 PR 코멘트로 자동 게시
- ⬜ `firebase.json`에 `hosting.target` 설정 확인

> 주의: `FIREBASE_TOKEN`은 `firebase login:ci`로 발급하며, GitHub Repository Secret에 등록 필요.

---

### 5. `.gitignore` 및 `eslint.config.js` 업데이트

- ⬜ `.gitignore`에 Playwright 생성 파일 추가:
  ```
  playwright-report/
  test-results/
  ```
- ⬜ `eslint.config.js`에 `e2e/` 디렉토리 제외 추가 (ESLint는 Vitest 기반이므로 E2E 파일 제외 필요)

---

## 기술적 접근 방법

### Playwright vs Vitest 역할 구분

| 계층 | 도구 | 실행 환경 | 목적 |
|------|------|---------|------|
| 단위/컴포넌트 | Vitest + Testing Library | jsdom (가상 DOM) | 함수/컴포넌트 로직 검증 |
| E2E smoke | Playwright | 실제 브라우저 + 실제 서버 | 배포 후 프로덕션 동작 검증 |

Playwright는 실제 브라우저에서 실제 Firebase Hosting URL을 대상으로 실행되므로, 네트워크 상태와 Firebase 서비스 가용성에 의존한다. 이를 위해 `retries: 2` 설정을 적용하고 타임아웃을 충분히 확보한다.

### 공유 링크 테스트 데이터 관리

`/share/:id` 테스트는 Firestore에 실제 공개 템플릿이 존재해야 한다. 다음 전략을 채택한다:

1. 테스트 전용 공개 템플릿을 수동으로 생성하고 해당 ID를 `E2E_SHARE_ID` GitHub Secret에 등록
2. 해당 템플릿은 삭제하지 않고 영구 유지 (테스트 전용 문서)
3. `E2E_SHARE_ID` 미설정 시 `share.spec.js`는 graceful skip 처리

### 모바일 에뮬레이션 제한 사항

Playwright의 `devices['Pixel 5']`는 뷰포트 크기와 User-Agent를 변경하지만, 실제 터치 이벤트(`touchstart`, `touchmove`)를 완벽히 재현하지는 않는다. 이번 Sprint에서는 레이아웃 렌더링(하단 탭, 패널 전환)만 검증하고, 실제 터치 드래그 검증은 향후 이슈로 남긴다.

---

## 테스트 계획

이번 Sprint는 E2E 테스트 자체가 주요 산출물이므로 별도 Vitest 테스트 작성은 최소화한다.

| 항목 | 방법 |
|------|------|
| `playwright.config.js` 설정 검증 | `npx playwright test --list`로 테스트 목록 확인 |
| smoke.spec.js | 로컬 `npm run test:e2e` 실행 후 `playwright-report/index.html` 확인 |
| share.spec.js | `E2E_SHARE_ID` 환경변수 설정 후 로컬 실행 |
| mobile.spec.js | Playwright UI 모드(`npm run test:e2e:ui`)로 모바일 뷰포트 렌더링 시각 확인 |
| CI workflow | `workflow_dispatch`로 수동 트리거 후 GitHub Actions 결과 확인 |

---

## 의존성 및 리스크

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|---------|
| Playwright 브라우저 설치 CI 시간 증가 | 낮 | `chromium`만 설치하여 최소화 (webkit/firefox 제외) |
| Firebase Hosting 서비스 일시 장애 시 E2E 실패 | 중 | `retries: 2` 설정 + `if: always()`로 artifact 항상 수집 |
| `E2E_SHARE_ID` 템플릿 데이터 변경/삭제 | 중 | 테스트 전용 공개 템플릿 별도 유지, 문서에 ID 관리 지침 기록 |
| Firebase Hosting 프리뷰 채널 `FIREBASE_TOKEN` 만료 | 낮 | 만료 시 `firebase login:ci`로 재발급 후 Secret 업데이트 |
| `e2e.yml`이 `ci.yml`과 중복 실행되어 비용 증가 | 낮 | E2E는 `master` push 또는 수동 트리거로만 실행 (PR에서는 CI만 실행) |

---

## 완료 기준 (Definition of Done)

- ⬜ `@playwright/test` 패키지가 `devDependencies`에 추가됨
- ⬜ `playwright.config.js` 생성: baseURL, 타임아웃, chromium + mobile-chrome 프로젝트 설정 포함
- ⬜ `e2e/smoke.spec.js` 작성 완료: chromium에서 로컬 실행 통과
- ⬜ `e2e/share.spec.js` 작성 완료: `E2E_SHARE_ID` 설정 시 통과, 미설정 시 graceful skip
- ⬜ `e2e/mobile.spec.js` 작성 완료: `mobile-chrome` 프로젝트에서 레이아웃 검증 통과
- ⬜ `.github/workflows/e2e.yml` 생성: `workflow_dispatch` 및 `master` push 트리거, artifact 업로드 포함
- ⬜ GitHub Actions `workflow_dispatch`로 수동 실행 시 전체 E2E 통과
- ⬜ `.gitignore`에 `playwright-report/`, `test-results/` 추가
- ⬜ `eslint.config.js`에 `e2e/` 제외 추가
- ⬜ `docs/setup-guide.md` 업데이트: Playwright 설치 안내 추가
- ⬜ 기존 Vitest 테스트 영향 없음: `npm test` 135개 모두 통과 유지
- ⬜ `npm run lint` 오류 0건, `npm run build` 성공

---

## 예상 산출물

| 산출물 | 경로 | 설명 |
|--------|------|------|
| Playwright 설정 | `playwright.config.js` | baseURL, 브라우저 프로젝트, 리트라이 정책 |
| E2E smoke test | `e2e/smoke.spec.js` | 앱 접속 및 기본 UI 렌더링 검증 |
| E2E share test | `e2e/share.spec.js` | 공유 링크 공개 페이지 접근 검증 |
| E2E mobile test | `e2e/mobile.spec.js` | 모바일 375px 레이아웃 검증 |
| E2E CI workflow | `.github/workflows/e2e.yml` | 배포 후 자동 E2E 실행 |

---

## 다음 Sprint 예정 (이번 Sprint 범위 아님)

- 모바일 미리보기 전용 뷰 (Sprint 5 이월 유지)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시, Blaze 플랜 필요)
- Firebase Blaze 플랜 전환
- Firestore 보안 규칙 파일 업데이트
- SharePage CSS 변수 마이그레이션
- Firebase 인증 기반 E2E 테스트 (캔버스 편집/저장 흐름)
- `SavedTemplatesModal.jsx` 커버리지 향상 (현재 70.9%)

---

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint6.md`
- Playwright 공식 문서: https://playwright.dev/docs/intro
- Firebase Hosting 미리보기 채널: https://firebase.google.com/docs/hosting/manage-hosting-resources
- CI 정책: `docs/ci-policy.md`
- 테스트 설정: `vite.config.js`, `src/test/setup.js`
