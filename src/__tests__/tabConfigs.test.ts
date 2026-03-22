import { describe, expect, it } from 'vitest'
import { knowledgeBaseConfig, chatConfig } from '../config/tabConfigs'

describe('tabConfigs', () => {
  it('knowledgeBaseConfig has non-empty color classes', () => {
    expect(knowledgeBaseConfig.bgColorClass).toContain('orange')
    expect(knowledgeBaseConfig.iconColorClass).toContain('orange')
    expect(knowledgeBaseConfig.textColorClass).toContain('orange')
  })

  it('chatConfig has non-empty color classes', () => {
    expect(chatConfig.iconColorClass).toContain('sky')
    expect(chatConfig.textColorClass).toContain('sky')
  })
})
