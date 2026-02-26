/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/main.tsx',
    '!src/test/**',
  ],
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  ignoreStatic: true,
  timeoutMS: 60000,
  thresholds: {
    high: 95,
    low: 90,
    break: 90,
  },
  vitest: {
    configFile: 'vitest.config.ts',
  },
}
