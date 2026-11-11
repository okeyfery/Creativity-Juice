import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      cssTarget: ['safari14', 'chrome87', 'edge88', 'firefox78'],
    },
    server: {
      // HMR is disabled in AI Studio to prevent flickering and reload loops.
      hmr: false,
      watch: null,
    },
  };
});
