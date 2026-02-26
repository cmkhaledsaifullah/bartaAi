import { promptConfig } from './views/Prompt'
import { knowledgeBaseConfig } from './views/KnowledgeBase'
import type { PanelConfig } from './views/Panel'

export type PanelConfigWithId = PanelConfig & {
  id: string
}

/**
 * Central registry for all panels in the application.
 * Add new panels here to automatically include them in the header navigation.
 */
export const panelRegistry: PanelConfigWithId[] = [
  {
    id: 'prompt',
    ...promptConfig,
  },
  {
    id: 'knowledge',
    ...knowledgeBaseConfig,
  },
]

/**
 * Get panel configuration by ID
 */
export function getPanelById(id: string): PanelConfigWithId | undefined {
  return panelRegistry.find((panel) => panel.id === id)
}
