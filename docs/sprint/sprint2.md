# Sprint 2: 핵심 UX 기능

## 목표

Phase 1 메인 에디터 완성을 위한 핵심 UX 기능 구현 (P0 항목 전부).

## 기간

2026-03-15

## 브랜치

`sprint2` (develop 기반)

---

## 태스크 목록

### 1. Undo/Redo
- ✅ `src/hooks/useHistory.js` 커스텀 훅 구현
  - `pushSnapshot` / `setElements` / `commitDrag` / `undo` / `redo`
  - 최대 50단계 스택
- ✅ `App.jsx` 통합 — addText, handleDelete 등 이산 액션에 `pushSnapshot`
- ✅ `CanvasEditor.jsx` — mouseUp/resizeUp 시 `commitDrag` 호출
- ✅ `Header.jsx` — ↩/↪ 버튼 추가
- ✅ Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y 단축키 등록

### 2. 레이어 패널
- ✅ `src/components/LayerPanel.jsx` 컴포넌트 구현
  - zIndex 역순 표시
  - 이름 더블클릭 편집
  - 잠금/숨기기 토글
  - HTML5 드래그로 순서 재정렬
- ✅ `App.jsx` — onReorder / onToggleLock / onToggleHide / onRename 핸들러
- ✅ `CanvasEditor.jsx` — locked 요소 드래그 차단, hidden 요소 렌더링 스킵
- ✅ elements에 `name`, `locked`, `hidden` 속성 추가

### 3. 좌측 탭 전환
- ✅ `App.jsx` — `leftTab` state 추가 ('template' | 'layer')
- ✅ `App.css` — `.sidebar-tab-bar` / `.sidebar-tab-btn` 스타일

### 4. 캔버스 직접 입력
- ✅ `App.jsx` — 너비/높이 number input + 적용 버튼
- ✅ `App.css` — `.custom-size-*` 스타일
- ✅ 유효성 검사 (100~2000px)

---

## 완료 기준

- ✅ 텍스트/이미지 추가 → Ctrl+Z undo → Ctrl+Shift+Z redo 동작
- ✅ 드래그 후 Ctrl+Z → 드래그 전 위치 복원 (중간 위치 아님)
- ✅ 레이어 패널 드래그 재정렬 → 캔버스 zIndex 반영
- ✅ 레이어 잠금 → 캔버스 드래그/리사이즈 불가
- ✅ 레이어 숨기기 → 캔버스 비표시
- ✅ 좌측 탭 전환 (템플릿 ↔ 레이어)
- ✅ 직접 입력: 500×500 → 캔버스 크기 변경

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run build` | ✅ 성공 |
| `npm run lint` | ✅ 경고 없음 |
| 코드 리뷰 | ✅ 완료 (lint 오류 2건 수정) |

수동 검증 상세: `docs/deploy-history/2026-03-15.md` 참조

---

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useHistory.js` | 신규 — Undo/Redo 훅 |
| `src/components/LayerPanel.jsx` | 신규 — 레이어 패널 |
| `src/App.jsx` | useHistory 통합, 탭, 직접 입력, 레이어 핸들러 |
| `src/App.css` | 탭, 레이어 패널, 직접 입력 스타일 |
| `src/components/CanvasEditor.jsx` | commitDrag prop, locked/hidden 처리 |
| `src/components/Header.jsx` | undo/redo 버튼 추가 |
| `ROADMAP.md` | Sprint 2 상태 🔄 업데이트 |
