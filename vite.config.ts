/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
      avif: {
        lossless: true,
      },
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: false,
              },
            },
          },
          'removeViewBox',
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pozivnica: resolve(__dirname, 'pozivnica/index.html'),
      },
    },
  },
  server: {
    proxy: {
      // Forward API calls to a locally running `vercel dev` (default port 3000).
      // Run `vercel dev --listen 3001` (or any free port) alongside `npm run dev`
      // and update the target if you change ports. Lets the UI keep Vite's HMR
      // while exercising real Vercel Functions + Neon.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
})
