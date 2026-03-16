# PRD — POP 제작기

> Product Requirements Document
> 최종 수정: 2026-03-15

---

## 1. 배경 및 문제 정의

### 배경

**밴플러스(Banplus)**는 약국 전용 경영 관리 프로그램이다. 약국 매장에서는 할인 행사, 신제품 안내, 건강 캠페인 등을 알리기 위해 POP(Point of Purchase) 광고물을 자주 제작한다.

### 문제

경쟁 약국 관리 솔루션들은 이미 자체 POP 제작 기능을 제공하고 있다. 반면 밴플러스에는 해당 기능이 없어 사용자(약사)들이 불편을 겪고 있다.

- 약사가 직접 포토샵/파워포인트 등 별도 툴로 POP를 만들어야 함
- 디자인 경험이 없는 경우 제작이 어렵거나 퀄리티가 낮음
- 서버에서 제공하는 이미지/템플릿이 원하는 것과 다를 경우 대안이 없음

### 목표

밴플러스 사용자가 **디자인 경험 없이 3분 이내에** 약국 POP를 완성하고 출력할 수 있도록 한다.

---

## 2. 타겟 사용자

### Primary: 밴플러스 사용 약사

- 밴플러스 사업자번호 + ID 입력으로 인증 (추후 로그인 방식으로 전환 예정)
- 약국 POP(할인 안내, 약품 홍보, 건강 캠페인 등) 제작이 주목적
- 약국 특화 디자인 템플릿, 서버 제공 이미지 에셋, AI 이미지 생성 기능 사용

### Secondary: 일반 사용자

- 밴플러스 미인증 일반 사용자
- 기본 POP 편집 · 저장 · 출력 기능 사용 가능
- 일반 범용 디자인 템플릿 제공

---

## 3. 성공 지표

| 지표 | 기준 |
|------|------|
| 제작 소요 시간 | 처음 사용하는 약사가 POP 완성까지 3분 이내 |
| 출력 품질 | A4 기준 선명한 출력물 |
| 저장/불러오기 | 작업물이 클라우드에 저장되어 다음에도 이어서 편집 가능 |
| 사용자 편의성 | 디자인 툴 경험 없이 기본 기능을 직관적으로 사용 가능 |

---

## 4. 시스템 아키텍처

```
[브라우저]
  ├── React SPA (Firebase Hosting)
  │     ├── /          → 일반 사용자 / 밴플러스 인증 사용자 에디터
  │     └── /share/:id → 공유 링크 읽기 전용 미리보기
  │
  └── Firebase
        ├── Firestore       → 데이터 저장 (사용자, 디자인, 템플릿)
        ├── Firebase Storage → 이미지 파일 저장 (썸네일, 사용자 업로드)
        └── Firebase Auth   → 추후 일반 사용자 로그인 (현재 미사용)
```

---

## 5. 데이터 모델 (Firestore)

### `users/{userId}`

사업자번호 + ID로 생성된 사용자 식별 정보.

```
{
  bizNumber: string,      // 사업자번호 (10자리)
  userId: string,         // 사용자 입력 ID
  isBanplus: boolean,     // 밴플러스 인증 여부
  createdAt: timestamp,
  lastActiveAt: timestamp
}
```

### `designs/{designId}`

사용자가 저장한 POP 작업물.

```
{
  ownerId: string,        // users/{userId} 참조
  name: string,           // 작업물 이름
  canvasData: {
    template: object,
    canvasSize: object,
    elements: array
  },
  thumbnail: string,      // Firebase Storage URL
  isBanplus: boolean,     // 저장 당시 사용자 인증 상태
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `templates/{templateId}`

사용자가 저장하거나 공유한 템플릿.

```
{
  name: string,
  category: string,       // 'pharmacy' | 'general'
  previewUrl: string,     // Firebase Storage URL
  canvasData: object,     // 템플릿 캔버스 데이터
  isActive: boolean,
  createdAt: timestamp
}
```

### `assets/{assetId}`

이미지 에셋 메타데이터 (향후 서버 에셋 확장 시 사용).

```
{
  name: string,
  category: string,       // 'pharmacy' | 'general' | 'icon' | 'background'
  url: string,            // Firebase Storage URL
  tags: array<string>,    // 검색용 태그
  isActive: boolean,
  createdAt: timestamp
}
```

---

## 6. 기능 명세

### 6.1 캔버스 편집기 (P0 — 핵심)

| 기능 | 설명 | 상태 |
|------|------|------|
| 텍스트 추가 | 폰트, 크기, 색상, 정렬, 자간, 행간 편집 | ✅ 완료 |
| 이미지 업로드 | 로컬 파일 업로드 → 캔버스 배치 | ✅ 완료 |
| 드래그 이동 | 마우스로 요소 자유 이동 | ✅ 완료 |
| 리사이즈 | 8방향 핸들로 크기 조절 | ✅ 완료 |
| 회전 | 요소 각도 편집 | ✅ 완료 |
| 테두리 · 배경색 | 요소별 스타일 편집 | ✅ 완료 |
| Undo/Redo | Ctrl+Z / Ctrl+Shift+Z, 최대 50단계 | ✅ 완료 |
| 레이어 패널 | zIndex 재정렬, 잠금, 숨기기, 이름 편집 | ✅ 완료 |
| 캔버스 규격 | POP 300×300(기본) · A4 · A5 · 정사각 · 배너 프리셋 + 직접 입력 | ✅ 완료 |
| 기본 캔버스 크기 | 앱 최초 로드 시 300×300px (POP 표준 크기) | ✅ 완료 |
| 직접 입력 필드 현재값 표시 | 직접 입력 너비/높이 필드에 현재 캔버스 크기가 미리 채워짐, 프리셋 변경 시 자동 동기화 | ✅ 완료 |

### 6.2 템플릿 (P0)

| 기능 | 설명 | 상태 |
|------|------|------|
| 클라이언트 기본 템플릿 10종 | 코드에 내장된 기본 디자인 (일반 5 + 약국 5) | ✅ 완료 |
| 템플릿 클릭 시 기본 텍스트 자동 배치 | 미리보기와 동일한 `defaultText` + `textColor`로 텍스트 요소 생성, 캔버스 정 중앙 배치 | ✅ 완료 |
| 저장된 작업물 불러오기 | Firebase에 저장한 디자인 재편집 | ✅ 완료 |

### 6.3 내보내기 · 출력 (P0)

| 기능 | 설명 | 상태 |
|------|------|------|
| PNG 내보내기 | 고해상도(2x) PNG 다운로드 | ✅ 완료 |
| PDF 내보내기 | 캔버스 크기 기준 PDF 생성 | ✅ 완료 |
| 브라우저 인쇄 | window.print() | ✅ 완료 |

### 6.4 사용자 인증 · 저장 (P0)

| 기능 | 설명 | 상태 |
|------|------|------|
| 밴플러스 인증 | 사업자번호 + ID 입력으로 약국 전용 기능 잠금 해제 | ✅ 완료 (로컬) |
| 서버 인증 연동 | 사업자번호 + ID를 Firestore에 저장, 사용자 식별 | ⬜ 예정 |
| 작업물 저장 | Firestore에 캔버스 데이터 저장, Storage에 썸네일 저장 | ✅ 완료 |
| 작업물 불러오기 | 저장된 작업물 목록 조회 및 재편집 | ✅ 완료 |
| 이메일/비밀번호 로그인 | Firebase Auth 연동 (추후) | 📋 예정 |

### 6.5 AI SVG 에셋 생성 (P1)

| 기능 | 설명 | 상태 |
|------|------|------|
| AI SVG 생성 | 텍스트 프롬프트로 SVG 아이콘을 생성하고 AssetPanel "AI 생성" 탭에 추가하여 캔버스에 삽입 | ✅ Sprint 9 구현 완료 |

**구현 결정 사항 (Sprint 9)**

- **Spark 플랜 유지 결정으로 Firebase Functions 미사용.** 클라이언트에서 `@anthropic-ai/sdk`를 통해 직접 Anthropic API 호출.
- API 키는 `VITE_CLAUDE_API_KEY` 환경변수로 관리 (Vite 빌드 번들에 포함됨 — 내부 도구 용도로 허용된 의도적 결정).
- Blaze 플랜 전환 시 Firebase Functions 프록시로 이전하여 보안 강화 예정.
- SVG 생성 결과는 DOMPurify로 sanitize 후 base64 data URL로 변환 (XSS 방어).
- `dangerouslySetInnerHTML` 미사용: `<img src={dataUrl}>` 방식으로 렌더링.
- 생성된 에셋은 localStorage에 영속 저장 (최대 50개 제한).

> 보안 고려사항: `VITE_CLAUDE_API_KEY`는 브라우저에 노출되므로 운영 환경에서 API 키 사용량 모니터링 필수. 키 유출 방지를 위해 `.env` 파일은 반드시 `.gitignore`에 포함되어 있어야 함.

---

## 7. 비기능 요구사항

| 항목 | 요구사항 |
|------|---------|
| 성능 | PNG 내보내기 3초 이내 |
| 브라우저 지원 | Chrome 최신, Safari 최신 |
| 화면 해상도 | 데스크톱 우선 (1280px 이상 기준) |
| 보안 | Firestore 보안 규칙으로 타인 작업물 접근 차단 |
| 배포 | Firebase Hosting (Spark 무료 플랜) |

---

## 8. 제외 범위 (Out of Scope)

- 모바일 편집 (모바일은 저장된 작업물 조회만)
- 실시간 협업 편집
- 인쇄소 직접 연동
- 밴플러스 기존 서버 실인증 연동 (현재는 사업자번호+ID 자체 검증)
