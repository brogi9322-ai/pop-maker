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

### 관리자

- 별도 관리자 페이지(`/admin`) 접근
- Firebase Auth 이메일/비밀번호 로그인
- 이미지 에셋, 템플릿, 사용자 관리 권한

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
  │     └── /admin     → 관리자 전용 대시보드 (Firebase Auth 로그인 필요)
  │
  └── Firebase
        ├── Firestore       → 데이터 저장 (사용자, 디자인, 템플릿, 에셋 목록)
        ├── Firebase Storage → 이미지 파일 저장 (에셋, 썸네일, 사용자 업로드)
        ├── Firebase Auth   → 관리자 로그인 (추후: 일반 사용자 로그인)
        └── Firebase Functions → 관리자 API 서버 (Node.js)
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

관리자가 서버에 등록한 기본 제공 템플릿.

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

관리자가 업로드한 이미지 에셋.

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
| 캔버스 규격 | A4·A5·정사각·배너 프리셋 + 직접 입력 | ✅ 완료 |
| 서버 이미지 에셋 | 관리자가 등록한 이미지를 에셋 패널에서 선택하여 캔버스에 삽입 | ⬜ 예정 |

### 6.2 템플릿 (P0)

| 기능 | 설명 | 상태 |
|------|------|------|
| 클라이언트 기본 템플릿 10종 | 코드에 내장된 기본 디자인 (일반 5 + 약국 5) | ✅ 완료 |
| 서버 제공 템플릿 | 관리자가 서버에 등록한 템플릿 불러오기 | ⬜ 예정 |
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

### 6.5 관리자 기능 (P1)

| 기능 | 설명 | 상태 |
|------|------|------|
| 관리자 로그인 | `/admin` 페이지, Firebase Auth 이메일/비밀번호 | ⬜ 예정 |
| 이미지 에셋 관리 | Storage에 이미지 업로드/삭제, Firestore `assets` 컬렉션 관리 | ⬜ 예정 |
| 템플릿 관리 | 서버 템플릿 추가/수정/삭제, Firestore `templates` 컬렉션 관리 | ⬜ 예정 |
| 사용자 목록 조회 | 가입 사용자 목록, 밴플러스 인증 여부, 최종 접속일 | ⬜ 예정 |
| 사용자 작업물 조회 | 특정 사용자의 저장된 POP 목록 조회 | ⬜ 예정 |

### 6.6 AI 이미지 생성 (P1)

| 기능 | 설명 | 상태 |
|------|------|------|
| AI 이미지 생성 | 서버 제공 이미지가 마음에 들지 않을 때 텍스트 프롬프트로 원하는 이미지 생성 후 POP에 삽입 | 📋 예정 |

> 보안 주의: Claude API 키는 Firebase Functions를 프록시로 사용하여 클라이언트에 노출되지 않도록 함.

---

## 7. 비기능 요구사항

| 항목 | 요구사항 |
|------|---------|
| 성능 | PNG 내보내기 3초 이내 |
| 브라우저 지원 | Chrome 최신, Safari 최신 |
| 화면 해상도 | 데스크톱 우선 (1280px 이상 기준) |
| 보안 | Firestore 보안 규칙으로 타인 작업물 접근 차단, 관리자 API는 Firebase Auth 토큰 검증 |
| 배포 | Firebase Hosting (Spark 무료 플랜) |

---

## 8. 제외 범위 (Out of Scope)

- 모바일 편집 (모바일은 저장된 작업물 조회만)
- 실시간 협업 편집
- 인쇄소 직접 연동
- 밴플러스 기존 서버 실인증 연동 (현재는 사업자번호+ID 자체 검증)
