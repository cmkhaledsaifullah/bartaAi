import { Database, MessageSquare } from 'lucide-react'
import type { PanelConfig } from '../components/Panel'
import { PANEL_KNOWLEDGE_TITLE, PANEL_PROMPT_TITLE } from './constants'

export const knowledgeBaseConfig: PanelConfig = {
  icon: Database,
  title: PANEL_KNOWLEDGE_TITLE,
  bgColorClass: 'bg-orange-50',
  iconColorClass: 'text-orange-500',
  textColorClass: 'text-orange-800',
  testId: 'knowledge-base',
}

export const promptConfig: PanelConfig = {
  icon: MessageSquare,
  title: PANEL_PROMPT_TITLE,
  bgColorClass: 'bg-sky-50',
  iconColorClass: 'text-sky-500',
  textColorClass: 'text-sky-800',
  testId: 'chat-panel',
}
