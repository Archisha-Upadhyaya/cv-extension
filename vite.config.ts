import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'extension', // Set root to extension folder
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/src/popup/popup.html'),
            background: resolve(__dirname, 'extension/src/background.ts'),
    content: resolve(__dirname, 'extension/src/content/content.ts')
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return '[name].js';
        }
      }
    }
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/manifest.json',
          dest: '.' // goes to dist/
        },
        {
          src: 'src/popup/popup.html',
          dest: 'popup'
        }
      ]
    })
  ]
});
