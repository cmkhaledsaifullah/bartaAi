/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['src/Home.tsx'],
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
    configFile: 'vite.config.ts',
  },
}
