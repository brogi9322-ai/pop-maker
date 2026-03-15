# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD-sprint{n}.md`로 이동됩니다.

---

## 프로덕션 배포 (Sprint 6+7) — 2026-03-15

PR: https://github.com/brogi9322-ai/pop-maker/pull/13
배포 URL: https://pop-maker-9209f.web.app
브랜치: develop → master

포함된 주요 변경 사항:
- Sprint 6: 테스트 커버리지 확대 — Vitest 기반 테스트 135개 통과 (9 test files)
- Sprint 6: CI/CD 개선 — 커버리지 임계값(lines 75%), artifact 업로드
- Sprint 7: Playwright E2E 테스트 도입 (chromium + mobile-chrome 프로젝트)
- Sprint 7: `.github/workflows/e2e.yml` — master push 후 E2E 자동 실행

사전 점검 결과:
- ✅ npm run lint — 에러 0건
- ✅ npm test — 135 tests 통과
- ✅ npm run build — 성공
- ✅ npx playwright test — 19 passed, 7 skipped (의도된 skip)

수동 검증 필요 항목:
- ⬜ https://pop-maker-9209f.web.app 정상 로딩 확인
- ⬜ 캔버스 편집 기본 흐름 (요소 추가 → 이동 → 저장)
- ⬜ 공유 링크 `/share/:id` 정상 접근
- ⬜ 모바일(375px)에서 하단 탭 전환 및 터치 드래그 동작
- ⬜ GitHub Actions에서 E2E 워크플로우 자동 실행 확인
- ⬜ GitHub Secret `E2E_SHARE_ID` 설정 후 share.spec.js 전체 테스트 실행 확인

---

## 현재 미완료 항목

### [2026-03-15] Hotfix — Firebase Hosting 자동 배포 CI 추가

PR: https://github.com/brogi9322-ai/pop-maker/pull/12

| 항목 | 상태 |
|------|------|
| `FIREBASE_SERVICE_ACCOUNT_POP_MAKER_9209F` GitHub Secret 등록 | ⬜ 수동 작업 필요 |
| master merge 후 GitHub Actions `deploy` 잡 실행 확인 | ⬜ 수동 검증 필요 |
| Firebase Hosting URL 정상 접속 확인 | ⬜ 수동 검증 필요 |
| develop 브랜치에 이 변경사항 역머지 | ⬜ 수동 작업 필요 |

**Secret 설정 방법**:
- 방법 1: `firebase init hosting:github` 실행 (자동 등록)
- 방법 2: GitHub → Settings → Secrets and variables → Actions → `FIREBASE_SERVICE_ACCOUNT_POP_MAKER_9209F` 추가

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
