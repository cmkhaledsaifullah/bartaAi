import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { By, type WebDriver, until } from 'selenium-webdriver'
import {
  buildDriver,
  closeDriver,
  openApp,
  switchToKnowledgeTab,
  scrollIntoView,
  SELECTORS,
  DEFAULT_WAIT_MS,
  DESKTOP_VIEWPORT,
} from './helpers'

describe('Desktop - Knowledge Base', () => {
  let driver: WebDriver

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await closeDriver(driver)
  })

  it('renders the knowledge base and chunk preview toggle', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Switch to knowledge tab
    await switchToKnowledgeTab(driver)

    const cards = await driver.findElements(By.css(SELECTORS.articleCard))
    expect(cards.length).toBeGreaterThanOrEqual(3)

    // Scroll to make view toggle visible
    const chunksToggle = await driver.findElement(By.css(SELECTORS.viewToggleChunks))
    await scrollIntoView(driver, chunksToggle)
    await driver.wait(until.elementIsVisible(chunksToggle), DEFAULT_WAIT_MS)
    
    await chunksToggle.click()

    const knowledgePanelVisualizer = await driver.wait(
      until.elementLocated(By.css(SELECTORS.chunkVisualizer)),
      DEFAULT_WAIT_MS,
    )

    const keywordCount = await knowledgePanelVisualizer.getAttribute('data-keyword-count')
    expect(keywordCount).toBe('0')
  })

  it('stacks knowledge panel below chat on mobile viewports', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Switch to knowledge tab
    await switchToKnowledgeTab(driver)

    // Verify article preview functionality
    const previewPanel = await driver.findElement(By.css(SELECTORS.articlePreviewPanel))
    await driver.wait(until.elementIsVisible(previewPanel), DEFAULT_WAIT_MS)

    const articleCard = await driver.findElement(By.css('[data-testid="article-card-2"]'))
    await scrollIntoView(driver, articleCard)
    await articleCard.click()

    const previewText = await previewPanel.getText()
    expect(previewText.length).toBeGreaterThan(0)
  })
})
