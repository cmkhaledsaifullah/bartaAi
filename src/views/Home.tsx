import { useEffect, useRef, useState } from 'react'
import '../styles/App.css'
import KnowledgeBase from './KnowledgeBase'
import Prompt from './Prompt'
import {
  buildContextText,
  buildGeminiPrompt,
  buildGeminiRequest,
  collectUniqueSources,
  createBanglaFontLink,
  extractSearchKeywords,
  resetRagStepsState,
  splitArticleIntoSentences,
} from '../utils/homeHelpers'
import { generateMockResponse } from '../utils/mockResponses'
import {
  INITIAL_CHAT_MESSAGE,
  RAG_STEP_DELAY,
  MOCK_RESPONSE_DELAY,
  MAX_RETRIEVED_CHUNKS,
  NO_CONTEXT_MESSAGE,
  PROMPT_PLACEHOLDER,
  EXAMPLE_QUESTIONS,
  PANEL_PROMPT_ID,
  PANEL_KNOWLEDGE_ID,
} from '../config/constants'
import type {
  Article,
  ViewMode,
  RetrievedChunk,
  ChatMessage,
  RagStep,
  RagStatus,
  GeminiResponse,
  HomeProps,
} from '../types'
import Header from './Header'

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
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ragSteps, setRagSteps] = useState<RagStep[]>([])
  const [activeTab, setActiveTab] = useState<string>(PANEL_PROMPT_ID)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isProcessing, ragSteps])

  const addRagStep = (text: string, status: RagStatus) => {
    setRagSteps((prev) => [...prev, { text, status, id: `step-${Date.now()}-${Math.random()}` }])
  }

  const handleNewSession = () => {
    setChatHistory([INITIAL_CHAT_MESSAGE])
    setQuery('')
    setIsProcessing(false)
    setRagSteps([])
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      return
    }

    const timestamp = Date.now().toString()
    const userMsg: ChatMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      content: query,
      type: 'text',
    }

    setChatHistory((prev) => [...prev, userMsg])
    setQuery('')
    setIsProcessing(true)
    resetRagStepsState(setRagSteps)

    addRagStep('Generating query embeddings...', 'processing')
    await new Promise((resolve) => setTimeout(resolve, RAG_STEP_DELAY))

    addRagStep('Searching vector database (ChromaDB simulated)...', 'processing')
    await new Promise((resolve) => setTimeout(resolve, RAG_STEP_DELAY))

    const searchKeywords = extractSearchKeywords(query)

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
        const prompt = buildGeminiPrompt(contextText, userMsg.content)
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

      setChatHistory((prev) => [
        ...prev,
        {
          id: `bot-${timestamp}`,
          role: 'assistant',
          content: answer,
          type: 'answer',
          sources: uniqueSources,
          retrieved: topChunks,
        },
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'

      setChatHistory((prev) => [
        ...prev,
        {
          id: `err-${timestamp}`,
          role: 'assistant',
          content: `Error: ${message}. Please check your API key.`,
          type: 'error',
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        showModels={showSettings}
        onToggleModels={() => setShowSettings((prev) => !prev)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onNewSession={handleNewSession}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8 lg:px-12 flex-1">
        {/* Tab visibility controlled here for consistent mobile and desktop experience */}
        {activeTab === PANEL_PROMPT_ID && (
          <Prompt
            chatHistory={chatHistory}
            query={query}
            isProcessing={isProcessing}
            placeholder={PROMPT_PLACEHOLDER}
            exampleQuestions={EXAMPLE_QUESTIONS}
            onQueryChange={setQuery}
            onSubmit={handleSearch}
            ragSteps={ragSteps}
            messagesEndRef={messagesEndRef}
          />
        )}

        {activeTab === PANEL_KNOWLEDGE_ID && (
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
