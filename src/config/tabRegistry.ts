import { chatConfig, knowledgeBaseConfig } from './tabConfigs'
import { TAB_CHAT_ID, TAB_KNOWLEDGE_ID } from './constants'
import type { TabConfig } from '../components/TabContainer'

export type TabConfigWithId = TabConfig & {
  id: string
}

/**
 * Central registry for all tabs in the application.
 * Add new tabs here to automatically include them in the header navigation.
 */
export const tabRegistry: TabConfigWithId[] = [
  {
    id: TAB_CHAT_ID,
    ...chatConfig,
  },
  {
    id: TAB_KNOWLEDGE_ID,
    ...knowledgeBaseConfig,
  },
]


