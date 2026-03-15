# 2026-03-15 Hotfix — Firebase Hosting 자동 배포 CI 추가

## 개요

- **브랜치**: `hotfix/firebase-auto-deploy`
- **대상 브랜치**: `master` (PR to master)
- **배포 유형**: Hotfix (긴급 패치)

---

## 문제 원인

master 브랜치에 push해도 Firebase Hosting에 자동 배포가 되지 않았습니다.
CI 워크플로우에 `test` 잡만 존재하고 `deploy` 잡이 없었습니다.

---

## 수정 내용

`.github/workflows/ci.yml`에 `deploy` 잡 추가:

| 항목 | 설정값 |
|------|--------|
| 트리거 조건 | master push 시에만 (`event_name == 'push'`, `ref == 'refs/heads/master'`) |
| 실행 순서 | `needs: test` — test 성공 후 배포 |
| 배포 액션 | `FirebaseExtended/action-hosting-deploy@v0` |
| 프로젝트 ID | `pop-maker-9209f` |
| 서비스 계정 | `${{ secrets.FIREBASE_SERVICE_ACCOUNT_POP_MAKER_9209F }}` |

---

## 자동 검증 결과

| 검증 항목 | 결과 |
|-----------|------|
| `npm run lint` | ✅ 오류 없음 (warning 2건 — coverage 디렉토리, 기능 무관) |
| `npm test` | ✅ 60개 전부 통과 |
| 코드 리뷰 (보안) | ✅ API 키 노출 없음, secrets 참조 방식 정상 |
| 코드 리뷰 (오류) | ✅ job dependency 설정 정상, 배포 범위 조건 정상 |

---

## 수동 검증 항목

| 항목 | 상태 |
|------|------|
| `FIREBASE_SERVICE_ACCOUNT_POP_MAKER_9209F` GitHub Secret 등록 | ⬜ 수동 작업 필요 |
| master push 후 GitHub Actions `deploy` 잡 실행 확인 | ⬜ 수동 검증 필요 |
| Firebase Hosting URL 정상 접속 확인 | ⬜ 수동 검증 필요 |
| develop 브랜치에 이 변경사항 역머지 | ⬜ 수동 작업 필요 |

---

## 변경 파일

- `.github/workflows/ci.yml` — `deploy` 잡 추가 (27줄)

---

## Secret 설정 방법

**방법 1 (자동)**: 프로젝트 루트에서 `firebase init hosting:github` 실행
**방법 2 (수동)**: GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

- 키: `FIREBASE_SERVICE_ACCOUNT_POP_MAKER_9209F`
- 값: Firebase 서비스 계정 JSON 내용 전체

---

## 역머지 안내

이 핫픽스가 master에 머지된 후, develop 브랜치에도 반드시 역머지해야 합니다:

```bash
git checkout develop
git merge master
git push origin develop
```
