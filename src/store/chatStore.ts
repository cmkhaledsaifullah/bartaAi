import { create } from 'zustand'

type ChatStoreState = {
  isInitialChat: boolean
  startConversation: () => void
  resetChat: () => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isInitialChat: true,
  startConversation: () => set({ isInitialChat: false }),
  resetChat: () => set({ isInitialChat: true }),
}))
