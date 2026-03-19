import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import PanelNavigation from '../components/PanelNavigation'

interface HeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  showModels: boolean
  onToggleModels: () => void
  apiKey: string
  onApiKeyChange: (key: string) => void
  onNewSession: () => void
}

export default function Header({ activeTab, onTabChange, showModels, onToggleModels, apiKey, onApiKeyChange, onNewSession }: HeaderProps) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const apiKeyFieldId = 'gemini-api-key'
  const modelsRef = useRef<HTMLDivElement>(null)
  const modelsButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showModels &&
        modelsRef.current &&
        modelsButtonRef.current &&
        !modelsRef.current.contains(event.target as Node) &&
        !modelsButtonRef.current.contains(event.target as Node)
      ) {
        onToggleModels()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModels, onToggleModels])

  const handleSignIn = () => {
    // TODO: Implement sign-in functionality
    console.log('Sign in clicked')
  }

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(event.target.value)
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
        <button 
          onClick={() => {
            onTabChange?.('prompt')
            onNewSession()
          }}
          className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Start new chat session"
        >
          <h1 className="font-bold text-slate-800 text-xl sm:text-2xl flex-shrink-0">
            <span className="text-emerald-600 font-light">বার্তাAI</span>
          </h1>
        </button>

        {/* Desktop Panel Buttons - Centered */}
        {activeTab && onTabChange && (
          <div className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            <PanelNavigation activeTab={activeTab} onTabChange={onTabChange} variant="desktop" />
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            ref={modelsButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleModels()
            }}
            data-testid="models-toggle"
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              showModels
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Toggle model configuration"
          >
            Model
          </button>
          <button
            onClick={handleSignIn}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
          >
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidePanelOpen(true)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile Side Panel Overlay */}
      {isSidePanelOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* Mobile Side Panel */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b border-slate-200">
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="p-4 space-y-3">
            <button
              onClick={() => {
                onToggleModels()
                setIsSidePanelOpen(false)
              }}
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Model
            </button>
            <button
              onClick={() => {
                handleSignIn()
                setIsSidePanelOpen(false)
              }}
              className="w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Model Configuration Modal */}
      {showModels && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] animate-in fade-in"
            onClick={onToggleModels}
          />
          
          {/* Modal */}
          <div
            ref={modelsRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-xl z-[70] animate-in fade-in slide-in-from-top-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Model Configuration</h3>
              <button
                onClick={onToggleModels}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close configuration"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor={apiKeyFieldId} className="text-sm text-slate-700 font-medium block mb-2">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  id={apiKeyFieldId}
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your API key..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Without a key, the system will use mocked responses for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
