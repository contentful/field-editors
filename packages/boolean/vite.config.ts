import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: [resolve(__dirname, 'src/index.tsx')],
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['react'],
      output: {
        //file: `dist/field-editor-boolean.cjs.production.min.js`,
        name: '@contentful/field-editor-boolean',
        sourcemap: true,
        exports: 'named',
        format: 'cjs',
        freeze: false,
        globals: {
          react: 'React',
        },
      },
    },
  },
  plugins: [react(), dts()],
});
