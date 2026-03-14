# Sprint 3: 내보내기 최적화 + Firebase Hosting 배포

## 목표

MVP 배포 마일스톤 달성. PNG/PDF 내보내기 품질 및 속도 개선, JSON 템플릿 포터블 포맷 지원, Firebase Hosting을 통한 프로덕션 배포 설정.

## 기간

2026-03-15 ~

## 브랜치

`sprint3` (develop 기반)

---

## 구현 범위

| 태스크 | 우선순위 | 예상 변경 파일 수 |
|--------|----------|-----------------|
| PNG 내보내기 최적화 (3초 이내) | P0 | 1~2 |
| PDF 내보내기 품질 개선 | P0 | 1~2 |
| JSON 템플릿 내보내기/가져오기 | P0 | 2~3 |
| Firebase Hosting 배포 설정 | P0 | 3~4 |

---

## 태스크 분해

### 1. PNG 내보내기 최적화

**현재 구현** (`src/App.jsx` `handleSavePng`):
```js
const c = await html2canvas(canvas, { scale: 2, useCORS: true });
```
- html2canvas를 매번 동적 import하여 렌더링 → 대형 캔버스에서 3초 초과 가능
- html2canvas는 DOM 재렌더링 방식이므로 Fabric.js 캔버스 엘리먼트 직접 추출보다 느림

**개선 방향**:
- 캔버스 DOM 엘리먼트(`<canvas>`)가 이미 존재하므로 `canvas.toDataURL('image/png')`로 직접 추출하는 1차 시도
- html2canvas는 배경 스타일(gradient, 배경색 등)이 별도 DOM에 있을 경우에만 폴백으로 사용
- `CanvasEditor.jsx`에 `exportPng()` 메서드 추가 (ref 노출), App에서 호출

**태스크 목록**:
- ⬜ `CanvasEditor.jsx` — `exportPng(scale)` 메서드 구현 (canvas.toDataURL 방식)
- ⬜ `App.jsx` — `handleSavePng` 개선: `canvasRef.current.exportPng(2)` 우선 호출, 실패 시 html2canvas 폴백
- ⬜ 내보내기 중 로딩 상태 표시 (saving 오버레이 또는 버튼 비활성화)
- ⬜ 성능 측정: 300×300px / 600×600px / A4(794×1123px) 기준 내보내기 시간 3초 이내 확인

### 2. PDF 내보내기 품질 개선

**현재 구현** (`src/App.jsx` `handleSavePdf`):
```js
const pdf = new jsPDF({
  unit: 'px',
  format: [canvasSize.width, canvasSize.height],
});
pdf.addImage(imgData, 'PNG', 0, 0, canvasSize.width, canvasSize.height);
```
- `unit: 'px'`는 jsPDF 내부에서 72dpi 기준 변환 → 인쇄 시 실제 크기 불일치 가능
- 고해상도 이미지가 jsPDF에서 압축되어 선명도 저하 가능

**개선 방향**:
- `unit: 'mm'`로 전환 후 캔버스 px → mm 변환 (96dpi 기준: 1px = 0.2646mm)
- JPEG 압축 대신 PNG 유지 또는 JPEG quality 0.95 이상 설정
- A4 출력 시 캔버스 비율 유지한 상태로 페이지 중앙 배치

**태스크 목록**:
- ⬜ `App.jsx` — `handleSavePdf` 개선: `unit: 'mm'` + px→mm 변환 계산
- ⬜ A4 프리셋 선택 시 PDF 페이지 크기를 A4(210×297mm)로 맞추는 옵션 추가
- ⬜ 내보내기 품질 검증: A4 PDF 인쇄 미리보기 기준 선명도 확인

### 3. JSON 템플릿 내보내기/가져오기

**canvasData 구조** (기존 Firestore 저장 포맷 활용):
```js
{
  template: { id, name, background, ... },
  canvasSize: { label, width, height },
  elements: [{ id, type, x, y, width, height, ... }]
}
```
- 이 구조를 그대로 `.json` 파일로 내보내고, 다시 가져와 `handleLoadTemplate`과 동일한 흐름으로 복원
- 파일 가져오기 시 요소 id 충돌 방지: 가져온 elements의 id를 새로 채번

**태스크 목록**:
- ⬜ `Header.jsx` — 내보내기 드롭다운에 "JSON 저장" 버튼 추가
- ⬜ `App.jsx` — `handleExportJson()` 구현
  - `JSON.stringify({ template, canvasSize, elements })` → Blob → `<a>` download
  - 파일명: `pop_export_YYYYMMDD.json`
- ⬜ `App.jsx` — `handleImportJson(file)` 구현
  - FileReader로 JSON 파싱 → 유효성 검증 (필수 키 존재 확인)
  - elements id 재채번 후 `pushSnapshot` 호출
  - 오류 시 toast.error 표시
- ⬜ `App.jsx` — 파일 input (`.json` accept) + onChange 연결
- ⬜ 엣지 케이스 처리: 빈 elements 배열, canvasSize 누락, 손상된 JSON

### 4. Firebase Hosting 배포 설정

**신규 생성 파일**:
- `firebase.json` — Hosting 설정 (SPA rewrites 포함)
- `.firebaserc` — 프로젝트 ID 연결
- `docs/setup-guide.md` — Firebase CLI 배포 절차 문서화 (신규 또는 업데이트)

**태스크 목록**:
- ⬜ `firebase.json` 생성
  ```json
  {
    "hosting": {
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  }
  ```
- ⬜ `.firebaserc` 생성 (프로젝트 ID: VITE_FIREBASE_PROJECT_ID 값 활용)
- ⬜ `package.json` — `"deploy": "npm run build && firebase deploy --only hosting"` 스크립트 추가
- ⬜ `docs/setup-guide.md` 생성 또는 업데이트 — Firebase CLI 설치/로그인/배포 절차
- ⬜ `vite.config.js` 확인 — `base: '/'` 설정 (SPA 라우팅 대응)
- ⬜ 빌드 후 배포 전 `npm run build` 성공 확인

---

## 기술적 접근 방법

### PNG 내보내기: canvas.toDataURL 직접 추출

```
[현재 흐름]
App.jsx → html2canvas(DOM 엘리먼트) → 전체 DOM 재렌더링 → DataURL

[개선 흐름]
App.jsx → canvasRef.current.exportPng(scale)
        → CanvasEditor 내 <canvas> DOM ref에서 toDataURL 직접 추출
        → 실패(CORS 등) 시 html2canvas 폴백
```

- Fabric.js 캔버스는 내부적으로 `<canvas>` 엘리먼트를 관리하므로 DOM ref 접근 가능
- 배경(background gradient/image)이 CSS로만 적용된 경우 toDataURL에 포함되지 않을 수 있음 → 배경을 Fabric.js 오브젝트로 관리하거나 html2canvas 폴백 사용

### PDF 단위 변환 공식

```
96dpi 기준:
mm = px * 25.4 / 96

예시: 794px (A4 너비) → 794 * 25.4 / 96 ≈ 210.0mm
```

### JSON 가져오기 id 재채번

```js
// 가져올 때 elements id 재매핑
const idMap = {};
const remappedEls = parsedData.elements.map((el) => {
  const newId = genId();
  idMap[el.id] = newId;
  return { ...el, id: newId };
});
```

---

## 테스트 계획

### 수동 검증 시나리오

| 시나리오 | 검증 방법 | 기준 |
|---------|---------|------|
| PNG 내보내기 속도 | Chrome DevTools Performance 탭 | 3초 이내 |
| PNG 내보내기 화질 | 300×300 / A4 크기 내보내기 후 육안 확인 | 선명함 (계단 없음) |
| PDF 출력 크기 | A4 PDF Chrome 인쇄 미리보기 | 실제 A4 비율과 일치 |
| JSON 내보내기 | 작업물 저장 → JSON 파일 다운로드 → 파일 내용 확인 | 유효한 JSON, 필수 키 존재 |
| JSON 가져오기 | 저장한 JSON 파일 다시 불러오기 → 캔버스 복원 | 동일한 레이아웃 재현 |
| Firebase Hosting | `firebase deploy` 후 Hosting URL 접속 | 앱 정상 로드, SPA 라우팅 동작 |
| 빌드 검증 | `npm run build` | 오류 없음 |

### 엣지 케이스

| 케이스 | 예상 동작 |
|--------|---------|
| 빈 캔버스(요소 없음) PNG 내보내기 | 배경만 있는 이미지 다운로드 |
| 손상된 JSON 가져오기 | toast.error("올바른 JSON 파일이 아닙니다.") |
| JSON에 elements 키 누락 | toast.error 후 가져오기 중단 |
| 이미지 포함 JSON 내보내기/가져오기 | base64 src 그대로 직렬화 (파일 크기 주의) |
| Firebase 미설정 상태 빌드 | VITE_ 환경변수 없어도 빌드 성공 (런타임 에러만) |

---

## 완료 기준

- ⬜ PNG 내보내기: A4(794×1123px) 기준 3초 이내 완료
- ⬜ PDF 내보내기: A4 크기 PDF, 인쇄 미리보기에서 여백 없이 정확한 비율 출력
- ⬜ JSON 내보내기: 작업물을 `.json` 파일로 저장 가능
- ⬜ JSON 가져오기: 내보낸 `.json` 파일을 다시 불러와 동일한 캔버스 재현
- ⬜ `firebase.json` / `.firebaserc` 생성 완료
- ⬜ `npm run build && firebase deploy --only hosting` 성공
- ⬜ Firebase Hosting URL에서 앱 정상 동작 확인
- ⬜ `npm run build` / `npm run lint` 오류 없음
- ⬜ 코드 리뷰 완료 (보안 + 잠재 오류 체크리스트 통과)

---

## 예상 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | handleSavePng 개선, handleSavePdf 개선, handleExportJson/handleImportJson 추가 |
| `src/components/CanvasEditor.jsx` | exportPng(scale) 메서드 추가 (ref 노출) |
| `src/components/Header.jsx` | JSON 저장/불러오기 버튼 추가 |
| `firebase.json` | 신규 — Firebase Hosting 설정 |
| `.firebaserc` | 신규 — Firebase 프로젝트 연결 |
| `package.json` | deploy 스크립트 추가 |
| `docs/setup-guide.md` | 신규 — 배포 절차 문서 |
| `ROADMAP.md` | Sprint 3 상태 업데이트 |

---

## 리스크 및 완화

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|---------|
| canvas.toDataURL CORS 오류 (외부 이미지 src) | 중 | `useCORS: true` html2canvas 폴백, 또는 이미지를 base64로 미리 변환 |
| JSON 파일에 base64 이미지 포함 시 크기 과다 | 낮 | 가져오기 전 파일 크기 경고 (10MB 초과 시) |
| Firebase CLI 미설치 환경 | 낮 | setup-guide.md에 설치 절차 명시 |
| jsPDF px→mm 변환 오차 | 낮 | 변환 공식 주석 명시, A4 출력 수동 검증 |
