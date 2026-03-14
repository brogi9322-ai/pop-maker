# Sprint 4: 반응형 모바일 지원

## 목표

모바일 및 태블릿 환경에서 POP 제작기를 완전히 사용할 수 있도록 반응형 레이아웃 및 터치 인터랙션 구현.

## 기간

2026-03-15

## 브랜치

`sprint4` (develop 기반)

---

## 태스크 목록

### 1. 모바일 레이아웃 (App.jsx + App.css)
- ✅ `mobileTab` state 추가 ('left' | 'canvas' | 'right')
- ✅ 사이드바/캔버스에 `mobile-active` 클래스 조건부 적용
- ✅ 하단 네비게이션 바 (`.mobile-nav`) JSX 추가
- ✅ 미디어 쿼리 (≤768px): 사이드바 숨김, 캔버스 전체 너비
- ✅ 미디어 쿼리 (769~1024px): 사이드바 너비 축소

### 2. 터치 드래그 (CanvasEditor.jsx)
- ✅ 드래그 공통 로직 분리 (`startDragElement`, `moveDragElement`, `endDragElement`)
- ✅ `handleTouchStart` / `handleTouchMove` / `handleTouchEnd` 구현
- ✅ 텍스트/이미지 요소에 `onTouchStart` 연결

### 3. 기타
- ✅ 헤더 모바일 압축 스타일
- ✅ 캔버스 스크롤 영역 터치 스크롤 허용

---

## 완료 기준

- ✅ 모바일(375px)에서 하단 탭으로 패널/캔버스/속성 전환
- ✅ 모바일에서 요소 터치 드래그 동작
- ✅ 태블릿(768px)에서 3패널 레이아웃 유지
- ✅ `npm run build` 오류 없음
- ✅ `npm run lint` 경고 없음
- ✅ 테스트 60개 통과
- ✅ Firebase Hosting 배포 완료

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run build` | ✅ 성공 |
| `npm run lint` | ✅ 경고 없음 |
| `npm test` | ✅ 60개 통과 |
| Firebase Hosting 배포 | ✅ https://pop-maker-9209f.web.app |

---

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | mobileTab state, mobile-active 클래스, 하단 네비게이션 |
| `src/App.css` | 반응형 미디어 쿼리 (모바일/태블릿), 하단 네비 스타일 |
| `src/components/CanvasEditor.jsx` | 터치 드래그, 드래그 공통 로직 리팩토링 |
| `ROADMAP.md` | Sprint 4 상태 ✅ 업데이트, 진행률 85% |

---

## 코드 리뷰 결과

### 수정한 이슈
- 없음 (이미 머지됨, 다음 sprint에서 처리)

### 발견된 개선 사항 (다음 Sprint 개선 목록)
- 🟡 `src/utils/id.js`: `genId()`가 모듈 레벨 카운터(`nextId`) 방식으로 구현됨. 페이지 리프레시 없이 장시간 사용 시 카운터 누적, JSON 가져오기·내보내기 사이클에서는 `remapId`로 재생성하므로 충돌 없음. 향후 `crypto.randomUUID()` 또는 타임스탬프 기반으로 교체 권장
- 🟡 `src/App.jsx` Line 97: 캔버스 크기 버튼 `onClick`에 여러 `setState` 호출이 인라인으로 중첩되어 가독성 저하. 핸들러 함수로 분리 권장
- 🟡 `src/context/EditorContext.jsx`: `generateThumbnail`에서 catch 후 null 반환 — 섬네일 생성 실패 시 저장은 계속 진행되므로 동작상 문제 없으나, 사용자에게 무음 실패가 발생할 수 있음

### 보안 체크리스트 결과
- ✅ 하드코딩된 API 키/비밀번호 없음 (`VITE_` 환경변수 사용)
- ✅ `dangerouslySetInnerHTML` 미사용 (`contentEditable` 방식)
- ✅ Firebase 규칙 우회 로직 없음

### 잠재적 오류 체크리스트 결과
- ✅ null/undefined 접근: `?.` 옵셔널 체이닝 적절히 사용
- ✅ 비동기 처리: `handleImageUpload`, `handleSavePng` 등 모두 에러 핸들링 있음
- ✅ 메모리 누수: 터치·마우스 이벤트 리스너 모두 `end` 이벤트에서 제거
- ✅ 무한 루프: 없음 (useEffect 의존성 배열 적절히 관리)
- ✅ 엣지 케이스: 빈 elements 배열, template null 상태 모두 처리됨

---

## UI 리뷰 결과

### 체크 결과
- ✅ 디자인 시스템 CSS 변수 활용: 주요 색상, 간격, 그림자 등 변수 사용
- ✅ 다크 모드: `[data-theme="dark"]` 변수 재정의로 전환
- ✅ 빈 상태: `.no-select-msg`로 선택 없을 때 안내 메시지 표시
- ✅ 로딩 상태: `.saving-overlay`로 저장 중 표시
- ✅ 모바일 하단 네비게이션: `position: fixed`, `z-index: 200`, 3탭 구성
- ✅ 터치 영역: 모바일 네비 버튼 높이 60px (적절한 터치 타겟)
- ✅ 태블릿 레이아웃: `769~1024px`에서 사이드바 너비 축소 (200/220px)
- ⬜ 접근성: 이모지 전용 버튼에 `aria-label` 미적용 (하단 네비, 사이드바 탭 버튼 등)
- ⬜ CSS 변수 일관성: `.modal`, `.saved-template-*` 등 일부 컴포넌트에 하드코딩 색상 혼용

### 개선 제안 (미반영)
- 접근성: 하단 네비 버튼 (`📋 패널`, `🎨 캔버스`, `⚙️ 속성`)에 `aria-label` 추가 권장
- 접근성: 사이드바 탭 버튼에 `aria-selected`, `role="tab"` 추가 권장
- CSS 일관성: `App.css` 내 `.modal`, `.saved-template-*`, `.props-*` 섹션을 CSS 변수로 점진적 통일 권장
