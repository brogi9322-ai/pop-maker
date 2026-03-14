# 환경 설정 및 배포 가이드

> 프로젝트 최초 시작 및 배포 시 참조하는 가이드입니다.

---

## 1. 사전 요구사항

- Node.js 20 이상 (`node -v`로 확인)
- npm 10 이상 (`npm -v`로 확인)
- Git
- Firebase 프로젝트 (Firebase Console 계정 필요)
- Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

---

## 2. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/brogi9322-ai/pop-maker.git
cd pop-maker
npm install
```

---

## 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Firebase 값을 입력합니다:

```
# Firebase 프로젝트 설정 (필수)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Claude API — AI 이미지 생성 기능 (Firebase Functions에서만 사용, 클라이언트 직접 사용 금지)
# CLAUDE_API_KEY=...  → functions/.env 에 별도 설정
```

Firebase 값은 [Firebase Console](https://console.firebase.google.com/) → 프로젝트 설정 → 앱 등록에서 확인.

---

## 3-1. 주요 프론트엔드 의존성

| 패키지 | 용도 |
|--------|------|
| `react`, `react-dom` | UI 프레임워크 |
| `react-router-dom` | SPA 라우팅 (`/share/:id` 공유 페이지) |
| `firebase` | Firestore, Auth, Storage, Hosting |
| `html2canvas` | 캔버스 → PNG/PDF 내보내기 |
| `jspdf` | PDF 생성 |

> `npm install` 실행 시 위 패키지들이 모두 설치됩니다.

---

## 4. 로컬 개발 서버 실행

```bash
npm run dev
# → http://localhost:5173
```

---

## 5. Firebase 서비스 설정 (최초 1회)

### 5.1 Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. 웹 앱 등록 → SDK 설정 값 복사 → `.env`에 입력

### 5.2 Firebase Authentication 설정

1. Firebase Console → Authentication → 시작하기
2. 로그인 방법 → **이메일/비밀번호** 활성화 (관리자 로그인용)
3. 관리자 계정 수동 등록: Authentication → 사용자 추가

### 5.3 Firestore 설정

1. Firebase Console → Firestore Database → 데이터베이스 만들기
2. 시작 모드: **프로덕션 모드**로 시작 (아래 보안 규칙 직접 설정)
3. 보안 규칙 설정:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 정보 — 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 디자인 작업물 — 본인만 읽기/쓰기
    match /designs/{designId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null;
    }

    // 서버 제공 템플릿 — 누구나 읽기, 관리자만 쓰기
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.admin == true;
    }

    // 이미지 에셋 — 누구나 읽기, 관리자만 쓰기
    match /assets/{assetId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.admin == true;
    }
  }
}
```

### 5.4 Firebase Storage 설정

1. Firebase Console → Storage → 시작하기
2. 보안 규칙 설정:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // 관리자 업로드 에셋 — 누구나 읽기, 관리자만 쓰기
    match /assets/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.admin == true;
    }

    // 디자인 썸네일 — 인증 사용자 읽기, 본인만 쓰기
    match /thumbnails/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == userId;
    }

    // 사용자 업로드 이미지 — 본인만 읽기/쓰기
    match /user-uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### 5.5 Firebase Functions 설정 (관리자 API)

```bash
firebase init functions
# → Language: JavaScript
# → ESLint: Yes
# → Install dependencies: Yes
```

Functions 환경변수 설정 (`functions/.env`):
```
CLAUDE_API_KEY=...   # AI 이미지 생성 기능용
```

로컬 Functions 에뮬레이터 실행:
```bash
firebase emulators:start --only functions
```

### 5.6 Firebase CLI 초기화 (Hosting)

```bash
firebase init hosting
```

설정 시 선택:
- **Public directory**: `dist`
- **Single-page app (rewrite all urls to /index.html)**: `Yes`
- **Set up automatic builds and deploys with GitHub?**: `Yes` (권장)
- **Overwrite dist/index.html**: `No`

---

## 6. 배포

### 6.1 수동 배포

```bash
npm run build
firebase deploy --only hosting        # 프론트엔드만 배포
firebase deploy --only functions      # Functions만 배포
firebase deploy                       # 전체 배포
```

배포 완료 URL:
```
Hosting URL: https://{project-id}.web.app
```

### 6.2 GitHub Actions 자동 배포 (권장)

`firebase init hosting:github` 실행 시 `.github/workflows/` 파일이 자동 생성됩니다.

설정 후 **`main` 브랜치에 push하면 자동 빌드 → 배포**됩니다.

GitHub Secrets에 아래 값 등록 필요:
- `FIREBASE_SERVICE_ACCOUNT_{PROJECT_ID}` (Firebase CLI가 자동 생성)

### 6.3 롤백

Firebase Console → Hosting → Release History → 원하는 버전 "Rollback" 클릭.

---

## 7. Firebase Hosting 무료 플랜 (Spark) 한도

| 항목 | 무료 한도 | 초과 시 |
|------|----------|--------|
| Hosting 저장 용량 | 10 GB | Blaze 전환 |
| Hosting 월간 전송량 | 10 GB | Blaze 전환 |
| Firestore 저장 | 1 GB | Blaze 전환 |
| Firestore 읽기 | 50,000회/일 | Blaze 전환 |
| Firestore 쓰기 | 20,000회/일 | Blaze 전환 |
| Storage 저장 | 5 GB | Blaze 전환 |
| Storage 다운로드 | 1 GB/일 | Blaze 전환 |
| Functions | **Spark 플랜 미지원** — Blaze 전환 필요 | — |
| HTTPS / 커스텀 도메인 | 지원 | — |

> **주의**: Firebase Functions는 Spark(무료) 플랜에서 사용 불가합니다.
> 관리자 API(Functions) 기능 개발 시 Blaze(종량제) 플랜으로 업그레이드 필요.
> Blaze 플랜도 위 무료 한도까지는 과금 없음 — 초과분만 과금.

---

## 8. 커스텀 도메인 연결 (선택)

1. Firebase Console → Hosting → 커스텀 도메인 추가
2. 도메인 소유권 확인 (TXT 레코드 추가)
3. DNS A 레코드를 Firebase IP로 설정
4. SSL 인증서 자동 발급 (수 분 ~ 수십 분 소요)

---

## 9. 외부 서비스

### 9.1 Claude API (AI 이미지 생성 기능)

> AI 이미지 생성 기능 구현 시 설정. Firebase Functions가 프록시 역할.

1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. `functions/.env`의 `CLAUDE_API_KEY`에 입력
3. **클라이언트 `.env`에 절대 추가하지 말 것** — 키 노출 위험

---

## 10. 개발 도구 (선택)

### VS Code 권장 익스텐션

- ESLint
- Prettier
- ES7+ React/Redux snippets
- Firebase Explorer

### 주요 명령어 요약

```bash
npm run dev                          # 개발 서버 (localhost:5173)
npm run build                        # 프로덕션 빌드
npm run preview                      # 빌드 결과 로컬 미리보기
npm run lint                         # ESLint 실행
firebase deploy                      # Firebase 전체 배포
firebase deploy --only hosting       # Hosting만 배포
firebase deploy --only functions     # Functions만 배포
firebase emulators:start             # 로컬 Firebase 에뮬레이터
```
