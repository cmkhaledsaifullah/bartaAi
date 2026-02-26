import type { ChangeEvent, KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { Bot, CheckCircle2, Cpu, Loader2, MessageSquare, Search, Settings } from 'lucide-react'
import type { PromptProps } from '../types'
import Panel, { type PanelConfig } from './Panel'

export const promptConfig: PanelConfig = {
  icon: MessageSquare,
  title: 'বার্তা Prompt',
  bgColorClass: 'bg-sky-50',
  borderColorClass: 'border-sky-100',
  iconColorClass: 'text-sky-500',
  textColorClass: 'text-sky-800',
  testId: 'chat-panel',
  ariaLabel: 'Prompt panel',
}

export default function Prompt({
  chatHistory,
  showSettings,
  onToggleSettings,
  apiKey,
  onApiKeyChange,
  query,
  isProcessing,
  placeholder,
  exampleQuestions,
  onQueryChange,
  onSubmit,
  ragSteps,
  messagesEndRef,
  isCollapsed,
  onToggleCollapse,
  isActiveTab = false,
}: PromptProps) {
  const apiKeyFieldId = 'gemini-api-key'
  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettings &&
        settingsRef.current &&
        settingsButtonRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        onToggleSettings()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings, onToggleSettings])

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

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(event.target.value)
  }

  const isSubmitDisabled = isProcessing || !query.trim()

  // Mobile order only - desktop positioning handled by wrapper div in Home.tsx
  const desktopSpanClasses = 'order-1 md:order-2'

  const settingsButton = (
    <button
      type="button"
      ref={settingsButtonRef}
      onClick={(e) => {
        e.stopPropagation()
        onToggleSettings()
      }}
      data-testid="settings-toggle"
      className={`p-2 rounded-full transition-colors ${
        showSettings ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
      }`}
      aria-label="Toggle settings"
    >
      <Settings size={20} />
    </button>
  )

  return (
    <div className={isActiveTab ? '' : 'hidden'}>
      <Panel
        config={promptConfig}
        isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      desktopSpanClasses={desktopSpanClasses}
      collapsedSpanClasses=""
      additionalHeaderActions={settingsButton}
      containerClassName="bg-white/90 border border-slate-200 rounded-2xl shadow-xl"
    >
      {showSettings && (
        <div
          ref={settingsRef}
          className="absolute top-[4.5rem] right-4 sm:right-6 w-full max-w-xs bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-20 animate-in fade-in slide-in-from-top-2"
        >
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
                onChange={handleApiKeyChange}
                placeholder="Enter key to generate real answers..."
                className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Without a key, the system will use mocked responses.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-6 bg-slate-50/60">
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

      <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] items-stretch">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bangla text-sm shadow-sm"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            aria-label="Run search"
            className="flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Search size={18} />
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-3 grid gap-2 sm:grid-cols-2 text-center">
          {exampleQuestions.map((question, index) => (
            <button
              key={question}
              type="button"
              onClick={() => handleExampleClick(question)}
              className="text-[10px] text-slate-400 hover:text-emerald-600 transition-colors"
            >
              Example {index + 1}: {question}
            </button>
          ))}        </div>
      </div>
    </Panel>
    </div>
  )
}
