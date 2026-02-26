import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MessageSquare } from 'lucide-react'
import Panel from '../views/Panel'
import type { PanelConfig } from '../views/Panel'

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
          desktopSpanClasses="col-span-1"
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
          desktopSpanClasses="col-span-1"
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
          desktopSpanClasses="col-span-1"
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
          desktopSpanClasses="col-span-1"
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
          desktopSpanClasses="col-span-1"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
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
          desktopSpanClasses="col-span-2"
          additionalHeaderActions={<button>No TestId</button>}
        >
          <div>Content</div>
        </Panel>
      )

      expect(screen.getAllByRole('button', { name: /no testid/i })).toHaveLength(2)
    })
  })

  describe('styling and classes', () => {
    it('applies desktop span classes correctly', () => {
      const onToggleCollapse = vi.fn()
      render(
        <Panel
          config={mockConfig}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          desktopSpanClasses="col-span-3 md:col-start-1"
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
          desktopSpanClasses="col-span-2"
        >
          <div>Content</div>
        </Panel>
      )

      const mobileHeader = container.querySelector('.bg-emerald-50.border-emerald-200')
      expect(mobileHeader).toBeInTheDocument()
    })
  })
})
