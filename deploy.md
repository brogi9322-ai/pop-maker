# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD-sprint{n}.md`로 이동됩니다.

---

## 프로덕션 배포 (Sprint 6) — 2026-03-15

PR: https://github.com/brogi9322-ai/pop-maker/pull/13
배포 URL: https://pop-maker-9209f.web.app
브랜치: develop → master

포함된 주요 변경 사항:
- 테스트 커버리지 확대 — Vitest 기반 테스트 135개 통과 (9 test files)
- CI/CD 자동화 — GitHub Actions 워크플로우 추가
- EditorContext 리팩토링 및 정리
- SharePage 컴포넌트 추가 (공개 링크 공유 뷰)
- 에셋/데이터 구조 개선

사전 점검 결과:
- ✅ GitHub Actions CI (develop) — 모두 success
- ✅ npm run lint — 에러 0건
- ✅ npm test — 135 tests 통과 (9 test files)
- ✅ npm run build — 성공

수동 검증 필요 항목:
- ⬜ https://pop-maker-9209f.web.app 정상 로딩 확인
- ⬜ 캔버스 편집 기본 흐름 (요소 추가 → 이동 → 저장)
- ⬜ 공유 링크 `/share/:id` 정상 접근
- ⬜ 모바일(375px)에서 하단 탭 전환 및 터치 드래그 동작

---

## 현재 미완료 항목

(초기 상태 — 스프린트/핫픽스 완료 후 sprint-close/hotfix-close agent가 업데이트합니다.)

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
