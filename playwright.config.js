import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // CI에서 재시도 2회
  retries: process.env.CI ? 2 : 0,
  // 병렬 실행 (CI에서는 단일 워커)
  workers: process.env.CI ? 1 : undefined,
  // 리포트 설정
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    // 프로덕션 배포 URL
    baseURL: 'https://pop-maker-9209f.web.app',
    // 실패 시 스크린샷
    screenshot: 'only-on-failure',
    // 실패 시 trace
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
