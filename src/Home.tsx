import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  Loader2,
  Newspaper,
  Search,
  Settings,
  Split,
} from 'lucide-react'
import './App.css'
import {
  buildContextText,
  buildGeminiPrompt,
  buildGeminiRequest,
  collectUniqueSources,
  createBanglaFontLink,
  extractSearchKeywords,
  resetRagStepsState,
  splitArticleIntoSentences,
} from './homeHelpers'
import type {
  Article,
  ViewMode,
  RetrievedChunk,
  ChatMessage,
  RagStep,
  RagStatus,
  GeminiResponse,
  ChunkVisualizerProps,
  HomeProps,
} from './types'

export function ChunkVisualizer({ text, highlightKeywords = [] }: ChunkVisualizerProps) {
  const normalizedKeywords = highlightKeywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)

  const chunks = splitArticleIntoSentences(text)

  return (
    <div className="space-y-2" data-testid="chunk-visualizer" data-keyword-count={normalizedKeywords.length}>
      {chunks.map((chunk, idx) => {
        const isRelevant = normalizedKeywords.some((keyword) =>
          chunk.toLowerCase().includes(keyword.toLowerCase()),
        )

        return (
          <div
            key={`chunk-${idx}`}
            className={`p-3 text-sm rounded border ${
              isRelevant ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100'
            }`}
            data-testid="chunk-card"
            data-relevant={isRelevant ? 'true' : 'false'}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-slate-400">
                Chunk #{idx + 1} | Length: {chunk.length}
              </span>
              {isRelevant && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                  Relevant
                </span>
              )}
            </div>
            <p className="font-bangla leading-relaxed text-slate-700">{chunk}</p>
          </div>
        )
      })}
    </div>
  )
}

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const apiKeyFieldId = 'gemini-api-key'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isProcessing, ragSteps])

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

  const exampleQuestions = [
    'মেট্রোরেল নিয়ে আপডেট কি?',
    'How is Bangladesh doing in Cricket?',
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <style data-testid="global-style-block">
        {`
          .font-bangla { font-family: 'Noto Sans Bengali', sans-serif; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}
      </style>

      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700">
            <Database size={18} />
            <h2 className="font-semibold text-sm uppercase tracking-wide">Knowledge Base</h2>
          </div>
          <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {articles.length} Articles
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {articles.map((article) => (
            <button
              type="button"
              key={`article-${article.id}`}
              onClick={() => setSelectedArticle(article)}
              data-testid={`article-card-${article.id}`}
              className={`w-full text-left p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedArticle.id === article.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {article.source}
                </span>
                <span className="text-[10px] text-slate-400">{article.date}</span>
              </div>
              <h3 className="font-bangla font-semibold text-slate-800 mb-2 leading-snug">{article.title}</h3>
              <p className="font-bangla text-xs text-slate-500 line-clamp-2">{article.content}</p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Article Preview</h3>
              <div
                className="bg-white border border-slate-200 rounded-md p-3 h-48 overflow-y-auto"
                data-testid="article-preview-panel"
              >
            <div className="flex justify-end mb-2">
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                      data-testid="view-toggle-text"
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                    viewMode === 'text' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Raw Text
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chunks')}
                      data-testid="view-toggle-chunks"
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                    viewMode === 'chunks'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Split size={10} /> Chunks
                  </span>
                </button>
              </div>
            </div>
            <div data-testid="article-preview-body">
              {viewMode === 'text' ? (
                <p className="font-bangla text-sm text-slate-700 leading-relaxed">{selectedArticle.content}</p>
              ) : (
                <ChunkVisualizer text={selectedArticle.content} highlightKeywords={[]} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-lg">
              <Newspaper size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg">
                <span className="text-emerald-600 font-light">বার্তাAI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">খবর থেকে উত্তর</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            data-testid="settings-toggle"
            className={`p-2 rounded-full transition-colors ${
              showSettings ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Toggle settings"
          >
            <Settings size={20} />
          </button>
        </header>

        {showSettings && (
          <div className="absolute top-16 right-6 w-72 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-20 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Configuration</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor={apiKeyFieldId} className="text-xs text-slate-500 block mb-1">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  id={apiKeyFieldId}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Enter key to generate real answers..."
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Without a key, the system will use mocked responses.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              data-testid="chat-message"
              data-role={msg.role}
              data-message-id={msg.id}
              data-message-type={msg.type}
              data-sources={msg.sources?.join('|') ?? ''}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
                }`}
                data-testid="chat-avatar"
                data-role={msg.role}
              >
                {msg.role === 'user' ? (
                  <div className="w-4 h-4 bg-slate-400 rounded-full" data-testid="user-indicator" />
                ) : (
                  <Bot size={18} data-testid="assistant-icon" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-none'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}
                  data-testid="chat-bubble"
                  data-role={msg.role}
                >
                  {msg.type === 'text' || msg.type === 'answer' ? (
                    <div className="font-bangla whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="text-red-500 text-sm">{msg.content}</div>
                  )}
                </div>

                {msg.retrieved && msg.retrieved.length > 0 && (
                  <div
                    className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-2"
                    data-testid="retrieval-context"
                  >
                    <div className="flex items center gap-2 mb-2">
                      <Cpu size={14} className="text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        RAG Retrieval Context
                      </span>
                    </div>
                    <div className="space-y-2">
                      {msg.retrieved.map((chunk, chunkIndex) => (
                        <div
                          key={`${msg.id}-chunk-${chunkIndex}`}
                          className="text-xs bg-white p-2 rounded border border-emerald-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity"
                          data-testid="retrieved-chunk"
                          data-source={chunk.source}
                          data-score={chunk.score}
                        >
                          <p className="font-bangla text-slate-600 mb-1">"...{chunk.text}..."</p>
                          <div className="flex justify-between items-center text-[10px] text-emerald-600/70 font-mono">
                            <span>Source: {chunk.source}</span>
                            <span>Rel: {chunk.score * 10}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="max-w-3xl mx-auto pl-12" data-testid="rag-steps-panel">
              <div className="space-y-2">
                {ragSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 text-xs animate-in slide-in-from-left-4 fade-in duration-300"
                    data-testid="rag-step"
                    data-status={step.status}
                    data-step-id={step.id}
                  >
                    {step.status === 'processing' && (
                      <Loader2 data-testid="rag-icon-processing" size={12} className="animate-spin text-blue-500" />
                    )}
                    {step.status === 'success' && (
                      <CheckCircle2 data-testid="rag-icon-success" size={12} className="text-emerald-500" />
                    )}
                    {step.status === 'warning' && (
                      <div data-testid="rag-icon-warning" className="w-3 h-3 rounded-full bg-amber-400" />
                    )}
                    <span
                      className={step.status === 'success' ? 'text-slate-600 font-medium' : 'text-slate-400'}
                      data-testid="rag-step-text"
                      data-status={step.status}
                    >
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="Ask about the news (e.g., মেট্রোরেল বা ক্রিকেট সম্পর্কে কিছু বলুন)..."
              disabled={isProcessing}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bangla text-sm shadow-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isProcessing || !query.trim()}
              aria-label="Run search"
              className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Search size={18} />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 flex justify-center gap-4">
            {exampleQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setQuery(question)}
                className="text-[10px] text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {question.startsWith('ম') ? 'Example 1: Metro Rail' : 'Example 2: Cricket'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
