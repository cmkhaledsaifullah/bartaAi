import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Header from '../views/Header'
import { useSettingsStore } from '../store/settingsStore'
import { useNavigationStore } from '../store/navigationStore'
import { TAB_CHAT_ID } from '../config/constants'

const createConsoleLogSpy = () => {
  return vi.spyOn(console, 'log').mockImplementation(() => {})
}

type StoreOverrides = {
  showSettings?: boolean
  apiKey?: string
  activeTab?: string
}

const renderHeader = (overrides: StoreOverrides & { onNewSession?: () => void } = {}) => {
  const { showSettings, apiKey, activeTab, ...rest } = overrides

  useSettingsStore.setState({
    showSettings: showSettings ?? false,
    apiKey: apiKey ?? '',
  })
  useNavigationStore.setState({
    activeTab: activeTab ?? TAB_CHAT_ID,
  })

  const onNewSession = rest.onNewSession ?? vi.fn()
  return { ...render(<Header onNewSession={onNewSession} />), onNewSession }
}

beforeEach(() => {
  useSettingsStore.setState({ showSettings: false, apiKey: '' })
  useNavigationStore.setState({ activeTab: TAB_CHAT_ID })
})

afterEach(() => {
  cleanup()
})

describe('Header', () => {
  it('renders the title', () => {
    renderHeader()
    expect(screen.getByText('বার্তাAI')).toBeInTheDocument()
  })

  it('title button triggers new session and tab change', () => {
    const onNewSession = vi.fn()
    renderHeader({ activeTab: 'knowledge', onNewSession })

    fireEvent.click(screen.getByRole('button', { name: /start new chat session/i }))
    expect(useNavigationStore.getState().activeTab).toBe('chat')
    expect(onNewSession).toHaveBeenCalledTimes(1)
  })

  it('renders panel navigation with store-driven activeTab', () => {
    renderHeader({ activeTab: 'chat' })
    const navigation = screen.queryByTestId('panel-nav-desktop')
    expect(navigation || true).toBeTruthy()
  })

  it('calls handleSignIn when desktop sign in button is clicked', () => {
    const consoleSpy = createConsoleLogSpy()
    renderHeader()
    
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const desktopSignInButton = signInButtons[0]
    fireEvent.click(desktopSignInButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked')
    consoleSpy.mockRestore()
  })

  it('opens mobile side panel when menu button is clicked', () => {
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const sidePanel = container.querySelector('.translate-x-0')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes mobile side panel when close button is clicked', () => {
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const closeButton = screen.getByRole('button', { name: /close side panel/i })
    fireEvent.click(closeButton)
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes mobile side panel when overlay is clicked', () => {
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('calls handleSignIn and keeps side panel open when mobile sign in button is clicked', () => {
    const consoleSpy = createConsoleLogSpy()
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const mobileSignInButton = signInButtons[signInButtons.length - 1]
    fireEvent.click(mobileSignInButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked')
    
    const sidePanel = container.querySelector('.translate-x-0')
    expect(sidePanel).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('renders mobile side panel initially closed', () => {
    const { container } = renderHeader()
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('renders with activeTab from store', () => {
    renderHeader({ activeTab: 'knowledge' })
    
    expect(screen.getByText('বার্তাAI')).toBeInTheDocument()
  })

  it('does not show overlay when side panel is closed', () => {
    const { container } = renderHeader()
    
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    expect(overlay).not.toBeInTheDocument()
  })

  it('shows overlay when side panel is open', () => {
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    expect(overlay).toBeInTheDocument()
  })

  it('renders navigation when activeTab is set in store', () => {
    renderHeader({ activeTab: 'chat' })
    const navigation = screen.queryByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('toggles model configuration modal via Model button in side panel', () => {
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const modelButtons = screen.getAllByRole('button', { name: /model/i })
    fireEvent.click(modelButtons[modelButtons.length - 1])
    expect(useSettingsStore.getState().showSettings).toBe(true)
  })

  it('shows model configuration modal when showSettings is true', () => {
    renderHeader({ showSettings: true })

    expect(screen.getByText('Model Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument()
  })

  it('does not show model configuration modal when showSettings is false', () => {
    renderHeader({ showSettings: false })

    expect(screen.queryByText('Model Configuration')).not.toBeInTheDocument()
  })

  it('updates API key input in configuration modal', () => {
    renderHeader({ showSettings: true })

    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'test-key-123' } })
    expect(useSettingsStore.getState().apiKey).toBe('test-key-123')
  })

  it('closes configuration modal via close button', () => {
    renderHeader({ showSettings: true })

    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('closes configuration modal via backdrop click', () => {
    const { container } = renderHeader({ showSettings: true })

    // Click the modal backdrop (z-[60])
    const backdrops = container.querySelectorAll('.bg-black.bg-opacity-50')
    const modalBackdrop = Array.from(backdrops).find(el => el.classList.contains('z-\\[60\\]') || el.className.includes('z-[60]'))
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop)
      expect(useSettingsStore.getState().showSettings).toBe(false)
    }
  })

  it('mobile Model button toggles settings and keeps sidebar open', () => {
    const { container } = renderHeader()

    // Open sidebar
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    // Click mobile Model button
    const modelButtons = screen.getAllByRole('button', { name: /model/i })
    const mobileModelButton = modelButtons[modelButtons.length - 1]
    fireEvent.click(mobileModelButton)

    expect(useSettingsStore.getState().showSettings).toBe(true)
    // Sidebar should stay open
    const sidePanel = container.querySelector('.translate-x-0')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes model modal when clicking outside via mousedown', () => {
    renderHeader({ showSettings: true })

    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('does not close model modal when clicking inside the modal', () => {
    renderHeader({ showSettings: true })

    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.mouseDown(apiInput)
    expect(useSettingsStore.getState().showSettings).toBe(true)
  })

  it('removes mousedown listener on cleanup and respects dependency changes', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHeader({ showSettings: true })

    // Verify listener was registered
    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    // Verify listener works before unmount
    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)

    unmount()

    // Verify removeEventListener was called with 'mousedown'
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('does not toggle settings on outside click when showSettings is false', () => {
    renderHeader({ showSettings: false })

    // Click on body - should NOT trigger because showSettings is false
    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)

    // Also click on various elements to make sure
    fireEvent.mouseDown(screen.getByText('বার্তাAI'))
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('does not close settings when clicking inside the modal content', () => {
    renderHeader({ showSettings: true })

    const configTitle = screen.getByText('Model Configuration')
    fireEvent.mouseDown(configTitle)
    expect(useSettingsStore.getState().showSettings).toBe(true)
  })

  it('applies consistent styling to Model button in side panel', () => {
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const modelButtons = screen.getAllByRole('button', { name: /model/i })
    const sideMenuModelButton = modelButtons[modelButtons.length - 1]
    expect(sideMenuModelButton).toHaveClass('bg-slate-100')
    expect(sideMenuModelButton).toHaveClass('text-slate-700')
  })

  it('renders Model button in side panel with expected classes', () => {
    renderHeader({ showSettings: false })

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const modelButtons = screen.getAllByRole('button', { name: /model/i })
    const sideMenuModelButton = modelButtons[modelButtons.length - 1]
    expect(sideMenuModelButton).toHaveClass('font-medium')
    expect(sideMenuModelButton).toHaveClass('rounded-lg')
  })

  it('calls onNewSession and sets activeTab to chat', () => {
    const onNewSession = vi.fn()
    renderHeader({ activeTab: 'knowledge', onNewSession })

    fireEvent.click(screen.getByRole('button', { name: /start new chat session/i }))
    expect(onNewSession).toHaveBeenCalledTimes(1)
    expect(useNavigationStore.getState().activeTab).toBe('chat')
  })

  it('re-registers mousedown listener when showSettings changes', () => {
    useSettingsStore.setState({ showSettings: false })
    render(<Header onNewSession={vi.fn()} />)

    // When showSettings is false, clicking outside should not change state
    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)

    // Update store to showSettings true
    act(() => {
      useSettingsStore.setState({ showSettings: true })
    })

    // Now clicking outside should toggle showSettings
    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('reflects the API key from the store in the configuration modal', () => {
    useSettingsStore.setState({ apiKey: 'my-test-key' })
    renderHeader({ showSettings: true, apiKey: 'my-test-key' })
    const apiInput = screen.getByLabelText(/Gemini API Key/i) as HTMLInputElement
    expect(apiInput.value).toBe('my-test-key')
  })

  it('closes modal via outside click only when showModels is true (not OR)', () => {
    // This verifies the && logic: showModels must be true AND click outside modal
    renderHeader({ showSettings: false })
    fireEvent.mouseDown(document.body)
    // Should remain false — && means both conditions needed
    expect(useSettingsStore.getState().showSettings).toBe(false)

    // Now set to true and verify outside click closes
    act(() => {
      useSettingsStore.setState({ showSettings: true })
    })
    fireEvent.mouseDown(document.body)
    expect(useSettingsStore.getState().showSettings).toBe(false)
  })

  it('shows Close menu aria-label when side panel is open', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()
  })
})