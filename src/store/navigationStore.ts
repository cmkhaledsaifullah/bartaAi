import { create } from 'zustand'
import { TAB_CHAT_ID } from '../config/constants'

type NavigationStoreState = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useNavigationStore = create<NavigationStoreState>((set) => ({
  activeTab: TAB_CHAT_ID,
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
