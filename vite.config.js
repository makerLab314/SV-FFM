import { defineConfig } from 'vite';

export default defineConfig({
  // muss dem GitHub-Pages-Unterpfad entsprechen: https://<user>.github.io/SV-FFM/
  base: '/SV-FFM/',
  build: {
    target: 'es2020',
    cssMinify: true,
  },
  server: {
    open: false,
  },
});
