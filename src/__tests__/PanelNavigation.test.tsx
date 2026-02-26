import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PanelNavigation from '../components/PanelNavigation'

afterEach(() => {
  cleanup()
})

describe('PanelNavigation', () => {
  describe('desktop variant', () => {
    it('renders buttons for all registered panels', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="prompt" onTabChange={onTabChange} variant="desktop" />)
      
      // Should have buttons for prompt and knowledge panels
      expect(screen.getByRole('button', { name: /view বার্তা prompt/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })).toBeInTheDocument()
    })

    it('highlights the active tab', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="prompt" onTabChange={onTabChange} variant="desktop" />)
      
      const activeButton = screen.getByRole('button', { name: /view বার্তা prompt/i })
      expect(activeButton).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight inactive tabs', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="prompt" onTabChange={onTabChange} variant="desktop" />)
      
      const inactiveButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      expect(inactiveButton).not.toHaveAttribute('aria-current')
    })

    it('calls onTabChange when a panel button is clicked', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="prompt" onTabChange={onTabChange} variant="desktop" />)
      
      const knowledgeButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      fireEvent.click(knowledgeButton)
      
      expect(onTabChange).toHaveBeenCalledWith('knowledge')
    })
  })

  describe('mobile variant', () => {
    it('renders buttons for all registered panels', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      expect(screen.getByRole('button', { name: /view বার্তা prompt/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })).toBeInTheDocument()
    })

    it('highlights the active tab', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      const activeButton = screen.getByRole('button', { name: /view বার্তা ভাণ্ডার/i })
      expect(activeButton).toHaveAttribute('aria-current', 'page')
    })

    it('calls onTabChange when a panel button is clicked', () => {
      const onTabChange = vi.fn()
      render(<PanelNavigation activeTab="knowledge" onTabChange={onTabChange} variant="mobile" />)
      
      const promptButton = screen.getByRole('button', { name: /view বার্তা prompt/i })
      fireEvent.click(promptButton)
      
      expect(onTabChange).toHaveBeenCalledWith('prompt')
    })
  })
})
