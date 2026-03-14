# pop-maker (POP 제작기)

AI 해커톤 프로젝트. 캔버스 기반 POP(Point of Purchase) 광고물 제작 웹 앱.

## 저장소

- **원격 저장소**: https://github.com/brogi9322-ai/pop-maker.git

## 기술 스택

- **프레임워크**: React 19 + Vite 8
- **캔버스**: Fabric.js 7
- **백엔드**: Firebase (Authentication, Firestore)
- **내보내기**: html2canvas + jsPDF

## 주요 명령어

```bash
npm run dev       # 개발 서버 실행 (localhost:5173)
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint 실행
```

## 디렉토리 구조

```
src/
├── components/
│   ├── CanvasEditor.jsx      # Fabric.js 캔버스 편집기 (핵심)
│   ├── TemplatePanel.jsx     # 템플릿 선택 패널
│   ├── PropsPanel.jsx        # 객체 속성 편집 패널
│   ├── Header.jsx            # 헤더 (저장/내보내기 버튼)
│   ├── BanplusModal.jsx      # 반플러스 관련 모달
│   └── SavedTemplatesModal.jsx  # 저장된 템플릿 모달
├── hooks/
│   └── useAuth.js            # Firebase 인증 훅
├── utils/
│   └── storage.js            # Firestore 저장/불러오기 유틸
├── data/
│   └── templates.js          # 기본 템플릿 데이터
├── firebase.js               # Firebase 초기화
├── App.jsx                   # 루트 컴포넌트
└── main.jsx                  # 엔트리포인트
```

## 언어 및 커뮤니케이션 규칙

- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)

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

- 체크리스트 작성 형식:
  - 완료 항목: `- ✅ 항목 내용`
  - 미완료 항목: `- ⬜ 항목 내용`

## 컨벤션

- 컴포넌트 파일명: PascalCase (`.jsx`)
- 훅/유틸/데이터 파일명: camelCase (`.js`)
- Firebase 설정은 `src/firebase.js`에서 관리 (`VITE_` 환경변수 사용)
- Fabric.js 캔버스 인스턴스는 `CanvasEditor` 컴포넌트 내부에서 ref로 관리
