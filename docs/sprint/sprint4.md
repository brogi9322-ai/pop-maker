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
