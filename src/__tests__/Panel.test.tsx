import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MessageSquare } from 'lucide-react'
import Panel from '../components/Panel'
import type { PanelConfig } from '../components/Panel'

afterEach(() => {
  cleanup()
})

const mockConfig: PanelConfig = {
  icon: MessageSquare,
  title: 'Test Panel',
  bgColorClass: 'bg-emerald-50',
  borderColorClass: 'border-emerald-200',
  iconColorClass: 'text-emerald-600',
  textColorClass: 'text-emerald-800',
  testId: 'test-panel',
  ariaLabel: 'Test Panel Area',
}

describe('Panel', () => {
  describe('when collapsed', () => {
    it('renders mobile collapsed button', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const buttons = screen.getAllByRole('button', { name: 'Test Panel Area' })
      const mobileButton = buttons[0] // First one is mobile
      expect(mobileButton).toBeInTheDocument()
      expect(mobileButton).toHaveClass('md:hidden')
    })

    it('renders desktop collapsed button', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const desktopButton = container.querySelector('.hidden.md\\:flex')
      expect(desktopButton).toBeInTheDocument()
    })

    it('calls onToggleCollapse when mobile collapsed button is clicked', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const buttons = screen.getAllByRole('button', { name: 'Test Panel Area' })
      fireEvent.click(buttons[0]) // Mobile button
      expect(onToggleCollapse).toHaveBeenCalledTimes(1)
    })

    it('uses default aria-label when not provided', () => {
      const onToggleCollapse = vi.fn()
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getAllByRole('button', { name: 'Expand Test Panel' }).length).toBeGreaterThan(0)
    })

    it('does not render children when collapsed', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div data-testid="panel-content">Content</div>
        </Panel>
      )

      expect(screen.queryByTestId('panel-content')).not.toBeInTheDocument()
    })
  })

  describe('when expanded', () => {
    it('renders the panel with children', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div data-testid="panel-content">Panel Content</div>
        </Panel>
      )

      expect(screen.getByTestId('test-panel')).toBeInTheDocument()
      expect(screen.getByTestId('panel-content')).toBeInTheDocument()
      expect(screen.getByText('Panel Content')).toBeInTheDocument()
    })

    it('renders mobile static header', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const mobileHeader = container.querySelector('.md\\:hidden.w-full.p-4')
      expect(mobileHeader).toBeInTheDocument()
      const headers = screen.getAllByText('Test Panel')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('renders desktop collapsible header', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const collapseButton = screen.getByRole('button', { name: 'Test Panel Area' })
      expect(collapseButton).toBeInTheDocument()
    })

    it('calls onToggleCollapse when desktop header button is clicked', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const collapseButton = screen.getByRole('button', { name: 'Test Panel Area' })
      fireEvent.click(collapseButton)
      expect(onToggleCollapse).toHaveBeenCalledTimes(1)
    })

    it('renders with additional header actions', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          additionalHeaderActions={
            <button data-testid="custom-action">Action</button>
          }
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getByTestId('custom-action-mobile')).toBeInTheDocument()
      expect(screen.getByTestId('custom-action-desktop')).toBeInTheDocument()
    })

    it('renders with header badge', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          headerBadge={<span data-testid="badge">New</span>}
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getAllByTestId('badge')).toHaveLength(2) // Both mobile and desktop
    })

    it('renders with custom container className', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          containerClassName="custom-container-class"
        >
          <div>Content</div>
        </Panel>
      )

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('custom-container-class')
    })

    it('renders with data attributes', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          dataAttributes={{
            'custom-attr': 'value',
            'another-attr': true,
            'number-attr': 42,
          }}
        >
          <div>Content</div>
        </Panel>
      )

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveAttribute('data-custom-attr', 'value')
      expect(panel).toHaveAttribute('data-another-attr', 'true')
      expect(panel).toHaveAttribute('data-number-attr', '42')
    })

    it('uses default aria-label when not provided in expanded state', () => {
      const onToggleCollapse = vi.fn()
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getByRole('button', { name: 'Collapse Test Panel' })).toBeInTheDocument()
    })

    it('handles non-ReactElement additionalHeaderActions', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          additionalHeaderActions="Text Action"
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getAllByText('Text Action')).toHaveLength(2) // Both mobile and desktop
    })

    it('handles additionalHeaderActions without data-testid', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          additionalHeaderActions={<button>No TestId</button>}
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getAllByRole('button', { name: /no testid/i })).toHaveLength(2)
    })
  })

  describe('styling and classes', () => {
    it.skip('applies desktop span classes correctly', () => {
      // This test is skipped because Panel no longer applies grid classes
      // The Panel component is now used within flex containers
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const panel = screen.getByTestId('test-panel')
      expect(panel).toHaveClass('col-span-3', 'md:col-start-1')
    })

    it('applies config color classes correctly', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const mobileHeader = container.querySelector('.bg-emerald-50.border-emerald-200')
      expect(mobileHeader).toBeInTheDocument()
    })
  })

  describe('mutant killing tests', () => {
    it('verifies collapsed button className includes textColor and gap', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      // Find the span with the icon and text
      const spans = container.querySelectorAll('span')
      const iconSpan = Array.from(spans).find(span => span.textContent?.includes('Test Panel'))
      expect(iconSpan?.className).toContain('flex')
      expect(iconSpan?.className).toContain('items-center')
      expect(iconSpan?.className).toContain('gap-2')
      expect(iconSpan?.className).toContain('text-emerald-800')
    })

    it('verifies aria-label uses OR operator not AND operator', () => {
      const onToggleCollapse = vi.fn()
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      // Should use fallback when ariaLabel is undefined (OR logic)
      const buttons = screen.getAllByRole('button', { name: 'Expand Test Panel' })
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('verifies aria-label template literal is not empty', () => {
      const onToggleCollapse = vi.fn()
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      // Aria label should not be empty string
      const buttons = screen.getAllByRole('button')
      const ariaLabels = buttons.map(b => b.getAttribute('aria-label'))
      expect(ariaLabels.some(label => label && label !== '')).toBe(true)
    })

    it('verifies containerClassName has default value not empty', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const panel = screen.getByTestId('test-panel')
      // Should have default border and background classes
      expect(panel.className).toContain('border')
      expect(panel.className).toContain('rounded')
    })

    it('verifies conditional expressions for aria-label use correct booleans', () => {
      const onToggleCollapse = vi.fn()
      
      // With ariaLabel provided
      const { unmount } = render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )
      
      expect(screen.getAllByRole('button', { name: 'Test Panel Area' }).length).toBeGreaterThan(0)
      
      unmount()
      
      // Without ariaLabel
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )
      
      expect(screen.getAllByRole('button', { name: 'Expand Test Panel' }).length).toBeGreaterThan(0)
    })

    it('verifies collapsed button inner div has non-empty className with textColorClass', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      // Mobile button inner div
      const mobileButton = container.querySelector('.md\\:hidden.w-full')
      const mobileInnerDiv = mobileButton?.querySelector('.flex.items-center.gap-2')
      expect(mobileInnerDiv).toBeInTheDocument()
      expect(mobileInnerDiv?.className).toContain('text-emerald-800')
    })

    it('verifies collapsed icon has non-empty className with rotation', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      // Desktop button icon should have rotate-90 class
      const desktopButton = container.querySelector('.hidden.md\\:flex.flex-col')
      const icon = desktopButton?.querySelector('svg.rotate-90')
      expect(icon).toBeInTheDocument()
      // SVGs use class attribute, not className property
      const iconClassAttr = icon?.getAttribute('class')
      expect(iconClassAttr).toContain('text-emerald-600')
      expect(iconClassAttr).toContain('rotate-90')
    })

    it('verifies expanded mobile header has non-empty className', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const mobileHeader = container.querySelector('.md\\:hidden.w-full.p-4.border-b')
      expect(mobileHeader).toBeInTheDocument()
      expect(mobileHeader?.className).toContain('bg-emerald-50')
      expect(mobileHeader?.className).toContain('border-emerald-200')
      expect(mobileHeader?.className).toContain('flex')
      expect(mobileHeader?.className).toContain('justify-between')
    })

    it('verifies expanded desktop header has non-empty className', () => {
      const onToggleCollapse = vi.fn()
      const { container } = render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.text-left.p-4.border-b')
      expect(desktopHeader).toBeInTheDocument()
      expect(desktopHeader?.className).toContain('bg-emerald-50')
      expect(desktopHeader?.className).toContain('border-emerald-200')
      expect(desktopHeader?.className).toContain('justify-between')
    })

    it('verifies expanded desktop button has non-empty className with textColorClass', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const collapseButton = screen.getByRole('button', { name: 'Test Panel Area' })
      expect(collapseButton.className).toContain('flex')
      expect(collapseButton.className).toContain('items-center')
      expect(collapseButton.className).toContain('gap-2')
      expect(collapseButton.className).toContain('text-emerald-800')
      expect(collapseButton.className).toContain('cursor-pointer')
    })

    it('verifies aria-label template literal includes title text', () => {
      const onToggleCollapse = vi.fn()
      const configWithoutAriaLabel = { ...mockConfig, ariaLabel: undefined }
      
      // Collapsed state
      const { unmount } = render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('Test Panel')
        expect(ariaLabel).not.toBe('')
      })

      unmount()

      // Expanded state
      render(
        <Panel
          config={configWithoutAriaLabel}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
        >
          <div>Content</div>
        </Panel>
      )

      const collapseButton = screen.getByRole('button', { name: /Test Panel/i })
      const ariaLabel = collapseButton.getAttribute('aria-label')
      expect(ariaLabel).toContain('Collapse')
      expect(ariaLabel).toContain('Test Panel')
      expect(ariaLabel).not.toBe('')
    })
  })
})
