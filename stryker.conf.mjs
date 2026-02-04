/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['src/Home.tsx'],
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  ignoreStatic: true,
  timeoutMS: 60000,
  vitest: {
    configFile: 'vite.config.ts',
  },
}
