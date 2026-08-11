import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const externalPackages = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  'clsx',
  'react',
  'react-dom',
  'zustand',
];

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      include: ['src'],
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        widgets: fileURLToPath(new URL('./src/widgets.ts', import.meta.url)),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => externalPackages.some(
        (packageName) => id === packageName || id.startsWith(`${packageName}/`),
      ),
      output: {
        assetFileNames: (assetInfo) => (
          assetInfo.name?.endsWith('.css') ? 'styles.css' : 'assets/[name]-[hash][extname]'
        ),
        banner: "'use client';",
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: '[name].js',
      },
    },
  },
});
