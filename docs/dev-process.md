# 개발 프로세스 가이드

> **Single Source of Truth** — 검증 원칙, 개발 워크플로우, QA 기준이 이 문서 한 곳에 정의됩니다.
> CLAUDE.md, agent 파일, ci-policy.md는 이 문서를 참조합니다.

---

## 1. Git 브랜치 전략

| 브랜치 | 역할 | 배포 환경 |
|--------|------|----------|
| `sprint{n}` | 스프린트 단위 개발 | 로컬 |
| `develop` | 스테이징 통합 브랜치 | 로컬 검증 |
| `main` | 프로덕션 브랜치 | Firebase Hosting |
| `hotfix/*` | 긴급 운영 패치 | main + develop 역머지 |

### Sprint 흐름

```
sprint{n}  →  PR to develop  →  로컬 검증  →  PR to main  →  Firebase Hosting 자동 배포
```

### Hotfix 흐름

```
hotfix/*  →  PR to main  →  Firebase Hosting 배포  →  main을 develop에 역머지
```

---

## 2. Hotfix vs Sprint 의사결정

### Hotfix 추천 기준 (모두 충족 시)

- 프로덕션 장애/버그이거나, 변경 범위가 파일 3개 이하 & 코드 50줄 이하
- 새 의존성(npm) 추가 없음

### Sprint 추천 기준 (하나라도 해당 시)

- 새 기능 추가 또는 여러 모듈에 걸친 작업
- 새 의존성 추가 필요
- 파일 4개 이상 또는 코드 50줄 초과 변경

---

## 3. Sprint 프로세스

### 3.1 계획 (sprint-planner agent)

1. ROADMAP.md를 참조하여 스프린트 번호와 목표 확인
2. `docs/sprint/sprint{N}.md` 계획 문서 생성 (목표, 태스크 목록, 완료 기준 포함)
3. ROADMAP.md 해당 Sprint 상태를 🔄 진행 중으로 업데이트
4. `sprint{N}` 브랜치 생성 (`develop` 기반)

### 3.2 구현

- `sprint{N}` 브랜치에서 작업 (worktree 사용 금지)
- 커밋 전 섹션 7 코드 리뷰 체크리스트 통과 필수
- 새 컴포넌트/파일 추가 시 CLAUDE.md 디렉토리 구조 업데이트
- 새 npm 패키지 추가 시 `docs/setup-guide.md` 업데이트
- 환경변수 추가 시 `.env.example` 동기화

### 3.3 마무리 (sprint-close agent)

1. ROADMAP.md 상태 업데이트 (`🔄 진행 중` → `✅ 완료`)
2. `sprint{N}` → **develop** PR 생성 (main이 아닌 develop)
3. 섹션 7 체크리스트 기준으로 코드 리뷰 수행
4. 섹션 5 검증 매트릭스 기준으로 검증 실행
5. `docs/deploy-history/YYYY-MM-DD.md`에 완료 기록 저장 후 `deploy.md` 업데이트
6. PRD 기능 명세 업데이트 필요 여부 안내

> **참고**: `develop` → `main` merge는 별도 QA 통과 후 deploy-prod agent를 사용합니다.

---

## 4. Hotfix 프로세스

### 4.1 구현

- `main` 기반으로 `hotfix/{설명}` 브랜치 생성 (worktree 사용 금지)
- sprint-planner agent 사용하지 않음

### 4.2 마무리 (hotfix-close agent)

1. `hotfix/*` → **main** PR 생성
2. 변경 파일만 대상으로 경량 코드 리뷰 (섹션 7 보안 · 잠재적 오류 항목)
3. 섹션 5 검증 매트릭스의 Hotfix 컬럼 기준 검증 실행
4. `docs/deploy-history/YYYY-MM-DD.md`에 기록 후 `deploy.md` 업데이트
5. develop 역머지 안내

---

## 5. 검증 매트릭스

| 검증 항목 | Sprint | Hotfix | deploy-prod | 방식 |
|-----------|--------|--------|-------------|------|
| `npm run build` 성공 | ✅ | ✅ | — | 자동 |
| `npm run lint` 경고 없음 | ✅ | ✅ | — | 자동 |
| 로컬 `npm run dev` 정상 실행 | ✅ | ✅ | — | 수동 |
| 핵심 기능 수동 확인 (섹션 5.1) | ✅ 전체 | ✅ 변경분만 | — | 수동 |
| Firebase 배포 후 URL 접속 확인 | — | — | ✅ | 자동 |
| Firestore 읽기/쓰기 동작 확인 | ✅ | ⬜ 변경시 | — | 수동 |
| Firebase Storage 업로드 확인 | ⬜ 변경시 | ⬜ 변경시 | — | 수동 |
| UI 디자인/시각적 품질 판단 | ✅ | — | ✅ | 수동 |

### 5.1 핵심 기능 수동 확인 항목

**캔버스 편집:**
- 텍스트 추가 → 폰트·색상 편집 → 드래그 이동 → 리사이즈
- 이미지 업로드 → 리사이즈 → 회전
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) — 드래그 후 Undo 시 이전 위치 복원 확인
- 레이어 패널: 순서 재정렬, 잠금(드래그 불가 확인), 숨기기(캔버스 비표시 확인)
- 캔버스 크기 변경 (프리셋 + 직접 입력)

**저장/불러오기:**
- 작업물 저장 → 새로고침 → 불러오기 → 동일 상태 복원

**내보내기:**
- PNG 다운로드 → 파일 열어서 화질 확인
- PDF 다운로드 → 파일 열어서 크기/비율 확인

**인증:**
- 사업자번호 + ID 입력 → 밴플러스 배지 표시 → 약국 템플릿 접근 가능

### 5.2 검증 결과 기록

- 자동 검증 결과 → `deploy.md`에 즉시 기록
- 수동 검증 스크린샷 → `docs/sprint/sprint{N}/` 폴더에 저장
- `✅ 완료` / `⬜ 수동 검증 필요` 구분 표시

---

## 6. 배포 프로세스

### 6.1 로컬 빌드 검증

```bash
npm run build
npm run preview   # http://localhost:4173 에서 프로덕션 빌드 확인
```

### 6.2 Firebase Hosting 배포 (deploy-prod agent)

```bash
npm run build
firebase deploy --only hosting
```

배포 완료 후 제공 URL에서 접속 확인:
```
Hosting URL: https://{project-id}.web.app
```

### 6.3 Firebase Functions 배포 (관리자 API)

```bash
firebase deploy --only functions
```

### 6.4 전체 배포

```bash
firebase deploy   # hosting + functions 동시 배포
```

### 6.5 롤백

Firebase Console → Hosting → Release History → 원하는 버전 "Rollback" 클릭.

---

## 7. 코드 리뷰 체크리스트

sprint-close agent의 3단계 및 hotfix-close agent의 2단계에서 이 체크리스트를 사용합니다.
**커밋 전 변경된 파일 전체를 읽고** 아래 항목을 검토합니다. 문제가 발견되면 커밋 전에 즉시 수정합니다.

### 보안

- [ ] 하드코딩된 API 키, 비밀번호, 토큰 없음 (`.env`에만 존재해야 함)
- [ ] `dangerouslySetInnerHTML` 미사용 (XSS 방지)
- [ ] Firebase 보안 규칙 우회 가능한 로직 없음
- [ ] Claude API 키가 클라이언트 코드에 직접 노출되지 않음 (Firebase Functions 경유)
- [ ] 관리자 API는 Firebase Auth 토큰 검증 후에만 실행
- [ ] 사용자 입력값 검증 누락 없음 (사업자번호 형식, 파일 타입 등)

### 잠재적 오류

- [ ] null / undefined 접근으로 인한 런타임 에러 가능성 (`?.` optional chaining 활용)
- [ ] 비동기 처리 누락 (await 빠진 Promise, 에러 핸들링 없는 async 함수)
- [ ] Firebase 작업(Firestore 읽기/쓰기, Storage 업로드) try-catch 처리
- [ ] 메모리 누수 (이벤트 리스너 미제거, 클린업 없는 useEffect)
- [ ] 무한 루프 / 무한 리렌더링 가능성 (useEffect 의존성 배열 확인)
- [ ] 엣지 케이스 미처리 (빈 배열, 빈 문자열, 0, null 등)
- [ ] FileReader / Image 객체 오류 핸들러(`onerror`) 누락
- [ ] 대용량 이미지 업로드 시 메모리 문제 (파일 크기 제한 필요)

### 코드 품질

- [ ] 사용하지 않는 import / 변수 없음
- [ ] 컴포넌트 파일명 PascalCase, 훅/유틸 파일명 camelCase 준수
- [ ] Firebase 관련 로직은 `src/utils/` 또는 `src/hooks/`에 분리 (컴포넌트에 Firebase 직접 호출 지양)
- [ ] 반복되는 로직은 유틸 함수로 추출 (단, 1회성 사용이면 인라인 유지)

### Firebase 특이 사항

- [ ] Firestore 쿼리에 불필요한 전체 컬렉션 읽기 없음 (쿼터 절약)
- [ ] Storage 업로드 파일에 적절한 Content-Type 메타데이터 설정
- [ ] Firestore 문서 크기 제한 확인 (단일 문서 1MB 이하)
- [ ] 이미지 데이터(base64)를 Firestore에 직접 저장하지 않고 Storage URL 참조

---

## 8. 문서 관리 규칙

### 8.1 deploy.md

- **목적**: 현재 미완료 수동 검증 항목만 유지
- sprint-close/hotfix-close 완료 시 이전 완료 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동
- 체크리스트 형식: 완료 `✅`, 미완료 `⬜`

### 8.2 docs/deploy-history/

- 날짜별 배포/검증 기록 아카이브
- 파일명: `YYYY-MM-DD.md` (해당 날짜의 모든 기록)

### 8.3 docs/prd.md

- 기능 추가/변경/삭제 시 해당 섹션(기능 명세, 데이터 모델) 업데이트
- 상태 필드: `✅ 완료` / `⬜ 예정` / `📋 예정(장기)`

### 8.4 docs/setup-guide.md

- 새 npm 패키지 추가 시 관련 섹션 업데이트
- 환경변수 추가 시 `.env.example` 및 섹션 3 동기화
- Firebase 서비스 추가 시 관련 설정 섹션 추가

### 8.5 Sprint 문서

- 계획/완료 문서: `docs/sprint/sprint{N}.md`
- 첨부 파일 (스크린샷, 보고서): `docs/sprint/sprint{N}/`

### 8.6 CLAUDE.md

- 새 컴포넌트/파일 추가 시 디렉토리 구조 섹션 업데이트
- 새 개발 규칙/컨벤션 추가 시 해당 섹션 업데이트

### 8.7 문서 최신화 트리거

| 변경 사항 | 업데이트 대상 | 담당 |
|-----------|--------------|------|
| 새 스프린트 완료 | `ROADMAP.md` 상태, `sprint-planner` 에이전트 MEMORY.md | sprint-close agent |
| 새 기능 추가/변경 | `docs/prd.md` 기능 명세 | sprint-close agent |
| 데이터 모델 변경 | `docs/prd.md` 데이터 모델 섹션 | 해당 스프린트 작업자 |
| 새 컴포넌트/파일 추가 | `CLAUDE.md` 디렉토리 구조 | 해당 스프린트 작업자 |
| 환경변수/의존성 추가 | `docs/setup-guide.md`, `.env.example` | 해당 스프린트 작업자 |
| 검증 원칙 변경 | `docs/dev-process.md` 섹션 5 | 직접 수정 |
| 에이전트 워크플로우 변경 | `.claude/agents/*.md` 해당 파일 | 직접 수정 |
| 배포 완료 | `docs/deploy-history/YYYY-MM-DD.md` | deploy-prod agent |

---

## 9. 에이전트 활용 가이드

이 프로젝트는 Claude Code 에이전트를 활용하여 개발 프로세스를 자동화합니다.

### 9.1 sprint-planner

**사용 시점**: 새 스프린트 시작 전 계획 수립 시

**수행 작업**:
1. ROADMAP.md에서 다음 스프린트 번호와 P0 항목 파악
2. 구현 범위 분석 — Hotfix vs Sprint 판단 (섹션 2 기준)
3. `docs/sprint/sprint{N}.md` 생성 (목표, 태스크 목록, 완료 기준, 수정 파일 목록)
4. ROADMAP.md Sprint 상태를 🔄로 업데이트
5. `develop` 기반으로 `sprint{N}` 브랜치 생성

**참고 파일**: `ROADMAP.md`, `docs/prd.md`, `.claude/agents/sprint-planner.md`

### 9.2 sprint-close

**사용 시점**: 스프린트 구현 완료 후 마무리 시

**수행 작업**:
1. 섹션 7 코드 리뷰 체크리스트 전 항목 수행
2. 섹션 5 검증 매트릭스 Sprint 컬럼 실행
3. ROADMAP.md 상태 `✅ 완료`로 업데이트
4. `sprint{N}` → `develop` PR 생성 (main이 아닌 develop)
5. `docs/prd.md` 기능 명세 상태 업데이트
6. 스프린트 완료 기록을 `docs/deploy-history/`에 이동

**참고 파일**: `docs/dev-process.md`, `.claude/agents/sprint-close.md`

### 9.3 hotfix-close

**사용 시점**: 핫픽스 구현 완료 후 마무리 시

**수행 작업**:
1. 변경 파일 대상 경량 코드 리뷰 (섹션 7 보안 · 잠재적 오류 항목)
2. 섹션 5 검증 매트릭스 Hotfix 컬럼 실행
3. `hotfix/*` → `main` PR 생성
4. `deploy.md` 업데이트
5. develop 역머지 안내

**참고 파일**: `docs/dev-process.md`, `.claude/agents/hotfix-close.md`

### 9.4 deploy-prod

**사용 시점**: `develop` → `main` merge 후 프로덕션 배포 시

**수행 작업**:
1. `npm run build` 성공 확인
2. `firebase deploy` 실행
3. 배포 URL 접속 확인
4. Firebase Console에서 Functions 상태 확인 (Functions 배포 포함 시)
5. `docs/deploy-history/YYYY-MM-DD.md`에 배포 기록 저장

**참고 파일**: `docs/setup-guide.md`, `.claude/agents/deploy-prod.md`

### 9.5 prd-to-roadmap

**사용 시점**: PRD 내용 기반으로 ROADMAP.md를 재구성하거나 새 기능을 스프린트에 배정할 때

**수행 작업**:
1. `docs/prd.md` 기능 명세 분석
2. 미완료 항목 우선순위 파악 (P0 → P1 → P2)
3. 현재 진행 중인 스프린트 범위에 맞으면 기존 스프린트에 추가
4. 범위를 벗어나면 다음 스프린트 번호로 신규 배정
5. ROADMAP.md 업데이트

**참고 파일**: `docs/prd.md`, `ROADMAP.md`, `.claude/agents/prd-to-roadmap.md`
