import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'assets/web',
    emptyOutDir: true,
  },
});

