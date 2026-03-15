# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목

### Sprint 7 완료 — 2026-03-15

PR: https://github.com/brogi9322-ai/pop-maker/pull/14

포함된 주요 기능:
- Playwright E2E 테스트 도입 (chromium + mobile-chrome 프로젝트)
- `e2e/smoke.spec.js` — 앱 접속 및 기본 UI 렌더링 검증 (6개 테스트)
- `e2e/share.spec.js` — /share/:id 공개 페이지 검증 (graceful skip 지원)
- `e2e/mobile.spec.js` — 375px 모바일 레이아웃 검증 (4개 테스트)
- `.github/workflows/e2e.yml` — master push 및 workflow_dispatch 트리거, artifact 업로드

검증 결과:
- ✅ npm run lint 경고 없음
- ✅ npm test 60개 통과
- ✅ npm run build 성공
- ✅ npx playwright test 19 passed, 7 skipped (의도된 skip)

수동 검증 필요 항목:
- ⬜ 로컬 `npm run dev`로 주요 기능 동작 확인
- ⬜ GitHub Actions에서 `workflow_dispatch`로 E2E 수동 트리거 후 결과 확인
- ⬜ GitHub Secret `E2E_SHARE_ID` 설정 후 share.spec.js 전체 테스트 실행 확인

상세 리뷰 결과: `docs/sprint/sprint7.md` 참조

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
