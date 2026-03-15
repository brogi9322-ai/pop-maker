import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    // Playwright E2E 테스트 파일은 Vitest 수집 대상에서 제외
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/hooks/**', 'src/components/**', 'src/utils/**'],
      exclude: ['src/test/**', 'src/main.jsx', 'src/firebase.js'],
    },
  },
})
