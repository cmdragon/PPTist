import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    vue(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api/v1/proxy/ppt_server': {
        target: 'http://192.168.2.103:8003',
        changeOrigin: true
      },
      '/api/v1/proxy/ppt_asset': {
        target: 'http://192.168.2.103:8003',
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: `
          @use '@/assets/styles/variable.scss' as *;
          @use '@/assets/styles/mixin.scss' as *;
        `
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia', 'axios'],
          'prosemirror': [
            'prosemirror-commands',
            'prosemirror-dropcursor',
            'prosemirror-gapcursor',
            'prosemirror-history',
            'prosemirror-inputrules',
            'prosemirror-keymap',
            'prosemirror-model',
            'prosemirror-schema-basic',
            'prosemirror-schema-list',
            'prosemirror-state',
            'prosemirror-view'
          ],
          'echarts': ['echarts'],
          'pptxgenjs': ['pptxgenjs'],
          'pptxtojson': ['pptxtojson'],
          'html-parser': ['@/utils/htmlParser'],
          'prosemirror-utils': ['@/utils/prosemirror']
        }
      }
    },
    chunkSizeWarningLimit: 1500
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
