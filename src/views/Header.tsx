import { useState } from 'react'
import PanelNavigation from '../components/PanelNavigation'

interface HeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  const handleSignIn = () => {
    // TODO: Implement sign-in functionality
    console.log('Sign in clicked')
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <img src="/logo.svg" alt="BartaAI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-slate-800 text-xl sm:text-2xl flex-shrink-0">
            <span className="text-emerald-600 font-light">বার্তাAI</span>
          </h1>
        </div>

        {/* Desktop Panel Buttons - Centered */}
        {activeTab && onTabChange && (
          <div className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            <PanelNavigation activeTab={activeTab} onTabChange={onTabChange} variant="desktop" />
          </div>
        )}

        {/* Desktop SignIn Button */}
        <button
          onClick={handleSignIn}
          className="hidden md:block px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
        >
          Sign In
        </button>

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

          {/* SignIn Button */}
          <div className="p-4">
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
    </>
  )
}
