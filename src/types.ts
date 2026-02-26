import type { MutableRefObject } from 'react'

export type Article = {
  id: number
  source: string
  date: string
  title: string
  content: string
  url: string
}

export type ViewMode = 'text' | 'chunks'

export type RetrievedChunk = {
  text: string
  source: string
  sourceId: number
  score: number
}

export type ChatRole = 'system' | 'user' | 'assistant'
export type ChatMessageType = 'text' | 'answer' | 'error'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  type: ChatMessageType
  sources?: string[]
  retrieved?: RetrievedChunk[]
}

export type RagStatus = 'processing' | 'success' | 'warning'

export type RagStep = {
  id: string
  text: string
  status: RagStatus
}

export type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

export type ChunkCardsProps = {
  text: string
  highlightKeywords?: string[]
}

export type KnowledgeBaseProps = {
  articles: Article[]
  selectedArticle: Article
  viewMode: ViewMode
  highlightKeywords?: string[]
  onSelectArticle: (article: Article) => void
  onViewModeChange: (mode: ViewMode) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isActiveTab?: boolean
}

export type PromptProps = {
  chatHistory: ChatMessage[]
  showSettings: boolean
  onToggleSettings: () => void
  apiKey: string
  onApiKeyChange: (value: string) => void
  query: string
  isProcessing: boolean
  placeholder: string
  exampleQuestions: string[]
  onQueryChange: (value: string) => void
  onSubmit: () => void
  ragSteps: RagStep[]
  messagesEndRef: MutableRefObject<HTMLDivElement | null>
  isCollapsed: boolean
  onToggleCollapse: () => void
  isActiveTab?: boolean
}

export type HomeProps = {
  articles: Article[]
}
