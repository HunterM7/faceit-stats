import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  cacheDir: path.resolve(__dirname, '../.cache/vite-client'),
  plugins: [ react() ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@requests': path.resolve(__dirname, 'src/requests'),
      '@images': path.resolve(__dirname, 'src/images'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
