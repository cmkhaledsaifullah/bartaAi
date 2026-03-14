import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/e2e/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    reporters: ['./vitest.e2e.reporter.js'],
    sequence: {
      concurrent: false,
    },
  },
})
