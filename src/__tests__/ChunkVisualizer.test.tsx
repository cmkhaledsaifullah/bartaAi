import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChunkVisualizer, { ChunkCards } from '../ChunkVisualizer'
import type { Article, ViewMode } from '../types'

const ARTICLES: Article[] = [
  {
    id: 1,
    source: 'Metro Desk',
    date: '2023-11-08',
    title: 'Uppercase METRO briefing',
    content: 'METRO expansion is underway? Port updates follow!',
    url: '#',
  },
  {
    id: 2,
    source: 'Economy Beat',
    date: '2023-11-07',
    title: 'Investment momentum',
    content: 'দ্বিতীয় বাক্য পরিকল্পনা। তৃতীয় বাক্য তথ্য।',
    url: '#',
  },
]

const renderSidebar = (overrides: Partial<{ viewMode: ViewMode; isCollapsed: boolean }> = {}) => {
  const props = {
    articles: ARTICLES,
    selectedArticle: ARTICLES[0]!,
    viewMode: 'text' as ViewMode,
    highlightKeywords: ['metro'],
    onSelectArticle: vi.fn(),
    onViewModeChange: vi.fn(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    ...overrides,
  }

  render(<ChunkVisualizer {...props} />)
  return props
}

describe('ChunkVisualizer sidebar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders article list metadata and counts', () => {
    renderSidebar()

    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('2 Articles')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-1')).toHaveClass('bg-blue-50')
    expect(screen.getByTestId('article-card-2')).toHaveClass('bg-white')
  })

  it('invokes onSelectArticle when an article card is clicked', () => {
    const props = renderSidebar()

    fireEvent.click(screen.getByTestId('article-card-2'))

    expect(props.onSelectArticle).toHaveBeenCalledWith(ARTICLES[1])
  })

  it('switches view modes via the toggle buttons', () => {
    const props = renderSidebar()

    fireEvent.click(screen.getByTestId('view-toggle-chunks'))
    expect(props.onViewModeChange).toHaveBeenCalledWith('chunks')
  })

  it('renders chunk cards when the view mode is set to chunks', () => {
    renderSidebar({ viewMode: 'chunks' })

    expect(screen.getByTestId('chunk-visualizer')).toBeInTheDocument()
    expect(screen.getAllByTestId('chunk-card').length).toBeGreaterThan(0)
  })

  it('renders collapsed mobile button when isCollapsed is true', () => {
    const props = renderSidebar({ isCollapsed: true })

    const buttons = screen.getAllByRole('button', { expanded: false })
    const mobileButton = buttons.find((btn) => btn.classList.contains('md:hidden'))
    
    expect(mobileButton).toBeDefined()
    expect(mobileButton).toHaveClass('md:hidden')
    expect(within(mobileButton!).getByText('Knowledge Base')).toBeInTheDocument()

    fireEvent.click(mobileButton!)
    expect(props.onToggleCollapse).toHaveBeenCalled()
  })

  it('renders collapsed desktop button when isCollapsed is true', () => {
    const props = renderSidebar({ isCollapsed: true })

    const desktopButtons = screen.getAllByRole('button', { expanded: false })
    const desktopButton = desktopButtons.find((btn) => btn.classList.contains('md:flex'))
    
    expect(desktopButton).toBeDefined()
    expect(desktopButton).toHaveClass('hidden', 'md:flex')
    
    fireEvent.click(desktopButton!)
    expect(props.onToggleCollapse).toHaveBeenCalled()
  })
})

describe('ChunkCards', () => {
  afterEach(() => {
    cleanup()
  })

  it('highlights any chunk that matches at least one trimmed keyword', () => {
    render(
      <ChunkCards
        text="রেল সংবাদ অগ্রগতি চলছে। বিনিয়োগ পরিকল্পনা শক্তিশালী।"
        highlightKeywords={['  রেল  ', 'অনুপস্থিত শব্দ']}
      />,
    )

    const cards = screen.getAllByTestId('chunk-card')
    const relevantCard = cards.find((card) => card.getAttribute('data-relevant') === 'true')!
    expect(relevantCard).toHaveClass('bg-emerald-50')
    expect(within(relevantCard).getByText('Relevant')).toBeInTheDocument()
  })

  it('renders chunk numbers, lengths, and keeps non-matching chunks neutral', () => {
    render(<ChunkCards text="প্রথম বাক্য। দ্বিতীয় অংশ!" highlightKeywords={['দ্বিতীয়']} />)

    const cards = screen.getAllByTestId('chunk-card')
    const meta = within(cards[0]!).getByText(/Chunk/i)
    expect(meta.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/Chunk #1 \| Length: \d+/)
    const neutralChunk = cards.find((card) => card.getAttribute('data-relevant') === 'false') as HTMLElement
    expect(neutralChunk).toHaveClass('bg-white')
    expect(screen.queryAllByText('Relevant')).toHaveLength(1)
  })

  it('renders neutral chunks when highlightKeywords prop is omitted', () => {
    render(<ChunkCards text="প্রথম বাক্য? দ্বিতীয় বাক্য!" />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })

  it('reports its normalized keyword count via data attributes', () => {
    render(<ChunkCards text="Metro expansion is underway?" highlightKeywords={['  metro  ']} />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '1')
  })

  it('trims highlight keywords before matching chunk text', () => {
    render(<ChunkCards text="Metro expansion is underway? Ports remain busy!" highlightKeywords={['  metro  ']} />)

    const cards = screen.getAllByTestId('chunk-card')
    const relevantCard = cards.find((card) => card.getAttribute('data-relevant') === 'true')
    expect(relevantCard).toBeDefined()
    const relevantElement = relevantCard as HTMLElement
    expect(within(relevantElement).getByText('Metro expansion is underway?')).toBeInTheDocument()
  })

  it('matches highlight keywords regardless of casing', () => {
    render(
      <ChunkCards
        text="METRO expansion is underway? Port updates follow!"
        highlightKeywords={['metro']}
      />,
    )

    const relevantCard = screen
      .getAllByTestId('chunk-card')
      .find((card) => card.getAttribute('data-relevant') === 'true')
    expect(relevantCard).toBeDefined()
    const relevantElement = relevantCard as HTMLElement
    expect(within(relevantElement).getByText('METRO expansion is underway?')).toBeInTheDocument()
  })

  it('ignores keywords that collapse to empty strings after trimming', () => {
    render(<ChunkCards text="প্রথম বাক্য। দ্বিতীয় বাক্য?" highlightKeywords={['   ']} />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })
})
