# PRD to ROADMAP 메모리

이 파일은 prd-to-roadmap 에이전트의 영구 메모리입니다.
PRD 분석 패턴, 로드맵 생성 이력 등을 기록합니다.

---

## 프로젝트 기본 정보

- **프로젝트명**: POP 제작기 (pop-maker)
- **PRD 위치**: `docs/prd.md`
- **ROADMAP 위치**: `ROADMAP.md` (프로젝트 루트)

## 현재 PRD 핵심 요약

### 타겟 사용자
- **Primary**: 밴플러스 사용 약사 (사업자번호+ID 인증, 추후 Firebase Auth 전환)
- **Secondary**: 일반 사용자 (기본 기능만)
- **관리자**: `/admin` 페이지, Firebase Auth 이메일/비밀번호 로그인

### 기능 우선순위
| 우선순위 | 기능 | 상태 |
|---------|------|------|
| P0 | 캔버스 편집 (텍스트/이미지/드래그/Undo/레이어) | ✅ 완료 |
| P0 | 템플릿 (클라이언트 10종) | ✅ 완료 |
| P0 | 내보내기 (PNG/PDF/인쇄) | ✅ 완료 |
| P0 | 사용자 인증+저장 (사업자번호+ID, Firestore) | ✅ 완료 (로컬) |
| P0 | Firebase Hosting 배포 | ⬜ 예정 |
| P1 | 서버 이미지 에셋 (Storage + Firestore) | ⬜ 예정 |
| P1 | 관리자 페이지 (이미지/템플릿/사용자 관리) | ⬜ 예정 |
| P1 | AI 이미지 생성 (Claude API + Functions 프록시) | ⬜ 예정 |
| P2 | 공유, 모바일 미리보기, UI 폴리싱 | ⬜ 예정 |

### Firestore 데이터 모델 (docs/prd.md 섹션 5)
- `users/{userId}`: bizNumber, userId, isBanplus, createdAt, lastActiveAt
- `designs/{designId}`: ownerId, name, canvasData, thumbnail(Storage URL), isBanplus
- `templates/{templateId}`: name, category, previewUrl, canvasData, isActive
- `assets/{assetId}`: name, category, url(Storage URL), tags, isActive

## PRD → ROADMAP 변환 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-15 | 초기 PRD 작성, ROADMAP Sprint 1~5 구성 |
| 2026-03-15 | 백엔드 아키텍처 확정 (Firebase 전체 스택), 관리자 기능 추가, 해커톤 표현 제거 |

## ROADMAP 생성 시 주의사항

- Firebase Functions는 Spark 무료 플랜 미지원 → 관리자 API 스프린트 계획 시 Blaze 업그레이드 안내 포함
- Claude API 키 보안: Functions 프록시 필수, 클라이언트 직접 사용 금지
- Sprint 번호는 `sprint-planner MEMORY.md` 참조하여 다음 번호 결정
- PRD `docs/prd.md` 참조 (대문자 PRD.md 아님)
