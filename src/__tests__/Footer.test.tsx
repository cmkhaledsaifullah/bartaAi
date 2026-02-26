import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '../views/Footer'

describe('Footer', () => {
  it('renders desktop footer with copyright text', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('© The 880 Dispatch')
    expect(footer).toHaveClass('hidden', 'md:block')
  })

  it('does not render mobile navigation when activeTab is missing', () => {
    const { container } = render(<Footer />)
    
    // Mobile tab bar should not be present without activeTab
    const mobileBar = container.querySelector('.md\\:hidden.fixed.bottom-0')
    expect(mobileBar).toBeNull()
  })

  it('does not render mobile navigation when onTabChange is missing', () => {
    const { container } = render(<Footer activeTab="prompt" />)
    
    // Mobile tab bar should not be present without onTabChange
    const mobileBar = container.querySelector('.md\\:hidden.fixed.bottom-0')
    expect(mobileBar).toBeNull()
  })

  it('renders mobile navigation when both activeTab and onTabChange are provided', () => {
    const onTabChange = vi.fn()
    const { container } = render(<Footer activeTab="prompt" onTabChange={onTabChange} />)
    
    // Mobile tab bar should be present
    const mobileBar = container.querySelector('.md\\:hidden.fixed.bottom-0')
    expect(mobileBar).not.toBeNull()
    expect(mobileBar).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
  })

  it('passes correct props to PanelNavigation in mobile mode', () => {
    const onTabChange = vi.fn()
    const { container } = render(<Footer activeTab="knowledge" onTabChange={onTabChange} />)
    
    // PanelNavigation should receive mobile variant
    const panelNav = within(container).getByRole('navigation')
    expect(panelNav).toHaveAttribute('data-variant', 'mobile')
  })

  it('verifies mobile bottom tab bar has correct z-index and styling', () => {
    const onTabChange = vi.fn()
    const { container } = render(<Footer activeTab="prompt" onTabChange={onTabChange} />)
    
    const mobileBar = container.querySelector('.md\\:hidden.fixed.bottom-0')
    expect(mobileBar).toHaveClass('z-50', 'shadow-lg', 'border-t')
  })

  it('verifies desktop footer has correct styling classes', () => {
    const footer = render(<Footer />).container.querySelector('footer')
    
    expect(footer).toHaveClass('bg-white', 'border-t', 'border-slate-200')
  })
})
