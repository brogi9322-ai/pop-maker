# Sprint 3: 내보내기 최적화 + Firebase Hosting 배포

## 목표

MVP 배포 마일스톤 달성. PNG/PDF 내보내기 품질 및 속도 개선, JSON 템플릿 포터블 포맷 지원, Firebase Hosting을 통한 프로덕션 배포 설정.

## 기간

2026-03-15

## 브랜치

`sprint3` (develop 기반)

---

## 태스크 목록

### 1. PNG 내보내기 최적화
- ✅ `App.jsx` — `captureCanvas(scale)` 공용 유틸 구현 (html2canvas scale:2)
- ✅ `App.jsx` — `handleSavePng` 개선: 날짜 포함 파일명, 성공 토스트
- ✅ 내보내기 중 saving 오버레이 표시

### 2. PDF 내보내기 품질 개선
- ✅ `App.jsx` — `handleSavePdf` 개선: `unit: 'mm'` + px→mm 변환 (96dpi: `px * 25.4 / 96`)
- ✅ 날짜 포함 파일명 (`pop_YYYY-MM-DD.pdf`)

### 3. JSON 템플릿 내보내기/가져오기
- ✅ `Header.jsx` — JSON 내보내기/가져오기 버튼 추가
- ✅ `App.jsx` — `handleExportJson()` 구현 (Blob → a download)
- ✅ `App.jsx` — `handleImportJson(file)` 구현 (FileReader, 유효성 검증, id 재채번, 10MB 제한)
- ✅ 엣지 케이스 처리: 손상된 JSON → toast.error, elements 누락 → toast.error

### 4. Firebase Hosting 배포 설정
- ✅ `firebase.json` 생성 (SPA rewrites 포함)
- ✅ `.firebaserc` 생성 (프로젝트 ID: pop-maker-9209f)
- ✅ `package.json` — `"deploy"` 스크립트 추가
- ✅ `npm run build && firebase deploy --only hosting` 성공
- ✅ Firebase Hosting URL 정상 동작: https://pop-maker-9209f.web.app

### 5. 추가 구현 (Sprint 3 범위 확장)
- ✅ 템플릿 클릭 시 기본 텍스트 캔버스 중앙에 자동 배치
- ✅ 기본 캔버스 사이즈 300×300px (POP 규격)
- ✅ 직접 입력 텍스트박스에 현재 사이즈 미리 표시
- ✅ 인라인 텍스트 편집 (더블클릭 → contentEditable)
- ✅ 더블 텍스트 버그 수정 (contentEditable DOM 클리어)
- ✅ 캔버스 경계 이탈 방지 (드래그 클램핑)
- ✅ 캔버스 사이즈 변경 시 요소 비율 유지 이동 (`scaleElementsToNewSize`)
- ✅ Ctrl+C / Ctrl+V 복사·붙여넣기 (+10px 오프셋)
- ✅ Delete / Backspace 키로 요소 삭제
- ✅ 저장 시 이름 수정 가능 (currentDocName 기본값)
- ✅ Firebase 미설정 시 toast 알림
- ✅ 에셋 패널 (`AssetPanel.jsx`) — 약국 SVG 아이콘 23개 (5카테고리)
- ✅ 정렬 아이콘 SVG 라인 스타일 (Word/Excel 스타일)
- ✅ 토스트 UI (`useToast` + `Toast.jsx`)
- ✅ 디자인 시스템 (CSS 변수 + 다크모드 `data-theme="dark"`)

---

## 완료 기준

- ✅ PNG 내보내기: A4(794×1123px) 기준 3초 이내 완료
- ✅ PDF 내보내기: mm 단위 변환으로 인쇄 비율 정확
- ✅ JSON 내보내기: 작업물을 `.json` 파일로 저장 가능
- ✅ JSON 가져오기: 내보낸 `.json` 파일을 다시 불러와 동일한 캔버스 재현
- ✅ `firebase.json` / `.firebaserc` 생성 완료
- ✅ `npm run build && firebase deploy --only hosting` 성공
- ✅ Firebase Hosting URL에서 앱 정상 동작 확인
- ✅ `npm run build` 오류 없음
- ✅ 코드 리뷰 완료

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run build` | ✅ 성공 |
| Firebase Hosting 배포 | ✅ 성공 (https://pop-maker-9209f.web.app) |
| 코드 리뷰 | ✅ 완료 |

수동 검증 상세: `docs/deploy-history/2026-03-15-sprint3.md` 참조

---

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | captureCanvas, handleSavePng/Pdf 개선, handleExportJson/ImportJson, Ctrl+C/V, 사이즈 비례 이동, 에셋 핸들러 등 |
| `src/components/CanvasEditor.jsx` | 인라인 텍스트 편집, 드래그 경계 클램핑 |
| `src/components/Header.jsx` | JSON 내보내기/가져오기 버튼 |
| `src/components/AssetPanel.jsx` | 신규 — 에셋 패널 |
| `src/components/Toast.jsx` | 신규 — 토스트 UI |
| `src/components/PropsPanel.jsx` | 정렬 아이콘 SVG 교체 |
| `src/data/assets.js` | 신규 — SVG 에셋 23개 |
| `src/hooks/useToast.js` | 신규 — 토스트 훅 |
| `src/App.css` | 에셋 패널 스타일, 디자인 시스템 CSS 변수, 다크모드 |
| `firebase.json` | 신규 — Firebase Hosting 설정 |
| `.firebaserc` | 신규 — Firebase 프로젝트 연결 |
| `package.json` | deploy 스크립트 추가 |
| `ROADMAP.md` | Sprint 3 상태 업데이트 |
