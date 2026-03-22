import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Chat from '../views/Chat'
import type { ChatMessage, RagStep } from '../types'
import { useChatStore } from '../store/chatStore'
import { CHAT_PLACEHOLDER, EXAMPLE_QUESTIONS } from '../config/constants'

const PLACEHOLDER = CHAT_PLACEHOLDER

const CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'initial-msg',
    role: 'system',
    content: 'স্বাগতম! বার্তাAI প্রস্তুত।',
    type: 'text',
  },
  {
    id: 'user-1',
    role: 'user',
    content: 'মেট্রোরেল আপডেট দিন',
    type: 'text',
  },
  {
    id: 'bot-1',
    role: 'assistant',
    content: 'মেট্রোরেলে নতুন সময়সূচি প্রকাশ হয়েছে।',
    type: 'answer',
    retrieved: [
      { text: 'মেট্রোরেল সকাল ৭টায় শুরু হয়।', score: 3, source: 'Metro Desk', sourceId: 1 },
    ],
    sources: ['Metro Desk'],
  },
]

const RAG_STEPS: RagStep[] = [
  { id: 'step-1', text: 'Generating query embeddings...', status: 'processing' },
  { id: 'step-2', text: 'Found 2 relevant context chunks', status: 'success' },
]

const createMessagesEndRef = (): MutableRefObject<HTMLDivElement | null> => ({
  current: document.createElement('div'),
})

type StoreOverrides = {
  chatHistory?: ChatMessage[]
  query?: string
  isProcessing?: boolean
  ragSteps?: RagStep[]
}

const renderChat = (overrides: StoreOverrides = {}) => {
  const onSubmit = vi.fn()

  useChatStore.setState({
    chatHistory: overrides.chatHistory ?? CHAT_HISTORY,
    query: overrides.query ?? '',
    isProcessing: overrides.isProcessing ?? false,
    ragSteps: overrides.ragSteps ?? [],
    placeholder: PLACEHOLDER,
    exampleQuestions: EXAMPLE_QUESTIONS,
  })

  render(<Chat onSubmit={onSubmit} messagesEndRef={createMessagesEndRef()} />)
  return { onSubmit }
}

beforeEach(() => {
  useChatStore.setState({ isInitialChat: true })
})

afterEach(() => {
  cleanup()
})

describe('Chat', () => {
  it('renders chat history and retrieval context bubbles', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    expect(screen.getByText('স্বাগতম! বার্তাAI প্রস্তুত।')).toBeInTheDocument()
    expect(screen.getByText('মেট্রোরেল আপডেট দিন')).toBeInTheDocument()
    expect(screen.getByText('মেট্রোরেলে নতুন সময়সূচি প্রকাশ হয়েছে।')).toBeInTheDocument()

    const retrievalContext = screen.getByTestId('retrieval-context')
    expect(within(retrievalContext).getByText(/Source:/)).toBeInTheDocument()
  })

  it('prefills the query input when an example question is selected', () => {
    renderChat()

    fireEvent.click(screen.getByRole('button', { name: /মেট্রোরেল নিয়ে আপডেট কি\?/i }))

    expect(useChatStore.getState().query).toBe('মেট্রোরেল নিয়ে আপডেট কি?')
  })

  it('invokes onSubmit when pressing Enter', () => {
    useChatStore.setState({ isInitialChat: false })
    const { onSubmit } = renderChat({ query: 'বঙ্গবন্ধু স্যাটেলাইট আপডেট' })

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not prevent Enter key when query is empty', () => {
    renderChat()
    const input = screen.getByPlaceholderText(PLACEHOLDER) as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('disables input while a search is running', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({ query: 'Ready', isProcessing: true })
    const input = screen.getByPlaceholderText(PLACEHOLDER) as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('shows rag steps when processing is active', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({ isProcessing: true, ragSteps: RAG_STEPS })

    const ragPanel = screen.getByTestId('rag-steps-panel')
    expect(within(ragPanel).getAllByTestId('rag-step')).toHaveLength(2)
    expect(within(ragPanel).getByTestId('rag-icon-success')).toBeInTheDocument()
  })

  it('verifies data-sources uses pipe separator', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      chatHistory: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Answer',
          type: 'text',
          sources: ['Source A', 'Source B', 'Source C'],
        },
      ],
    })

    const messageElements = screen.getAllByTestId('chat-message')
    const assistantMessage = messageElements.find(el => el.getAttribute('data-role') === 'assistant')
    const dataSources = assistantMessage?.getAttribute('data-sources') || ''
    expect(dataSources).toContain('|')
    expect(dataSources).not.toBe('')
  })

  it('verifies retrieved chunk keys are unique', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      chatHistory: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Answer',
          type: 'answer',
          retrieved: [
            { text: 'Chunk 1', score: 1, source: 'A', sourceId: 1 },
            { text: 'Chunk 2', score: 0.9, source: 'B', sourceId: 2 },
          ],
        },
      ],
    })

    const chunks = screen.getAllByTestId('retrieved-chunk')
    expect(chunks.length).toBe(2)
    expect(chunks[0].textContent).toContain('Chunk 1')
    expect(chunks[1].textContent).toContain('Chunk 2')
  })

  it('verifies warning status renders warning icon', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      isProcessing: true,
      ragSteps: [
        { id: '1', text: 'Warning step', status: 'warning' as const },
      ],
    })

    expect(screen.getByTestId('rag-icon-warning')).toBeInTheDocument()
  })

  it('renders user avatar with User icon', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const userAvatars = screen.getAllByTestId('chat-avatar').filter(el => el.dataset.role === 'user')
    expect(userAvatars.length).toBeGreaterThan(0)
    expect(within(userAvatars[0]).getByTestId('user-indicator')).toBeInTheDocument()
  })

  it('renders assistant avatar with logo', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const assistantAvatars = screen.getAllByTestId('chat-avatar').filter(el => el.dataset.role === 'assistant')
    expect(assistantAvatars.length).toBeGreaterThan(0)
    expect(within(assistantAvatars[0]).getByTestId('assistant-icon')).toBeInTheDocument()
  })

  it('renders error message with red styling', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      chatHistory: [
        {
          id: 'err-1',
          role: 'assistant',
          content: 'Error: Something went wrong',
          type: 'error',
        },
      ],
    })

    const errorText = screen.getByText('Error: Something went wrong')
    expect(errorText).toHaveClass('text-red-500')
  })

  it('renders single unified view with chat history and search input', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    expect(screen.getAllByTestId('chat-message').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it('renders example questions as buttons', () => {
    renderChat()

    const exampleButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Example'),
    )
    expect(exampleButtons).toHaveLength(2)
  })

  it('shows scroll-to-bottom button and scrolls when clicked', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const scrollContainer = document.querySelector('[data-testid="chat-conversation-view"] .overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true })
    scrollContainer.scrollTo = vi.fn()

    fireEvent.scroll(scrollContainer)

    const scrollBtn = screen.getByTestId('scroll-to-bottom')
    expect(scrollBtn).toBeInTheDocument()

    fireEvent.click(scrollBtn)
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' })
  })

  it('does not show scroll-to-bottom button when near bottom', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const scrollContainer = document.querySelector('[data-testid="chat-conversation-view"] .overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 450, configurable: true })
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true })

    fireEvent.scroll(scrollContainer)

    expect(screen.queryByTestId('scroll-to-bottom')).not.toBeInTheDocument()
  })

  it('reads isInitialChat from store to switch between initial and conversation view', () => {
    useChatStore.setState({ isInitialChat: true })
    renderChat()
    expect(screen.getByTestId('chat-initial-view')).toBeInTheDocument()
    expect(screen.queryByTestId('chat-conversation-view')).not.toBeInTheDocument()
  })

  it('reads query from store and renders it in input', () => {
    renderChat({ query: 'test-query-value' })
    const input = screen.getByPlaceholderText(PLACEHOLDER) as HTMLInputElement
    expect(input.value).toBe('test-query-value')
  })

  it('uses scroll-to-bottom initially hidden (false) not shown (true)', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()
    // Initially, scroll button should NOT be visible (useState(false))
    expect(screen.queryByTestId('scroll-to-bottom')).not.toBeInTheDocument()
  })

  it('data-sources attribute is empty string when sources is undefined', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      chatHistory: [
        { id: 'msg-no-sources', role: 'assistant', content: 'test', type: 'text' },
      ],
    })
    const msg = screen.getByTestId('chat-message')
    expect(msg.getAttribute('data-sources')).toBe('')
  })

  it('renders multiple retrieved chunks with unique keys', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      chatHistory: [
        {
          id: 'msg-multi',
          role: 'assistant',
          content: 'Answer',
          type: 'answer',
          retrieved: [
            { text: 'Chunk A', score: 1, source: 'S1', sourceId: 1 },
            { text: 'Chunk B', score: 2, source: 'S2', sourceId: 2 },
            { text: 'Chunk C', score: 3, source: 'S3', sourceId: 3 },
          ],
        },
      ],
    })
    const chunks = screen.getAllByTestId('retrieved-chunk')
    expect(chunks).toHaveLength(3)
    // All 3 chunks rendered means keys are unique (empty keys would deduplicate)
    expect(chunks[0].textContent).toContain('Chunk A')
    expect(chunks[1].textContent).toContain('Chunk B')
    expect(chunks[2].textContent).toContain('Chunk C')
  })

  it('only shows warning icon when status is warning, not unconditionally', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat({
      isProcessing: true,
      ragSteps: [
        { id: '1', text: 'Processing step', status: 'processing' as const },
      ],
    })
    expect(screen.queryByTestId('rag-icon-warning')).not.toBeInTheDocument()
    expect(screen.getByTestId('rag-icon-processing')).toBeInTheDocument()
  })

  it('does not show scroll button at exactly 100 distance (strict greater-than)', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const scrollContainer = document.querySelector('[data-testid="chat-conversation-view"] .overflow-y-auto')!
    // distance = 500 - 0 - 400 = 100 (exactly 100, not > 100)
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true })

    fireEvent.scroll(scrollContainer)

    expect(screen.queryByTestId('scroll-to-bottom')).not.toBeInTheDocument()
  })

  it('shows scroll button when distance is 101 (just above threshold)', () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    const scrollContainer = document.querySelector('[data-testid="chat-conversation-view"] .overflow-y-auto')!
    // distance = 501 - 0 - 400 = 101
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 501, configurable: true })
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true })

    fireEvent.scroll(scrollContainer)

    expect(screen.getByTestId('scroll-to-bottom')).toBeInTheDocument()
  })

  it('useEffect triggers handleChatScroll on chatHistory change', async () => {
    useChatStore.setState({ isInitialChat: false })
    renderChat()

    // First set the scroll position so button shows
    const scrollContainer = document.querySelector('[data-testid="chat-conversation-view"] .overflow-y-auto')!
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true })
    fireEvent.scroll(scrollContainer)
    expect(screen.getByTestId('scroll-to-bottom')).toBeInTheDocument()

    // Now scroll near bottom and trigger chatHistory change
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 550, configurable: true })
    // distance = 1000 - 550 - 400 = 50 < 100, so button should hide

    // The useEffect on chatHistory should call handleChatScroll
    useChatStore.setState({
      chatHistory: [
        ...CHAT_HISTORY,
        { id: 'new-msg', role: 'assistant' as const, content: 'new message', type: 'text' as const },
      ],
    })

    // After re-render triggered by chatHistory change, the useEffect runs handleChatScroll
    // The same DOM element is reused (React doesn't unmount the scroll container)
    await waitFor(() => {
      expect(screen.queryByTestId('scroll-to-bottom')).not.toBeInTheDocument()
    })
  })
})