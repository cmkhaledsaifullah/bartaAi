import { create } from 'zustand'

type SettingsStoreState = {
  apiKey: string
  showSettings: boolean
  setApiKey: (key: string) => void
  toggleSettings: () => void
  closeSettings: () => void
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  apiKey: '',
  showSettings: false,
  setApiKey: (key) => set({ apiKey: key }),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  closeSettings: () => set({ showSettings: false }),
}))
