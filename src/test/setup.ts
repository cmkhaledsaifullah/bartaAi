import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
})

// Help React understand that we're running inside an act-enabled environment.
// @ts-expect-error -- flag is intentionally assigned on the global scope
globalThis.IS_REACT_ACT_ENVIRONMENT = true
