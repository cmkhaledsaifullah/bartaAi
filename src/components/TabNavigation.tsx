import { tabRegistry } from '../config/tabRegistry'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  variant: 'desktop' | 'mobile'
}

/**
 * Reusable tab navigation component that renders buttons for all registered tabs.
 * Used in both desktop header and mobile bottom tab bar.
 */
export default function TabNavigation({ activeTab, onTabChange, variant }: TabNavigationProps) {
  return (
    <nav role="navigation" data-variant={variant} className="flex items-center gap-2">
      {tabRegistry.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <div key={tab.id} className="relative group">
            <button
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center ${
                variant === 'desktop' ? 'px-3' : 'px-4'
              } py-2 rounded-lg transition-colors ${
                isActive
                  ? `${tab.bgColorClass} ${tab.textColorClass}`
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              aria-label={`View ${tab.title}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} className={isActive ? tab.iconColorClass : 'text-slate-500'} />
            </button>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {tab.title}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
