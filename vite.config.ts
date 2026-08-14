import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const AION2_ORIGIN = 'https://aion2.plaync.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // 브라우저에서 aion2.plaync.com 을 직접 부르면 CORS 로 막히므로 개발 서버가 대신 호출한다.
    // /api/aion2/xxx -> https://aion2.plaync.com/api/xxx
    proxy: {
      '/api/aion2': {
        target: AION2_ORIGIN,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/aion2/, '/api'),
        headers: {
          Referer: `${AION2_ORIGIN}/ko-kr/characters/index`,
          Origin: AION2_ORIGIN,
        },
      },
    },
  },
})
