/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'es2015', // safer for mobile webviews
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // 🔥 disables code splitting (IMPORTANT)
      },
    },
    chunkSizeWarningLimit: 1500, // avoid warnings due to single bundle
  },

  server: {
    headers: {
      'Cache-Control': 'no-store', // prevent stale chunks in dev
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
  },
})