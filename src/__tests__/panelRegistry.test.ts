import { describe, expect, it } from 'vitest'
import { panelRegistry, getPanelById } from '../panelRegistry'

describe('panelRegistry', () => {
  it('contains the expected panels', () => {
    expect(panelRegistry).toHaveLength(2)
    expect(panelRegistry[0].id).toBe('prompt')
    expect(panelRegistry[1].id).toBe('knowledge')
  })

  it('has prompt panel with correct configuration', () => {
    const promptPanel = panelRegistry.find(panel => panel.id === 'prompt')
    expect(promptPanel).toBeDefined()
    expect(promptPanel?.title).toBeDefined()
    expect(promptPanel?.icon).toBeDefined()
  })

  it('has knowledge panel with correct configuration', () => {
    const knowledgePanel = panelRegistry.find(panel => panel.id === 'knowledge')
    expect(knowledgePanel).toBeDefined()
    expect(knowledgePanel?.title).toBeDefined()
    expect(knowledgePanel?.icon).toBeDefined()
  })

  describe('getPanelById', () => {
    it('returns the correct panel for a valid id', () => {
      const panel = getPanelById('prompt')
      expect(panel).toBeDefined()
      expect(panel?.id).toBe('prompt')
    })

    it('returns undefined for an invalid id', () => {
      const panel = getPanelById('non-existent-panel')
      expect(panel).toBeUndefined()
    })

    it('returns the knowledge panel by id', () => {
      const panel = getPanelById('knowledge')
      expect(panel).toBeDefined()
      expect(panel?.id).toBe('knowledge')
    })
  })
})
