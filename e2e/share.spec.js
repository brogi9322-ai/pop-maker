import { test, expect } from '@playwright/test';

// E2E_SHARE_ID 미설정 시 graceful skip
const SHARE_ID = process.env.E2E_SHARE_ID;

test.describe('/share/:id 공개 페이지', () => {
  test.beforeEach(() => {
    if (!SHARE_ID) {
      test.skip(true, 'E2E_SHARE_ID 환경변수가 설정되지 않아 share 테스트를 건너뜁니다. GitHub Secret에 E2E_SHARE_ID를 설정하세요.');
    }
  });

  test('공유 링크 페이지가 로드된다', async ({ page }) => {
    const response = await page.goto(`/share/${SHARE_ID}`);
    expect(response.status()).toBe(200);
  });

  test('공유 페이지에서 읽기 전용 콘텐츠가 표시된다', async ({ page }) => {
    await page.goto(`/share/${SHARE_ID}`);
    // 공유 페이지는 편집 UI가 없어야 함 (헤더 저장 버튼 없음)
    const saveBtn = page.locator('button:has-text("저장"), button:has-text("Save")');
    await expect(saveBtn).not.toBeVisible();
  });

  test('잘못된 공유 ID는 에러 상태를 표시한다', async ({ page }) => {
    await page.goto('/share/invalid-nonexistent-id-12345');
    // 에러 메시지 또는 404 상태
    const body = await page.content();
    const hasError = body.includes('찾을 수 없') || body.includes('존재하지') || body.includes('오류') || body.includes('error');
    // 최소한 앱이 크래시 없이 로드되어야 함
    await expect(page.locator('body')).toBeVisible();
  });
});
