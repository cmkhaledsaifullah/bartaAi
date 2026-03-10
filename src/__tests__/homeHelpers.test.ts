import { describe, it, expect, vi } from 'vitest'
import {
  buildContextText,
  buildGeminiPrompt,
  buildGeminiRequest,
  collectUniqueSources,
  extractSearchKeywords,
  resetRagStepsState,
  splitArticleIntoSentences,
} from '../utils/homeHelpers'

describe('homeHelpers', () => {
  describe('extractSearchKeywords', () => {
    it('trims whitespace and ignores short tokens', () => {
      expect(extractSearchKeywords('  ai   সংবাদ   ট্রেন  ')).toEqual(['সংবাদ', 'ট্রেন'])
    })

    it('strips punctuation, lowercases, and deduplicates tokens', () => {
      expect(extractSearchKeywords('METRO!! metro?? পরিকল্পনা, পরিকল্পনা. ai')).toEqual(['metro', 'পরিকল্পনা'])
    })

    it('keeps Bengali grapheme clusters intact', () => {
      expect(extractSearchKeywords('মেট্রোরেল আপডেট')).toContain('মেট্রোরেল')
    })

    it('returns empty array when no keywords match', () => {
      expect(extractSearchKeywords('!@# $%^ &*()')).toEqual([])
    })
  })

  describe('splitArticleIntoSentences', () => {
    it('respects Bengali punctuation boundaries', () => {
      expect(splitArticleIntoSentences('প্রথম বাক্য। দ্বিতীয় প্রশ্ন? তৃতীয় উচ্ছ্বাস!')).toEqual([
        'প্রথম বাক্য।',
        'দ্বিতীয় প্রশ্ন?',
        'তৃতীয় উচ্ছ্বাস!',
      ])
    })

    it('removes whitespace spillover between sentences', () => {
      expect(splitArticleIntoSentences('প্রথম বাক্য।   দ্বিতীয় বাক্য!   তৃতীয় অংশ?')).toEqual([
        'প্রথম বাক্য।',
        'দ্বিতীয় বাক্য!',
        'তৃতীয় অংশ?',
      ])
    })
  })

  describe('buildGeminiPrompt', () => {
    it('weaves the context and question into the template', () => {
      const prompt = buildGeminiPrompt('context A', 'What happened?')

      expect(prompt).toContain('context A')
      expect(prompt).toContain('What happened?')
      expect(prompt.startsWith('You are a helpful news assistant')).toBe(true)
    })
  })

  describe('buildGeminiRequest', () => {
    it('targets the Gemini endpoint with headers and payload', () => {
      const { url, init } = buildGeminiRequest('fake-key', 'Prompt text here')
      const bodyPayload = JSON.parse((init?.body as string) ?? '{}')

      expect(url).toContain('fake-key')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
      expect(bodyPayload).toEqual({ contents: [{ parts: [{ text: 'Prompt text here' }] }] })
    })
  })

  describe('resetRagStepsState', () => {
    it('clears all rag steps via the provided setter', () => {
      const setter: Parameters<typeof resetRagStepsState>[0] = vi.fn()

      resetRagStepsState(setter)

      expect(setter).toHaveBeenCalledWith([])
    })
  })

  describe('collectUniqueSources', () => {
    it('removes duplicates while preserving order', () => {
      const sources = collectUniqueSources([
        { source: 'A', score: 1, text: 'a', sourceId: 1 },
        { source: 'B', score: 1, text: 'b', sourceId: 2 },
        { source: 'A', score: 2, text: 'c', sourceId: 1 },
      ])

      expect(sources).toEqual(['A', 'B'])
    })
  })

  describe('buildContextText', () => {
    it('joins retrieved sentences with blank lines', () => {
      const context = buildContextText([
        { text: 'Sentence one.', score: 1, source: 'A', sourceId: 1 },
        { text: 'Sentence two.', score: 1, source: 'B', sourceId: 2 },
      ])

      expect(context).toBe('Sentence one.\n\nSentence two.')
    })
  })
})
