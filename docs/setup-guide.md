# 환경 설정 가이드

> 프로젝트 최초 시작 시 1회 수행하는 환경 설정 가이드입니다.

---

## 1. 사전 요구사항

- Node.js 20 이상 (`node -v`로 확인)
- npm 10 이상 (`npm -v`로 확인)
- Git
- Firebase 프로젝트 (Firebase Console 계정 필요)
- Anthropic API 키 (AI POP 생성 기능 사용 시)

---

## 2. 저장소 클론

```bash
git clone https://github.com/brogi9322-ai/pop-maker.git
cd pop-maker
```

---

## 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 Firebase 값을 입력합니다:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLAUDE_API_KEY=...   # AI POP 생성 기능에 필요
```

Firebase 값은 [Firebase Console](https://console.firebase.google.com/) → 프로젝트 설정 → 앱 등록에서 확인.

---

## 4. 로컬 개발 환경 실행

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 5. 외부 서비스 설정

### 5.1 Firebase

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication → 이메일/비밀번호 로그인 활성화
3. Firestore Database → 데이터베이스 생성 (테스트 모드로 시작)
4. Firestore 보안 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/designs/{designId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /templates/public/{templateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5.2 Claude API

1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. `.env`의 `VITE_CLAUDE_API_KEY`에 입력
3. 프론트엔드에서 직접 호출 시 키 노출 주의 — 프로덕션에서는 프록시 서버 권장

---

## 6. 개발 도구 설정

### VS Code 권장 익스텐션

- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets

---

## 7. Claude Code 설정

이 프로젝트는 Claude Code와 함께 사용하도록 설계되었습니다.

### 에이전트 활용

- `sprint-planner`: 스프린트 계획 수립
- `sprint-close`: 스프린트 마무리 (PR, 코드 리뷰)
- `hotfix-close`: 핫픽스 마무리
- `deploy-prod`: 프로덕션 배포
- `prd-to-roadmap`: PRD → ROADMAP.md 변환

자세한 내용은 `CLAUDE.md` 및 `docs/dev-process.md` 참조.
