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
        additionalData: `
          @import '@/assets/styles/variable.scss';
          @import '@/assets/styles/mixin.scss';
        `
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
