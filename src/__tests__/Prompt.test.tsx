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
    content: 'মেট্রোরেলে নতুন সময়সূচি প্রকাশ হয়েছে।',
    type: 'answer',
    retrieved: [
      { text: 'মেট্রোরেল সকাল ৭টায় শুরু হয়।', score: 3, source: 'Metro Desk', sourceId: 1 },
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
    showSettings: false,
    onToggleSettings: vi.fn(),
    apiKey: '',
    onApiKeyChange: vi.fn(),
    query: '',
    isProcessing: false,
    placeholder: PLACEHOLDER,
    exampleQuestions: ['মেট্রোরেল নিয়ে আপডেট কি?', 'How is Bangladesh doing in Cricket?'],
    onQueryChange: vi.fn(),
    onSubmit: vi.fn(),
    ragSteps: [],
    messagesEndRef: createMessagesEndRef(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    isKnowledgeCollapsed: false,
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
    expect(screen.getByText('মেট্রোরেলে নতুন সময়সূচি প্রকাশ হয়েছে।')).toBeInTheDocument()

    const retrievalContext = screen.getByTestId('retrieval-context')
    expect(within(retrievalContext).getByText(/Source:/)).toBeInTheDocument()
  })

  it('prefills the query input when an example question is selected', () => {
    const props = renderPrompt()

    fireEvent.click(screen.getByRole('button', { name: /মেট্রোরেল নিয়ে আপডেট কি\?/i }))

    expect(props.onQueryChange).toHaveBeenCalledWith('মেট্রোরেল নিয়ে আপডেট কি?')
  })

  it('invokes onSubmit when clicking run search or pressing Enter', () => {
    const props = renderPrompt({ query: 'বঙ্গবন্ধু স্যাটেলাইট আপডেট' })

    fireEvent.click(screen.getByRole('button', { name: /run search/i }))
    expect(props.onSubmit).toHaveBeenCalledTimes(1)

    const input = screen.getByPlaceholderText(PLACEHOLDER)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(props.onSubmit).toHaveBeenCalledTimes(2)
  })

  it('disables submission when the query is empty', () => {
    renderPrompt()
    const submitButton = screen.getByRole('button', { name: /run search/i }) as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
  })

  it('disables submission while a search is running', () => {
    renderPrompt({ query: 'Ready', isProcessing: true })
    const submitButton = screen.getByRole('button', { name: /run search/i }) as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
  })

  it('toggles the settings panel and updates the API key input', () => {
    const props = renderPrompt()

    fireEvent.click(screen.getByTestId('settings-toggle-desktop'))
    expect(props.onToggleSettings).toHaveBeenCalledTimes(1)

    const apiProps = renderPrompt({ showSettings: true })
    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.change(apiInput, { target: { value: 'secret-key' } })
    expect(apiProps.onApiKeyChange).toHaveBeenCalledWith('secret-key')
  })

  it('shows rag steps when processing is active', () => {
    renderPrompt({ isProcessing: true, ragSteps: RAG_STEPS })

    const ragPanel = screen.getByTestId('rag-steps-panel')
    expect(within(ragPanel).getAllByTestId('rag-step')).toHaveLength(2)
    expect(within(ragPanel).getByTestId('rag-icon-success')).toBeInTheDocument()
  })

  it('applies correct data attribute when knowledge panel is collapsed', () => {
    renderPrompt({ isKnowledgeCollapsed: true })
    
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toHaveAttribute('data-knowledge-collapsed', 'true')
  })

  it('applies correct data attribute when knowledge panel is expanded', () => {
    renderPrompt({ isKnowledgeCollapsed: false })
    
    const chatPanel = screen.getByTestId('chat-panel')
    expect(chatPanel).toHaveAttribute('data-knowledge-collapsed', 'false')
  })

  it('closes settings panel when clicking outside', () => {
    const props = renderPrompt({ showSettings: true })

    // Click outside the settings panel
    fireEvent.mouseDown(document.body)
    
    expect(props.onToggleSettings).toHaveBeenCalledTimes(1)
  })

  it('does not close settings panel when clicking inside the settings panel', () => {
    const props = renderPrompt({ showSettings: true })

    const apiInput = screen.getByLabelText(/Gemini API Key/i)
    fireEvent.mouseDown(apiInput)
    
    expect(props.onToggleSettings).not.toHaveBeenCalled()
  })

  it('does not close settings panel when clicking the settings button', () => {
    const props = renderPrompt({ showSettings: true })

    const settingsButton = screen.getByTestId('settings-toggle-desktop')
    fireEvent.mouseDown(settingsButton)
    
    expect(props.onToggleSettings).not.toHaveBeenCalled()
  })

  it('does not trigger click outside handler when settings are closed', () => {
    const props = renderPrompt({ showSettings: false })

    fireEvent.mouseDown(document.body)
    
    expect(props.onToggleSettings).not.toHaveBeenCalled()
  })
})
