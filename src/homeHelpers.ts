import type { Dispatch, SetStateAction } from 'react'
import type { RagStep, RetrievedChunk } from './types'

const BENGALI_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap'
const GEMINI_MODEL_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent'
const GEMINI_HEADERS: HeadersInit = { 'Content-Type': 'application/json' }
const KEYWORD_FRAGMENT = /[\p{L}\p{N}\p{M}]+/gu

export const resetRagStepsState = (update: Dispatch<SetStateAction<RagStep[]>>) => {
  update([])
}

export const createBanglaFontLink = (): HTMLLinkElement => {
  const link = document.createElement('link')
  link.href = BENGALI_FONT_URL
  link.rel = 'stylesheet'
  link.setAttribute('data-testid', 'bangla-font-link')
  return link
}

export const extractSearchKeywords = (rawQuery: string): string[] => {
  const matches = rawQuery.match(KEYWORD_FRAGMENT) ?? []
  const normalized = matches
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 2)

  return Array.from(new Set(normalized))
}

export const splitArticleIntoSentences = (text: string): string[] => text.split(/(?<=[।?!])\s+/)

export const buildGeminiPrompt = (contextText: string, question: string): string => `You are a helpful news assistant for Bangladeshi news. Answer the user's question based ONLY on the following context. If the answer is not in the context, say so.

Context:
${contextText}

User Question: ${question}

Answer in Bengali (or English if asked):`

export const buildGeminiRequest = (apiKey: string, prompt: string) => ({
  url: `${GEMINI_MODEL_ENDPOINT}?key=${apiKey}`,
  init: {
    method: 'POST',
    headers: GEMINI_HEADERS,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  } satisfies RequestInit,
})

export const collectUniqueSources = (chunks: RetrievedChunk[]): string[] =>
  Array.from(new Set(chunks.map((chunk) => chunk.source)))

export const buildContextText = (chunks: RetrievedChunk[]): string =>
  chunks.map((chunk) => chunk.text).join('\n\n')
