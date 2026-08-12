import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
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

function injectStyles(): Plugin {
  return {
    name: 'inject-library-styles',
    renderChunk(code: string, chunk: { isEntry: boolean }) {
      if (!chunk.isEntry) return null;
      return {
        code: `'use client';\nimport './styles.css';\n${code}`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [
    injectStyles(),
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
      external: (id) => externalPackages.some((packageName) => id === packageName || id.startsWith(`${packageName}/`)),
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'styles.css' : 'assets/[name]-[hash][extname]',
        banner: "'use client';",
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: '[name].js',
      },
    },
  },
});
