import { describe, expect, it } from 'vitest'
import { tabRegistry } from '../config/tabRegistry'

describe('tabRegistry', () => {
  it('contains the expected tabs', () => {
    expect(tabRegistry).toHaveLength(2)
    expect(tabRegistry[0].id).toBe('chat')
    expect(tabRegistry[1].id).toBe('knowledge')
  })

  it('has chat tab with correct configuration', () => {
    const chatTab = tabRegistry.find(tab => tab.id === 'chat')
    expect(chatTab).toBeDefined()
    expect(chatTab?.title).toBeDefined()
    expect(chatTab?.icon).toBeDefined()
  })

  it('has knowledge tab with correct configuration', () => {
    const knowledgeTab = tabRegistry.find(tab => tab.id === 'knowledge')
    expect(knowledgeTab).toBeDefined()
    expect(knowledgeTab?.title).toBeDefined()
    expect(knowledgeTab?.icon).toBeDefined()
  })
})
