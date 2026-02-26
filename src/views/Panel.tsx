import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import '../styles/KnowledgePanel.css'

export type PanelConfig = {
  icon: LucideIcon
  title: string
  bgColorClass: string
  borderColorClass: string
  iconColorClass: string
  textColorClass: string
  testId: string
  ariaLabel?: string
}

export type PanelProps = {
  config: PanelConfig
  isCollapsed: boolean
  onToggleCollapse: () => void
  desktopSpanClasses: string
  collapsedSpanClasses?: string // Optional for backward compatibility
  additionalHeaderActions?: ReactNode
  headerBadge?: ReactNode
  children: ReactNode
  containerClassName?: string
  dataAttributes?: Record<string, string | boolean | number>
}

export default function Panel({
  config,
  isCollapsed,
  onToggleCollapse,
  desktopSpanClasses,
  additionalHeaderActions,
  headerBadge,
  children,
  containerClassName = 'bg-white border border-slate-200 rounded-2xl shadow-sm',
  dataAttributes = {},
}: PanelProps) {
  const Icon = config.icon

  // Clone additionalHeaderActions to add unique test IDs for mobile and desktop
  const mobileHeaderActions = additionalHeaderActions && isValidElement(additionalHeaderActions)
    ? cloneElement(additionalHeaderActions as ReactElement, {
        'data-testid': (additionalHeaderActions.props as any)['data-testid'] 
          ? `${(additionalHeaderActions.props as any)['data-testid']}-mobile`
          : undefined,
      } as any)
    : additionalHeaderActions

  const desktopHeaderActions = additionalHeaderActions && isValidElement(additionalHeaderActions)
    ? cloneElement(additionalHeaderActions as ReactElement, {
        'data-testid': (additionalHeaderActions.props as any)['data-testid'] 
          ? `${(additionalHeaderActions.props as any)['data-testid']}-desktop`
          : undefined,
      } as any)
    : additionalHeaderActions

  if (isCollapsed) {
    return (
      <>
        {/* Mobile collapsed button - horizontal */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`md:hidden w-full rounded-2xl border ${config.borderColorClass} ${config.bgColorClass} px-4 py-3 shadow-sm flex items-center justify-between ${desktopSpanClasses}`}
          aria-expanded="false"
          aria-label={config.ariaLabel || `Expand ${config.title}`}
          data-testid={config.testId}
        >
          <div className={`flex items-center gap-2 ${config.textColorClass}`}>
            <Icon size={18} className={config.iconColorClass} />
            <h2 className="font-semibold text-sm uppercase tracking-wide">{config.title}</h2>
          </div>
          <ChevronDown size={18} className="text-emerald-600" />
        </button>

        {/* Desktop collapsed button - vertical */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden md:flex flex-col items-center justify-center rounded-2xl border ${config.borderColorClass} ${config.bgColorClass} shadow-sm hover:border-emerald-300 hover:bg-white transition-colors px-3 py-4 min-h-[180px] vertical-text`}
          aria-expanded="false"
          aria-label={config.ariaLabel || `Expand ${config.title}`}
        >
          <span className={`flex items-center gap-2 ${config.textColorClass}`}>
            <Icon size={18} className={`${config.iconColorClass} rotate-90`} />
            <span className="font-semibold text-sm uppercase tracking-wide">{config.title}</span>
          </span>
        </button>
      </>
    )
  }

  return (
    <div
      className={`${desktopSpanClasses} md:h-full md:max-h-full ${containerClassName} flex flex-col relative overflow-hidden`}
      data-testid={config.testId}
      role="complementary"
      {...Object.entries(dataAttributes).reduce((acc, [key, value]) => {
        acc[`data-${key}`] = String(value)
        return acc
      }, {} as Record<string, string>)}
    >
      {/* Mobile: Static header (no collapse button) */}
      <div className={`md:hidden w-full p-4 border-b ${config.borderColorClass} ${config.bgColorClass} flex justify-between items-center`}>
        <div className={`flex items-center gap-2 ${config.textColorClass}`}>
          <Icon size={18} className={config.iconColorClass} />
          <h2 className="font-semibold text-sm uppercase tracking-wide">{config.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {headerBadge}
          {mobileHeaderActions}
        </div>
      </div>

      {/* Desktop: Collapsible header button */}
      <div
        className={`hidden md:flex w-full text-left p-4 border-b ${config.borderColorClass} ${config.bgColorClass} justify-between items-center`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex items-center gap-2 ${config.textColorClass} cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 bg-transparent border-0 p-0 hover:opacity-80`}
          aria-label={config.ariaLabel || `Collapse ${config.title}`}
          aria-expanded="true"
        >
          <Icon size={18} className={config.iconColorClass} />
          <h2 className="font-semibold text-sm uppercase tracking-wide">{config.title}</h2>
        </button>
        <div className="flex items-center gap-2">
          {headerBadge}
          {desktopHeaderActions}
        </div>
      </div>

      {/* Panel content */}
      {children}
    </div>
  )
}
