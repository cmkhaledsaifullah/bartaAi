import { useEffect, useRef, useState } from 'react'
import '../styles/App.css'
import KnowledgeBase from './KnowledgeBase'
import Chat from './Chat'
import {
  buildContextText,
  buildGeminiPrompt,
  buildGeminiRequest,
  collectUniqueSources,
  createBanglaFontLink,
  extractSearchKeywords,
  splitArticleIntoSentences,
} from '../utils/homeHelpers'
import { generateMockResponse } from '../utils/mockResponses'
import {
  RAG_STEP_DELAY,
  MOCK_RESPONSE_DELAY,
  MAX_RETRIEVED_CHUNKS,
  NO_CONTEXT_MESSAGE,
  TAB_CHAT_ID,
  TAB_KNOWLEDGE_ID,
} from '../config/constants'
import type {
  Article,
  ViewMode,
  RetrievedChunk,
  GeminiResponse,
  HomeProps,
} from '../types'
import Header from './Header'
import { useChatStore } from '../store/chatStore'
import { useSettingsStore } from '../store/settingsStore'
import { useNavigationStore } from '../store/navigationStore'

export default function Home({ articles }: HomeProps) {
  useEffect(() => {
    const link = createBanglaFontLink()
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const [selectedArticle, setSelectedArticle] = useState<Article>(articles[0]!)
  const [viewMode, setViewMode] = useState<ViewMode>('text')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const chatHistory = useChatStore((s) => s.chatHistory)
  const isProcessing = useChatStore((s) => s.isProcessing)
  const ragSteps = useChatStore((s) => s.ragSteps)
  const setQuery = useChatStore((s) => s.setQuery)
  const addMessage = useChatStore((s) => s.addMessage)
  const addRagStep = useChatStore((s) => s.addRagStep)
  const resetRagSteps = useChatStore((s) => s.resetRagSteps)
  const setIsProcessing = useChatStore((s) => s.setIsProcessing)
  const startConversation = useChatStore((s) => s.startConversation)
  const resetChat = useChatStore((s) => s.resetChat)

  const apiKey = useSettingsStore((s) => s.apiKey)

  const activeTab = useNavigationStore((s) => s.activeTab)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isProcessing, ragSteps])

  const handleNewSession = () => {
    resetChat()
  }

  const handleSearch = async () => {
    const currentQuery = useChatStore.getState().query
    if (!currentQuery.trim()) {
      return
    }

    const timestamp = Date.now().toString()

    addMessage({
      id: `user-${timestamp}`,
      role: 'user',
      content: currentQuery,
      type: 'text',
    })
    setQuery('')
    setIsProcessing(true)
    startConversation()
    resetRagSteps()

    addRagStep('Generating query embeddings...', 'processing')
    await new Promise((resolve) => setTimeout(resolve, RAG_STEP_DELAY))

    addRagStep('Searching vector database (ChromaDB simulated)...', 'processing')
    await new Promise((resolve) => setTimeout(resolve, RAG_STEP_DELAY))

    const searchKeywords = extractSearchKeywords(currentQuery)

    const retrievedChunks: RetrievedChunk[] = []

    articles.forEach((article) => {
      const sentences = splitArticleIntoSentences(article.content)

      sentences.forEach((sentence) => {
        let score = 0

        searchKeywords.forEach((keyword) => {
          if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
            score += 1
          }
        })

        if (score > 0) {
          retrievedChunks.push({
            text: sentence,
            source: article.title,
            sourceId: article.id,
            score,
          })
        }
      })
    })

    retrievedChunks.sort((a, b) => b.score - a.score)
    const topChunks = retrievedChunks.slice(0, MAX_RETRIEVED_CHUNKS)

    if (topChunks.length > 0) {
      addRagStep(`Found ${topChunks.length} relevant context chunks`, 'success')
    } else {
      addRagStep('No highly relevant chunks found. Using general knowledge.', 'warning')
    }

    addRagStep('Sending context + query to LLM...', 'processing')

    const uniqueSources = collectUniqueSources(topChunks)

    try {
      let answer = ''

      if (apiKey) {
        const contextText = buildContextText(topChunks)
        const prompt = buildGeminiPrompt(contextText, useChatStore.getState().chatHistory.at(-1)?.content ?? currentQuery)
        const { url, init } = buildGeminiRequest(apiKey, prompt)

        const response = await fetch(url, init)

        const data = (await response.json()) as GeminiResponse

        if (data.error?.message) {
          throw new Error(data.error.message)
        }

        answer =
          data.candidates?.[0]?.content?.parts?.[0]?.text ?? NO_CONTEXT_MESSAGE
      } else {
        await new Promise((resolve) => setTimeout(resolve, MOCK_RESPONSE_DELAY))
        answer = generateMockResponse(topChunks)
      }

      addMessage({
        id: `bot-${timestamp}`,
        role: 'assistant',
        content: answer,
        type: 'answer',
        sources: uniqueSources,
        retrieved: topChunks,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'

      addMessage({
        id: `err-${timestamp}`,
        role: 'assistant',
        content: `Error: ${message}. Please check your API key.`,
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }


  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Header
        onNewSession={handleNewSession}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8 lg:px-12 flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === TAB_CHAT_ID && (
          <Chat
            onSubmit={handleSearch}
            messagesEndRef={messagesEndRef}
          />
        )}

        {activeTab === TAB_KNOWLEDGE_ID && (
          <KnowledgeBase
            articles={articles}
            selectedArticle={selectedArticle}
            viewMode={viewMode}
            highlightKeywords={[]}
            onSelectArticle={setSelectedArticle}
            onViewModeChange={setViewMode}
          />
        )}
      </div>
    </div>
  )
}
