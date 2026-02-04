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

export type ChunkVisualizerProps = {
  text: string
  highlightKeywords?: string[]
}

export type HomeProps = {
  articles: Article[]
}
