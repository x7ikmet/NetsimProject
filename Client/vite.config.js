import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5159',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5159',
        changeOrigin: true,
      },
      '/crud': {
        target: 'http://localhost:5159',
        changeOrigin: true,
      },
    },
    allowedHosts: ['.ngrok-free.app']
  },
})
