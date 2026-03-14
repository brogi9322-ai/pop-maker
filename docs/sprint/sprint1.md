# Sprint 1: 기본 제공 템플릿 + 개발 프로세스 수립

## 목표

실제 약사가 바로 사용 가능한 기본 템플릿 10개 제공 및 지속 가능한 개발 프로세스 수립.

## 기간

2026-03-15

## 브랜치

`sprint1` (master 기반)

---

## 태스크 목록

### 1. 기본 제공 템플릿
- ✅ `src/data/templates.js` 신규 생성 — 일반 5개 + 약국 5개 총 10개 템플릿
- ✅ `TemplatePanel.jsx` — 기본 디자인 탭 / 배경 스타일 탭 분리
- ✅ 템플릿 클릭 → 캔버스 적용

### 2. 개발 프로세스 수립
- ✅ `CLAUDE.md` — 커밋 형식, 브랜치 전략, 코드 리뷰 체크리스트
- ✅ `docs/dev-process.md` — 개발 프로세스 상세 문서
- ✅ `docs/ci-policy.md` — CI/CD 정책
- ✅ Claude Code 에이전트 설정 (sprint-planner, sprint-close 등)

### 3. 버그 수정
- ✅ 코드 리뷰 후 발견된 버그 4건 수정
- ✅ Firestore 템플릿 조회 권한 수정

---

## 완료 기준

- ✅ 템플릿 10개 TemplatePanel에 정상 표시
- ✅ 템플릿 클릭 시 캔버스에 배경/스타일 적용
- ✅ 개발 지침 CLAUDE.md에 반영
- ✅ `npm run build` 오류 없음

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run build` | ✅ 성공 |
| `npm run lint` | ✅ 경고 없음 |
| 코드 리뷰 | ✅ 완료 (버그 4건 수정) |

수동 검증 상세: `docs/deploy-history/2026-03-15-sprint1.md` 참조

---

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/data/templates.js` | 신규 — 기본 템플릿 10개 |
| `src/components/TemplatePanel.jsx` | 탭 분리 (기본 디자인 / 배경 스타일) |
| `src/App.jsx` | 템플릿 선택 핸들러 |
| `CLAUDE.md` | 개발 지침 수립 |
| `docs/dev-process.md` | 신규 — 개발 프로세스 문서 |
| `docs/ci-policy.md` | 신규 — CI/CD 정책 |
| `ROADMAP.md` | Sprint 1 상태 업데이트 |
