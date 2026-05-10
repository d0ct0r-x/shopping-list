import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/__mocks__/async-storage.ts',
      ),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
