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
| Sprint 6 | 테스트 커버리지 확대 + CI/CD 개선 | 🔄 진행 중 | — |

**다음 스프린트 번호: 7**

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

## Sprint 6 계획 요약 (2026-03-15)

### 목표: 테스트 커버리지 확대 + CI/CD 개선

피드백 점수 개선: 테스트(4/8→7/8), CI/CD(3/7→6/7)

### 추가 예정 테스트 파일 (우선순위 순)

| 우선순위 | 파일 | 주요 테스트 항목 |
|---------|------|----------------|
| P0 | `src/utils/id.test.js` | genId 접두사, 고유성 |
| P0 | `src/utils/storage.test.js` | validateBizNumber, formatBizNumber, getUserId, Firestore CRUD (vi.mock) |
| P1 | `src/components/BanplusModal.test.jsx` | 폼 입력, 유효성 검사, onLogin/onClose 호출 |
| P1 | `src/components/SavedTemplatesModal.test.jsx` | 탭 전환, 공개 토글, 링크 복사, 삭제 |
| P2 | `src/components/LayerPanel.test.jsx` | 잠금/숨기기/이름 변경, DnD |

### CI 개선 항목

- `npm test` → `npm run test:coverage` 교체
- 커버리지 artifact 업로드 (`actions/upload-artifact@v4`)
- `vite.config.js` 커버리지 임계값 추가 (lines 60%)

### Firebase 목킹 패턴 (확립 예정)

`vi.mock('../firebase')` + `vi.mock('firebase/firestore')` 두 레벨 목킹 필요.
`serverTimestamp()`도 mock 반환값 설정 필요.

### Sprint 7 예정 (이번 Sprint 범위 아님)

- 모바일 미리보기 전용 뷰 (Sprint 5 이월)
- AI 이미지 생성 (Claude API + Firebase Functions 프록시)
- Firebase Blaze 플랜 전환
- Firestore 보안 규칙 파일 업데이트
- SharePage CSS 변수 마이그레이션
