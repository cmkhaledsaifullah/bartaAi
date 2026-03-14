import { Split } from 'lucide-react'
import { splitArticleIntoSentences } from '../utils/homeHelpers'
import type { ChunkCardsProps, KnowledgeBaseProps } from '../types'
import Panel from '../components/Panel'
import { knowledgeBaseConfig } from '../config/panelConfigs'

export default function KnowledgeBase({
  articles,
  selectedArticle,
  viewMode,
  highlightKeywords = [],
  onSelectArticle,
  onViewModeChange,
}: KnowledgeBaseProps) {
  const headerBadge = (
    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
      {articles.length} Articles
    </div>
  )

  return (
    <Panel
      config={knowledgeBaseConfig}
      headerBadge={headerBadge}
    >
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
    </Panel>
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
