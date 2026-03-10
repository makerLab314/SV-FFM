import { defineConfig } from 'vite';

export default defineConfig({
  base: '/SV-FFM/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    open: false,
  },
});
