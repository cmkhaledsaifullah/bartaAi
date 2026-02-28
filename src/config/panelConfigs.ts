import { Database, MessageSquare } from 'lucide-react'
import type { PanelConfig } from '../components/Panel'

export const knowledgeBaseConfig: PanelConfig = {
  icon: Database,
  title: 'বার্তা ভাণ্ডার',
  bgColorClass: 'bg-orange-50',
  borderColorClass: 'border-orange-100',
  iconColorClass: 'text-orange-500',
  textColorClass: 'text-orange-800',
  testId: 'knowledge-base',
  ariaLabel: 'Knowledge base',
}

export const promptConfig: PanelConfig = {
  icon: MessageSquare,
  title: 'বার্তা Prompt',
  bgColorClass: 'bg-sky-50',
  borderColorClass: 'border-sky-100',
  iconColorClass: 'text-sky-500',
  textColorClass: 'text-sky-800',
  testId: 'chat-panel',
  ariaLabel: 'Prompt panel',
}
