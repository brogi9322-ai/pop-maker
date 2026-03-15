import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/hooks/**', 'src/components/**', 'src/utils/**'],
      exclude: [
        'src/test/**',
        'src/main.jsx',
        'src/firebase.js',
        // 아래 파일은 이번 Sprint 테스트 범위 외 (복잡한 DOM 이벤트 / Context 의존)
        'src/components/CanvasEditor.jsx',
        'src/components/PropsPanel.jsx',
        'src/components/AssetPanel.jsx',
        'src/components/TemplatePanel.jsx',
        'src/components/SharePage.jsx',
        'src/hooks/useAuth.js',
        'src/hooks/useEditor.js',
      ],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
      },
    },
  },
})
