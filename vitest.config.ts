import { defineConfig } from 'vitest/config';

// Vitest covers the pure TypeScript layers (domain + application).
// For React Native component tests, add jest-expo later.
export default defineConfig({
  test: {
    include: ['src/{shared,modules}/**/*.test.ts'],
  },
});
