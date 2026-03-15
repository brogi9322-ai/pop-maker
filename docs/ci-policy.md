> **개발 프로세스/검증 절차**: [`docs/dev-process.md`](dev-process.md) 참조

## Git 브랜치 전략 & 배포 흐름

### 브랜치 구조

| 브랜치 | 역할 | 배포 환경 |
|--------|------|----------|
| `sprint{n}` | 스프린트 단위 기능 개발 | 로컬 개발 서버 |
| `develop` | 스테이징 통합 브랜치 | 로컬 검증 (`npm run preview`) |
| `main` | 프로덕션 브랜치 | Firebase Hosting |
| `hotfix/*` | 긴급 운영 패치 (main 기반 분기) | Firebase Hosting |

---

### Sprint 배포 흐름

```
sprint{n}
  ↓ PR & merge → develop
develop ──── 로컬 검증 (npm run preview) ────
  ↓ PR & merge → main (QA 통과 후)
main    ──── GitHub Actions → Firebase Hosting 자동 배포
```

### Hotfix 배포 흐름

```
hotfix/*  (main 기반 분기)
  ↓ PR & merge → main
main    ──── GitHub Actions → Firebase Hosting 자동 배포
  ↓ 역머지
develop ──── main 변경사항 동기화
```

---

### 핵심 규칙

- `main` / `develop` 직접 push 금지 — 반드시 PR + 리뷰 후 merge
- `develop` → `main` merge는 로컬 QA 통과 후 진행
- 긴급 패치는 **`main` 기반**으로 `hotfix/*` 브랜치를 생성하여 작업
- hotfix PR은 **`main`으로 직접** 생성 (develop 거치지 않음)
- main merge 후 반드시 `develop`에 역머지하여 동기화
- hotfix 범위 제한: 파일 3개 이하, 코드 50줄 이하, 새 의존성(npm) 없음

---

## CI 파이프라인 (`.github/workflows/ci.yml`)

PR이 `develop` 또는 `main`으로 올라오면 GitHub Actions가 자동으로 실행됩니다.

### 트리거 조건

```yaml
on:
  pull_request:
    branches: [develop, main]
```

### CI 단계 (순서)

| 단계 | 명령어 | 목적 |
|------|--------|------|
| 1. 린트 | `npm run lint` | ESLint 규칙 준수 확인 |
| 2. 테스트 | `npm test` | Vitest 단위/컴포넌트 테스트 통과 확인 |
| 3. 빌드 | `npm run build` | Vite 프로덕션 빌드 성공 확인 |

### 커버리지 임계값 (vite.config.js 기준)

| 항목 | 최솟값 |
|------|--------|
| Lines | 75% |
| Functions | 70% |
| Branches | 65% |
| Statements | 75% |

### 필수 통과 조건

PR merge는 CI 3단계(lint → test → build)가 모두 통과된 후에만 가능합니다.
Branch Protection Rule에서 `ci` 워크플로우를 required status check로 설정합니다.

---

## E2E 파이프라인 (`.github/workflows/e2e.yml`)

`main` 브랜치에 push(merge)되면 배포 후 자동으로 Playwright E2E 검증이 실행됩니다.

### 트리거 조건

```yaml
on:
  push:
    branches: [main]
```

### E2E 단계 (순서)

1. Firebase Hosting 배포 완료 대기 (또는 배포 후 트리거)
2. Playwright 설치 (`npx playwright install --with-deps`)
3. E2E 테스트 실행 (`npx playwright test`)
4. 결과 아티팩트 업로드 (`playwright-report/`)

### E2E 테스트 파일 위치

```
e2e/
└── app.spec.js   # 핵심 사용자 플로우 검증 (캔버스 진입, 템플릿 선택 등)
```

---

## CD 파이프라인 — Firebase Hosting 배포

### develop merge 후 (스테이징 검증)

`develop` 브랜치는 별도 배포 서버 없이 **로컬에서 검증**합니다.

```bash
# 최신 코드 반영 후 프리뷰 빌드로 검증
git pull origin develop
npm run build
npm run preview
```

### main merge 후 (프로덕션 자동 배포)

`main` 브랜치에 merge되면 GitHub Actions가 자동으로:

1. `npm run build` 실행 → `dist/` 디렉터리 생성
2. `firebase deploy --only hosting` 실행
3. Firebase Hosting에 정적 파일 업로드

배포 완료 후 Firebase Hosting URL에서 서비스가 갱신됩니다.

### Firebase Hosting 관련 설정 파일

| 파일 | 용도 |
|------|------|
| `firebase.json` | Hosting 설정 (rewrites, headers 등) |
| `.firebaserc` | 프로젝트 ID 연결 |
| `dist/` | 빌드 결과물 (배포 대상) |

---

## 환경 설정 관리

| 환경 | 설정 방법 | 비고 |
|------|----------|------|
| 로컬 개발 | `.env` 파일 | Git 미추적 (`.gitignore`) |
| 프로덕션 (CI/CD) | GitHub Secrets | Actions에서 자동 주입 |

### GitHub Secrets 목록

| Secret 이름 | 설명 |
|------------|------|
| `FIREBASE_TOKEN` | Firebase CLI 배포 인증 토큰 |
| `VITE_FIREBASE_API_KEY` | Firebase Web API 키 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| 기타 `VITE_FIREBASE_*` | firebase.js에서 사용하는 환경변수 |

> `.env.example`을 참조하여 필요한 환경변수를 모두 Secrets로 등록해야 합니다.

---

## 롤백 절차

### Firebase Hosting 롤백

Firebase Console 또는 CLI에서 이전 배포 버전으로 즉시 롤백합니다.

```bash
# Firebase CLI로 이전 릴리스 목록 확인
firebase hosting:releases:list

# 특정 버전으로 롤백 (버전 ID는 위 명령으로 확인)
firebase hosting:rollback
```

### 코드 레벨 롤백

```bash
# main에서 문제 커밋을 되돌리는 revert PR 생성
git revert <commit-sha>
git push origin hotfix/revert-xxx
# → PR to main → merge → 자동 재배포
```
