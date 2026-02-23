import { useEffect, useRef, useState } from 'react'
import '../styles/App.css'
import '../styles/Home.css'
import KnowledgePanel from './KnowledgePanel'
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
} from '../homeHelpers'
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
import Footer from './Footer'
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'initial-msg',
      role: 'system',
      content:
        'স্বাগতম! আমি আপনার বার্তাAI—বাংলাদেশের সর্বশেষ খবরের ভিত্তিতে আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।',
      type: 'text',
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ragSteps, setRagSteps] = useState<RagStep[]>([])
  const [isKnowledgeCollapsed, setIsKnowledgeCollapsed] = useState(false)
  const [panelWidth, setPanelWidth] = useState(360)
  const [isResizing, setIsResizing] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isProcessing, ragSteps])

  useEffect(() => {
    if (gridRef.current) {
      if (isDesktop && !isKnowledgeCollapsed) {
        gridRef.current.style.setProperty('--panel-width', `${panelWidth}px`)
      } else {
        gridRef.current.style.removeProperty('--panel-width')
      }
    }
  }, [panelWidth, isDesktop, isKnowledgeCollapsed])

  const addRagStep = (text: string, status: RagStatus) => {
    setRagSteps((prev) => [...prev, { text, status, id: `step-${Date.now()}-${Math.random()}` }])
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
    await new Promise((resolve) => setTimeout(resolve, 800))

    addRagStep('Searching vector database (ChromaDB simulated)...', 'processing')
    await new Promise((resolve) => setTimeout(resolve, 800))

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
    const topChunks = retrievedChunks.slice(0, 3)

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
          data.candidates?.[0]?.content?.parts?.[0]?.text ??
          'দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500))

        if (topChunks.length > 0) {
          const topSource = topChunks[0].sourceId

          if (topSource === 1) {
            answer =
              'উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে মেট্রোরেল চলাচল শুরু হয়েছে। প্রধানমন্ত্রী শেখ হাসিনা আগারগাঁও স্টেশনে এটি উদ্বোধন করেন। যাত্রীরা সকাল ৭:৩০ থেকে ১১:৩০ পর্যন্ত চলাচল করতে পারবেন।'
          } else if (topSource === 2) {
            answer =
              'আজ বাংলাদেশ নেদারল্যান্ডসের বিপক্ষে খেলবে। সেমিফাইনালে যেতে হলে বাংলাদেশকে জিততেই হবে। তাসকিন আহমেদ ইনজুরি থেকে ফিরছেন।'
          } else if (topSource === 3) {
            answer =
              'গত ২৪ ঘণ্টায় ১,২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। যদিও ভর্তির হার কিছুটা কমেছে, কিন্তু মৃত্যুর সংখ্যা এখনো চিন্তার বিষয়।'
          } else {
            answer = 'সংগৃহীত তথ্যের ভিত্তিতে দেখা যাচ্ছে যে বিষয়টি খবরে উল্লেখ করা হয়েছে।'
          }
        } else {
          answer = 'দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'
        }
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

  const promptPlaceholder = 'Ask about the news (e.g., মেট্রোরেল বা ক্রিকেট সম্পর্কে কিছু বলুন)...'

  const exampleQuestions = [
    'মেট্রোরেল নিয়ে আপডেট কি?',
    'How is Bangladesh doing in Cricket?',
  ]

  const desktopColumnClasses = isKnowledgeCollapsed
    ? 'md:grid-cols-[48px_minmax(0,1fr)] lg:grid-cols-[56px_minmax(0,1fr)] xl:grid-cols-[64px_minmax(0,1fr)]'
    : ''

  const toggleKnowledgePanel = () => {
    setIsKnowledgeCollapsed((prev) => !prev)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    setResizeStartX(e.clientX)
    setResizeStartWidth(panelWidth)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const delta = e.clientX - resizeStartX
      const newWidth = resizeStartWidth + delta
      if (newWidth >= 280 && newWidth <= 600) {
        setPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, resizeStartX, resizeStartWidth])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <div
        ref={gridRef}
        className={`home-grid mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8 lg:px-12 min-h-screen md:min-h-[100dvh] md:h-[100dvh] grid gap-4 md:gap-y-6 ${isKnowledgeCollapsed ? '' : 'md:gap-x-0'} md:grid-rows-[auto_minmax(0,1fr)_auto] ${desktopColumnClasses}`}
      >
        <KnowledgePanel
          articles={articles}
          selectedArticle={selectedArticle}
          viewMode={viewMode}
          highlightKeywords={[]}
          onSelectArticle={setSelectedArticle}
          onViewModeChange={setViewMode}
          isCollapsed={isKnowledgeCollapsed}
          onToggleCollapse={toggleKnowledgePanel}
        />

        {!isKnowledgeCollapsed && (
          <div
            className="hidden md:flex md:row-span-3 md:row-start-1 md:col-start-2 w-full cursor-col-resize hover:bg-slate-500/25 active:bg-slate-600/35 transition-colors items-center justify-center"
            onMouseDown={handleMouseDown}
            role="separator"
            aria-label="Resize panels"
          >
            <div className="flex flex-row gap-[3px] px-2 py-3 rounded">
              <div className="w-[2px] h-6 bg-slate-400 rounded-full" />
              <div className="w-[2px] h-6 bg-slate-400 rounded-full" />
              <div className="w-[2px] h-6 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}

        <Prompt
          chatHistory={chatHistory}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings((prev) => !prev)}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          query={query}
          isProcessing={isProcessing}
          placeholder={promptPlaceholder}
          exampleQuestions={exampleQuestions}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
          ragSteps={ragSteps}
          messagesEndRef={messagesEndRef}
          isKnowledgeCollapsed={isKnowledgeCollapsed}
        />
      </div>
      <Footer />
    </div>
  )
}
