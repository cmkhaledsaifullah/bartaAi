import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { ArrowDown, CheckCircle2, Cpu, Loader2, Search, User } from 'lucide-react'
import type { ChatProps, ChatMessage } from '../types'
import TabContainer from '../components/TabContainer'
import { chatConfig } from '../config/tabConfigs'
import { APP_DISCLAIMER } from '../config/constants'
import { useChatStore } from '../store/chatStore'

export default function Chat({
  chatHistory,
  query,
  isProcessing,
  placeholder,
  exampleQuestions,
  onQueryChange,
  onSubmit,
  ragSteps,
  messagesEndRef,
}: ChatProps) {
  const isInitialChat = useChatStore((state) => state.isInitialChat)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const handleChatScroll = useCallback(() => {
    const el = chatScrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollDown(distanceFromBottom > 100)
  }, [])

  const scrollToBottom = () => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  }

  const handleExampleClick = (question: string) => {
    onQueryChange(question)
  }

  const renderSearchInput = () => (
    <>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bangla text-lg"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isProcessing}
          aria-label="Run search"
          className="px-5 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Search size={22} />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400 text-center">{APP_DISCLAIMER}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-center">
        {exampleQuestions.map((question, index) => (
          <button
            key={question}
            type="button"
            onClick={() => handleExampleClick(question)}
            className="text-xs text-slate-400 hover:text-emerald-600 transition-colors py-2"
          >
            Example {index + 1}: {question}
          </button>
        ))}
      </div>
    </>
  )

  const renderChatMessage = (msg: ChatMessage) => (
    <div
      key={msg.id}
      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
      data-testid="chat-message"
      data-role={msg.role}
      data-message-id={msg.id}
      data-message-type={msg.type}
      data-sources={msg.sources?.join('|') ?? ''}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
        }`}
        data-testid="chat-avatar"
        data-role={msg.role}
      >
        {msg.role === 'user' ? (
          <User size={22} className="text-slate-600" data-testid="user-indicator" />
        ) : (
          <img src="/logo.svg" alt="BartaAI" className="w-6 h-6" data-testid="assistant-icon" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div
          className={`p-4 rounded-2xl text-lg leading-relaxed shadow-sm ${
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
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">RAG Retrieval Context</span>
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
  )

  return (
    <TabContainer config={chatConfig}>
      {isInitialChat ? (
        <div
          className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 sm:px-6 bg-slate-50/60"
          data-testid="chat-initial-view"
        >
          <div className="w-full space-y-6">
            {chatHistory.map((msg) => renderChatMessage(msg))}
            <div className="w-full">
              {renderSearchInput()}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-slate-50/60" data-testid="chat-conversation-view">
          <div className="flex-1 min-h-0 relative">
            <div
              ref={chatScrollRef}
              onScroll={handleChatScroll}
              className="h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-6"
            >
            {chatHistory.map((msg) => renderChatMessage(msg))}

            {isProcessing && (
              <div className="pl-12" data-testid="rag-steps-panel">
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

            {showScrollDown && (
              <button
                type="button"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                data-testid="scroll-to-bottom"
                className="absolute right-6 bottom-4 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ArrowDown size={18} className="text-slate-600" />
              </button>
            )}
          </div>

          <div className="shrink-0 px-4 py-4 sm:px-6 sm:py-5 bg-white border-t border-slate-100">
            {renderSearchInput()}
          </div>
        </div>
      )}
    </TabContainer>
  )
}
