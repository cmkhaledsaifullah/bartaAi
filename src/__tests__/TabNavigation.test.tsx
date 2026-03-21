import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TabNavigation from '../components/TabNavigation'

afterEach(() => {
  cleanup()
})

describe('TabNavigation', () => {
  describe('desktop variant', () => {
    it('renders buttons for all registered panels', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />)
      
      // Should have buttons for prompt and knowledge panels
      expect(screen.getByRole('button', { name: /view বার্তা জিজ্ঞাসা/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })).toBeInTheDocument()
    })

    it('highlights the active tab', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />)
      
      const activeButton = screen.getByRole('button', { name: /view বার্তা জিজ্ঞাসা/i })
      expect(activeButton).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight inactive tabs', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />)
      
      const inactiveButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      expect(inactiveButton).not.toHaveAttribute('aria-current')
    })

    it('calls onTabChange when a panel button is clicked', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />)
      
      const knowledgeButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      fireEvent.click(knowledgeButton)
      
      expect(onTabChange).toHaveBeenCalledWith('knowledge')
    })
  })

  describe('mobile variant', () => {
    it('renders buttons for all registered panels', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      expect(screen.getByRole('button', { name: /view বার্তা জিজ্ঞাসা/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })).toBeInTheDocument()
    })

    it('highlights the active tab', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      const activeButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      expect(activeButton).toHaveAttribute('aria-current', 'page')
    })

    it('calls onTabChange when a panel button is clicked', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      const promptButton = screen.getByRole('button', { name: /view বার্তা জিজ্ঞাসা/i })
      fireEvent.click(promptButton)
      
      expect(onTabChange).toHaveBeenCalledWith('chat')
    })
  })

  describe('mutant killing tests', () => {
    it('verifies variant comparison uses exact string desktop', () => {
      const onTabChange = vi.fn()
      const { container: desktopContainer } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />
      )
      
      // Desktop should have smaller padding (px-4)
      const desktopButtons = desktopContainer.querySelectorAll('button')
      const hasDesktopPadding = Array.from(desktopButtons).some(btn => 
        btn.className.includes('px-4')
      )
      expect(hasDesktopPadding).toBe(true)
      
      cleanup()
      
      const { container: mobileContainer } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="mobile" />
      )
      
      // Mobile should have larger padding (px-6)
      const mobileButtons = mobileContainer.querySelectorAll('button')
      const hasMobilePadding = Array.from(mobileButtons).some(btn => 
        btn.className.includes('px-6')
      )
      expect(hasMobilePadding).toBe(true)
    })

    it('verifies className template literal is not empty', () => {
      const onTabChange = vi.fn()
      const { container } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />
      )
      
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).not.toBe('')
        expect(button.className.length).toBeGreaterThan(0)
      })
    })

    it('verifies active button has color classes not empty string', () => {
      const onTabChange = vi.fn()
      render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />
      )
      
      const activeButton = screen.getByRole('button', { name: /view বার্তা জিজ্ঞাসা/i })
      // Active button should have bg and text color classes (not empty)
      expect(activeButton.className.length).toBeGreaterThan(0)
      expect(activeButton.className).toContain('bg-sky')
    })

    it('verifies inactive button has default classes not empty string', () => {
      const onTabChange = vi.fn()
      render(<TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />)
      
      const inactiveButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      // Inactive button should have text-slate-600 hover:bg-slate-50
      expect(inactiveButton.className).toContain('text-slate-600')
      expect(inactiveButton.className).toContain('hover:bg-slate')
    })

    it('verifies isDesktop is false when variant is not desktop', () => {
      const onTabChange = vi.fn()
      const { container } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="mobile" />
      )
      
      // Mobile buttons should have px-6 (not px-4)
      const buttons = container.querySelectorAll('button')
      const hasMobilePadding = Array.from(buttons).some(btn =>
        btn.className.includes('px-6')
      )
      expect(hasMobilePadding).toBe(true)
    })

    it('verifies variant comparison is strict equality not empty string', () => {
      const onTabChange = vi.fn()
      
      // Render with desktop variant
      const { unmount } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />
      )
      
      const desktopNav = screen.getByRole('navigation')
      expect(desktopNav).toHaveAttribute('data-variant', 'desktop')
      
      unmount()
      
      // Render with mobile variant  
      render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="mobile" />
      )
      
      const mobileNav = screen.getByRole('navigation')
      expect(mobileNav).toHaveAttribute('data-variant', 'mobile')
    })

    it('verifies inactive icon has text-slate-500 class not empty string', () => {
      const onTabChange = vi.fn()
      const { container } = render(
        <TabNavigation activeTab="chat" onTabChange={onTabChange} variant="desktop" />
      )
      
      // Get all icons (SVGs)
      const icons = container.querySelectorAll('svg')
      
      // Find an inactive button's icon (not the active one)
      const inactiveIcon = Array.from(icons).find(icon => {
        const className = icon.getAttribute('class') || ''
        return className.includes('text-slate-500')
      })
      
      expect(inactiveIcon).toBeDefined()
      const inactiveIconClass = inactiveIcon?.getAttribute('class') || ''
      expect(inactiveIconClass).toContain('text-slate-500')
      expect(inactiveIconClass).not.toBe('')
    })
  })
})
