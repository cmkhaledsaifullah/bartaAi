import PanelNavigation from '../components/PanelNavigation'

interface FooterProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function Footer({ activeTab, onTabChange }: FooterProps) {
  return (
    <>
      {/* Desktop footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200 px-4 sm:px-6 py-4 text-center">
        <p className="text-sm text-slate-600">
          © The 880 Dispatch
        </p>
      </footer>

      {/* Mobile bottom tab bar */}
      {activeTab && onTabChange && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
          <div className="flex items-center justify-around px-4 py-3 pb-safe">
            <PanelNavigation activeTab={activeTab} onTabChange={onTabChange} variant="mobile" />
          </div>
        </div>
      )}
    </>
  )
}
