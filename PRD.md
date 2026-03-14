# PRD: POP 제작기 메인 에디터

> 작성일: 2026-03-15
> 해커톤 데모 기한: 오늘 (2026-03-15)

---

## 1. 개요

**제품명**: POP Maker (포인트 오브 퍼체이스 제작기)
**목표**: 매장 담당자가 디자인 경험 없이도 POP 광고물을 빠르게 제작·저장·출력할 수 있는 캔버스 에디터

### 핵심 문제
| 문제 | 현재 상태 |
|------|----------|
| UI/UX 디자인 | 시각적으로 미완성, 사용 흐름 불명확 |
| 기능 부재 | 레이어 관리, AI 생성, Undo/Redo 미구현 |
| 성능/안정성 | 내보내기 속도 지연, 렌더링 버그 |
| 전체 플로우 | 온보딩~저장~출력 흐름이 끊김 |

---

## 2. 타겟 사용자

**페르소나**: 매장 담당자
- 디자인 도구(Figma, 포토샵) 비경험자
- 빠르게 세일/이벤트 POP를 제작하고 즉시 인쇄 또는 공유가 필요
- 스마트폰으로는 결과물 확인·저장 정도만 사용

---

## 3. 레이아웃 & 화면 구조

### 3-1. 전체 레이아웃 (데스크탑)

```
┌─────────────────────────────────────────────────────────────┐
│                    Header / Nav Bar                         │
│  [POP Maker 로고]          [저장] [내보내기▼] [계정]        │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  Left Panel  │      Canvas Area         │   Right Panel     │
│              │                          │                   │
│  [템플릿]    │   ┌──────────────────┐   │  선택 객체 속성   │
│  [레이어]    │   │                  │   │                   │
│              │   │   POP Canvas     │   │  폰트 / 색상      │
│  템플릿 썸네 │   │                  │   │  크기 / 위치      │
│  일 그리드   │   └──────────────────┘   │  투명도 / 정렬    │
│              │                          │                   │
│  레이어 목록 │  캔버스 규격: [프리셋▼]  │  [AI 생성]        │
│  (드래그 재  │  또는 [W: ___] [H: ___] │  버튼             │
│   정렬 가능) │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

### 3-2. Left Panel 탭 구조
- **템플릿 탭**: 기본 템플릿 썸네일 그리드, 클릭 시 캔버스에 적용
- **레이어 탭**: 현재 캔버스 객체 목록, 드래그로 순서 변경

### 3-3. 모바일 (≤ 768px)
- 편집 UI 숨김, 읽기 전용 캔버스 미리보기
- "Firebase에서 불러오기" / "PNG 저장" 버튼만 노출
- 에디터로 이동 유도 배너 표시

---

## 4. 기능 요구사항

### 4-1. 캔버스 편집 (핵심)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 텍스트 추가 | 더블클릭 인라인 편집, 폰트/크기/색상 조정 | P0 |
| 이미지 추가 | 로컬 파일 업로드, Fabric.js Image 객체 | P0 |
| 도형 추가 | 사각형, 원, 선 기본 도형 | P0 |
| 객체 선택/이동/리사이즈 | Fabric.js 기본 컨트롤 | P0 |
| Undo/Redo | Fabric.js 내장 히스토리 활용 (Ctrl+Z / Ctrl+Y) | P0 |

### 4-2. 레이어 패널

| 기능 | 설명 |
|------|------|
| 레이어 목록 | 캔버스 객체를 순서대로 나열 |
| 드래그 재정렬 | 드래그앤드롭으로 z-order 변경 → canvas.moveTo() 호출 |
| 잠금/숨기기 | 토글 아이콘, 잠금 시 선택 불가 / 숨기기 시 visible=false |
| 이름 변경 | 더블클릭 인라인 편집, object.name 속성 사용 |
| 그룹화 | 다중 선택 후 Ctrl+G, Fabric.js Group 객체 생성 |

### 4-3. AI POP 생성

**입력 방식**: 텍스트 프롬프트 (자연어)

**플로우**:
```
사용자 입력: "여름 할인 30% 세일 POP"
         ↓
Claude API 호출 (canvas JSON 스키마 형식으로 응답 요청)
         ↓
응답된 Fabric.js JSON → canvas.loadFromJSON()
         ↓
캔버스에 즉시 렌더링, 사용자가 이후 직접 수정 가능
```

**Claude API 요청 스키마**:
```json
{
  "prompt": "사용자 입력 텍스트",
  "canvasWidth": 400,
  "canvasHeight": 400,
  "outputFormat": "fabric-json"
}
```

**에러 처리**: API 실패 시 토스트 메시지, 캔버스 상태 유지

### 4-4. 캔버스 규격 관리

**프리셋 목록**:
| 이름 | 크기 (px) | 실제 용도 |
|------|----------|----------|
| A4 세로 | 794 × 1123 | 일반 인쇄 |
| A5 세로 | 559 × 794 | 소형 POP |
| 정사각형 | 400 × 400 | SNS/카운터 |
| 배너 가로 | 800 × 300 | 진열대 배너 |

**직접 입력**: W/H 픽셀 입력 필드, 변경 시 기존 객체 비율 유지 옵션

### 4-5. 내보내기

| 형식 | 구현 | 비고 |
|------|------|------|
| PNG | html2canvas → `<a>` 다운로드 | 고해상도 (scale: 2) |
| PDF | jsPDF + html2canvas | A4 자동 맞춤 또는 캔버스 비율 유지 |
| JSON | `canvas.toJSON()` → Blob 다운로드 | 재편집 가능 파일 |
| Firebase | `storage.js` → Firestore 저장 | 로그인 필요 |

**성능 요구사항**: PNG/PDF 내보내기는 3초 이내 완료, 진행 중 로딩 스피너 표시

### 4-6. Firebase 저장 & 공유

- **개인 저장**: 로그인 사용자의 `users/{uid}/designs` 컬렉션에 저장
- **공개 공유**: `isPublic: true` 플래그로 `templates/public` 컬렉션에도 복사
- **공유 링크**: `/template/{docId}` URL로 다른 사용자가 열어 편집 시작 가능

---

## 5. UI/UX 요구사항

### 5-1. 인터랙션 원칙
- 모든 편집 작업은 즉각적으로 캔버스에 반영 (no save button for canvas state)
- 빈 캔버스에서 시작할 경우 온보딩 힌트 오버레이 표시
- 객체 미선택 시 Right Panel은 캔버스 전체 속성(배경색, 크기) 표시

### 5-2. 핵심 UX 플로우
```
1. 진입 → 템플릿 선택 또는 빈 캔버스
2. 편집 → 텍스트/이미지/도형 추가, AI 생성 옵션
3. 저장 → Firebase 또는 JSON 파일
4. 내보내기 → PNG / PDF 다운로드
```

### 5-3. 에러 & 엣지 케이스

| 상황 | 처리 |
|------|------|
| 로그인 안 한 채 Firebase 저장 | 로그인 모달 표시 |
| 캔버스 비어있는 채 내보내기 | 비어있음 경고 토스트 |
| 이미지 업로드 5MB 초과 | 파일 크기 오류 메시지 |
| AI 생성 API 타임아웃 | 재시도 버튼 포함 에러 토스트 |
| 레이어 10개 이상 | 스크롤 가능한 레이어 목록 |

---

## 6. 기술 구현 가이드

### 6-1. Undo/Redo (Fabric.js 내장)
```javascript
// fabric v6+ IHistory mixin 활용
canvas.on('object:modified', () => canvas.fire('history:append'));
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') canvas.undo();
  if (e.ctrlKey && e.key === 'y') canvas.redo();
});
```

### 6-2. 레이어 패널 동기화
```javascript
// canvas 이벤트 구독으로 레이어 목록 자동 갱신
['object:added', 'object:removed', 'object:modified', 'stack:changed']
  .forEach(evt => canvas.on(evt, syncLayerPanel));
```

### 6-3. 내보내기 최적화 (PNG)
```javascript
// html2canvas 대신 Fabric.js 내장 toDataURL 우선 사용 (더 빠름)
const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
```

### 6-4. AI 생성 API 연동
- `src/utils/aiGenerate.js`에 Claude API 호출 로직 분리
- 환경변수: `VITE_CLAUDE_API_KEY`
- 응답 형식: Fabric.js JSON (`{ version, objects, background }`)

---

## 7. 파일 변경 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/components/CanvasEditor.jsx` | Undo/Redo, 레이어 이벤트, 내보내기 최적화 |
| `src/components/PropsPanel.jsx` | AI 생성 버튼, 캔버스 규격 선택 추가 |
| `src/components/TemplatePanel.jsx` | 레이어 탭 추가, 탭 전환 UI |
| `src/components/LayerPanel.jsx` | **신규**: 레이어 목록, 드래그 재정렬 |
| `src/utils/aiGenerate.js` | **신규**: Claude API 호출 유틸 |
| `src/utils/storage.js` | 공개 공유 로직 추가 |
| `src/App.jsx` | 3패널 레이아웃 구조 조정 |
| `src/index.css` | 레이아웃, 모바일 반응형 스타일 |

---

## 8. 성공 지표 (해커톤 데모 기준)

- [ ] 템플릿 선택 → 편집 → PNG 내보내기 플로우 막힘 없이 동작
- [ ] AI 프롬프트 입력 → 캔버스 자동 생성 데모 가능
- [ ] 레이어 패널에서 순서 변경 시 캔버스 즉시 반영
- [ ] Undo/Redo Ctrl+Z/Y 동작
- [ ] Firebase 저장 후 공유 링크 동작
- [ ] PNG 내보내기 3초 이내 완료
