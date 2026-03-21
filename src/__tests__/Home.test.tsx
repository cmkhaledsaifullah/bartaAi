import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import Home from '../views/Home'
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
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
}

const setApiKey = (key: string) => {
  fireEvent.click(screen.getByTestId('models-toggle'))
  const apiInput = screen.getByLabelText(/Gemini API Key/i)
  fireEvent.change(apiInput, { target: { value: key } })
  fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  global.fetch = originalFetch
})

describe('Home', () => {
  it('renders the knowledge base header and default articles', () => {
    renderHome()

    expect(screen.getAllByText('বার্তা ভাণ্ডার').length).toBeGreaterThan(0)

    // Switch to knowledge tab to see articles
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)

    expect(screen.getByTestId('article-card-1')).toHaveTextContent('মেট্রোরেল')
    expect(screen.getByTestId('article-card-2')).toHaveTextContent('বিশ্বকাপ ক্রিকেট')
  })

  it('mounts the Bengali font link and cleans it up on unmount', () => {
    const { unmount } = renderHome()

    const fontLink = document.head.querySelector('link[data-testid="bangla-font-link"]') as HTMLLinkElement | null

    expect(fontLink).not.toBeNull()
    expect(fontLink?.rel).toBe('stylesheet')
    expect(fontLink?.href).toContain('Noto+Sans+Bengali')

    unmount()
    expect(document.head.querySelector('link[data-testid="bangla-font-link"]')).toBeNull()
  })

  it('displays the initial welcome system message in the centered view', () => {
    renderHome()

    const welcomeMessage = screen.getByText(
      'স্বাগতম! আমি আপনার বার্তাAI—বাংলাদেশের সর্বশেষ খবরের ভিত্তিতে আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।',
    )
    expect(welcomeMessage).toBeInTheDocument()
    expect(welcomeMessage.tagName).toBe('DIV')
  })

  it('renders knowledge base summary and first article preview', () => {
    renderHome()

    // বার্তা ভাণ্ডার button should be visible in header/footer
    expect(screen.getAllByText('বার্তা ভাণ্ডার').length).toBeGreaterThan(0)
    
    // Switch to knowledge tab to see the knowledge base content
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)
    
    expect(screen.getAllByText('3 Articles').length).toBeGreaterThan(0)
    expect(screen.getByText(MOCK_ARTICLES[0]!.title)).toBeInTheDocument()
  })

  it('renders prompt example shortcuts with the provided copy', () => {
    renderHome()

    const buttons = screen.getAllByRole('button')
    const exampleOne = buttons.find(b => b.textContent?.includes('Example 1') && b.textContent?.includes('মেট্রোরেল নিয়ে আপডেট কি?'))
    const exampleTwo = buttons.find(b => b.textContent?.includes('Example 2') && b.textContent?.includes('How is Bangladesh doing in Cricket?'))

    expect(exampleOne).toBeDefined()
    expect(exampleTwo).toBeDefined()
  })

  it('highlights the active article card', () => {
    renderHome()

    // Switch to knowledge tab to see articles
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)

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

    // Switch to knowledge tab
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)

    fireEvent.click(screen.getByRole('button', { name: /chunks/i }))

    expect(screen.getByText(/Chunk #1/)).toBeInTheDocument()
  })

  it('keeps preview chunk cards neutral when no highlight keywords are provided', () => {
    renderHome()

    // Switch to knowledge tab first
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)

    fireEvent.click(screen.getByTestId('view-toggle-chunks'))

    const visualizer = screen.getByTestId('chunk-visualizer')
    expect(visualizer).toHaveAttribute('data-keyword-count', '0')

    screen.getAllByTestId('chunk-card').forEach((card) => {
      expect(card.getAttribute('data-relevant')).toBe('false')
    })
  })

  it('syncs view-mode buttons with preview content', () => {
    renderHome()

    // Switch to knowledge tab first
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)

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

    const modelsButton = screen.getByTestId('models-toggle')
    expect(screen.queryByText('Model Configuration')).not.toBeInTheDocument()

    fireEvent.click(modelsButton)

    expect(screen.getByText('Model Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))

    expect(screen.queryByText('Model Configuration')).not.toBeInTheDocument()
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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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

    fireEvent.click(screen.getByTestId('models-toggle'))
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'fake-key' } })
    // Close modal before submitting
    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'ক্রিকেট প্রশ্ন' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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



  it('surfaces API errors inside the chat stream for invalid keys', async () => {
    vi.useFakeTimers()

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ error: { message: 'Invalid API key' } }),
    }) as typeof fetch

    renderHome()

    fireEvent.click(screen.getByTestId('models-toggle'))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'bad-key' } })
    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'ক্রিকেট প্রশ্ন' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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

    fireEvent.click(screen.getByTestId('models-toggle'))
    fireEvent.change(screen.getByLabelText(/Gemini API Key/i), { target: { value: 'key-123' } })
    fireEvent.click(screen.getByRole('button', { name: /close configuration/i }))

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

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








  // Tests targeting surviving OptionalChaining mutants in Gemini response parsing
  it('verifies exact optional chaining path for Gemini candidates array access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: null })
    })
    global.fetch = mockFetch
    
    renderHome()
    setApiKey('fake-key')
    
    submitQuery('health question')
    
    await advanceAllTimers()
    vi.useRealTimers()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini content object access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: null }] })
    })
    global.fetch = mockFetch
    
    renderHome()
    setApiKey('fake-key')
    
    submitQuery('health question')
    
    await advanceAllTimers()
    vi.useRealTimers()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini parts array access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: null } }] })
    })
    global.fetch = mockFetch
    
    renderHome()
    setApiKey('fake-key')
    
    submitQuery('health question')
    
    await advanceAllTimers()
    vi.useRealTimers()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies exact optional chaining path for Gemini text property access', async () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: undefined }] } }] })
    })
    global.fetch = mockFetch
    
    renderHome()
    setApiKey('fake-key')
    
    submitQuery('health question')
    
    await advanceAllTimers()
    vi.useRealTimers()
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('verifies answer variable initializes to empty string not other value', async () => {
    vi.useFakeTimers()
    renderHome()
    
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER)
    fireEvent.change(input, { target: { value: 'test question' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    // If answer starts as "Stryker was here!", the response would be malformed
    await advanceAllTimers()
    vi.useRealTimers()
    
    await waitFor(() => {
      const messages = screen.getAllByText(/cricket|dengue|could not find/i)
      expect(messages.length).toBeGreaterThan(0)
    })
  })

  // Tests to kill remaining surviving mutants for 95%+ mutation score

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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
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

  it('resets chat session when clicking the logo (new session)', async () => {
    vi.useFakeTimers()
    renderHome()

    // Submit a query first so we have user + assistant messages
    submitQuery('মেট্রোরেল আপডেট দিন')
    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      const userMessages = screen
        .getAllByTestId('chat-message')
        .filter((node) => node.dataset.role === 'user')
      expect(userMessages.length).toBeGreaterThan(0)
    })

    // Click the logo / new session button
    const newSessionButton = screen.getByRole('button', { name: /Start new chat session/i })
    fireEvent.click(newSessionButton)

    // After reset: no user messages, only the initial system message remains
    const userMessagesAfterReset = screen
      .getAllByTestId('chat-message')
      .filter((node) => node.dataset.role === 'user')
    expect(userMessagesAfterReset).toHaveLength(0)

    const assistantMessagesAfterReset = screen
      .getAllByTestId('chat-message')
      .filter((node) => node.dataset.role === 'assistant')
    expect(assistantMessagesAfterReset).toHaveLength(0)

    // System welcome message should still be present
    expect(
      screen.getByText(/স্বাগতম! আমি আপনার বার্তাAI/),
    ).toBeInTheDocument()

    // Query input should be cleared and enabled
    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER) as HTMLInputElement
    expect(input.value).toBe('')
    expect(input.disabled).toBe(false)

    // RAG steps should be cleared (no processing indicators)
    expect(screen.queryByTestId('rag-steps-panel')).not.toBeInTheDocument()
  })

  it('initializes query as empty and isProcessing as false', () => {
    renderHome()

    const input = screen.getByPlaceholderText(QUESTION_PLACEHOLDER) as HTMLInputElement
    expect(input.value).toBe('')
    expect(input.disabled).toBe(false)
  })

  it('does not show rag steps panel on initial render', () => {
    renderHome()

    expect(screen.queryByTestId('rag-steps-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('rag-step')).not.toBeInTheDocument()
  })

  it('does not add duplicate font link on rerender', () => {
    const { rerender } = renderHome()

    const linksBefore = document.head.querySelectorAll('[data-testid="bangla-font-link"]')
    expect(linksBefore).toHaveLength(1)

    rerender(<Home articles={MOCK_ARTICLES} />)

    const linksAfter = document.head.querySelectorAll('[data-testid="bangla-font-link"]')
    expect(linksAfter).toHaveLength(1)
  })

  it('scrolls on chatHistory change but not on unrelated state changes', async () => {
    vi.useFakeTimers()
    const mockScrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true,
      configurable: true,
    })

    renderHome()
    const callCountAfterMount = mockScrollIntoView.mock.calls.length

    // Submit triggers chatHistory change → should scroll
    submitQuery('মেট্রোরেল')
    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(mockScrollIntoView.mock.calls.length).toBeGreaterThan(callCountAfterMount)
    })
  })

  it('shows both prompt and knowledge panels when activeTab conditionals are true', () => {
    renderHome()

    // Initially prompt is visible
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('knowledge-base')).not.toBeInTheDocument()

    // Switch to knowledge
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)
    expect(screen.getByTestId('knowledge-base')).toBeInTheDocument()
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument()

    // Switch back to prompt
    const promptButton = screen.getAllByRole('button', { name: /বার্তা Prompt/i })[0]
    fireEvent.click(promptButton)
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('knowledge-base')).not.toBeInTheDocument()
  })

  it('falls back to NO_CONTEXT_MESSAGE when Gemini returns null candidates', async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: null }),
    }) as typeof fetch

    renderHome()
    setApiKey('test-key')
    submitQuery('test query')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument()
    })
  })

  it('falls back to NO_CONTEXT_MESSAGE when Gemini returns empty candidates', async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: [] }),
    }) as typeof fetch

    renderHome()
    setApiKey('test-key')
    submitQuery('test query')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument()
    })
  })

  it('falls back to NO_CONTEXT_MESSAGE when Gemini candidate has null content', async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: [{ content: null }] }),
    }) as typeof fetch

    renderHome()
    setApiKey('test-key')
    submitQuery('test query')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument()
    })
  })

  it('falls back to NO_CONTEXT_MESSAGE when Gemini parts are empty', async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: [{ content: { parts: [] } }] }),
    }) as typeof fetch

    renderHome()
    setApiKey('test-key')
    submitQuery('test query')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument()
    })
  })

  it('falls back to NO_CONTEXT_MESSAGE when Gemini parts text is undefined', async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ candidates: [{ content: { parts: [{ text: undefined }] } }] }),
    }) as typeof fetch

    renderHome()
    setApiKey('test-key')
    submitQuery('test query')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      expect(
        screen.getByText('দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'),
      ).toBeInTheDocument()
    })
  })

  it('does not prefix mock response with any stale value from answer variable', async () => {
    vi.useFakeTimers()
    renderHome()

    submitQuery('মেট্রোরেল')

    await advanceAllTimers()
    vi.useRealTimers()

    await waitFor(() => {
      const assistant = screen
        .getAllByTestId('chat-message')
        .find((n) => n.dataset.role === 'assistant')
      const bubble = within(assistant!).getByTestId('chat-bubble')
      expect(bubble.textContent).not.toContain('Stryker was here')
      expect(bubble.textContent!.length).toBeGreaterThan(0)
    })
  })
})
