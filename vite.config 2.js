import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // CRUCIAAL: base = /scout/ zodat alle assets correct laden
  // op www.voetbal4all.eu/scout/
  base: '/scout/',

  // Vite root = de map met scout-index.html
  root: resolve(__dirname, 'src/scout'),

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/scout/scout-index.html'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api/scout': {
        target: 'https://voetbal4all-backend-database.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  preview: {
    port: 4173,
  },

  resolve: {
    alias: {
      '@scout': resolve(__dirname, 'src/scout'),
    },
  },
});
