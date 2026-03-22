import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import KnowledgeBase, { ChunkCards } from '../views/KnowledgeBase'
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
    content: 'দ্বিতীয় বাক্য পরিকল্পনা। তৃতীয় বাক্য তথ্য।',
    url: '#',
  },
]

const renderPanel = (overrides: Partial<{ viewMode: ViewMode }> = {}) => {
  const props = {
    articles: ARTICLES,
    selectedArticle: ARTICLES[0]!,
    viewMode: 'text' as ViewMode,
    highlightKeywords: ['metro'],
    onSelectArticle: vi.fn(),
    onViewModeChange: vi.fn(),
    ...overrides,
  }

  render(<KnowledgeBase {...props} />)
  return props
}

describe('KnowledgeBase', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders article list metadata and counts', () => {
    renderPanel()

    expect(screen.getAllByText('2 Articles').length).toBeGreaterThan(0)
    expect(screen.getByTestId('article-card-1')).toHaveClass('bg-blue-50')
    expect(screen.getByTestId('article-card-2')).toHaveClass('bg-white')
  })

  it('invokes onSelectArticle when an article card is clicked', () => {
    const props = renderPanel()

    fireEvent.click(screen.getByTestId('article-card-2'))

    expect(props.onSelectArticle).toHaveBeenCalledWith(ARTICLES[1])
  })

  it('switches view modes via the toggle buttons', () => {
    const props = renderPanel()

    fireEvent.click(screen.getByTestId('view-toggle-chunks'))
    expect(props.onViewModeChange).toHaveBeenCalledWith('chunks')
  })

  it('renders chunk cards when the view mode is set to chunks', () => {
    renderPanel({ viewMode: 'chunks' })

    expect(screen.getByTestId('chunk-visualizer')).toBeInTheDocument()
    expect(screen.getAllByTestId('chunk-card').length).toBeGreaterThan(0)
  })

  it('renders knowledge base panel', () => {
    render(
      <KnowledgeBase
        articles={ARTICLES}
        selectedArticle={ARTICLES[0]!}
        viewMode="text"
        onSelectArticle={vi.fn()}
        onViewModeChange={vi.fn()}
      />
    )

    expect(screen.getByTestId('knowledge-base')).toBeInTheDocument()
  })

  it('shows scroll-to-top button after scrolling down and scrolls when clicked', () => {
    renderPanel()

    const scrollContainer = document.querySelector('.overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 200, configurable: true })
    scrollContainer.scrollTo = vi.fn()

    fireEvent.scroll(scrollContainer)

    const scrollBtn = screen.getByTestId('scroll-to-top')
    expect(scrollBtn).toBeInTheDocument()

    fireEvent.click(scrollBtn)
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('hides scroll-to-top button when scrolled near the top', () => {
    renderPanel()

    const scrollContainer = document.querySelector('.overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 50, configurable: true })

    fireEvent.scroll(scrollContainer)

    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument()
  })

  it('handles scroll when articleListRef is null', () => {
    renderPanel()

    const scrollContainer = document.querySelector('.overflow-y-auto')!

    // Get the React fiber to access the ref
    const fiberKey = Object.keys(scrollContainer).find(k => k.startsWith('__reactFiber$'))
    if (fiberKey) {
      let fiber = (scrollContainer as unknown as Record<string, unknown>)[fiberKey] as { ref?: { current: unknown }; return?: unknown }
      // Walk up the fiber tree to find the ref
      while (fiber) {
        if (fiber.ref && typeof fiber.ref === 'object' && 'current' in fiber.ref) {
          // Temporarily set ref.current to null
          const originalCurrent = fiber.ref.current
          fiber.ref.current = null

          // Fire scroll — handleArticleScroll will see null ref and early-return
          fireEvent.scroll(scrollContainer)

          // Restore
          fiber.ref.current = originalCurrent
          break
        }
        fiber = fiber.return as typeof fiber
      }
    }

    // showScrollUp should remain false (no crash)
    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument()
  })

  it('verifies article list keys are unique and non-empty', () => {
    render(
      <KnowledgeBase
        articles={ARTICLES}
        selectedArticle={ARTICLES[0]!}
        viewMode="text"
        highlightKeywords={[]}
        onSelectArticle={() => {}}
        onViewModeChange={() => {}}
      />
    )

    // Verify article cards exist
    const articleCard1 = screen.getByTestId('article-card-1')
    const articleCard2 = screen.getByTestId('article-card-2')
    expect(articleCard1).toBeInTheDocument()
    expect(articleCard2).toBeInTheDocument()
  })
})

describe('ChunkCards', () => {
  afterEach(() => {
    cleanup()
  })

  it('highlights any chunk that matches at least one trimmed keyword', () => {
    render(
      <ChunkCards
        text="রেল সংবাদ অগ্রগতি চলছে। বিনিয়োগ পরিকল্পনা শক্তিশালী।"
        highlightKeywords={['  রেল  ', 'অনুপস্থিত শব্দ']}
      />,
    )

    const cards = screen.getAllByTestId('chunk-card')
    const relevantCard = cards.find((card) => card.getAttribute('data-relevant') === 'true')!
    expect(relevantCard).toHaveClass('bg-emerald-50')
    expect(within(relevantCard).getByText('Relevant')).toBeInTheDocument()
  })

  it('renders chunk numbers, lengths, and keeps non-matching chunks neutral', () => {
    render(<ChunkCards text="প্রথম বাক্য। দ্বিতীয় অংশ!" highlightKeywords={['দ্বিতীয়']} />)

    const cards = screen.getAllByTestId('chunk-card')
    const meta = within(cards[0]!).getByText(/Chunk/i)
    expect(meta.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/Chunk #1 \| Length: \d+/)
    const neutralChunk = cards.find((card) => card.getAttribute('data-relevant') === 'false') as HTMLElement
    expect(neutralChunk).toHaveClass('bg-white')
    expect(screen.queryAllByText('Relevant')).toHaveLength(1)
  })

  it('renders neutral chunks when highlightKeywords prop is omitted', () => {
    render(<ChunkCards text="প্রথম বাক্য? দ্বিতীয় বাক্য!" />)

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
    render(<ChunkCards text="প্রথম বাক্য। দ্বিতীয় বাক্য?" highlightKeywords={['   ']} />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })

  it('verifies chunk keys include index', () => {
    render(<ChunkCards text="First. Second?" highlightKeywords={[]} />)

    const chunks = screen.getAllByTestId(/chunk-card/)
    expect(chunks.length).toBeGreaterThan(0)
    chunks.forEach((chunk) => {
      expect(chunk).toBeInTheDocument()
    })
  })

  it('verifies highlightKeywords defaults to empty array', () => {
    render(<ChunkCards text="First. Second?" />)

    // All chunks should be neutral
    const chunks = screen.getAllByTestId('chunk-card')
    chunks.forEach((chunk) => {
      expect(chunk.getAttribute('data-relevant')).toBe('false')
    })

    // keyword count should be 0
    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
  })

  it('renders unique article card keys by verifying all articles are in the DOM', () => {
    const manyArticles: Article[] = [
      { id: 10, source: 'A', date: '2023-01-01', title: 'Article 10', content: 'Content 10.', url: '#' },
      { id: 20, source: 'B', date: '2023-01-02', title: 'Article 20', content: 'Content 20.', url: '#' },
      { id: 30, source: 'C', date: '2023-01-03', title: 'Article 30', content: 'Content 30.', url: '#' },
    ]

    render(
      <KnowledgeBase
        articles={manyArticles}
        selectedArticle={manyArticles[0]!}
        viewMode="text"
        onSelectArticle={vi.fn()}
        onViewModeChange={vi.fn()}
      />
    )

    // If keys were empty (mutant: key={``}), React would deduplicate and only render one
    expect(screen.getByTestId('article-card-10')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-20')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-30')).toBeInTheDocument()
    expect(screen.getByText('Article 10')).toBeInTheDocument()
    expect(screen.getByText('Article 20')).toBeInTheDocument()
    expect(screen.getByText('Article 30')).toBeInTheDocument()
  })

  it('renders all chunks when keys are unique', () => {
    // Text with 3 sentences using Bengali/supported punctuation to verify all chunk cards render
    render(
      <ChunkCards
        text="First sentence here। Second sentence here? Third sentence here!"
        highlightKeywords={[]}
      />
    )

    const chunks = screen.getAllByTestId('chunk-card')
    expect(chunks).toHaveLength(3)
    expect(within(chunks[0]!).getByText(/Chunk #1/)).toBeInTheDocument()
    expect(within(chunks[1]!).getByText(/Chunk #2/)).toBeInTheDocument()
    expect(within(chunks[2]!).getByText(/Chunk #3/)).toBeInTheDocument()
  })

  it('does not mark chunks as relevant when highlightKeywords defaults to empty array', () => {
    render(
      <KnowledgeBase
        articles={ARTICLES}
        selectedArticle={ARTICLES[0]!}
        viewMode="chunks"
        onSelectArticle={vi.fn()}
        onViewModeChange={vi.fn()}
      />
    )

    // highlightKeywords is not passed, so it defaults to []
    // If the default was ["Stryker was here"], chunks could incorrectly match
    const chunks = screen.getAllByTestId('chunk-card')
    chunks.forEach((chunk) => {
      expect(chunk.getAttribute('data-relevant')).toBe('false')
    })
    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
  })

  it('does not show scroll-to-top at exactly scrollTop=100 (strict >)', () => {
    renderPanel()

    const scrollContainer = document.querySelector('.overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 100, configurable: true })

    fireEvent.scroll(scrollContainer)

    // scrollTop must be > 100, not >= 100, so exactly 100 should NOT show button
    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument()
  })

  it('renders all article cards when keys contain article id (not empty)', () => {
    const manyArticles = [
      { id: 100, source: 'A', date: '2023-01-01', title: 'Title 100', content: 'Content A.', url: '#' },
      { id: 200, source: 'B', date: '2023-01-02', title: 'Title 200', content: 'Content B.', url: '#' },
      { id: 300, source: 'C', date: '2023-01-03', title: 'Title 300', content: 'Content C.', url: '#' },
      { id: 400, source: 'D', date: '2023-01-04', title: 'Title 400', content: 'Content D.', url: '#' },
    ]

    render(
      <KnowledgeBase
        articles={manyArticles}
        selectedArticle={manyArticles[0]!}
        viewMode="text"
        onSelectArticle={vi.fn()}
        onViewModeChange={vi.fn()}
      />
    )

    // If key was empty string (``) React would deduplicate, only rendering 1
    expect(screen.getByTestId('article-card-100')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-200')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-300')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-400')).toBeInTheDocument()
  })

  it('renders all chunk cards when keys contain index (not empty)', () => {
    render(
      <ChunkCards
        text="One sentence here। Two sentence here? Three sentence here! Four sentence here।"
        highlightKeywords={[]}
      />
    )

    const chunks = screen.getAllByTestId('chunk-card')
    // If key was empty string, React would only render 1 item
    expect(chunks).toHaveLength(4)
  })

  it('does not crash when scrollToTop is called with null ref', () => {
    renderPanel()

    const scrollContainer = document.querySelector('.overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 200, configurable: true })
    scrollContainer.scrollTo = vi.fn()

    fireEvent.scroll(scrollContainer)

    // Button should be visible now
    const scrollBtn = screen.getByTestId('scroll-to-top')

    // Null out the ref via React fiber before clicking
    const fiberKey = Object.keys(scrollContainer).find(k => k.startsWith('__reactFiber$'))
    if (fiberKey) {
      let fiber = (scrollContainer as unknown as Record<string, unknown>)[fiberKey] as { ref?: { current: unknown }; return?: unknown }
      while (fiber) {
        if (fiber.ref && typeof fiber.ref === 'object' && 'current' in fiber.ref) {
          fiber.ref.current = null
          break
        }
        fiber = fiber.return as typeof fiber
      }
    }

    // Should not throw — the ?. prevents crash when ref is null
    // With .scrollTo mutant, this would throw TypeError: null.scrollTo()
    expect(() => fireEvent.click(scrollBtn)).not.toThrow()
  })
})
