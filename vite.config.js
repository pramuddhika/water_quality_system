import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/water_quality_system/' : '/',
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1600,
    },
  }
});