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
| Sprint 3 | Firebase Hosting 배포 + 내보내기 최적화 + JSON 가져오기/내보내기 | ✅ 완료 | 2026-03-15 |
| Sprint 4 | 반응형 모바일 지원 + 터치 드래그 + Context API 리팩토링 | ✅ 완료 | 2026-03-15 |
| Sprint 5 | 공개 템플릿 공유 + UI 폴리싱 (온보딩, 에러, 로딩) | ✅ 완료 | 2026-03-15 |
| Sprint 6 | 모바일 미리보기 + AI 이미지 생성 (Claude API + Functions) | ⬜ 예정 | — |

**다음 스프린트 번호: 6**

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

## 다음 스프린트(Sprint 6) 주요 항목

- 모바일 미리보기 (저장된 작업물 조회 전용 뷰, 썸네일 표시) — Sprint 5 이월
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)
- Firebase Blaze 플랜 전환 필요
- 생성된 이미지를 캔버스 요소로 삽입
- Firestore 보안 규칙 파일 업데이트 적용
- SharePage 인라인 스타일 CSS 변수 마이그레이션 (Medium 이슈)
