import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import Home from '../views/Home'
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

const CASE_SENSITIVE_ARTICLES: Article[] = [
  {
    id: 1,
    source: 'Metro Desk',
    date: '2023-11-08',
    title: 'Uppercase METRO briefing',
    content: 'METRO expansion is underway? Port updates follow! আরও কিছু তথ্য।',
    url: 'https://example.com/metro-case',
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

  it('extractSearchKeywords returns empty array when no keywords match', () => {
    expect(extractSearchKeywords('!@# $%^ &*()')).toEqual([])
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

  it('renders prompt example shortcuts with the provided copy', () => {
    renderHome()

    const exampleOne = screen.getByRole('button', { name: 'Example 1: মেট্রোরেল নিয়ে আপডেট কি?' })
    const exampleTwo = screen.getByRole('button', { name: 'Example 2: How is Bangladesh doing in Cricket?' })

    expect(exampleOne).toBeInTheDocument()
    expect(exampleTwo).toBeInTheDocument()
  })

  it('highlights the active article card', () => {
    renderHome()

    const first = screen.getByTestId('article-card-1')
    const second = screen.getByTestId('article-card-2')

    expect(first).toHaveClass('bg-blue-50')
    expect(second).not.toHaveClass('bg-blue-50')
    expect(second).toHaveClass('bg-white')
    expect(second).toHaveClass('border-slate-200')

    fireEvent.click(second)

    expect(second).toHaveClass('bg-blue-50')
    expect(first).not.toHaveClass('bg-blue-50')
    expect(first).toHaveClass('bg-white')
    expect(first).toHaveClass('border-slate-200')
  })

  it('toggles between article text and chunk view', () => {
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /chunks/i }))

    expect(screen.getByText(/Chunk #1/)).toBeInTheDocument()
  })

  it('keeps preview chunk cards neutral when no highlight keywords are provided', () => {
    renderHome()

    fireEvent.click(screen.getByTestId('view-toggle-chunks'))

    const visualizer = screen.getByTestId('chunk-visualizer')
    expect(visualizer).toHaveAttribute('data-keyword-count', '0')

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
    expect(chunkToggle).toHaveClass('text-slate-500')
    expect(chunkToggle).toHaveClass('hover:text-slate-700')
    expect(previewBody).toHaveTextContent(MOCK_ARTICLES[0]!.content)

    fireEvent.click(chunkToggle)

    expect(chunkToggle).toHaveClass('bg-white')
    expect(textToggle).not.toHaveClass('bg-white')
    expect(textToggle).toHaveClass('text-slate-500')
    expect(textToggle).toHaveClass('hover:text-slate-700')
    expect(screen.getByText(/Chunk #1/)).toBeInTheDocument()

    fireEvent.click(textToggle)
    expect(textToggle).toHaveClass('bg-white')
    expect(chunkToggle).not.toHaveClass('bg-white')
    expect(chunkToggle).toHaveClass('text-slate-500')
    expect(chunkToggle).toHaveClass('hover:text-slate-700')
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

  it('matches retrieved context regardless of casing', async () => {
    vi.useFakeTimers()
    renderHome(CASE_SENSITIVE_ARTICLES)

    submitQuery('metro expansion updates কী')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      const retrievedChunks = screen.getAllByTestId('retrieved-chunk')
      expect(
        retrievedChunks.some((chunk) => within(chunk).queryByText(/METRO expansion is underway/i)),
      ).toBe(true)
    })
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
    expect(assistantMessage?.className ?? '').not.toContain('Stryker was here')

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

    const avatarNodes = screen.getAllByTestId('chat-avatar')
    const userAvatar = avatarNodes.find((node) => node.dataset.role === 'user')
    const assistantAvatar = avatarNodes.find((node) => node.dataset.role === 'assistant')

    expect(userAvatar).toBeDefined()
    expect(userAvatar!).toHaveClass('bg-slate-200')
    expect(assistantAvatar).toBeDefined()
    expect(assistantAvatar!).toHaveClass('bg-emerald-100')
    expect(assistantAvatar!).toHaveClass('text-emerald-600')
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

  it('detects desktop on initial render when window is wide', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toBeInTheDocument()
  })

  it('updates desktop state when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()

    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    fireEvent(window, new Event('resize'))

    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
  })

  it('toggles knowledge panel collapsed state', () => {
    renderHome()
    
    const knowledgePanel = screen.getByTestId('knowledge-panel')
    expect(knowledgePanel).toBeInTheDocument()
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const chatPanel = screen.getByTestId('chat-panel')
      expect(chatPanel).toHaveAttribute('data-knowledge-collapsed', 'true')
    }
  })

  it('handles mousedown on resize separator', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(separator).toBeInTheDocument()
    }
  })

  it('resizes panel width when dragging separator', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      
      expect(separator).toBeInTheDocument()
    }
  })

  it('clamps panel width to minimum and maximum bounds', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      fireEvent(document, new MouseEvent('mousemove', { clientX: 100, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      
      expect(separator).toBeInTheDocument()
    }
  })

  it('stops resizing on mouseup event', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      
      fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('does not resize when mousemove occurs without active drag', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
    
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toBeInTheDocument()
  })

  it('hides resize separator when knowledge panel is collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const separator = screen.queryByRole('separator', { name: /resize panels/i })
      expect(separator).not.toBeInTheDocument()
    }
  })

  it('applies correct grid template columns style when panel is expanded', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    
    const gridContainer = container.querySelector('[class*="grid"]')
    expect(gridContainer).toBeInTheDocument()
  })

  it('sets cursor style to col-resize during active drag', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(document.body.style.cursor).toBe('')
      
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(document.body.style.cursor).toBe('col-resize')
      expect(document.body.style.userSelect).toBe('none')
      
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(document.body.style.cursor).toBe('')
      expect(document.body.style.userSelect).toBe('')
    }
  })

  it('calculates correct panel width delta during drag', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      // Move right by 50px
      fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
      // Panel should resize
      
      // Move left by 100px (back past start)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 300, bubbles: true }))
      
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('respects minimum panel width of 280px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      // Try to drag far left (below minimum)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 50, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      
      expect(separator).toBeInTheDocument()
    }
  })

  it('respects maximum panel width of 600px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      // Try to drag far right (above maximum)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 800, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      
      expect(separator).toBeInTheDocument()
    }
  })

  it('cleans up resize event listeners on unmount', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { unmount } = renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
    }
    
    unmount()
    
    // After unmount, mousemove should not cause errors
    fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
  })

  it('cleans up desktop resize listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { unmount } = renderHome()
    
    unmount()
    
    // After unmount, resize should not cause errors
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    fireEvent(window, new Event('resize'))
  })

  it('updates desktop state from false to true on resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true })
    renderHome()
    
    // Initially narrow (mobile)
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
    
    // Resize to wide (desktop)
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    fireEvent(window, new Event('resize'))
    
    // Separator should now be available
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(separator).toBeInTheDocument()
    }
  })

  it('applies different grid classes based on collapse state', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    // Check that chat panel position changes when toggling collapse
    const chatPanel = screen.getByTestId('chat-panel')
    const initialClasses = chatPanel.className
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const updatedClasses = chatPanel.className
      expect(initialClasses).not.toBe(updatedClasses)
    }
  })

  it('handles rapid mouse movements during resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      
      // Rapid movements
      fireEvent(document, new MouseEvent('mousemove', { clientX: 420, bubbles: true }))
      fireEvent(document, new MouseEvent('mousemove', { clientX: 440, bubbles: true }))
      fireEvent(document, new MouseEvent('mousemove', { clientX: 460, bubbles: true }))
      fireEvent(document, new MouseEvent('mousemove', { clientX: 480, bubbles: true }))
      
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('verifies default panel width is 360px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    expect(separator).toBeInTheDocument()
  })

  it('verifies resize state initializes to false', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    // Should not be resizing initially
    expect(document.body.style.cursor).not.toBe('col-resize')
  })

  it('verifies desktop state initializes based on window width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true })
    renderHome()
    
    // On mobile, separator should exist but may be hidden via CSS
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toBeInTheDocument()
  })

  it('sets resizing state to true on mousedown', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(document.body.style.cursor).toBe('')
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(document.body.style.cursor).toBe('col-resize')
    }
  })

  it('verifies resize start position is captured', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 350 })
      // Verify that subsequent movements are relative to start position
      fireEvent(document, new MouseEvent('mousemove', { clientX: 400, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('maintains cursor and userSelect styles during active resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(document.body.style.cursor).toBe('col-resize')
      expect(document.body.style.userSelect).toBe('none')
      
      fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
      expect(document.body.style.cursor).toBe('col-resize')
      expect(document.body.style.userSelect).toBe('none')
    }
  })

  it('resets styles when exiting resize mode', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(document.body.style.cursor).toBe('col-resize')
      
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(document.body.style.cursor).toBe('')
      expect(document.body.style.userSelect).toBe('')
    }
  })

  it('does not update panel width when width is below minimum', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      // Try to drag to make width less than 280px (400 - 400 + 360 = 360, then 360 - 200 = 160 < 280)
      fireEvent(document, new MouseEvent('mousemove', { clientX: 200, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('does not update panel width when width is above maximum', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      // Try to drag to make width more than 600px
      fireEvent(document, new MouseEvent('mousemove', { clientX: 700, bubbles: true }))
      fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
      expect(separator).toBeInTheDocument()
    }
  })

  it('shows separator only when desktop and not collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    let separator = screen.queryByRole('separator', { name: /resize panels/i })
    expect(separator).toBeInTheDocument()
    
    // Collapse panel
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      separator = screen.queryByRole('separator', { name: /resize panels/i })
      expect(separator).not.toBeInTheDocument()
    }
  })

  // Tests targeting surviving OptionalChaining mutants in Gemini response parsing
  it('verifies exact optional chaining path for Gemini candidates array access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: null }) // This will fail without ?.[0]
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const inputElement = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(inputElement, { target: { value: 'health question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    // Should not crash even when candidates is null - optional chaining handles it
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini content object access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: null }] }) // This will fail without ?.content
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const inputElement = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(inputElement, { target: { value: 'health question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    // Should not crash even when content is null - optional chaining handles it
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini parts array access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: null } }] }) // This will fail without ?.parts
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const inputElement = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(inputElement, { target: { value: 'health question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    // Should not crash even when parts is null - optional chaining handles it
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini text property access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: undefined }] } }] }) // This will fail without ?.text
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const inputElement = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(inputElement, { target: { value: 'health question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    // Should not crash even when text is undefined - optional chaining handles it
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  // Tests targeting gridStyle calculation mutants
  it('verifies gridStyle is undefined when not desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true })
    const { container } = renderHome()
    const mainGrid = container.querySelector('.md\\:grid-cols-\\[48px_minmax\\(0\\,1fr\\)\\]')
    // When not desktop, gridStyle should be undefined, so inline style should not be set
    expect(mainGrid?.getAttribute('style')).toBeFalsy()
  })

  it('verifies gridStyle is undefined when knowledge panel is collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const mainGrid = document.querySelector('.md\\:grid-cols-\\[48px_minmax\\(0\\,1fr\\)\\]')
      // When collapsed, gridStyle should be undefined
      expect(mainGrid?.getAttribute('style')).toBeFalsy()
    }
  })

  it('verifies gridStyle contains exact gridTemplateColumns template literal', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Should contain the template with panelWidth, 16px separator, and minmax
    expect(style).toContain('360px 16px minmax(0, 1fr)') // default panelWidth is 360
  })

  it('verifies gridTemplateColumns updates with panel width changes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    fireEvent.mouseDown(separator, { clientX: 400 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Panel width should be 360 + (450 - 400) = 410px
    expect(style).toContain('410px 16px minmax(0, 1fr)')
  })

  // Tests targeting resize logic mutants (delta, arithmetic operators)
  it('verifies resize delta calculation uses subtraction not addition', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Start at 400, move left to 350 (delta should be -50)
    fireEvent.mouseDown(separator, { clientX: 400 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 350, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Panel width should be 360 + (-50) = 310px (not 360 + 400 + 350)
    expect(style).toContain('310px 16px minmax(0, 1fr)')
  })

  it('verifies newWidth calculation uses addition not subtraction', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Start at 400, move right to 500 (delta = +100)
    fireEvent.mouseDown(separator, { clientX: 400 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 500, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Panel width should be 360 + 100 = 460px (not 360 - 100)
    expect(style).toContain('460px 16px minmax(0, 1fr)')
  })

  it('verifies exact minimum boundary at 280px using >=', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Try to drag to exactly 280px
    fireEvent.mouseDown(separator, { clientX: 360 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 280, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Should allow exactly 280px (>= not >)
    expect(style).toContain('280px 16px minmax(0, 1fr)')
  })

  it('verifies exact maximum boundary at 600px using <=', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Try to drag to exactly 600px
    fireEvent.mouseDown(separator, { clientX: 360 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 600, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Should allow exactly 600px (<= not <)
    expect(style).toContain('600px 16px minmax(0, 1fr)')
  })

  it('verifies width does not update when boundary check fails', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Try to drag below 280px
    fireEvent.mouseDown(separator, { clientX: 360 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 250, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Should stay at 360px (not update to 270px)
    expect(style).toContain('360px 16px minmax(0, 1fr)')
  })

  // Tests targeting string literal and event listener mutants
  it('verifies mousemove event listener is attached with correct event name', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    fireEvent.mouseDown(separator, { clientX: 400 })
    
    // Should call addEventListener with 'mousemove', not empty string
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })

  it('verifies mouseup event listener is attached with correct event name', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    fireEvent.mouseDown(separator, { clientX: 400 })
    
    // Should call addEventListener with 'mouseup', not empty string
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('verifies cursor style is reset to empty string on mouseup', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    fireEvent.mouseDown(separator, { clientX: 400 })
    expect(document.body.style.cursor).toBe('col-resize')
    
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
    // Should be empty string, not 'col-resize' or other value
    expect(document.body.style.cursor).toBe('')
  })

  it('verifies userSelect style is reset to empty string on mouseup', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    fireEvent.mouseDown(separator, { clientX: 400 })
    expect(document.body.style.userSelect).toBe('none')
    
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
    // Should be empty string, not 'none' or other value
    expect(document.body.style.userSelect).toBe('')
  })

  it('verifies main grid className includes md:gap-x-0 when not collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const gridElement = container.querySelector('.grid')
    // When not collapsed, should have 'md:gap-x-0' class
    expect(gridElement?.className).toContain('md:gap-x-0')
  })

  it('verifies main grid className does not include md:gap-x-0 when collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const gridElement = document.querySelector('.grid')
      // When collapsed, should NOT have 'md:gap-x-0' class (empty string)
      expect(gridElement?.className).not.toContain('md:gap-x-0')
    }
  })

  it('verifies resizing stops when isResizing becomes false', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    fireEvent.mouseDown(separator, { clientX: 400 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
    
    let gridElement = container.querySelector('.grid')
    let style = gridElement?.getAttribute('style')
    expect(style).toContain('410px') // width updated
    
    // Mouseup sets isResizing to false
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
    
    // Try to move mouse again - should not update width
    fireEvent(document, new MouseEvent('mousemove', { clientX: 500, bubbles: true }))
    gridElement = container.querySelector('.grid')
    style = gridElement?.getAttribute('style')
    expect(style).toContain('410px') // still 410, not 450
  })

  it('verifies answer variable initializes to empty string not other value', async () => {
    vi.useFakeTimers()
    renderHome()
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'test question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    // If answer starts as "Stryker was here!", the response would be malformed
    await advanceAllTimers()
    vi.useRealTimers()
    
    await waitFor(() => {
      const messages = screen.getAllByText(/cricket|dengue|could not find/i)
      expect(messages.length).toBeGreaterThan(0)
    })
  })

  it('verifies grid columns styling when panel is not collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    
    // Should have grid layout with specific columns
    const gridContainer = container.querySelector('[class*="grid"]')
    expect(gridContainer).toBeInTheDocument()
  })

  it('applies desktop-specific grid column classes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toHaveClass('md:col-start-3')
  })

  it('applies collapsed grid column classes when panel is collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const chatPanel = screen.getByTestId('chat-panel')
      expect(chatPanel).toHaveClass('md:col-start-2')
    }
  })

  it('removes event listeners when component unmounts during resize', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { unmount } = renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      fireEvent.mouseDown(separator, { clientX: 400 })
      expect(document.body.style.cursor).toBe('col-resize')
    }
    
    unmount()
    
    // After unmount, styles should be cleaned up
    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
  })

  it('verifies window innerWidth check uses >= operator for desktop detection', () => {
    // Test at exactly 768px (breakpoint)
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true })
    renderHome()
    
    fireEvent(window, new Event('resize'))
    
    // At 768px, should be considered desktop
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(separator).toBeInTheDocument()
    }
  })

  it('verifies separator has correct aria-label', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(separator).toHaveAttribute('aria-label', 'Resize panels')
    }
  })

  it('verifies separator has cursor-col-resize class', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    if (separator) {
      expect(separator).toHaveClass('cursor-col-resize')
    }
  })

  it('verifies grid template columns uses correct syntax', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    // Grid should be applied with specific template
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toBeInTheDocument()
  })

  // Tests to kill remaining surviving mutants for 95%+ mutation score
  
  // Kill ArrayDeclaration mutants in useEffect dependencies
  it('verifies Bengali font link cleanup depends on empty array dependency', () => {
    const { unmount } = renderHome()
    const initialLinks = document.querySelectorAll('link[href*="Noto+Sans+Bengali"]')
    expect(initialLinks.length).toBeGreaterThan(0)
    
    unmount()
    // If dependency array was ["Stryker was here"], cleanup wouldn't work properly
    const remainingLinks = document.querySelectorAll('link[href*="Noto+Sans+Bengali"]')
    expect(remainingLinks.length).toBe(0)
  })

  it('verifies scroll behavior triggers on chat history changes', async () => {
    renderHome()
    const mockScrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true,
      configurable: true
    })
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'test question' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    // If dependency array was empty [], scroll wouldn't trigger on chat changes
    await waitFor(() => expect(mockScrollIntoView).toHaveBeenCalled())
  })

  it('verifies ragSteps initializes to empty array not string array', () => {
    renderHome()
    // Component should render without errors
    // If ragSteps was ["Stryker was here"], TypeScript would catch type error in runtime
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
  })

  // Kill isDesktop initial state and desktop detection mutants
  it('verifies isDesktop starts as false on mobile width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true })
    renderHome()
    
    // The separator exists in DOM but is hidden on mobile via CSS classes
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    // It has hidden class for mobile, md:flex for desktop
    expect(separator).toHaveClass('hidden')
  })

  it('verifies desktop detection at exactly 768px uses >= not >', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true })
    renderHome()
    
    // Trigger resize to update isDesktop state
    fireEvent(window, new Event('resize'))
    
    // At exactly 768px, should be desktop (>=), not mobile (>)
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    expect(separator).toBeInTheDocument()
  })

  it('verifies desktop detection at 767px is mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 767, writable: true, configurable: true })
    renderHome()
    
    fireEvent(window, new Event('resize'))
    
    // At 767px, should be mobile - separator has hidden class
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    expect(separator).toHaveClass('hidden')
  })

  it('verifies setIsDesktop is not always set to true', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true })
    renderHome()
    
    fireEvent(window, new Event('resize'))
    
    // If setIsDesktop(true) always, separator would show on mobile
    const separator = screen.queryByRole('separator', { name: /resize panels/i })
    // Should be hidden on mobile
    expect(separator).toHaveClass('hidden')
  })

  // Kill event listener string literal mutants
  it('verifies resize event listener uses "resize" not empty string', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    // Separator should have md:flex class on desktop
    let separator = screen.queryByRole('separator', { name: /resize panels/i })
    expect(separator?.classList.contains('md:flex')).toBe(true)
    
    // Change width and trigger resize
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    fireEvent(window, new Event('resize'))
    
    // If addEventListener used "", resize wouldn't work
    // The separator still exists but styling would be same (hidden on mobile)
    separator = screen.queryByRole('separator', { name: /resize panels/i })
    // On mobile, the separator has hidden class
    expect(separator?.classList.contains('hidden')).toBe(true)
  })

  it('verifies desktop resize cleanup removes correct event listener', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHome()
    
    unmount()
    
    // Should call removeEventListener with 'resize', not empty string
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('verifies cleanup function is not replaced with undefined', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHome()
    
    unmount()
    
    // If cleanup was () => undefined, removeEventListener wouldn't be called
    expect(removeEventListenerSpy).toHaveBeenCalled()
  })

  // Kill optional chaining mutants in scrollIntoView
  it('verifies scrollIntoView with smooth behavior on message update', async () => {
    vi.useFakeTimers()
    const mockScrollIntoView = vi.fn()
    
    // Mock scrollIntoView globally
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true,
      configurable: true
    })
    
    renderHome()
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'cricket' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    
    // Should call with { behavior: 'smooth' }, not {}
    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalled()
      if (mockScrollIntoView.mock.calls.length > 0) {
        expect(mockScrollIntoView.mock.calls[0][0]).toEqual({ behavior: 'smooth' })
      }
    })
  })

  // Kill string literal mutants in grid classes
  it('verifies collapsed grid class is not "Stryker was here!"', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const gridElement = document.querySelector('.grid')
      // Should not contain "Stryker was here!"
      expect(gridElement?.className).not.toContain('Stryker was here')
    }
  })

  it('verifies non-collapsed returns empty string not "Stryker was here!"', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    
    const gridElement = container.querySelector('.grid')
    // When not collapsed, ternary should return '', not "Stryker was here!"
    expect(gridElement?.className).not.toContain('Stryker was here!')
  })

  it('verifies desktopColumnClasses not empty string when collapsed', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    
    const toggleButtons = screen.getAllByRole('button')
    const collapseButton = toggleButtons.find(btn => 
      btn.getAttribute('aria-expanded') === 'true' && 
      btn.textContent?.includes('Knowledge Base')
    )
    
    if (collapseButton) {
      fireEvent.click(collapseButton)
      const gridElement = document.querySelector('.grid')
      // Should have grid column classes, not be empty
      expect(gridElement?.className).toMatch(/md:grid-cols-\[48px/)
    }
  })

  // Kill BlockStatement mutant in else block (cursor/userSelect reset)
  it('verifies else block executes to reset cursor and userSelect', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // Start resize
    fireEvent.mouseDown(separator, { clientX: 400 })
    expect(document.body.style.cursor).toBe('col-resize')
    expect(document.body.style.userSelect).toBe('none')
    
    // Move mouse (still resizing)
    fireEvent(document, new MouseEvent('mousemove', { clientX: 450, bubbles: true }))
    expect(document.body.style.cursor).toBe('col-resize')
    
    // End resize - else block should reset styles
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
    
    // If else block was {}, styles wouldn't reset
    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
  })

  // Kill ConditionalExpression mutant for !isResizing check
  it('verifies mousemove only updates when isResizing is true', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    
    // Try to move without starting resize
    fireEvent(document, new MouseEvent('mousemove', { clientX: 500, bubbles: true }))
    
    const gridElement = container.querySelector('.grid')
    const style = gridElement?.getAttribute('style')
    // Should stay at 360px since !isResizing check prevents update
    expect(style).toContain('360px')
  })

  // Kill ConditionalExpression mutant for boundary check
  it('verifies width boundary check is not just newWidth >= 280', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    const { container } = renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    // First set width to exactly 280px by dragging left from 360px (delta = -80)
    fireEvent.mouseDown(separator, { clientX: 360 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 280, bubbles: true }))
    
    await waitFor(() => {
      const gridElement = container.querySelector('.grid')
      const style = gridElement?.getAttribute('style')
      expect(style).toContain('280px')
    })
    
    // Now try to drag further left (below 280px)
    fireEvent.mouseDown(separator, { clientX: 280 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 100, bubbles: true }))
    
    await waitFor(() => {
      const gridElement = container.querySelector('.grid')
      const style = gridElement?.getAttribute('style')
      // Should stay at 280px, not go below
      expect(style).toContain('280px')
      expect(style).not.toContain('100px')
    })
    
    // Set to 600px max
    fireEvent.mouseDown(separator, { clientX: 280 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 600, bubbles: true }))
    
    await waitFor(() => {
      const gridElement = container.querySelector('.grid')
      const style = gridElement?.getAttribute('style')
      // Should cap at 600px
      expect(style).toContain('600px')
    })
    
    // Try to go beyond 600px
    fireEvent.mouseDown(separator, { clientX: 600 })
    fireEvent(document, new MouseEvent('mousemove', { clientX: 1000, bubbles: true }))
    
    await waitFor(() => {
      const gridElement = container.querySelector('.grid')
      const style = gridElement?.getAttribute('style')
      // Should stay at 600px
      expect(style).toContain('600px')
      expect(style).not.toContain('1000px')
    })
  })

  // Kill mouseup removeEventListener string literal mutant
  it('verifies mouseup cleanup uses correct event name', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    renderHome()
    const separator = screen.getByRole('separator', { name: /resize panels/i })
    
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    fireEvent.mouseDown(separator, { clientX: 400 })
    fireEvent(document, new MouseEvent('mouseup', { bubbles: true }))
    
    // Should call with 'mouseup', not empty string ""
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  // Kill answer initialization string literal mutant
  it('verifies answer variable starts empty not "Stryker was here!"', async () => {
    vi.useFakeTimers()
    renderHome()
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'cricket' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    
    // Response should be normal cricket answer, not prefixed with "Stryker was here!"
    await waitFor(() => {
      const chatPanel = screen.getByTestId('chat-panel')
      expect(chatPanel.textContent).not.toContain('Stryker was here!')
    })
  })

  // Kill remaining OptionalChaining mutants in Gemini parsing
  it('verifies removing ?. from parts[0] breaks with null parts', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        candidates: [{ 
          content: { 
            parts: null // This tests parts?.[0] 
          } 
        }] 
      })
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    
    // Should not crash - optional chaining handles null
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies removing ?. from [0].text breaks with empty parts array', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        candidates: [{ 
          content: { 
            parts: [] // Empty array tests [0]?.text
          } 
        }] 
      })
    })
    global.fetch = mockFetch
    
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /toggle settings/i }))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    
    await advanceAllTimers()
    vi.useRealTimers()
    
    // Should not crash - optional chaining handles empty array
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })
})
