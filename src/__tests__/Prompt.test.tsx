import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps, MutableRefObject } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Prompt from '../views/Prompt'
import type { ChatMessage, RagStep } from '../types'

const PLACEHOLDER = 'Ask about the news (e.g., মেট্রোরেল বা ক্রিকেট সম্পর্কে কিছু বলুন)...'

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

const renderPrompt = (overrides: Partial<ComponentProps<typeof Prompt>> = {}) => {
  const props: ComponentProps<typeof Prompt> = {
    chatHistory: CHAT_HISTORY,
    query: '',
    isProcessing: false,
    placeholder: PLACEHOLDER,
    exampleQuestions: ['মেট্রোরেল নিয়ে আপডেট কি?', 'How is Bangladesh doing in Cricket?'],
    onQueryChange: vi.fn(),
    onSubmit: vi.fn(),
    ragSteps: [],
    messagesEndRef: createMessagesEndRef(),
    ...overrides,
  }

  render(<Prompt {...props} />)
  return props
}

afterEach(() => {
  cleanup()
})

describe('Prompt', () => {
  it('renders chat history and retrieval context bubbles', () => {
    renderPrompt()

    expect(screen.getByText('স্বাগতম! বার্তাAI প্রস্তুত।')).toBeInTheDocument()
    expect(screen.getByText('মেট্রোরেল আপডেট দিন')).toBeInTheDocument()
    expect(screen.getByText('মেট্রোরেলে নতুন সময়সূচি প্রকাশ হয়েছে।')).toBeInTheDocument()

    const retrievalContext = screen.getByTestId('retrieval-context')
    expect(within(retrievalContext).getByText(/Source:/)).toBeInTheDocument()
  })

  it('prefills the query input when an example question is selected', () => {
    const props = renderPrompt()

    fireEvent.click(screen.getByRole('button', { name: /মেট্রোরেল নিয়ে আপডেট কি\?/i }))

    expect(props.onQueryChange).toHaveBeenCalledWith('মেট্রোরেল নিয়ে আপডেট কি?')
  })

  it('invokes onSubmit when pressing Enter', () => {
    const props = renderPrompt({ query: 'বঙ্গবন্ধু স্যাটেলাইট আপডেট' })

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not prevent Enter key when query is empty', () => {
    renderPrompt()
    const input = screen.getByPlaceholderText(PLACEHOLDER) as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('disables input while a search is running', () => {
    renderPrompt({ query: 'Ready', isProcessing: true })
    const input = screen.getByPlaceholderText(PLACEHOLDER) as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('shows rag steps when processing is active', () => {
    renderPrompt({ isProcessing: true, ragSteps: RAG_STEPS })

    const ragPanel = screen.getByTestId('rag-steps-panel')
    expect(within(ragPanel).getAllByTestId('rag-step')).toHaveLength(2)
    expect(within(ragPanel).getByTestId('rag-icon-success')).toBeInTheDocument()
  })

  it('verifies data-sources uses pipe separator', () => {
    renderPrompt({
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
    renderPrompt({
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
    renderPrompt({
      isProcessing: true,
      ragSteps: [
        { id: '1', text: 'Warning step', status: 'warning' as const },
      ],
    })

    expect(screen.getByTestId('rag-icon-warning')).toBeInTheDocument()
  })

  it('renders user avatar with User icon', () => {
    renderPrompt()

    const userAvatars = screen.getAllByTestId('chat-avatar').filter(el => el.dataset.role === 'user')
    expect(userAvatars.length).toBeGreaterThan(0)
    expect(within(userAvatars[0]).getByTestId('user-indicator')).toBeInTheDocument()
  })

  it('renders assistant avatar with logo', () => {
    renderPrompt()

    const assistantAvatars = screen.getAllByTestId('chat-avatar').filter(el => el.dataset.role === 'assistant')
    expect(assistantAvatars.length).toBeGreaterThan(0)
    expect(within(assistantAvatars[0]).getByTestId('assistant-icon')).toBeInTheDocument()
  })

  it('renders error message with red styling', () => {
    renderPrompt({
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
    renderPrompt()

    expect(screen.getAllByTestId('chat-message').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it('renders example questions as buttons', () => {
    renderPrompt()

    const exampleButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Example'),
    )
    expect(exampleButtons).toHaveLength(2)
  })
})