import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { By, type WebDriver } from 'selenium-webdriver'
import {
  buildDriver,
  closeDriver,
  openApp,
  submitQuery,
  SELECTORS,
  DESKTOP_VIEWPORT,
} from './helpers'

describe('Desktop - Chat and RAG', () => {
  let driver: WebDriver

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await closeDriver(driver)
  })

  it('answers a question with retrieval context', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    await submitQuery(driver, 'মেট্রোরেল সম্পর্কে আপডেট দিন')

    const assistantReply = await driver.findElement(By.css(SELECTORS.assistantReply))
    const replyText = await assistantReply.getText()
    expect(replyText.length).toBeGreaterThan(0)

    const retrievalChunks = await driver.findElements(By.css(SELECTORS.retrievedChunk))
    expect(retrievalChunks.length).toBeGreaterThan(0)
  })
})
