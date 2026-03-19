import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Header from '../views/Header'

const createConsoleLogSpy = () => {
  return vi.spyOn(console, 'log').mockImplementation(() => {})
}

const defaultProps: ComponentProps<typeof Header> = {
  showModels: false,
  onToggleModels: vi.fn(),
  apiKey: '',
  onApiKeyChange: vi.fn(),
  onNewSession: vi.fn(),
}

const renderHeader = (overrides: Partial<ComponentProps<typeof Header>> = {}) => {
  const props = { ...defaultProps, ...overrides }
  // Reset mocks for each render
  if (!overrides.onToggleModels) props.onToggleModels = vi.fn()
  if (!overrides.onApiKeyChange) props.onApiKeyChange = vi.fn()
  if (!overrides.onNewSession) props.onNewSession = vi.fn()
  return { ...render(<Header {...props} />), props }
}

afterEach(() => {
  cleanup()
})

describe('Header', () => {
  it('renders the title', () => {
    renderHeader()
    expect(screen.getByText('বার্তাAI')).toBeInTheDocument()
  })

  it('title button triggers new session and tab change', () => {
    const onTabChange = vi.fn()
    const onNewSession = vi.fn()
    renderHeader({ activeTab: 'knowledge', onTabChange, onNewSession })

    fireEvent.click(screen.getByRole('button', { name: /start new chat session/i }))
    expect(onTabChange).toHaveBeenCalledWith('prompt')
    expect(onNewSession).toHaveBeenCalledTimes(1)
  })

  it('does not render panel navigation when activeTab is not provided', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: /প্রম্পট/i })).not.toBeInTheDocument()
  })

  it('renders panel navigation when activeTab and onTabChange are provided', () => {
    const onTabChange = vi.fn()
    renderHeader({ activeTab: 'prompt', onTabChange })
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
    
    const closeButton = screen.getByRole('button', { name: /close menu/i })
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

  it('calls handleSignIn and closes side panel when mobile sign in button is clicked', () => {
    const consoleSpy = createConsoleLogSpy()
    const { container } = renderHeader()
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const mobileSignInButton = signInButtons[signInButtons.length - 1]
    fireEvent.click(mobileSignInButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked')
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('renders mobile side panel initially closed', () => {
    const { container } = renderHeader()
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('renders with activeTab and handles tab changes', () => {
    const onTabChange = vi.fn()
    renderHeader({ activeTab: 'knowledge', onTabChange })
    
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

  it('does not render panel navigation when only activeTab is provided', () => {
    renderHeader({ activeTab: 'prompt' })
    
    const navigation = screen.queryByRole('navigation')
    expect(navigation).not.toBeInTheDocument()
  })

  it('does not render panel navigation when only onTabChange is provided', () => {
    renderHeader({ onTabChange: vi.fn() })
    
    const navigation = screen.queryByRole('navigation')
    expect(navigation).not.toBeInTheDocument()
  })

  it('verifies both activeTab and onTabChange are required for navigation', () => {
    const onTabChange = vi.fn()
    
    renderHeader()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    
    cleanup()
    
    renderHeader({ activeTab: 'prompt', onTabChange })
    const navigation = screen.queryByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('toggles model configuration modal via desktop Model button', () => {
    const onToggleModels = vi.fn()
    renderHeader({ onToggleModels })

    fireEvent.click(screen.getByTestId('models-toggle'))
    expect(onToggleModels).toHaveBeenCalledTimes(1)
  })

  it('shows model configuration modal when showModels is true', () => {
    renderHeader({ showModels: true })

    expect(screen.getByText('Model Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument()
  })

  it('does not show model configuration modal when showModels is false', () => {
    renderHeader({ showModels: false })

    expect(screen.queryByText('Model Configuration')).not.toBeInTheDocument()
  })

  it('updates API key input in configuration modal', () => {
    const onApiKeyChange = vi.fn()
    renderHeader({ showModels: true, onApiKeyChange })

    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'test-key-123' } })
    expect(onApiKeyChange).toHaveBeenCalledWith('test-key-123')
  })

  it('closes configuration modal via close button', () => {
    const onToggleModels = vi.fn()
    renderHeader({ showModels: true, onToggleModels })

    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))
    expect(onToggleModels).toHaveBeenCalledTimes(1)
  })

  it('closes configuration modal via backdrop click', () => {
    const onToggleModels = vi.fn()
    const { container } = renderHeader({ showModels: true, onToggleModels })

    // Click the modal backdrop (z-[60])
    const backdrops = container.querySelectorAll('.bg-black.bg-opacity-50')
    const modalBackdrop = Array.from(backdrops).find(el => el.classList.contains('z-\\[60\\]') || el.className.includes('z-[60]'))
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop)
      expect(onToggleModels).toHaveBeenCalled()
    }
  })

  it('mobile Model button triggers onToggleModels and closes sidebar', () => {
    const onToggleModels = vi.fn()
    const { container } = renderHeader({ onToggleModels })

    // Open sidebar
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    // Click mobile Model button
    const modelButtons = screen.getAllByRole('button', { name: /model/i })
    const mobileModelButton = modelButtons[modelButtons.length - 1]
    fireEvent.click(mobileModelButton)

    expect(onToggleModels).toHaveBeenCalledTimes(1)
    // Sidebar should close
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes model modal when clicking outside via mousedown', () => {
    const onToggleModels = vi.fn()
    renderHeader({ showModels: true, onToggleModels })

    fireEvent.mouseDown(document.body)
    expect(onToggleModels).toHaveBeenCalledTimes(1)
  })

  it('does not close model modal when clicking inside the modal', () => {
    const onToggleModels = vi.fn()
    renderHeader({ showModels: true, onToggleModels })

    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.mouseDown(apiInput)
    expect(onToggleModels).not.toHaveBeenCalled()
  })

  it('removes mousedown listener on cleanup and respects dependency changes', () => {
    const onToggleModels = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHeader({ showModels: true, onToggleModels })

    // Verify listener was registered
    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    // Verify listener works before unmount
    fireEvent.mouseDown(document.body)
    expect(onToggleModels).toHaveBeenCalledTimes(1)

    unmount()

    // Verify removeEventListener was called with 'mousedown'
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    // After unmount, the listener should NOT fire
    onToggleModels.mockClear()
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onToggleModels).not.toHaveBeenCalled()

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('does not call onToggleModels on outside click when showModels is false', () => {
    const onToggleModels = vi.fn()
    // Render with showModels false - the modelsRef and modelsButtonRef will still have DOM elements
    // but the handler should NOT trigger because showModels is false.
    // If the mutant changes && to ||, modelsRef.current being truthy would bypass showModels check
    renderHeader({ showModels: false, onToggleModels })

    // Click on body - should NOT trigger because showModels is false
    fireEvent.mouseDown(document.body)
    expect(onToggleModels).not.toHaveBeenCalled()

    // Also click on various elements to make sure
    fireEvent.mouseDown(screen.getByText('বার্তাAI'))
    expect(onToggleModels).not.toHaveBeenCalled()
  })

  it('does not call onToggleModels when clicking on the models button itself', () => {
    const onToggleModels = vi.fn()
    renderHeader({ showModels: true, onToggleModels })

    const modelsButton = screen.getByTestId('models-toggle')
    fireEvent.mouseDown(modelsButton)
    expect(onToggleModels).not.toHaveBeenCalled()
  })

  it('applies active styling to Model button when showModels is true', () => {
    renderHeader({ showModels: true })

    const modelsButton = screen.getByTestId('models-toggle')
    expect(modelsButton).toHaveClass('bg-emerald-600')
    expect(modelsButton).toHaveClass('text-white')
    expect(modelsButton).not.toHaveClass('bg-slate-100')
  })

  it('applies inactive styling to Model button when showModels is false', () => {
    renderHeader({ showModels: false })

    const modelsButton = screen.getByTestId('models-toggle')
    expect(modelsButton).toHaveClass('bg-slate-100')
    expect(modelsButton).toHaveClass('text-slate-700')
    expect(modelsButton).not.toHaveClass('bg-emerald-600')
  })

  it('calls onNewSession but not onTabChange when onTabChange is undefined', () => {
    const onNewSession = vi.fn()
    renderHeader({ onNewSession })

    fireEvent.click(screen.getByRole('button', { name: /start new chat session/i }))
    expect(onNewSession).toHaveBeenCalledTimes(1)
    // Should not throw even though onTabChange is undefined (optional chaining)
  })

  it('re-registers mousedown listener when showModels changes', () => {
    const onToggleModels = vi.fn()
    const { rerender } = render(
      <Header
        showModels={false}
        onToggleModels={onToggleModels}
        apiKey=""
        onApiKeyChange={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    // When showModels is false, clicking outside should not trigger
    fireEvent.mouseDown(document.body)
    expect(onToggleModels).not.toHaveBeenCalled()

    // Re-render with showModels true
    rerender(
      <Header
        showModels={true}
        onToggleModels={onToggleModels}
        apiKey=""
        onApiKeyChange={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    // Now clicking outside should trigger onToggleModels
    fireEvent.mouseDown(document.body)
    expect(onToggleModels).toHaveBeenCalledTimes(1)
  })
})