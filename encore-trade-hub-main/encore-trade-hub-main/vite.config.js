import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // This will proxy /api requests to your Google Apps Script
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
