/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      'src/main.tsx',
      'src/App.tsx',
      '**/*.integration.{js,jsx,ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'node_modules/**',
        'src/components/ui/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.integration.{js,jsx,ts,tsx}'
      ]
    }
  }
}); 