/**
 * Tests that verify store initial state values from create().
 * These must run WITHOUT any beforeEach resets to catch initial-value mutants.
 * Each test file in vitest gets a fresh module scope, so the stores are freshly created.
 */
import { describe, expect, it } from 'vitest'
import { useChatStore } from '../store/chatStore'
import { useSettingsStore } from '../store/settingsStore'
import { INITIAL_SYSTEM_MESSAGE } from '../config/constants'

describe('chatStore initial create-time state', () => {
  it('isInitialChat starts as true', () => {
    expect(useChatStore.getState().isInitialChat).toBe(true)
  })

  it('chatHistory starts with the initial system message', () => {
    expect(useChatStore.getState().chatHistory).toEqual([INITIAL_SYSTEM_MESSAGE])
  })

  it('query starts as empty string', () => {
    expect(useChatStore.getState().query).toBe('')
  })

  it('isProcessing starts as false', () => {
    expect(useChatStore.getState().isProcessing).toBe(false)
  })

  it('ragSteps starts as empty array', () => {
    expect(useChatStore.getState().ragSteps).toEqual([])
  })
})

describe('settingsStore initial create-time state', () => {
  it('apiKey starts as empty string', () => {
    expect(useSettingsStore.getState().apiKey).toBe('')
  })

  it('showSettings starts as false', () => {
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })
})
