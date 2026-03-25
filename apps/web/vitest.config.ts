import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@sirtaskalot/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@sirtaskalot/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
      '@sirtaskalot/telemetry': path.resolve(__dirname, '../../packages/telemetry/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
