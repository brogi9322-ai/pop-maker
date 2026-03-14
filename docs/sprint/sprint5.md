# Sprint 5: 공유 + UI 폴리싱

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 5 |
| 목표 | 공개 템플릿 공유 기능 + UI 폴리싱 (온보딩, 에러, 로딩) |
| 시작일 | 2026-03-15 |
| 완료일 | 2026-03-15 |
| 상태 | ✅ 완료 |

---

## 목표 요약

Sprint 4에서 반응형 모바일 지원이 완료된 상태에서, Sprint 5는 두 가지 축으로 진행한다:

1. **공개 템플릿 공유**: 사용자가 자신의 작업물을 공개 링크로 공유할 수 있는 기능
2. **UI 폴리싱**: 코드 품질 리포트 기반의 사용성 개선 (온보딩 힌트, 로딩 상태, 에러 메시지)

---

## 태스크 목록

### 1. 공개 템플릿 공유

- ✅ Firestore 템플릿 문서에 `isPublic` 플래그 필드 추가
- ✅ 저장된 템플릿 모달(`SavedTemplatesModal`)에 공개/비공개 토글 UI 추가
- ✅ 공개 템플릿 조회용 Firestore 쿼리 구현 (`isPublic == true`)
- ✅ 공유 링크 생성 로직 구현 (`/share/{templateId}` 형태의 URL)
- ✅ 공유 링크 접근 시 읽기 전용으로 템플릿 미리보기 페이지 구현
- ⬜ Firestore 보안 규칙 업데이트 (공개 템플릿은 비인증 사용자도 읽기 허용) — 클라이언트 측 isPublic 체크로 부분 구현, 실제 Firestore Rules 파일 업데이트는 다음 Sprint에서 배포 시 반영

### 2. 모바일 미리보기

- ⬜ 저장된 작업물 목록을 모바일에서 조회하는 미리보기 전용 뷰 구현 — 범위 축소, 다음 Sprint로 이월
- ⬜ 썸네일 이미지 표시 (캔버스 스냅샷 저장 또는 첫 로드 시 렌더링) — 이월
- ⬜ 작업물 클릭 시 에디터로 전환 (기존 불러오기 연결) — 이월

### 3. UI 폴리싱 — 온보딩 힌트

- ✅ 빈 캔버스 진입 시 온보딩 오버레이 또는 힌트 배너 표시
- ✅ 온보딩 힌트는 첫 객체 추가 시 자동으로 사라지도록 처리
- ✅ localStorage에 "힌트 확인 여부" 저장 (재방문 시 재표시 안 함)

### 4. UI 폴리싱 — 로딩 상태 개선

- ✅ 저장 버튼 클릭 시 버튼 내 "저장 중..." 텍스트 표시
- ✅ 내보내기(PNG/PDF) 중 전체화면 오버레이 + 진행 메시지 표시
- ✅ 로딩 완료 후 성공/실패 토스트 메시지 표시

### 5. UI 폴리싱 — 에러 메시지 구체화

- ✅ Firebase 에러 코드 → 상황별 사용자 친화적 메시지 변환 함수 (`getErrorMessage`) 구현
  - 네트워크 오류: "네트워크 연결을 확인해 주세요."
  - 인증 만료: "로그인이 만료되었습니다. 다시 로그인해 주세요."
  - Firestore 쿼터 초과: "잠시 후 다시 시도해 주세요."
  - 일반 오류: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
- ✅ 내보내기 실패 시 구체적인 에러 토스트 표시 (기존 `alert` 대체)
- ✅ 에러 로깅 개선 (EditorContext, SavedTemplatesModal 전반)

---

## 완료 기준 (Definition of Done)

- ✅ 공유 링크 생성 후 비로그인 상태에서도 접근 및 미리보기 가능
- ⬜ Firestore 보안 규칙 테스트 통과 (공개 읽기 허용, 비공개 차단) — 다음 배포 시 규칙 파일 적용 필요
- ✅ 빈 캔버스 진입 시 온보딩 힌트 표시, 이후 방문 시 미표시
- ✅ 저장/내보내기 동작 중 명확한 로딩 피드백 제공
- ✅ 에러 발생 시 사용자가 이해할 수 있는 메시지 표시
- ⬜ 모바일 미리보기에서 저장된 작업물 목록 조회 가능 — Sprint 6으로 이월
- ✅ ESLint 오류 0건, 빌드 성공

---

## 실제 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Header.jsx` | 저장/내보내기 로딩 상태 (savingOp 기반 버튼 텍스트 변경) |
| `src/components/SavedTemplatesModal.jsx` | `isPublic` 토글, 공유 링크 복사 버튼, 에러 메시지 구체화 |
| `src/utils/storage.js` | `isPublic` 필드 저장/수정 API (`updateTemplateVisibility`), 공개 템플릿 단건 조회 (`getPublicTemplate`) |
| `src/components/SharePage.jsx` (신규) | 공유 링크 접근 시 읽기 전용 미리보기 페이지 |
| `src/App.jsx` | `/share/:id` 라우트 추가, EditorContext 분리, `showOnboarding` 상태 |
| `src/context/EditorContext.jsx` (신규) | 에디터 상태·핸들러 Context 분리, `getErrorMessage` 에러 변환 함수, `savingOp` 로딩 상태, `onboardingDone` 온보딩 힌트 |
| `src/main.jsx` | BrowserRouter 추가 |
| `src/App.css` | 온보딩 힌트 스타일, saving-overlay 스타일, 공유 버튼 레이아웃 스타일 추가 |

---

## 코드 리뷰 결과 (2026-03-15)

### Critical 수정 사항

- ✅ `SavedTemplatesModal.jsx`: `handleCopyLink` 성공 시 사용자 피드백 없음 → `copiedId` 상태 추가, "✅ 복사됨" 버튼 텍스트로 피드백 제공 (2초 후 복원)

### High — 검토 완료 (이슈 없음)

- `null`/`undefined` 방어 코드: `canvasData?.`, `elements || []`, `snap.exists()` 확인 — 양호
- 비동기 처리: 모든 async/await 및 try/catch 정상 — 양호
- 메모리 누수: keydown 이벤트 리스너 cleanup 존재 — 양호

### Medium — 다음 Sprint 개선 사항

- `SharePage.jsx` 스타일에 CSS 변수 대신 하드코딩 색상값 사용 (`#1e293b`, `#f0f4f8` 등) — 다음 Sprint에서 CSS 변수 마이그레이션 권장
- `SavedTemplatesModal.jsx`의 `myUserId` 계산 시 `isBanplus && !bizNumber` 엣지 케이스 — 실제 사용 시나리오에서는 bizNumber가 항상 존재하므로 현재는 무해하나 방어 코드 추가 권장

---

## UI 리뷰 결과 (2026-03-15)

### 디자인 시스템 준수
- 메인 앱(`App.jsx`, `Header.jsx`): CSS 변수 적절히 사용 — 양호
- `SharePage.jsx`: 인라인 스타일에 하드코딩 색상 사용 (Medium 이슈로 기록)
- 버튼 클래스 체계 (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-sm`): 일관성 유지 — 양호

### 컴포넌트 상태 처리
- 빈 상태: `SavedTemplatesModal`에 "저장된 템플릿이 없습니다." 안내 존재 — 양호
- 로딩 상태: `saving-overlay`, 버튼 "저장 중..." 텍스트 표시 — 양호
- 에러 상태: 토스트 에러 메시지 — 양호
- 성공 피드백: 저장/PNG/PDF/JSON 완료 시 toast.success — 양호

### 인터랙션 품질
- 버튼 hover/active 스타일: `.btn:hover`, `.btn:active` 전역 정의 — 양호
- disabled 상태: opacity + cursor 처리 — 양호
- 아이콘 버튼 aria-label: 다크모드 토글 버튼에 aria-label 존재 — 양호

---

## 자동 검증 결과

| 항목 | 결과 |
|------|------|
| ESLint | ✅ 오류 0건 |
| 빌드 (Vite) | ✅ 성공 |
| 테스트 | 해당 없음 (테스트 파일 미존재) |

---

## 변경 예상 파일 (계획 대비)

| 계획 파일 | 실제 구현 | 비고 |
|----------|----------|------|
| `src/components/CanvasEditor.jsx` | 미변경 | 온보딩 힌트는 App.jsx에서 처리 |
| `src/components/Header.jsx` | ✅ 변경 | |
| `src/components/SavedTemplatesModal.jsx` | ✅ 변경 | |
| `src/utils/storage.js` | ✅ 변경 | |
| `src/components/SharePage.jsx` (신규) | ✅ 신규 생성 | |
| `src/App.jsx` | ✅ 변경 | |
| `firestore.rules` | ⬜ 미적용 | 다음 배포 시 반영 필요 |

---

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint4.md`
- 코드 리뷰 기준: `docs/dev-process.md` 섹션 7
