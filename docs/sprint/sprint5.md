# Sprint 5: 공유 + UI 폴리싱

## 기본 정보

| 항목 | 내용 |
|------|------|
| 스프린트 번호 | 5 |
| 목표 | 공개 템플릿 공유 기능 + UI 폴리싱 (온보딩, 에러, 로딩) |
| 시작일 | 2026-03-15 |
| 상태 | 🔄 진행 중 |

---

## 목표 요약

Sprint 4에서 반응형 모바일 지원이 완료된 상태에서, Sprint 5는 두 가지 축으로 진행한다:

1. **공개 템플릿 공유**: 사용자가 자신의 작업물을 공개 링크로 공유할 수 있는 기능
2. **UI 폴리싱**: 코드 품질 리포트 기반의 사용성 개선 (온보딩 힌트, 로딩 상태, 에러 메시지)

---

## 태스크 목록

### 1. 공개 템플릿 공유

- ⬜ Firestore 템플릿 문서에 `isPublic` 플래그 필드 추가
- ⬜ 저장된 템플릿 모달(`SavedTemplatesModal`)에 공개/비공개 토글 UI 추가
- ⬜ 공개 템플릿 조회용 Firestore 쿼리 구현 (`isPublic == true`)
- ⬜ 공유 링크 생성 로직 구현 (`/share/{templateId}` 형태의 URL)
- ⬜ 공유 링크 접근 시 읽기 전용으로 템플릿 미리보기 페이지 구현
- ⬜ Firestore 보안 규칙 업데이트 (공개 템플릿은 비인증 사용자도 읽기 허용)

### 2. 모바일 미리보기

- ⬜ 저장된 작업물 목록을 모바일에서 조회하는 미리보기 전용 뷰 구현
- ⬜ 썸네일 이미지 표시 (캔버스 스냅샷 저장 또는 첫 로드 시 렌더링)
- ⬜ 작업물 클릭 시 에디터로 전환 (기존 불러오기 연결)

### 3. UI 폴리싱 — 온보딩 힌트

- ⬜ 빈 캔버스 진입 시 온보딩 오버레이 또는 힌트 배너 표시
  - "왼쪽 패널에서 템플릿을 선택하거나, 텍스트/도형 추가 버튼을 눌러 시작하세요" 안내
- ⬜ 온보딩 힌트는 첫 객체 추가 시 자동으로 사라지도록 처리
- ⬜ localStorage에 "힌트 확인 여부" 저장 (재방문 시 재표시 안 함)

### 4. UI 폴리싱 — 로딩 상태 개선

- ⬜ 저장 버튼 클릭 시 버튼 내 스피너 + "저장 중..." 텍스트 표시
- ⬜ 내보내기(PNG/PDF) 중 전체화면 오버레이 스피너 또는 진행 토스트 표시
- ⬜ 불러오기(템플릿 로드) 중 캔버스 영역에 로딩 인디케이터 표시
- ⬜ 로딩 완료 후 성공/실패 토스트 메시지 표시

### 5. UI 폴리싱 — 에러 메시지 구체화

- ⬜ `'저장 실패: ' + e.message` 패턴을 상황별 메시지로 교체:
  - 네트워크 오류: "네트워크 연결을 확인해 주세요."
  - 인증 만료: "로그인이 만료되었습니다. 다시 로그인해 주세요."
  - Firestore 쿼터 초과: "잠시 후 다시 시도해 주세요."
  - 일반 오류: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
- ⬜ 내보내기 실패 시 구체적인 에러 토스트 표시 (기존 `alert` 대체)
- ⬜ 에러 로깅 개선 (콘솔에 상세 스택 출력, 사용자에게는 간결한 메시지)

---

## 완료 기준 (Definition of Done)

- ⬜ 공유 링크 생성 후 비로그인 상태에서도 접근 및 미리보기 가능
- ⬜ Firestore 보안 규칙 테스트 통과 (공개 읽기 허용, 비공개 차단)
- ⬜ 빈 캔버스 진입 시 온보딩 힌트 표시, 이후 방문 시 미표시
- ⬜ 저장/내보내기 동작 중 명확한 로딩 피드백 제공
- ⬜ 에러 발생 시 사용자가 이해할 수 있는 메시지 표시
- ⬜ 모바일 미리보기에서 저장된 작업물 목록 조회 가능
- ⬜ ESLint 오류 0건, 빌드 성공

---

## 변경 예상 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/CanvasEditor.jsx` | 온보딩 힌트, 로딩 상태 UI |
| `src/components/Header.jsx` | 저장/내보내기 로딩 상태, 에러 메시지 구체화 |
| `src/components/SavedTemplatesModal.jsx` | `isPublic` 토글, 공유 링크 복사 버튼 |
| `src/utils/storage.js` | `isPublic` 필드 저장/수정 API, 공개 템플릿 조회 |
| `src/components/SharePage.jsx` (신규) | 공유 링크 접근 시 읽기 전용 미리보기 |
| `src/App.jsx` | `/share/:id` 라우트 추가 |
| `firestore.rules` | 공개 템플릿 읽기 허용 규칙 |

---

## 기술 고려사항

### 공유 링크 구현

- React Router v6 `useParams`로 `/share/:templateId` 처리
- 공개 템플릿 읽기는 Firestore 보안 규칙에서 `allow read: if resource.data.isPublic == true` 조건 추가
- 공유 페이지는 편집 불가(읽기 전용) 모드로 Fabric.js 캔버스 렌더링

### Firestore 데이터 구조 변경

```js
// templates/{uid}/userTemplates/{templateId}
{
  name: string,
  canvasJSON: string,
  isPublic: boolean,  // ← 신규 추가
  sharedAt: timestamp | null,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### 온보딩 힌트 조건

- `canvas.getObjects().length === 0` 이고 `localStorage.getItem('onboardingDone') !== 'true'`일 때 표시
- 객체가 추가되면 `localStorage.setItem('onboardingDone', 'true')` 저장 및 힌트 숨김

---

## 의존성

- 신규 npm 패키지 추가 없음
- React Router가 이미 설치되어 있다면 라우트만 추가, 미설치 시 `react-router-dom` 추가 필요 (설치 전 확인)

---

## 참고

- 이전 스프린트 문서: `docs/sprint/sprint4.md`
- 코드 리뷰 기준: `docs/dev-process.md` 섹션 7
