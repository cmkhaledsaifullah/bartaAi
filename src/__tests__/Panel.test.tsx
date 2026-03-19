import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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
  iconColorClass: 'text-emerald-600',
  textColorClass: 'text-emerald-800',
  testId: 'test-panel',
}

describe('Panel', () => {
  it('renders the panel with children', () => {
    render(
      <Panel config={mockConfig}>
        <div data-testid="panel-content">Panel Content</div>
      </Panel>
    )

    expect(screen.getByTestId('test-panel')).toBeInTheDocument()
    expect(screen.getByTestId('panel-content')).toBeInTheDocument()
    expect(screen.getByText('Panel Content')).toBeInTheDocument()
  })

  it('does not render header when no badge or actions provided', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    // No header should be rendered
    const mobileHeader = container.querySelector('.md\\:hidden.w-full.p-3')
    const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.p-3')
    expect(mobileHeader).not.toBeInTheDocument()
    expect(desktopHeader).not.toBeInTheDocument()
  })

  it('renders simplified header when badge or actions provided', () => {
    const { container } = render(
      <Panel
        config={mockConfig}
        headerBadge={<span data-testid="badge">Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.p-3')
    expect(desktopHeader).toBeInTheDocument()
    expect(screen.getAllByTestId('badge')).toHaveLength(2) // mobile and desktop
  })



  it('header does not render icon or title', () => {
    const { container } = render(
      <Panel
        config={mockConfig}
        headerBadge={<span>Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    // Title should not be in the document
    expect(screen.queryByText('Test Panel')).not.toBeInTheDocument()
    // Icon color class should not be present in headers
    const icons = container.querySelectorAll('.text-emerald-600')
    expect(icons.length).toBe(0)
  })

  it('renders headerBadge when provided', () => {
    render(
      <Panel
        config={mockConfig}
        headerBadge={<span data-testid="test-badge">Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const badges = screen.getAllByTestId('test-badge')
    expect(badges).toHaveLength(2) // mobile and desktop
    const badgeText = screen.getAllByText('Badge')
    expect(badgeText).toHaveLength(2)
  })

  it('renders additionalHeaderActions when provided', () => {
    render(
      <Panel
        config={mockConfig}
        additionalHeaderActions={
          <button data-testid="action-btn">Action</button>
        }
      >
        <div>Content</div>
      </Panel>
    )

    expect(screen.getByTestId('action-btn-mobile')).toBeInTheDocument()
    expect(screen.getByTestId('action-btn-desktop')).toBeInTheDocument()
  })

  it('applies custom containerClassName', () => {
    const customClass = 'custom-bg custom-border'
    const { container } = render(
      <Panel config={mockConfig} containerClassName={customClass}>
        <div>Content</div>
      </Panel>
    )

    const panel = container.querySelector('.custom-bg.custom-border')
    expect(panel).toBeInTheDocument()
  })

  it('applies default containerClassName when not provided', () => {
    render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const panel = screen.getByTestId('test-panel')
    // Default now has no background/border styling
    expect(panel).not.toHaveClass('bg-white')
    expect(panel).not.toHaveClass('border-slate-200')
    expect(panel).toBeInTheDocument()
  })

  it('applies dataAttributes as data- prefixed attributes', () => {
    render(
      <Panel
        config={mockConfig}
        dataAttributes={{ custom: 'value', count: 42 }}
      >
        <div>Content</div>
      </Panel>
    )

    const panel = screen.getByTestId('test-panel')
    expect(panel).toHaveAttribute('data-custom', 'value')
    expect(panel).toHaveAttribute('data-count', '42')
  })

  it('renders with complementary role', () => {
    render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const panel = screen.getByTestId('test-panel')
    expect(panel).toHaveAttribute('role', 'complementary')
  })

  it('renders both mobile and desktop headers when badge or actions provided', () => {
    const { container } = render(
      <Panel
        config={mockConfig}
        headerBadge={<span>Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const mobileHeader = container.querySelector('.md\\:hidden.w-full.p-3')
    const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.p-3')
    expect(mobileHeader).toBeInTheDocument()
    expect(desktopHeader).toBeInTheDocument()
  })

  it('clones additionalHeaderActions without testid for non-ReactElement', () => {
    render(
      <Panel
        config={mockConfig}
        additionalHeaderActions="Simple Text"
      >
        <div>Content</div>
      </Panel>
    )

    // Should render the text as-is
    const panel = screen.getByTestId('test-panel')
    expect(panel).toBeInTheDocument()
  })

  it('handles additionalHeaderActions without data-testid', () => {
    render(
      <Panel
        config={mockConfig}
        additionalHeaderActions={
          <button className="action-btn">Action Without TestId</button>
        }
      >
        <div>Content</div>
      </Panel>
    )

    // The panel should render, and the action button should appear twice (mobile + desktop)
    const actionButtons = screen.getAllByRole('button', { name: /Action Without TestId/i })
    expect(actionButtons.length).toBeGreaterThanOrEqual(2)
    
    // The cloned elements should not have data-testid set (it would be undefined)
    expect(screen.getByTestId('test-panel')).toBeInTheDocument()
  })

  it('verifies typeof check for data-testid returns undefined for non-string types', () => {
    render(
      <Panel
        config={mockConfig}
        additionalHeaderActions={
          <button data-testid={123 as unknown as string}>Action</button>
        }
      >
        <div>Content</div>
      </Panel>
    )

    // When data-testid is not a string, cloned elements should not have testid
    const panel = screen.getByTestId('test-panel')
    expect(panel).toBeInTheDocument()
    
    // The buttons should not have the mobile/desktop suffixes
    expect(screen.queryByTestId('123-mobile')).not.toBeInTheDocument()
    expect(screen.queryByTestId('123-desktop')).not.toBeInTheDocument()
  })

  it('verifies mobile header has required classes when badge provided', () => {
    const { container } = render(
      <Panel
        config={mockConfig}
        headerBadge={<span>Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const header = container.querySelector('.md\\:hidden.w-full.p-3')
    expect(header).toHaveClass('md:hidden', 'w-full', 'p-3', 'flex', 'justify-end', 'items-center', 'gap-2')
  })

  it('verifies desktop header has required classes when badge provided', () => {
    const { container } = render(
      <Panel
        config={mockConfig}
        headerBadge={<span>Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.p-3')
    expect(desktopHeader).toHaveClass('hidden', 'md:flex', 'w-full', 'p-3', 'justify-end', 'items-center', 'gap-2')
  })

  it('verifies textColorClass is not applied to headers', () => {
    const customConfig = {
      ...mockConfig,
      textColorClass: 'text-red-500',
    }
    
    const { container } = render(
      <Panel
        config={customConfig}
        headerBadge={<span>Badge</span>}
      >
        <div>Content</div>
      </Panel>
    )

    const coloredDivs = container.querySelectorAll('.text-red-500')
    // Should have 0 because text color is no longer applied to headers
    expect(coloredDivs.length).toBe(0)
  })
})
