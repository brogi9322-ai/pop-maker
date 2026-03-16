# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD-sprint{n}.md`로 이동됩니다.

---

### Sprint 9: Claude AI를 이용한 SVG 에셋 생성 (2026-03-16)

PR: https://github.com/brogi9322-ai/pop-maker/pull/18

포함된 주요 기능:
- AssetPanel "AI 생성" 탭 — 텍스트 프롬프트로 SVG 아이콘 생성
- DOMPurify sanitize + base64 data URL 변환 (XSS 방어)
- localStorage 영속 저장 (최대 50개)
- API 키 미설정 시 graceful degradation

검증 결과:
- ✅ `npm run lint` 경고 없음
- ✅ `npm test` 257개 통과
- ✅ `npm run build` 성공

수동 검증 필요 항목:
- ⬜ `VITE_CLAUDE_API_KEY` 설정 후 AI 생성 탭 → 프롬프트 입력 → SVG 생성 동작 확인
- ⬜ 생성된 에셋 클릭 시 캔버스 삽입 확인
- ⬜ 에셋 삭제 버튼 동작 확인
- ⬜ API 키 미설정 시 안내 메시지 표시 + 기존 탭 정상 동작 확인
- ⬜ 새로고침 후 AI 에셋 localStorage 복원 확인

상세 리뷰 결과: `docs/sprint/sprint9.md` 참조

---

### Hotfix: Firestore 저장 불가 및 이미지 내보내기 선택 핸들 포함 버그 수정 (2026-03-16)

PR: https://github.com/brogi9322-ai/pop-maker/pull/17

- ✅ 코드 리뷰 완료
- ✅ lint 통과
- ✅ test 통과 (222개)
- ✅ build 성공

- ⬜ 수동 검증 필요 항목:
  - Firebase Hosting 배포 후 Firestore 저장 기능 동작 확인 (콘솔 PERMISSION_DENIED 에러 없음)
  - PNG/PDF 내보내기 시 선택 핸들(점선 테두리, 리사이즈 핸들) 미포함 확인
  - `firebase deploy --only firestore:rules` 또는 전체 배포로 Firestore 규칙 반영 확인

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
