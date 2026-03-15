# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## Sprint 4 완료 — 2026-03-15

PR: https://github.com/brogi9322-ai/pop-maker/pull/7

포함된 주요 기능:
- 반응형 모바일 레이아웃 (하단 탭 네비게이션)
- 터치 드래그 지원
- Context API 리팩토링 (App.jsx 688→163줄)
- 에셋 SVG 정리

검증 결과:
- ✅ npm run lint 경고 없음
- ✅ npm test 60개 통과
- ✅ npm run build 성공

수동 검증 필요 항목:
- ⬜ 모바일(375px)에서 하단 탭 전환 동작
- ⬜ 모바일에서 요소 터치 드래그 동작
- ⬜ Context API 리팩토링 후 전체 기능 정상 동작

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
