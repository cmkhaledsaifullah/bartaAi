import { promptConfig, knowledgeBaseConfig } from './panelConfigs'
import { PANEL_PROMPT_ID, PANEL_KNOWLEDGE_ID } from './constants'
import type { PanelConfig } from '../components/Panel'

export type PanelConfigWithId = PanelConfig & {
  id: string
}

/**
 * Central registry for all panels in the application.
 * Add new panels here to automatically include them in the header navigation.
 */
export const panelRegistry: PanelConfigWithId[] = [
  {
    id: PANEL_PROMPT_ID,
    ...promptConfig,
  },
  {
    id: PANEL_KNOWLEDGE_ID,
    ...knowledgeBaseConfig,
  },
]


