import { describe, it, expect } from 'vitest'
import { generateMockResponse } from '../utils/mockResponses'
import { MOCK_RESPONSES, GENERIC_MOCK_RESPONSE, NO_CONTEXT_MESSAGE } from '../config/constants'

describe('mockResponses', () => {
  describe('generateMockResponse', () => {
    it('returns NO_CONTEXT_MESSAGE when topChunks array is empty', () => {
      const result = generateMockResponse([])
      expect(result).toBe(NO_CONTEXT_MESSAGE)
    })

    it('returns specific mock response for source ID 1', () => {
      const topChunks = [{ sourceId: 1 }]
      const result = generateMockResponse(topChunks)
      expect(result).toBe(MOCK_RESPONSES[1])
      expect(result).toContain('মেট্রোরেল')
    })

    it('returns specific mock response for source ID 2', () => {
      const topChunks = [{ sourceId: 2 }]
      const result = generateMockResponse(topChunks)
      expect(result).toBe(MOCK_RESPONSES[2])
      expect(result).toContain('বাংলাদেশ')
    })

    it('returns GENERIC_MOCK_RESPONSE for unknown source ID', () => {
      const topChunks = [{ sourceId: 999 }]
      const result = generateMockResponse(topChunks)
      expect(result).toBe(GENERIC_MOCK_RESPONSE)
    })

    it('returns GENERIC_MOCK_RESPONSE when source ID is 0', () => {
      const topChunks = [{ sourceId: 0 }]
      const result = generateMockResponse(topChunks)
      expect(result).toBe(GENERIC_MOCK_RESPONSE)
    })

    it('uses only the first chunk when multiple chunks are provided', () => {
      const topChunks = [
        { sourceId: 1 },
        { sourceId: 2 },
        { sourceId: 999 },
      ]
      const result = generateMockResponse(topChunks)
      expect(result).toBe(MOCK_RESPONSES[1])
      expect(result).not.toBe(MOCK_RESPONSES[2])
    })

    it('returns NO_CONTEXT_MESSAGE not GENERIC_MOCK_RESPONSE when array is empty', () => {
      const result = generateMockResponse([])
      expect(result).not.toBe(GENERIC_MOCK_RESPONSE)
      expect(result).toBe(NO_CONTEXT_MESSAGE)
    })

    it('verifies the empty check is not bypassed', () => {
      // This test ensures the if condition is actually checked
      // If the condition was always false, this would use the first chunk
      const emptyArray: Array<{ sourceId: number }> = []
      const result = generateMockResponse(emptyArray)
      expect(result).toBe(NO_CONTEXT_MESSAGE)
      
      // Verify it would be different with a non-empty array
      const nonEmptyArray = [{ sourceId: 1 }]
      const nonEmptyResult = generateMockResponse(nonEmptyArray)
      expect(nonEmptyResult).not.toBe(NO_CONTEXT_MESSAGE)
    })

    it('does not return empty string when topChunks is empty', () => {
      const result = generateMockResponse([])
      expect(result).not.toBe('')
      expect(result).toBeTruthy()
    })

    it('verifies early return prevents accessing first chunk when empty', () => {
      // If the early return is removed, this would throw accessing [0] on empty array
      const emptyChunks: Array<{ sourceId: number }> = []
      expect(() => generateMockResponse(emptyChunks)).not.toThrow()
      const result = generateMockResponse(emptyChunks)
      expect(result).toBe(NO_CONTEXT_MESSAGE)
    })
  })
})
