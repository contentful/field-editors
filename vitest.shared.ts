import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


const rootDir = fileURLToPath(new URL('.', import.meta.url));

export function createVitestConfig(packageName: string) {
  return {
    plugins: [react()],
    test: {
      globals: false,
      environment: 'jsdom' as const,
      setupFiles: [resolve(rootDir, 'vitest.setup.ts')],
      include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      reporters: [
        'default',
        ['junit', { outputFile: resolve(rootDir, `reports/${packageName}-results.xml`) }],
      ] as const,
    },
  };
}
