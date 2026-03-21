import { panelRegistry } from '../config/panelRegistry'

interface PanelNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  variant: 'desktop' | 'mobile'
}

/**
 * Reusable panel navigation component that renders buttons for all registered panels.
 * Used in both desktop header and mobile bottom tab bar.
 */
export default function PanelNavigation({ activeTab, onTabChange, variant }: PanelNavigationProps) {
  return (
    <nav role="navigation" data-variant={variant} className="flex items-center gap-2">
      {panelRegistry.map((panel) => {
        const isActive = activeTab === panel.id
        const Icon = panel.icon

        return (
          <div key={panel.id} className="relative group">
            <button
              type="button"
              onClick={() => onTabChange(panel.id)}
              className={`flex items-center justify-center ${
                variant === 'desktop' ? 'px-3' : 'px-4'
              } py-2 rounded-lg transition-colors ${
                isActive
                  ? `${panel.bgColorClass} ${panel.textColorClass}`
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              aria-label={`View ${panel.title}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} className={isActive ? panel.iconColorClass : 'text-slate-500'} />
            </button>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {panel.title}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
