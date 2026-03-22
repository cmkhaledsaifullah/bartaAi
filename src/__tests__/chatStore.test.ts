import { beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../store/chatStore'
import { INITIAL_SYSTEM_MESSAGE } from '../config/constants'

beforeEach(() => {
  useChatStore.getState().resetChat()
})

describe('chatStore', () => {
  it('has correct initial state values', () => {
    const state = useChatStore.getState()
    expect(state.isInitialChat).toBe(true)
    expect(state.chatHistory).toEqual([INITIAL_SYSTEM_MESSAGE])
    expect(state.query).toBe('')
    expect(state.isProcessing).toBe(false)
    expect(state.ragSteps).toEqual([])
  })

  it('resetRagSteps clears ragSteps to empty array', () => {
    useChatStore.setState({
      ragSteps: [{ id: 'step-1', text: 'test', status: 'processing' as const }],
    })
    expect(useChatStore.getState().ragSteps).toHaveLength(1)

    useChatStore.getState().resetRagSteps()
    expect(useChatStore.getState().ragSteps).toEqual([])
  })

  it('resetChat restores all fields to initial state', () => {
    // Modify all state
    useChatStore.setState({
      isInitialChat: false,
      chatHistory: [],
      query: 'test',
      isProcessing: true,
      ragSteps: [{ id: '1', text: 'step', status: 'success' as const }],
    })

    useChatStore.getState().resetChat()

    const state = useChatStore.getState()
    expect(state.isInitialChat).toBe(true)
    expect(state.chatHistory).toEqual([INITIAL_SYSTEM_MESSAGE])
    expect(state.query).toBe('')
    expect(state.isProcessing).toBe(false)
    expect(state.ragSteps).toEqual([])
  })
})
