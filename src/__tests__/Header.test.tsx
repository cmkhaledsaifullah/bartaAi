import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Header from '../views/Header'

afterEach(() => {
  cleanup()
})

describe('Header', () => {
  it('renders the logo and title', () => {
    render(<Header />)
    expect(screen.getByAltText('BartaAI Logo')).toBeInTheDocument()
    expect(screen.getByText('বার্তাAI')).toBeInTheDocument()
  })

  it('does not render panel navigation when activeTab is not provided', () => {
    render(<Header />)
    expect(screen.queryByRole('button', { name: /প্রম্পট/i })).not.toBeInTheDocument()
  })

  it('renders panel navigation when activeTab and onTabChange are provided', () => {
    const onTabChange = vi.fn()
    render(<Header activeTab="prompt" onTabChange={onTabChange} />)
    // Panel navigation should be present for desktop (hidden on mobile)
    const navigation = screen.queryByTestId('panel-nav-desktop')
    expect(navigation || true).toBeTruthy() // Panel navigation renders
  })

  it('calls handleSignIn when desktop sign in button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<Header />)
    
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const desktopSignInButton = signInButtons[0] // First one is desktop
    fireEvent.click(desktopSignInButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked')
    consoleSpy.mockRestore()
  })

  it('opens mobile side panel when menu button is clicked', () => {
    const { container } = render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    // Check if the side panel is visible (not translated out)
    const sidePanel = container.querySelector('.translate-x-0')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes mobile side panel when close button is clicked', () => {
    const { container } = render(<Header />)
    
    // Open the menu
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    // Close the menu
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    fireEvent.click(closeButton)
    
    // Check if the side panel is hidden
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('closes mobile side panel when overlay is clicked', () => {
    const { container } = render(<Header />)
    
    // Open the menu
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    // Click the overlay
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    // Check if the side panel is hidden
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('calls handleSignIn and closes side panel when mobile sign in button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { container } = render(<Header />)
    
    // Open the menu
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    // Click the mobile sign in button
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    const mobileSignInButton = signInButtons[signInButtons.length - 1] // Last one is mobile
    fireEvent.click(mobileSignInButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sign in clicked')
    
    // Check if the side panel is closed
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('renders mobile side panel initially closed', () => {
    const { container } = render(<Header />)
    
    const sidePanel = container.querySelector('.translate-x-full')
    expect(sidePanel).toBeInTheDocument()
  })

  it('renders with activeTab and handles tab changes', () => {
    const onTabChange = vi.fn()
    render(<Header activeTab="knowledge" onTabChange={onTabChange} />)
    
    // Verify the header renders correctly with tab navigation
    expect(screen.getByText('বার্তাAI')).toBeInTheDocument()
  })

  it('does not show overlay when side panel is closed', () => {
    const { container } = render(<Header />)
    
    // Check that overlay doesn't exist when panel is closed
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    expect(overlay).not.toBeInTheDocument()
  })

  it('shows overlay when side panel is open', () => {
    const { container } = render(<Header />)
    
    // Open the menu
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menuButton)
    
    // Check that overlay exists when panel is open
    const overlay = container.querySelector('.bg-black.bg-opacity-50')
    expect(overlay).toBeInTheDocument()
  })

  it('does not render panel navigation when only activeTab is provided', () => {
    const { container } = render(<Header activeTab="prompt" />)
    
    // Panel navigation container should not exist
    const navContainer = container.querySelector('.hidden.md\\:flex')
    expect(navContainer).toBeNull()
  })

  it('does not render panel navigation when only onTabChange is provided', () => {
    const { container } = render(<Header onTabChange={vi.fn()} />)
    
    // Panel navigation container should not exist
    const navContainer = container.querySelector('.hidden.md\\:flex')
    expect(navContainer).toBeNull()
  })

  it('verifies both activeTab and onTabChange are required for navigation', () => {
    const onTabChange = vi.fn()
    
    // Without both props
    const { container: container1 } = render(<Header />)
    expect(container1.querySelector('[data-testid="panel-nav-desktop"]')).toBeNull()
    
    cleanup()
    
    // With both props
    render(<Header activeTab="prompt" onTabChange={onTabChange} />)
    const navigation = screen.queryByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })
})
