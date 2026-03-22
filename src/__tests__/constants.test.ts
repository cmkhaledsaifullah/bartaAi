import { describe, expect, it } from 'vitest'
import {
  MOCK_ARTICLES,
  MOCK_RESPONSES,
  GENERIC_MOCK_RESPONSE,
  CHAT_PLACEHOLDER,
  APP_DISCLAIMER,
  COPYRIGHT_TEXT,
  API_KEY_PLACEHOLDER,
  API_KEY_HELP_TEXT,
} from '../config/constants'

describe('constants', () => {
  it('MOCK_ARTICLES has 6 articles with non-empty fields', () => {
    expect(MOCK_ARTICLES).toHaveLength(6)
    MOCK_ARTICLES.forEach((article) => {
      expect(article.source).not.toBe('')
      expect(article.date).not.toBe('')
      expect(article.title).not.toBe('')
      expect(article.content).not.toBe('')
      expect(article.url).not.toBe('')
      expect(article.id).toBeGreaterThan(0)
    })
  })

  it('MOCK_ARTICLES contains expected sources', () => {
    const sources = MOCK_ARTICLES.map((a) => a.source)
    expect(sources).toContain('Prothom Alo')
    expect(sources).toContain('The Daily Star Bangla')
    expect(sources).toContain('Dhaka Tribune')
  })

  it('MOCK_ARTICLES items have expected structure', () => {
    // First article
    expect(MOCK_ARTICLES[0].source).toBe('Prothom Alo')
    expect(MOCK_ARTICLES[0].date).toBe('2023-10-25')
    expect(MOCK_ARTICLES[0].title).toContain('মেট্রোরেল')
    expect(MOCK_ARTICLES[0].content).toContain('মেট্রোরেল')
    expect(MOCK_ARTICLES[0].url).toContain('prothomalo')

    // Second article
    expect(MOCK_ARTICLES[1].source).toBe('The Daily Star Bangla')
    expect(MOCK_ARTICLES[1].date).toBe('2023-10-26')
    expect(MOCK_ARTICLES[1].title).toContain('ক্রিকেট')
    expect(MOCK_ARTICLES[1].content).toContain('নেদারল্যান্ডস')
    expect(MOCK_ARTICLES[1].url).toContain('thedailystar')

    // Third article
    expect(MOCK_ARTICLES[2].source).toBe('Dhaka Tribune')
    expect(MOCK_ARTICLES[2].date).toBe('2023-10-27')
    expect(MOCK_ARTICLES[2].title).toContain('ডেঙ্গু')
    expect(MOCK_ARTICLES[2].content).toContain('ডেঙ্গু')
    expect(MOCK_ARTICLES[2].url).toContain('dhakatribune')
  })

  it('MOCK_ARTICLES duplicate set (4-6) mirrors first set (1-3)', () => {
    expect(MOCK_ARTICLES[3].source).toBe('Prothom Alo')
    expect(MOCK_ARTICLES[3].title).toContain('মেট্রোরেল')
    expect(MOCK_ARTICLES[3].content).toContain('মতিঝিল')
    expect(MOCK_ARTICLES[3].url).toContain('prothomalo')

    expect(MOCK_ARTICLES[4].source).toBe('The Daily Star Bangla')
    expect(MOCK_ARTICLES[4].title).toContain('ক্রিকেট')
    expect(MOCK_ARTICLES[4].content).toContain('সাকিব')
    expect(MOCK_ARTICLES[4].url).toContain('thedailystar')

    expect(MOCK_ARTICLES[5].source).toBe('Dhaka Tribune')
    expect(MOCK_ARTICLES[5].title).toContain('ডেঙ্গু')
    expect(MOCK_ARTICLES[5].content).toContain('স্বাস্থ্য')
    expect(MOCK_ARTICLES[5].url).toContain('dhakatribune')
  })

  it('MOCK_RESPONSES[3] contains dengue content', () => {
    expect(MOCK_RESPONSES[3]).toContain('ডেঙ্গু')
    expect(MOCK_RESPONSES[3]).not.toBe('')
  })

  it('GENERIC_MOCK_RESPONSE is non-empty', () => {
    expect(GENERIC_MOCK_RESPONSE).not.toBe('')
    expect(GENERIC_MOCK_RESPONSE).toContain('সংগৃহীত')
  })

  it('CHAT_PLACEHOLDER is non-empty', () => {
    expect(CHAT_PLACEHOLDER).not.toBe('')
    expect(CHAT_PLACEHOLDER).toContain('news')
  })

  it('APP_DISCLAIMER is non-empty', () => {
    expect(APP_DISCLAIMER).not.toBe('')
    expect(APP_DISCLAIMER).toContain('বার্তাAI')
  })

  it('COPYRIGHT_TEXT is non-empty', () => {
    expect(COPYRIGHT_TEXT).not.toBe('')
    expect(COPYRIGHT_TEXT).toContain('880')
  })

  it('API_KEY_PLACEHOLDER is non-empty', () => {
    expect(API_KEY_PLACEHOLDER).not.toBe('')
    expect(API_KEY_PLACEHOLDER).toContain('API key')
  })

  it('API_KEY_HELP_TEXT is non-empty', () => {
    expect(API_KEY_HELP_TEXT).not.toBe('')
    expect(API_KEY_HELP_TEXT).toContain('mocked')
  })
})
