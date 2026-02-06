import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Builder, By, until, type WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'
const DEFAULT_WAIT_MS = 20000
const DESKTOP_VIEWPORT = { width: 1280, height: 720 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }

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

  const setViewport = async (viewport: { width: number; height: number }) => {
    await driver.manage().window().setRect({ width: viewport.width, height: viewport.height, x: 0, y: 0 })
  }

  const openApp = async (viewport = DESKTOP_VIEWPORT) => {
    await setViewport(viewport)
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

  it('stacks knowledge panel below chat on mobile viewports', async () => {
    await openApp(MOBILE_VIEWPORT)

    const chatPanel = await driver.findElement(By.css('[data-testid="chat-panel"]'))
    const knowledgePanel = await driver.findElement(By.css('[data-testid="knowledge-panel"]'))

    const layoutInfo = (await driver.executeScript(
      'return { chat: arguments[0].getBoundingClientRect(), knowledge: arguments[1].getBoundingClientRect(), innerWidth: window.innerWidth }',
      chatPanel,
      knowledgePanel,
    )) as {
      chat: { top: number; bottom: number; width: number }
      knowledge: { top: number; bottom: number; width: number }
      innerWidth: number
    }

    expect(layoutInfo.innerWidth).toBeLessThanOrEqual(600)
    expect(layoutInfo.knowledge.top).toBeGreaterThan(layoutInfo.chat.bottom - 4)

    await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "start" })', knowledgePanel)

    const previewPanel = await driver.findElement(By.css('[data-testid="article-preview-panel"]'))
    await driver.wait(until.elementIsVisible(previewPanel), DEFAULT_WAIT_MS)

    const articleCard = await driver.findElement(By.css('[data-testid="article-card-2"]'))
    await articleCard.click()

    const previewText = await previewPanel.getText()
    expect(previewText.length).toBeGreaterThan(0)
  })
})
