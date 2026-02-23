import { ChevronDown, Database, Split } from 'lucide-react'
import { splitArticleIntoSentences } from '../homeHelpers'
import type { ChunkCardsProps, KnowledgePanelProps } from '../types'
import '../styles/KnowledgePanel.css'

export default function KnowledgePanel({
  articles,
  selectedArticle,
  viewMode,
  highlightKeywords = [],
  onSelectArticle,
  onViewModeChange,
  isCollapsed,
  onToggleCollapse,
}: KnowledgePanelProps) {
  if (isCollapsed) {
    return (
      <div
        className="order-2 md:order-1 flex flex-col gap-3 md:gap-0 md:row-span-3 md:h-full md:justify-start md:items-start md:pb-4 md:col-start-1 md:col-end-2 mb-4 md:mb-0"
        data-testid="knowledge-panel"
        role="complementary"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="md:hidden w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 shadow-sm flex items-center justify-between"
          aria-expanded="false"
        >
          <div className="flex items-center gap-2 text-orange-800">
            <Database size={18} className="text-orange-500" />
            <h2 className="font-semibold text-sm uppercase tracking-wide">বার্তা ভাণ্ডার</h2>
          </div>
          <ChevronDown size={18} className="text-emerald-600" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 shadow-sm hover:border-emerald-300 hover:bg-white transition-colors px-3 py-4 w-full vertical-text"
          aria-expanded="false"
        >
          <span className="flex items-center gap-2 text-orange-800">
            <Database size={18} className="text-orange-500 rotate-90" />
            <span className="font-semibold text-sm uppercase tracking-wide">বার্তা ভাণ্ডার</span>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div
      className="order-2 md:order-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden md:row-span-3 md:h-full md:col-start-1 md:col-end-2"
      data-testid="knowledge-panel"
      role="complementary"
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full text-left p-4 border-b border-orange-100 bg-orange-50 flex justify-between items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Collapse knowledge panel"
        aria-expanded="true"
      >
        <div className="flex items-center gap-2 text-orange-800">
          <Database size={18} className="text-orange-500" />
          <h2 className="font-semibold text-sm uppercase tracking-wide">বার্তা ভাণ্ডার</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {articles.length} Articles
          </div>
        </div>
      </button>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 sm:space-y-4">
        {articles.map((article) => {
          const isSelected = selectedArticle.id === article.id
          return (
            <button
              type="button"
              key={`article-${article.id}`}
              onClick={() => onSelectArticle(article)}
              data-testid={`article-card-${article.id}`}
              className={`w-full text-left p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{article.source}</span>
                <span className="text-[10px] text-slate-400">{article.date}</span>
              </div>
              <h3 className="font-bangla font-semibold text-slate-800 mb-2 leading-snug">{article.title}</h3>
              <p className="font-bangla text-xs text-slate-500 line-clamp-2">{article.content}</p>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Article Preview</h3>
        <div
          className="bg-white border border-slate-200 rounded-md p-3 h-60 sm:h-64 md:h-48 overflow-y-auto"
          data-testid="article-preview-panel"
        >
          <div className="flex justify-end mb-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onViewModeChange('text')}
                data-testid="view-toggle-text"
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  viewMode === 'text' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Raw Text
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('chunks')}
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
              <ChunkCards text={selectedArticle.content} highlightKeywords={highlightKeywords} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChunkCards({ text, highlightKeywords = [] }: ChunkCardsProps) {
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
