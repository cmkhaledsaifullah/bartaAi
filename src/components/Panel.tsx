import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import type { LucideIcon } from 'lucide-react'
import '../styles/App.css'

export type PanelConfig = {
  icon: LucideIcon
  title: string
  bgColorClass: string
  iconColorClass: string
  textColorClass: string
  testId: string
}

export type PanelProps = {
  config: PanelConfig
  additionalHeaderActions?: ReactNode
  headerBadge?: ReactNode
  children: ReactNode
  containerClassName?: string
  dataAttributes?: Record<string, string | boolean | number>
}

export default function Panel({
  config,
  additionalHeaderActions,
  headerBadge,
  children,
  containerClassName = '',
  dataAttributes = {},
}: PanelProps) {
  // Helper to safely get data-testid from props
  // This helper assumes element is a valid ReactElement (caller must verify first)
  const getDataTestId = (element: ReactElement): string | undefined => {
    const props = element.props as Record<string, unknown>
    return typeof props['data-testid'] === 'string' ? props['data-testid'] : undefined
  }

  // Clone additionalHeaderActions to add unique test IDs for mobile and desktop
  const mobileHeaderActions = additionalHeaderActions && isValidElement(additionalHeaderActions)
    ? cloneElement(additionalHeaderActions as ReactElement<Record<string, unknown>>, {
        'data-testid': getDataTestId(additionalHeaderActions as ReactElement) 
          ? `${getDataTestId(additionalHeaderActions as ReactElement)}-mobile`
          : undefined,
      } as Record<string, unknown>)
    : additionalHeaderActions

  const desktopHeaderActions = additionalHeaderActions && isValidElement(additionalHeaderActions)
    ? cloneElement(additionalHeaderActions as ReactElement<Record<string, unknown>>, {
        'data-testid': getDataTestId(additionalHeaderActions as ReactElement)
          ? `${getDataTestId(additionalHeaderActions as ReactElement)}-desktop`
          : undefined,
      } as Record<string, unknown>)
    : additionalHeaderActions

  return (
    <div
      className={`md:h-full md:max-h-full ${containerClassName} flex flex-col relative overflow-hidden`}
      data-testid={config.testId}
      role="complementary"
      {...Object.entries(dataAttributes).reduce((acc, [key, value]) => {
        acc[`data-${key}`] = String(value)
        return acc
      }, {} as Record<string, string>)}
    >
      {/* Simplified header - only shows badge and actions, no icon/title */}
      {(headerBadge || additionalHeaderActions) && (
        <>
          {/* Mobile: Header bar */}
          <div className="md:hidden w-full p-3 flex justify-end items-center gap-2">
            {headerBadge}
            {mobileHeaderActions}
          </div>

          {/* Desktop: Header bar */}
          <div className="hidden md:flex w-full p-3 justify-end items-center gap-2">
            {headerBadge}
            {desktopHeaderActions}
          </div>
        </>
      )}

      {/* Panel content */}
      {children}
    </div>
  )
}
