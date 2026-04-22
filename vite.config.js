
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// "dev" || "prod"
const environment = "dev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: `dist`,
    manifest: 'manifest.json',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (normalizedId.includes('/node_modules/')) {
            if (normalizedId.includes('/react-router-dom/') || normalizedId.includes('/react-router/')) {
              return 'vendor-router'
            }

            if (normalizedId.includes('/react-dom/') || normalizedId.includes('/react/')) {
              return 'vendor-react'
            }

            return 'vendor'
          }

          if (
            normalizedId.includes('/src/components/SampleInfo.jsx') ||
            normalizedId.includes('/src/utils/index.js')
          ) {
            return 'shared-pages'
          }

          if (
            normalizedId.includes('/src/components/LazyLoadErrorBoundary.jsx') ||
            normalizedId.includes('/src/utils/manifest.js')
          ) {
            return 'lazy-runtime'
          }
        },
      },
    },
  },
})