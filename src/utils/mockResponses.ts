import { MOCK_RESPONSES, GENERIC_MOCK_RESPONSE, NO_CONTEXT_MESSAGE } from '../config/constants'

/**
 * Generate a mock response based on retrieved chunks
 */
export function generateMockResponse(topChunks: Array<{ sourceId: number }>): string {
  if (topChunks.length === 0) {
    return NO_CONTEXT_MESSAGE
  }

  const topSourceId = topChunks[0].sourceId
  return MOCK_RESPONSES[topSourceId] ?? GENERIC_MOCK_RESPONSE
}
