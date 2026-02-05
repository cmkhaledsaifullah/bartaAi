import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import Home, { ChunkVisualizer } from '../Home'
import {
  buildContextText,
  buildGeminiPrompt,
  buildGeminiRequest,
  collectUniqueSources,
  extractSearchKeywords,
  resetRagStepsState,
  splitArticleIntoSentences,
} from '../homeHelpers'
import type { Article } from '../types'

const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    source: 'Prothom Alo',
    date: '2023-10-25',
    title: 'মেট্রোরেলের আগারগাঁও-মতিঝিল অংশের উদ্বোধন',
    content:
      'প্রধানমন্ত্রী শেখ হাসিনা মেট্রোরেলের আগারগাঁও থেকে মতিঝিল অংশের উদ্বোধন করেছেন। এর মাধ্যমে উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে ট্রেন চলাচল শুরু হলো। আজ শনিবার বিকেলে আগারগাঁও স্টেশনে এক অনাড়ম্বর অনুষ্ঠানে তিনি এ উদ্বোধন করেন। সাধারণ যাত্রীদের জন্য আগামীকাল থেকে এই রুটে ট্রেন চলবে। সকাল ৭টা ৩০ মিনিট থেকে বেলা ১১টা ৩০ মিনিট পর্যন্ত ট্রেন চলবে।',
    url: 'https://prothomalo.com/example1',
  },
  {
    id: 2,
    source: 'The Daily Star Bangla',
    date: '2023-10-26',
    title: 'বিশ্বকাপ ক্রিকেট: বাংলাদেশ বনাম নেদারল্যান্ডস',
    content:
      'আজ ইডেন গার্ডেন্সে বিশ্বকাপে নিজেদের ষষ্ঠ ম্যাচে নেদারল্যান্ডসের মুখোমুখি হবে বাংলাদেশ। সেমিফাইনালের আশা বাঁচিয়ে রাখতে হলে আজ জিততেই হবে সাকিব আল হাসানের দলকে। ইনজুরি কাটিয়ে দলে ফিরছেন তাসকিন আহমেদ। তবে টপ অর্ডারের ফর্ম নিয়ে চিন্তিত টিম ম্যানেজমেন্ট।',
    url: 'https://bangla.thedailystar.net/example2',
  },
  {
    id: 3,
    source: 'Dhaka Tribune',
    date: '2023-10-27',
    title: 'ডেঙ্গু পরিস্থিতি: হাসপাতালে ভর্তি রোগীর সংখ্যা কমেছে',
    content:
      'সারা দেশে ডেঙ্গু আক্রান্ত হয়ে হাসপাতালে ভর্তি রোগীর সংখ্যা কিছুটা কমেছে। স্বাস্থ্য অধিদপ্তরের তথ্য অনুযায়ী, গত ২৪ ঘণ্টায় নতুন করে ১ হাজার ২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। তবে মৃতের সংখ্যা এখনো উদ্বেগজনক। ঢাকার বাইরে রোগীর চাপ বেশি।',
    url: 'https://dhakatribune.com/example3',
  },
]

const RICH_RAIL_ARTICLES: Article[] = [
  {
    id: 10,
    source: 'Focus Bangla',
    date: '2023-11-01',
    title: 'রেলের অগ্রগতি প্রতিবেদন',
    content:
      'রেল সংবাদ অগ্রগতি প্রকল্প বাস্তবায়ন হচ্ছে। রেল অগ্রগতি প্রকল্প চলছে। সংবাদ প্রকল্প বিশ্লেষণ চলছে। প্রকল্প আপডেট প্রস্তুত।',
    url: 'https://example.com/rail',
  },
]

const ALT_CONTEXT_ARTICLES: Article[] = [
  {
    id: 4,
    source: 'Economic Times BD',
    date: '2023-11-02',
    title: 'অর্থনীতি: নতুন বিনিয়োগ পরিকল্পনা',
    content:
      'বাংলাদেশের অর্থনীতিতে নতুন বিনিয়োগ পরিকল্পনা ঘোষণা করা হয়েছে। বিনিয়োগ বোর্ড বলেছে এই পরিকল্পনায় প্রযুক্তি খাতকে সবচেয়ে বেশি গুরুত্ব দেওয়া হবে।',
    url: 'https://example.com/economy',
  },
]

const UNSORTED_CONTEXT_ARTICLES: Article[] = [
  {
    id: 5,
    source: 'Planning Desk',
    date: '2023-11-05',
    title: 'প্রকল্প পরিকল্পনা ধাপসমূহ',
    content:
      'প্রথম বাক্যে শুধু প্রকল্পের উল্লেখ আছে। দ্বিতীয় বাক্যে পরিকল্পনার প্রসঙ্গ আছে। শেষ বাক্যে প্রকল্প এবং পরিকল্পনা দুইটিই বিস্তারিতভাবে আছে।',
    url: 'https://example.com/plan',
  },
]

const QUESTION_PLACEHOLDER = 'Ask about the news (e.g., মেট্রোরেল বা ক্রিকেট সম্পর্কে কিছু বলুন)...'
const originalFetch = global.fetch

const renderHome = (articles: Article[] = MOCK_ARTICLES) => render(<Home articles={articles} />)

const advanceAllTimers = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000)
  })
}

const advanceTimersBy = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

const submitQuery = (value: string) => {
  const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
  fireEvent.change(input, { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: /run search/i }))
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  global.fetch = originalFetch
})

describe('Home helpers', () => {
  it('extractSearchKeywords trims whitespace and ignores short tokens', () => {
    expect(extractSearchKeywords('  ai   সংবাদ   ট্রেন  ')).toEqual(['সংবাদ', 'ট্রেন'])
  })

  it('extractSearchKeywords strips punctuation, lowercases, and deduplicates tokens', () => {
    expect(extractSearchKeywords('METRO!! metro?? পরিকল্পনা, পরিকল্পনা. ai')).toEqual(['metro', 'পরিকল্পনা'])
  })

  it('extractSearchKeywords keeps Bengali grapheme clusters intact', () => {
    expect(extractSearchKeywords('মেট্রোরেল আপডেট')).toContain('মেট্রোরেল')
  })

  it('splitArticleIntoSentences respects Bengali punctuation boundaries', () => {
    expect(splitArticleIntoSentences('প্রথম বাক্য। দ্বিতীয় প্রশ্ন? তৃতীয় উচ্ছ্বাস!')).toEqual([
      'প্রথম বাক্য।',
      'দ্বিতীয় প্রশ্ন?',
      'তৃতীয় উচ্ছ্বাস!',
    ])
  })

  it('splitArticleIntoSentences removes whitespace spillover between sentences', () => {
    expect(splitArticleIntoSentences('প্রথম বাক্য।   দ্বিতীয় বাক্য!   তৃতীয় অংশ?')).toEqual([
      'প্রথম বাক্য।',
      'দ্বিতীয় বাক্য!',
      'তৃতীয় অংশ?',
    ])
  })

  it('buildGeminiPrompt weaves the context and question into the template', () => {
    const prompt = buildGeminiPrompt('context A', 'What happened?')

    expect(prompt).toContain('context A')
    expect(prompt).toContain('What happened?')
    expect(prompt.startsWith('You are a helpful news assistant')).toBe(true)
  })

  it('buildGeminiRequest targets the Gemini endpoint with headers and payload', () => {
    const { url, init } = buildGeminiRequest('fake-key', 'Prompt text here')
    const bodyPayload = JSON.parse((init?.body as string) ?? '{}')

    expect(url).toContain('fake-key')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(bodyPayload).toEqual({ contents: [{ parts: [{ text: 'Prompt text here' }] }] })
  })

  it('resetRagStepsState clears all rag steps via the provided setter', () => {
    const setter: Parameters<typeof resetRagStepsState>[0] = vi.fn()

    resetRagStepsState(setter)

    expect(setter).toHaveBeenCalledWith([])
  })

  it('collectUniqueSources removes duplicates while preserving order', () => {
    const sources = collectUniqueSources([
      { source: 'A', score: 1, text: 'a', sourceId: 1 },
      { source: 'B', score: 1, text: 'b', sourceId: 2 },
      { source: 'A', score: 2, text: 'c', sourceId: 1 },
    ])

    expect(sources).toEqual(['A', 'B'])
  })

  it('buildContextText joins retrieved sentences with blank lines', () => {
    const context = buildContextText([
      { text: 'Sentence one.', score: 1, source: 'A', sourceId: 1 },
      { text: 'Sentence two.', score: 1, source: 'B', sourceId: 2 },
    ])

    expect(context).toBe('Sentence one.\n\nSentence two.')
  })
})

describe('ChunkVisualizer', () => {
  it('highlights any chunk that matches at least one trimmed keyword', () => {
    render(
      <ChunkVisualizer
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
    render(<ChunkVisualizer text="প্রথম বাক্য। দ্বিতীয় অংশ!" highlightKeywords={['দ্বিতীয়']} />)

    const cards = screen.getAllByTestId('chunk-card')
    const meta = within(cards[0]!).getByText(/Chunk/i)
    expect(meta.textContent?.replace(/\s+/g, ' ').trim()).toContain('Chunk #1 | Length: 12')
    const neutralChunk = cards.find((card) => card.getAttribute('data-relevant') === 'false') as HTMLElement
    expect(neutralChunk).toHaveClass('bg-white')
    expect(screen.queryAllByText('Relevant')).toHaveLength(1)
  })

  it('renders neutral chunks when highlightKeywords prop is omitted', () => {
    render(<ChunkVisualizer text="প্রথম বাক্য? দ্বিতীয় বাক্য!" />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '0')
    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })

  it('reports its normalized keyword count via data attributes', () => {
    render(<ChunkVisualizer text="Metro expansion is underway?" highlightKeywords={['  metro  ']} />)

    expect(screen.getByTestId('chunk-visualizer')).toHaveAttribute('data-keyword-count', '1')
  })

  it('trims highlight keywords before matching chunk text', () => {
    render(<ChunkVisualizer text="Metro expansion is underway? Ports remain busy!" highlightKeywords={['  metro  ']} />)

    const cards = screen.getAllByTestId('chunk-card')
    const relevantCard = cards.find((card) => card.getAttribute('data-relevant') === 'true')
    expect(relevantCard).toBeDefined()
    expect(relevantCard).toHaveTextContent('Metro expansion is underway?')
  })

  it('matches highlight keywords regardless of casing', () => {
    render(
      <ChunkVisualizer
        text="METRO expansion is underway? Port updates follow!"
        highlightKeywords={['metro']}
      />,
    )

    const relevantCard = screen.getAllByTestId('chunk-card').find((card) => card.getAttribute('data-relevant') === 'true')
    expect(relevantCard).toBeDefined()
    expect(relevantCard).toHaveTextContent('METRO expansion is underway?')
  })

  it('ignores keywords that collapse to empty strings after trimming', () => {
    render(<ChunkVisualizer text="প্রথম বাক্য। দ্বিতীয় বাক্য?" highlightKeywords={['   ']} />)

    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })
})

describe('Home', () => {
  it('mounts the Bengali font link and cleans it up on unmount', () => {
    const { unmount } = renderHome()

    const fontLink = document.head.querySelector('link[data-testid="bangla-font-link"]') as HTMLLinkElement | null

    expect(fontLink).not.toBeNull()
    expect(fontLink?.rel).toBe('stylesheet')
    expect(fontLink?.href).toContain('Noto+Sans+Bengali')

    unmount()
    expect(document.head.querySelector('link[data-testid="bangla-font-link"]')).toBeNull()
  })

  it('renders the global style block with scrollbar overrides', () => {
    renderHome()

    const styleBlock = screen.getByTestId('global-style-block')
    expect(styleBlock).toHaveTextContent('.font-bangla')
    expect(styleBlock).toHaveTextContent('::-webkit-scrollbar-thumb')
  })

  it('displays the initial welcome system message in the chat stream', () => {
    renderHome()

    const systemMessage = screen
      .getAllByTestId('chat-message')
      .find((node) => node.dataset.role === 'system') as HTMLElement | undefined

    expect(systemMessage).toBeDefined()
    expect(systemMessage).toHaveTextContent(
      'স্বাগতম! আমি আপনার বার্তাAI—বাংলাদেশের সর্বশেষ খবরের ভিত্তিতে আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।',
    )
  })

  it('renders knowledge base summary and first article preview', () => {
    renderHome()

    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('3 Articles')).toBeInTheDocument()
    expect(screen.getByText(MOCK_ARTICLES[0]!.title)).toBeInTheDocument()
  })

  it('highlights the active article card', () => {
    renderHome()

    const first = screen.getByTestId('article-card-1')
    const second = screen.getByTestId('article-card-2')

    expect(first).toHaveClass('bg-blue-50')
    expect(second).not.toHaveClass('bg-blue-50')

    fireEvent.click(second)

    expect(second).toHaveClass('bg-blue-50')
    expect(first).not.toHaveClass('bg-blue-50')
  })

  it('toggles between article text and chunk view', () => {
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /chunks/i }))

    expect(screen.getByText(/Chunk #1/)).toBeInTheDocument()
  })

  it('keeps preview chunk cards neutral when no highlight keywords are provided', () => {
    renderHome()

    fireEvent.click(screen.getByTestId('view-toggle-chunks'))

    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })

  it('syncs view-mode buttons with preview content', () => {
    renderHome()

    const textToggle = screen.getByTestId('view-toggle-text')
    const chunkToggle = screen.getByTestId('view-toggle-chunks')
    const previewBody = screen.getByTestId('article-preview-body')

    expect(textToggle).toHaveClass('bg-white')
    expect(chunkToggle).not.toHaveClass('bg-white')
    expect(previewBody).toHaveTextContent(MOCK_ARTICLES[0]!.content)

    fireEvent.click(chunkToggle)

    expect(chunkToggle).toHaveClass('bg-white')
    expect(textToggle).not.toHaveClass('bg-white')
    expect(screen.getByText(/Chunk #1/)).toBeInTheDocument()

    fireEvent.click(textToggle)
    expect(textToggle).toHaveClass('bg-white')
    expect(chunkToggle).not.toHaveClass('bg-white')
    expect(previewBody).toHaveTextContent(MOCK_ARTICLES[0]!.content)
  })

  it('toggles the settings panel and button styles', () => {
    renderHome()

    const settingsButton = screen.getByTestId('settings-toggle')
    expect(screen.queryByLabelText(/Gemini API Key/i)).not.toBeInTheDocument()
    expect(settingsButton).not.toHaveClass('bg-slate-100')
    expect(settingsButton).toHaveClass('text-slate-400')

    fireEvent.click(settingsButton)

    expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument()
    expect(settingsButton).toHaveClass('bg-slate-100')

    fireEvent.click(settingsButton)

    expect(screen.queryByLabelText(/Gemini API Key/i)).not.toBeInTheDocument()
    expect(settingsButton).not.toHaveClass('bg-slate-100')
  })

  it('prefills queries when an example question is selected', () => {
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER) as HTMLInputElement
    fireEvent.click(screen.getByRole('button', { name: /Example 1: Metro Rail/i }))

    expect(input.value).toBe('মেট্রোরেল নিয়ে আপডেট কি?')

    fireEvent.click(screen.getByRole('button', { name: /Example 2: Cricket/i }))
    expect(input.value).toBe('How is Bangladesh doing in Cricket?')
  })

  it('exposes both localized example prompt labels', () => {
    renderHome()

    expect(screen.getByRole('button', { name: /Example 1: Metro Rail/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Example 2: Cricket/i })).toBeInTheDocument()
  })

  it('keeps the search action disabled for empty or whitespace-only queries', () => {
    renderHome()

    const searchButton = screen.getByRole('button', { name: /run search/i }) as HTMLButtonElement
    expect(searchButton.disabled).toBe(true)

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: '   ' } })

    expect(searchButton.disabled).toBe(true)
  })

  it('ignores Enter submissions that contain only whitespace', () => {
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    const userMessages = screen
      .getAllByTestId('chat-message')
      .filter((node) => node.dataset.role === 'user')
    expect(userMessages).toHaveLength(0)
  })

  it('does not run searches when non-Enter keys are pressed', () => {
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'মেট্রোরেল' } })
    fireEvent.keyDown(input, { key: 'Shift', code: 'ShiftLeft' })

    const userMessages = screen
      .getAllByTestId('chat-message')
      .filter((node) => node.dataset.role === 'user')
    expect(userMessages).toHaveLength(0)
  })

  it('processes questions without an API key and surfaces mocked answers', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('মেট্রোরেল নিয়ে বলুন')

    expect(screen.getByText('Generating query embeddings...')).toBeInTheDocument()

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText(/উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে মেট্রোরেল চলাচল শুরু হয়েছে/),
      ).toBeInTheDocument(),
    )
    expect(screen.getByText(/Source: মেট্রোরেলের আগারগাঁও-মতিঝিল অংশের উদ্বোধন/)).toBeInTheDocument()
  })

  it('returns the cricket fallback answer when the second article is most relevant', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('নেদারল্যান্ডস ম্যাচ পরিস্থিতি কী')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText(/আজ বাংলাদেশ নেদারল্যান্ডসের বিপক্ষে খেলবে। সেমিফাইনালে যেতে হলে বাংলাদেশকে জিততেই হবে।/),
      ).toBeInTheDocument(),
    )
  })

  it('returns the dengue fallback answer when the third article ranks highest', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('ডেঙ্গু পরিস্থিতি এখন কেমন')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText(/গত ২৪ ঘণ্টায় ১,২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। যদিও ভর্তির হার কিছুটা কমেছে/),
      ).toBeInTheDocument(),
    )
  })

  it('falls back to the generic context message when an unknown source ranks first', async () => {
    vi.useFakeTimers()
    renderHome(ALT_CONTEXT_ARTICLES)

    submitQuery('অর্থনীতি বিনিয়োগ পরিকল্পনা জানাবেন')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getByText('সংগৃহীত তথ্যের ভিত্তিতে দেখা যাচ্ছে যে বিষয়টি খবরে উল্লেখ করা হয়েছে।')).toBeInTheDocument(),
    )
  })

  it('returns the context-missing answer when no keywords qualify for retrieval', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('AI')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument(),
    )
  })

  it('does not render retrieved context when no matches are found', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('AI')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => expect(screen.queryByTestId('retrieval-context')).toBeNull())
  })

  it('announces vector search and LLM workflow steps with descriptive copy', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'মেট্রোরেল আপডেট দিন' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceTimersBy(1600)
    expect(screen.getByText('Searching vector database (ChromaDB simulated)...')).toBeInTheDocument()
    expect(screen.getByText('Found 1 relevant context chunks')).toBeInTheDocument()

    await advanceTimersBy(1000)
    expect(screen.getByText('Sending context + query to LLM...')).toBeInTheDocument()

    await advanceAllTimers()
    vi.useRealTimers()
  })

  it('clears the query input and exposes rag step identifiers', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'প্রথম অনুসন্ধান' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    expect(input.value).toBe('')

    await advanceTimersBy(1600)
    const currentSteps = screen.getAllByTestId('rag-step')
    expect(currentSteps.length).toBeGreaterThan(0)
    expect(currentSteps[0].dataset.stepId).toMatch(/^step-/)

    await advanceAllTimers()
    vi.useRealTimers()
  })

  it('submits via Enter key and applies role-specific chat styling', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'মেট্রোরেল' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getAllByTestId('chat-message').some((node) => node.dataset.role === 'assistant')).toBe(true),
    )

    const messageNodes = screen.getAllByTestId('chat-message')
    const userMessage = messageNodes.find((node) => node.dataset.role === 'user')
    const assistantMessage = messageNodes.find((node) => node.dataset.role === 'assistant')

    expect(userMessage).toBeDefined()
    expect(userMessage!).toHaveClass('flex-row-reverse')
    expect(assistantMessage).toBeDefined()
    expect(assistantMessage!).not.toHaveClass('flex-row-reverse')

    const bubbleNodes = screen.getAllByTestId('chat-bubble')
    const userBubble = bubbleNodes.find((node) => node.dataset.role === 'user')
    const assistantBubble = bubbleNodes.find((node) => node.dataset.role === 'assistant')

    expect(userBubble).toBeDefined()
    expect(userBubble!).toHaveClass('bg-slate-800')
    expect(assistantBubble).toBeDefined()
    expect(assistantBubble!).toHaveClass('bg-white')

    const userCopy = within(userBubble!).getByText(/মেট্রোরেল/)
    expect(userCopy).toHaveClass('font-bangla')
    expect(userCopy).not.toHaveClass('text-red-500')

    const assistantCopy = within(assistantBubble!).getByText(/উত্তরা থেকে মতিঝিল/)
    expect(assistantCopy).toHaveClass('font-bangla')
  })

  it('assigns stable message identifiers for each role', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('মেট্রোরেল আপডেট দিন')

    await advanceAllTimers()
    vi.useRealTimers()

    const messages = screen.getAllByTestId('chat-message')
    const systemMessage = messages.find((node) => node.dataset.role === 'system')
    const userMessage = messages.find((node) => node.dataset.role === 'user')
    const assistantMessage = messages
      .filter((node) => node.dataset.role === 'assistant')
      .find((node) => node.dataset.messageId?.startsWith('bot-'))

    expect(systemMessage?.dataset.messageId).toBe('initial-msg')
    expect(systemMessage?.dataset.messageType).toBe('text')
    expect(userMessage?.dataset.messageId).toMatch(/^user-\d+$/)
    expect(userMessage?.dataset.messageType).toBe('text')
    expect(assistantMessage?.dataset.messageId).toMatch(/^bot-\d+$/)
    expect(assistantMessage?.dataset.messageType).toBe('answer')
  })

  it('records the unique source list on assistant messages', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('মেট্রোরেল আপডেট দিন')

    await advanceAllTimers()
    vi.useRealTimers()

    const assistantMessage = screen
      .getAllByTestId('chat-message')
      .find((node) => node.dataset.messageId?.startsWith('bot-'))

    expect(assistantMessage?.dataset.sources).toContain(MOCK_ARTICLES[0]!.title)
  })

  it('calls Gemini when an API key is provided and displays the response', async () => {
    vi.useFakeTimers()

    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Gemini says hi' }],
          },
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockResponse,
    }) as typeof fetch

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'ক্রিকেট প্রশ্ন' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => expect(screen.getByText('Gemini says hi')).toBeInTheDocument())
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    )

    const [, options] = (global.fetch as Mock).mock.calls[0]
    const payload = JSON.parse((options?.body as string) ?? '{}')

    expect(options?.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(payload?.contents?.[0]?.parts?.[0]?.text).toContain('You are a helpful news assistant')
    expect(payload?.contents?.[0]?.parts?.[0]?.text).toContain('User Question:')
    const newlineGroups = payload?.contents?.[0]?.parts?.[0]?.text?.match(/\n\n/g) ?? []
    expect(newlineGroups.length).toBeGreaterThan(1)
  })

  it('falls back to the generic context message when Gemini returns no text payload', async () => {
    vi.useFakeTimers()

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: [{ content: { parts: [{}] } }] }),
    }) as typeof fetch

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'key-xyz' } })

    submitQuery('ক্রিকেট আপডেট')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument(),
    )
  })

  it('falls back gracefully when Gemini omits the candidates payload entirely', async () => {
    vi.useFakeTimers()

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({}),
    }) as typeof fetch

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'key-xyz' } })

    submitQuery('ক্রিকেট আপডেট')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument(),
    )
  })

  it('surfaces API errors inside the chat stream for invalid keys', async () => {
    vi.useFakeTimers()

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ error: { message: 'Invalid API key' } }),
    }) as typeof fetch

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'bad-key' } })

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'ক্রিকেট প্রশ্ন' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => expect(screen.getByText(/Error: Invalid API key/)).toBeInTheDocument())

    const errorMessage = screen
      .getAllByTestId('chat-message')
      .find((node) => node.dataset.messageId?.startsWith('err-'))
    expect(errorMessage?.dataset.messageType).toBe('error')
    expect(errorMessage?.dataset.role).toBe('assistant')

    const errorBubble = within(errorMessage!).getByTestId('chat-bubble')
    const errorText = within(errorBubble).getByText(/Error: Invalid API key/)
    expect(errorText).toHaveClass('text-red-500')
  })

  it('surfaces the unknown error fallback when the Gemini call rejects outright', async () => {
    vi.useFakeTimers()

    global.fetch = vi.fn().mockRejectedValue('network-bad') as typeof fetch

    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'key-123' } })

    submitQuery('ক্রিকেটের স্কোর বলুন')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getByText(/Error: Unknown error occurred. Please check your API key./)).toBeInTheDocument(),
    )
  })

  it('shows processing and success RAG step indicators during retrieval', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'মেট্রোরেল' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceTimersBy(1600)

    const ragSteps = screen.getAllByTestId('rag-step') as HTMLElement[]
    const processingStep = ragSteps.find((node) => node.dataset.status === 'processing')
    const successStep = ragSteps.find((node) => node.dataset.status === 'success')

    expect(processingStep).toBeDefined()
    expect(successStep).toBeDefined()

    const processingEl = processingStep as HTMLElement
    const successEl = successStep as HTMLElement

    expect(within(processingEl).getByTestId('rag-icon-processing')).toBeInTheDocument()
    expect(within(processingEl).queryByTestId('rag-icon-success')).toBeNull()
    expect(within(successEl).getByTestId('rag-icon-success')).toBeInTheDocument()
    expect(within(successEl).queryByTestId('rag-icon-processing')).toBeNull()

    const successText = within(successEl).getByTestId('rag-step-text')
    expect(successText).toHaveClass('text-slate-600')
    expect(successText).toHaveAttribute('data-status', 'success')

    const generatingStep = ragSteps.find((node) => within(node).queryByText(/Generating query embeddings/))
    const searchingStep = ragSteps.find((node) => within(node).queryByText(/Searching vector database/))
    const sendingStep = ragSteps.find((node) => within(node).queryByText(/Sending context \+ query/))

    expect(generatingStep).toBeDefined()
    expect(searchingStep).toBeDefined()
    expect(sendingStep).toBeDefined()
    expect(generatingStep?.dataset.status).toBe('processing')
    expect(searchingStep?.dataset.status).toBe('processing')
    expect(sendingStep?.dataset.status).toBe('processing')

    await advanceAllTimers()
    vi.useRealTimers()
  })

  it('scrolls to the latest message when chat history updates', async () => {
    const originalScroll = HTMLElement.prototype.scrollIntoView
    const scrollSpy = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollSpy,
    })

    try {
      vi.useFakeTimers()
      renderHome()

      submitQuery('মেট্রোরেল আপডেট দিন')

      await advanceAllTimers()
      vi.useRealTimers()

      await waitFor(() => expect(scrollSpy).toHaveBeenCalled())
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScroll,
      })
    }
  })

  it('shows a warning RAG step when no article context matches the query', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'unmatchabletopic' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceTimersBy(1600)

    const warningStep = screen
      .getAllByTestId('rag-step')
      .find((node) => node.dataset.status === 'warning') as HTMLElement | undefined

    expect(warningStep).toBeDefined()
    const warningEl = warningStep as HTMLElement
    expect(within(warningEl).getByTestId('rag-icon-warning')).toBeInTheDocument()
    expect(within(warningEl).queryByTestId('rag-icon-success')).toBeNull()
    expect(within(warningEl).queryByTestId('rag-icon-processing')).toBeNull()
    expect(warningEl).toHaveTextContent('No highly relevant chunks found. Using general knowledge.')

    const warningText = within(warningEl).getByTestId('rag-step-text')
    expect(warningText).toHaveClass('text-slate-400')
    expect(warningText).toHaveAttribute('data-status', 'warning')

    await advanceAllTimers()
    vi.useRealTimers()
  })

  it('disables and then re-enables the query input around a search run', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ক্রিকেট স্কোর' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    expect(input.disabled).toBe(true)

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => expect(input.disabled).toBe(false))
  })

  it('renders role-specific avatars with matching indicators', async () => {
    vi.useFakeTimers()
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'মেট্রোরেল আপডেট' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceAllTimers()
    vi.useRealTimers()

    const avatars = screen.getAllByTestId('chat-avatar')
    const userAvatar = avatars.find((node) => node.dataset.role === 'user') as HTMLElement
    const assistantAvatar = avatars.find((node) => node.dataset.role === 'assistant') as HTMLElement

    expect(within(userAvatar).getByTestId('user-indicator')).toBeInTheDocument()
    expect(within(userAvatar).queryByTestId('assistant-icon')).toBeNull()
    expect(assistantAvatar).toHaveClass('bg-emerald-100')
    expect(within(assistantAvatar).getByTestId('assistant-icon')).toBeInTheDocument()
  })

  it('orders retrieved context by score and limits to three best sentences', async () => {
    vi.useFakeTimers()
    renderHome(RICH_RAIL_ARTICLES)

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'রেল সংবাদ অগ্রগতি প্রকল্প' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(screen.getAllByTestId('retrieval-context')).toHaveLength(1)
      expect(screen.getAllByTestId('retrieved-chunk')).toHaveLength(3)
    })
    const chunkNodes = screen.getAllByTestId('retrieved-chunk')

    expect(chunkNodes[0]!.dataset.score).toBe('4')
    expect(chunkNodes[0]).toHaveTextContent('রেল সংবাদ অগ্রগতি প্রকল্প বাস্তবায়ন হচ্ছে।')
    expect(chunkNodes[0]).toHaveTextContent('Rel: 40%')
    expect(chunkNodes[1]!.dataset.score).toBe('3')
    expect(chunkNodes[2]!.dataset.score).toBe('2')
    expect(chunkNodes.some((node) => node.textContent?.includes('প্রকল্প আপডেট প্রস্তুত।'))).toBe(false)
  })

  it('sorts retrieved context by score even when the most relevant chunk appears last', async () => {
    vi.useFakeTimers()
    renderHome(UNSORTED_CONTEXT_ARTICLES)

    submitQuery('প্রকল্প পরিকল্পনা')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => expect(screen.getAllByTestId('retrieved-chunk')).toHaveLength(3))
    const chunkNodes = screen.getAllByTestId('retrieved-chunk')

    expect(chunkNodes[0]).toHaveTextContent('শেষ বাক্যে প্রকল্প এবং পরিকল্পনা দুইটিই বিস্তারিতভাবে আছে।')
    expect(chunkNodes[0]!.dataset.score).toBe('2')
    expect(chunkNodes[1]!.dataset.score).toBe('1')
    expect(chunkNodes[2]!.dataset.score).toBe('1')
  })
})
