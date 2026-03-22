import { Database, MessageSquare } from 'lucide-react'
import type { TabConfig } from '../components/TabContainer'
import { TAB_KNOWLEDGE_TITLE, TAB_CHAT_TITLE } from './constants'

export const knowledgeBaseConfig: TabConfig = {
  icon: Database,
  title: TAB_KNOWLEDGE_TITLE,
  bgColorClass: 'bg-orange-50',
  iconColorClass: 'text-orange-500',
  textColorClass: 'text-orange-800',
  testId: 'knowledge-base',
}

export const chatConfig: TabConfig = {
  icon: MessageSquare,
  title: TAB_CHAT_TITLE,
  bgColorClass: 'bg-sky-50',
  iconColorClass: 'text-sky-500',
  textColorClass: 'text-sky-800',
  testId: 'chat-panel',
}
