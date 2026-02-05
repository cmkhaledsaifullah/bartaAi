import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Builder, By, until, type WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'
const DEFAULT_WAIT_MS = 20000

describe('BartaAI E2E', () => {
  let driver: WebDriver

  beforeAll(async () => {
    const options = new chrome.Options()
    options.addArguments(
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,720',
    )

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  })

  afterAll(async () => {
    if (driver) {
      await driver.quit()
    }
  })

  const openApp = async () => {
    await driver.get(BASE_URL)
    await driver.wait(until.elementLocated(By.css('[data-testid="article-card-1"]')), DEFAULT_WAIT_MS)
  }

  it('renders the knowledge base and chunk preview toggle', async () => {
    await openApp()

    const cards = await driver.findElements(By.css('[data-testid^="article-card-"]'))
    expect(cards.length).toBeGreaterThanOrEqual(3)

    const chunksToggle = await driver.findElement(By.css('[data-testid="view-toggle-chunks"]'))
    await chunksToggle.click()

    const chunkVisualizer = await driver.wait(
      until.elementLocated(By.css('[data-testid="chunk-visualizer"]')),
      DEFAULT_WAIT_MS,
    )

    const keywordCount = await chunkVisualizer.getAttribute('data-keyword-count')
    expect(keywordCount).toBe('0')
  })

  it('answers a question with retrieval context', async () => {
    await openApp()

    const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
    await queryInput.clear()
    await queryInput.sendKeys('মেট্রোরেল সম্পর্কে আপডেট দিন')

    const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
    await submitButton.click()

    await driver.wait(until.elementLocated(By.css('[data-testid="rag-step"]')), DEFAULT_WAIT_MS)

    const assistantReply = await driver.wait(
      until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
      DEFAULT_WAIT_MS,
    )

    const replyText = await assistantReply.getText()
    expect(replyText.length).toBeGreaterThan(0)

    const retrievalChunks = await driver.findElements(By.css('[data-testid="retrieved-chunk"]'))
    expect(retrievalChunks.length).toBeGreaterThan(0)
  })
})
