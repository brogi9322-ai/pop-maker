# POP 제작기

밴플러스 약국 관리 프로그램 사용자를 위한 **POP(Point of Purchase) 광고물 웹 에디터**.

약사가 디자인 경험 없이도 매장 홍보물을 직접 편집하고 출력할 수 있습니다.

---

## 주요 기능

### 편집
- 텍스트 추가 · 폰트 · 크기 · 색상 · 정렬 자유 편집
- 이미지 업로드 및 배치
- 요소 드래그 이동 · 리사이즈 · 회전
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z, 최대 50단계)

### 레이아웃
- 레이어 패널 — 요소 순서 드래그 재정렬, 잠금, 숨기기, 이름 편집
- 캔버스 규격 프리셋 (A4, A5, 정사각형, 배너) + 직접 입력
- 약국 전용 기본 제공 디자인 템플릿 (약국 5종 + 일반 5종)

### 내보내기 · 출력
- PNG · PDF 내보내기
- 브라우저 인쇄

### 계정 · 저장
- 사업자번호 + ID 입력으로 밴플러스 인증 → 약국 전용 기능 제공
- 작업물 Firebase 클라우드 저장 · 불러오기

### 관리자 *(예정)*
- `/admin` 관리자 전용 페이지 (로그인 필요)
- 이미지 에셋 · 서버 템플릿 관리
- 사용자 및 작업물 조회

### AI 이미지 생성 *(예정)*
- 텍스트 프롬프트 → Claude API → 이미지 생성 후 POP에 삽입

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + Vite 8 |
| 호스팅 | Firebase Hosting |
| 데이터베이스 | Firebase Firestore |
| 파일 저장소 | Firebase Storage |
| 인증 | Firebase Authentication |
| 서버 로직 | Firebase Functions (Node.js) |
| 내보내기 | html2canvas + jsPDF |
| AI 생성 | Anthropic Claude API *(예정)* |

---

## 로컬 실행

### 사전 요구사항

- Node.js 20 이상
- Firebase 프로젝트
- Firebase CLI (`npm install -g firebase-tools`)

### 설치 및 실행

```bash
git clone https://github.com/brogi9322-ai/pop-maker.git
cd pop-maker
npm install
cp .env.example .env   # Firebase 환경변수 입력
npm run dev            # http://localhost:5173
```

자세한 환경변수 설정은 [docs/setup-guide.md](docs/setup-guide.md) 참조.

---

## 배포

Firebase Hosting을 사용합니다.

```bash
npm run build
firebase deploy
```

자세한 내용은 [docs/setup-guide.md](docs/setup-guide.md) 참조.

---

## 문서

| 문서 | 설명 |
|------|------|
| [docs/prd.md](docs/prd.md) | 제품 요구사항 (문제 정의, 목표, 기능 명세, 데이터 모델) |
| [ROADMAP.md](ROADMAP.md) | 개발 로드맵 및 스프린트 현황 |
| [docs/setup-guide.md](docs/setup-guide.md) | 환경 설정 및 Firebase 배포 가이드 |
| [docs/dev-process.md](docs/dev-process.md) | 개발 프로세스, 코드 리뷰, 에이전트 활용 가이드 |
