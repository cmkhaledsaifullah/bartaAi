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
  borderColorClass: 'border-emerald-200',
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

  it('renders mobile static header', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const mobileHeader = container.querySelector('.md\\:hidden.w-full.p-4')
    expect(mobileHeader).toBeInTheDocument()
    const headers = screen.getAllByText('Test Panel')
    expect(headers.length).toBeGreaterThanOrEqual(1)
  })

  it('renders desktop static header', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const desktopHeader = container.querySelector('.hidden.md\\:flex.w-full.text-left.p-4')
    expect(desktopHeader).toBeInTheDocument()
  })

  it('applies config colors to mobile and desktop headers', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const mobileHeader = container.querySelector('.bg-emerald-50.border-emerald-200')
    const desktopHeader = container.querySelectorAll('.bg-emerald-50.border-emerald-200')[1]
    expect(mobileHeader).toBeInTheDocument()
    expect(desktopHeader).toBeInTheDocument()
  })

  it('renders the icon from config', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const icons = container.querySelectorAll('.text-emerald-600')
    expect(icons.length).toBeGreaterThanOrEqual(2) // mobile and desktop
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
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const panel = container.querySelector('.bg-white.border.border-slate-200')
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

  it('renders both mobile and desktop headers', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const mobileHeader = container.querySelector('.md\\:hidden')
    const desktopHeader = container.querySelector('.hidden.md\\:flex')
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

  it('verifies mobile header has all required className tokens', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const mobileHeaderContent = container.querySelector('.md\\:hidden .flex.items-center.gap-2.text-emerald-800')
    expect(mobileHeaderContent).toBeInTheDocument()
    
    // Verify all classes are present
    const header = container.querySelector('.md\\:hidden.w-full.p-4')
    expect(header).toHaveClass('md:hidden', 'w-full', 'p-4', 'border-b', 'bg-emerald-50', 'border-emerald-200')
  })

  it('verifies desktop header has all required className tokens', () => {
    const { container } = render(
      <Panel config={mockConfig}>
        <div>Content</div>
      </Panel>
    )

    const desktopHeaderContent = container.querySelector('.hidden.md\\:flex .flex.items-center.gap-2.text-emerald-800')
    expect(desktopHeaderContent).toBeInTheDocument()
    
    // Verify all classes are present (second element with these classes)
    const headers = container.querySelectorAll('.hidden.md\\:flex')
    const desktopHeader = headers[0]
    expect(desktopHeader).toHaveClass('hidden', 'md:flex', 'w-full', 'p-4', 'border-b', 'bg-emerald-50', 'border-emerald-200')
  })

  it('verifies textColorClass is applied to mobile and desktop icon containers', () => {
    const customConfig = {
      ...mockConfig,
      textColorClass: 'text-red-500',
    }
    
    const { container } = render(
      <Panel config={customConfig}>
        <div>Content</div>
      </Panel>
    )

    const coloredDivs = container.querySelectorAll('.text-red-500')
    // Should have at least 2: one for mobile, one for desktop
    expect(coloredDivs.length).toBeGreaterThanOrEqual(2)
  })
})
