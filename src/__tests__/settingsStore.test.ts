import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '../store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({ apiKey: '', showSettings: false })
})

describe('settingsStore', () => {
  it('has correct initial state', () => {
    // Fresh store should have empty apiKey and showSettings false
    const state = useSettingsStore.getState()
    expect(state.apiKey).toBe('')
    expect(state.showSettings).toBe(false)
  })

  it('closeSettings sets showSettings to false', () => {
    useSettingsStore.setState({ showSettings: true })
    useSettingsStore.getState().closeSettings()
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('closeSettings is a no-op when showSettings is already false', () => {
    useSettingsStore.getState().closeSettings()
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })
})
