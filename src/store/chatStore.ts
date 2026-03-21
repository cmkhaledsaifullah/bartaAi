import { create } from 'zustand'
import type { ChatMessage, RagStep, RagStatus } from '../types'
import { INITIAL_SYSTEM_MESSAGE, CHAT_PLACEHOLDER, EXAMPLE_QUESTIONS } from '../config/constants'

type ChatStoreState = {
  isInitialChat: boolean
  chatHistory: ChatMessage[]
  query: string
  isProcessing: boolean
  ragSteps: RagStep[]
  placeholder: string
  exampleQuestions: string[]

  setQuery: (query: string) => void
  addMessage: (msg: ChatMessage) => void
  addRagStep: (text: string, status: RagStatus) => void
  resetRagSteps: () => void
  setIsProcessing: (processing: boolean) => void
  startConversation: () => void
  resetChat: () => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isInitialChat: true,
  chatHistory: [INITIAL_SYSTEM_MESSAGE],
  query: '',
  isProcessing: false,
  ragSteps: [],
  placeholder: CHAT_PLACEHOLDER,
  exampleQuestions: EXAMPLE_QUESTIONS,

  setQuery: (query) => set({ query }),
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  addRagStep: (text, status) =>
    set((state) => ({
      ragSteps: [...state.ragSteps, { text, status, id: `step-${Date.now()}-${Math.random()}` }],
    })),
  resetRagSteps: () => set({ ragSteps: [] }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  startConversation: () => set({ isInitialChat: false }),
  resetChat: () =>
    set({
      isInitialChat: true,
      chatHistory: [INITIAL_SYSTEM_MESSAGE],
      query: '',
      isProcessing: false,
      ragSteps: [],
    }),
}))
