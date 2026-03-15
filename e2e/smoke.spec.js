import { test, expect } from '@playwright/test';

test.describe('앱 기본 로딩', () => {
  test('홈 페이지가 정상적으로 로드된다', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
  });

  test('앱 타이틀이 존재한다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/POP/i);
  });

  test('헤더 로고가 표시된다', async ({ page }) => {
    await page.goto('/');
    // 로고 텍스트 확인 ("POP 제작기")
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('POP');
  });

  test('캔버스 영역이 렌더링된다', async ({ page }) => {
    await page.goto('/');
    // 캔버스 컨테이너 확인
    const canvas = page.locator('.canvas-wrapper, .canvas-area, [class*="canvas"]').first();
    await expect(canvas).toBeVisible();
  });

  test('좌측 패널이 표시된다', async ({ page }) => {
    await page.goto('/');
    const leftPanel = page.locator('.left-panel, .template-panel, [class*="left"]').first();
    await expect(leftPanel).toBeVisible();
  });

  test('우측 속성 패널이 표시된다 (데스크톱)', async ({ page, isMobile }) => {
    // 모바일에서는 우측 패널이 의도적으로 숨겨짐
    test.skip(isMobile, '모바일에서는 우측 패널이 숨겨지는 것이 정상입니다');
    await page.goto('/');
    const rightPanel = page.locator('.right-panel, .props-panel, [class*="right"]').first();
    await expect(rightPanel).toBeVisible();
  });
});
