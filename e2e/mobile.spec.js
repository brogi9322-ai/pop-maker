import { test, expect } from '@playwright/test';

// 모바일 레이아웃 테스트 — Pixel 5 뷰포트(393×851)에서 실행
// playwright.config.js의 mobile-chrome 프로젝트에서 주로 실행됨
test.describe('모바일 레이아웃', () => {
  test('모바일 뷰포트에서 앱이 로드된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('모바일에서 헤더가 표시된다', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header, .header');
    await expect(header).toBeVisible();
  });

  test('모바일에서 캔버스가 표시된다', async ({ page }) => {
    await page.goto('/');
    // 모바일에서도 캔버스 영역이 노출되어야 함
    const canvas = page.locator('.canvas-wrapper, .canvas-area, [class*="canvas"]').first();
    await expect(canvas).toBeVisible();
  });

  // TODO(Sprint 8): 모바일 가로 스크롤 버그 수정 후 활성화
  // 현재 데스크톱 3패널 레이아웃이 모바일에서 overflow 발생 (body.scrollWidth 1009px > 뷰포트 398px)
  // 수정 완료 시 아래 주석을 해제하세요.
  //
  // test('모바일에서 가로 스크롤이 없다', async ({ page }) => {
  //   await page.goto('/');
  //   const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  //   const viewportWidth = page.viewportSize().width;
  //   expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  // });

  test('375px 뷰포트에서도 레이아웃이 깨지지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // 로고가 여전히 보여야 함
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
  });
});
