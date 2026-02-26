import { panelRegistry } from '../panelRegistry'

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
  const isDesktop = variant === 'desktop'

  return (
    <nav role="navigation" data-variant={variant}>
      {panelRegistry.map((panel) => {
        const isActive = activeTab === panel.id
        const Icon = panel.icon

        return (
          <button
            key={panel.id}
            type="button"
            onClick={() => onTabChange(panel.id)}
            className={`flex flex-col items-center justify-center gap-1 px-${isDesktop ? '4' : '6'} py-2 rounded-lg transition-colors ${
              isActive
                ? `${panel.bgColorClass} ${panel.textColorClass}`
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            aria-label={`View ${panel.title}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} className={isActive ? panel.iconColorClass : 'text-slate-500'} />
            <span className="text-xs font-medium">{panel.title}</span>
          </button>
        )
      })}
    </nav>
  )
}
