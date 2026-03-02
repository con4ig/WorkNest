import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // W Dockerze kontenery komunikują się przez nazwy usług (np. 'server'),
        // lokalnie przez localhost. Env variable rozwiązuje obie sytuacje.
        target: process.env.VITE_API_TARGET || 'http://localhost:5500',
        changeOrigin: true,
      },
    },
  },
})
