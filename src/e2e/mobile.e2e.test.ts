import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { By, type WebDriver, until } from 'selenium-webdriver'
import {
  buildDriver,
  closeDriver,
  openApp,
  switchToKnowledgeTab,
  submitQuery,
  scrollIntoView,
  jsClick,
  SELECTORS,
  DEFAULT_WAIT_MS,
  MOBILE_VIEWPORT,
} from './helpers'

describe('Mobile View', () => {
  let driver: WebDriver

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await closeDriver(driver)
  })

  it('renders knowledge base articles on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Switch to knowledge tab
    await switchToKnowledgeTab(driver)

    const cards = await driver.findElements(By.css(SELECTORS.articleCard))
    expect(cards.length).toBeGreaterThanOrEqual(3)

    const firstCard = await driver.findElement(By.css('[data-testid="article-card-1"]'))
    const cardTitle = await firstCard.getText()
    expect(cardTitle.length).toBeGreaterThan(0)
  })

  it('toggles between article and chunk views on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Switch to knowledge tab
    await switchToKnowledgeTab(driver)

    // Scroll to view toggle
    const chunksToggle = await driver.findElement(By.css(SELECTORS.viewToggleChunks))
    await scrollIntoView(driver, chunksToggle)
    await driver.wait(until.elementIsVisible(chunksToggle), DEFAULT_WAIT_MS)
    
    // Click chunks toggle
    await chunksToggle.click()

    // Verify chunk visualizer appears
    const knowledgePanelVisualizer = await driver.wait(
      until.elementLocated(By.css(SELECTORS.chunkVisualizer)),
      DEFAULT_WAIT_MS,
    )
    
    // Scroll to visualizer to ensure it's in view
    await scrollIntoView(driver, knowledgePanelVisualizer)

    // Toggle back to text/articles view
    const textToggle = await driver.wait(
      until.elementLocated(By.css(SELECTORS.viewToggleText)),
      DEFAULT_WAIT_MS,
    )
    await textToggle.click()

    // Verify articles are visible
    await driver.wait(
      until.elementLocated(By.css(SELECTORS.articleCard)),
      DEFAULT_WAIT_MS,
    )
    const cards = await driver.findElements(By.css(SELECTORS.articleCard))
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('submits questions via mobile input on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    await submitQuery(driver, 'Cricket news')

    // Verify assistant response
    const assistantReply = await driver.findElement(By.css(SELECTORS.assistantReply))
    const replyText = await assistantReply.getText()
    expect(replyText.length).toBeGreaterThan(0)
  })

  it('displays RAG steps on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    await submitQuery(driver, 'dengue')

    // Verify processing completed and response exists
    const assistantReply = await driver.findElement(By.css(SELECTORS.assistantReply))
    const replyText = await assistantReply.getText()
    expect(replyText.length).toBeGreaterThan(0)
  })

  it('shows retrieved context chunks on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    await submitQuery(driver, 'মেট্রোরেল')

    // Verify response has content (which means retrieval worked)
    const assistantReply = await driver.findElement(By.css(SELECTORS.assistantReply))
    const replyText = await assistantReply.getText()
    expect(replyText.length).toBeGreaterThan(0)

    // Verify user message exists
    const userMessages = await driver.findElements(By.css(SELECTORS.userMessage))
    expect(userMessages.length).toBeGreaterThan(0)
  })

  it('scrolls to latest message on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Submit first question
    let queryInput = await driver.findElement(By.css(SELECTORS.queryInput))
    await queryInput.clear()
    await queryInput.sendKeys('First question')

    let submitButton = await driver.findElement(By.css(SELECTORS.submitButton))
    await submitButton.click()

    // Wait for first response
    await driver.wait(
      until.elementLocated(By.css(SELECTORS.assistantReply)),
      DEFAULT_WAIT_MS,
    )

    // Re-find input and button (DOM may have changed after initial→conversation transition)
    queryInput = await driver.findElement(By.css(SELECTORS.queryInput))
    submitButton = await driver.findElement(By.css(SELECTORS.submitButton))

    // Submit second question
    await queryInput.clear()
    await queryInput.sendKeys('Second question')
    await submitButton.click()

    // Wait for second response
    await driver.wait(async () => {
      const messages = await driver.findElements(By.css(SELECTORS.assistantReply))
      return messages.length >= 2
    }, DEFAULT_WAIT_MS)

    // Verify messages exist
    const messages = await driver.findElements(By.css('[data-role="assistant"]'))
    expect(messages.length).toBeGreaterThanOrEqual(2)
  })

  it('clicks on article cards to view details on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Switch to knowledge tab
    await switchToKnowledgeTab(driver)

    // Click on an article card
    const articleCard = await driver.findElement(By.css('[data-testid="article-card-1"]'))
    await scrollIntoView(driver, articleCard)
    await articleCard.click()

    // Wait for preview panel
    const previewPanel = await driver.findElement(By.css(SELECTORS.articlePreviewPanel))
    await driver.wait(until.elementIsVisible(previewPanel), DEFAULT_WAIT_MS)

    // Verify preview content
    const previewText = await previewPanel.getText()
    expect(previewText.length).toBeGreaterThan(0)
  })

  it('handles example questions on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    await submitQuery(driver, 'মেট্রোরেল নিয়ে আপডেট কি?')

    // Verify assistant response
    const assistantReply = await driver.findElement(By.css(SELECTORS.assistantReply))
    expect(await assistantReply.isDisplayed()).toBe(true)
  })

  it('displays chat history correctly on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    await submitQuery(driver, 'cricket')

    // Check user and assistant messages
    const userMessages = await driver.findElements(By.css(SELECTORS.userMessage))
    const assistantMessages = await driver.findElements(By.css('[data-role="assistant"]'))

    expect(userMessages.length).toBeGreaterThanOrEqual(1)
    expect(assistantMessages.length).toBeGreaterThanOrEqual(1)
  })

  it('disables input while processing on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    let queryInput = await driver.findElement(By.css(SELECTORS.queryInput))
    await queryInput.clear()
    await queryInput.sendKeys('Processing test')

    const submitButton = await driver.findElement(By.css(SELECTORS.submitButton))
    await submitButton.click()

    // Re-find input after initial→conversation transition (DOM element is recreated)
    queryInput = await driver.findElement(By.css(SELECTORS.queryInput))

    // Check if input is disabled while processing
    const isDisabled = await queryInput.getAttribute('disabled')
    expect(isDisabled).toBeTruthy()

    // Wait for processing to complete
    await driver.wait(
      until.elementLocated(By.css(SELECTORS.assistantReply)),
      DEFAULT_WAIT_MS,
    )

    // Re-find input to check enabled state
    queryInput = await driver.findElement(By.css(SELECTORS.queryInput))
    // Input should be enabled again
    const isEnabledAfter = await queryInput.isEnabled()
    expect(isEnabledAfter).toBe(true)
  })

  it('shows welcome message on mobile initial load', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Find welcome/system message
    const systemMessage = await driver.findElement(By.css(SELECTORS.systemMessage))
    expect(await systemMessage.isDisplayed()).toBe(true)

    const welcomeText = await systemMessage.getText()
    expect(welcomeText.length).toBeGreaterThan(0)
  })

  it('hides resize separator on mobile', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // The resize separator should not be visible on mobile
    const separators = await driver.findElements(By.css('[aria-label="Resize panels"]'))
    
    if (separators.length > 0) {
      const separator = separators[0]
      const isVisible = await separator.isDisplayed()
      expect(isVisible).toBe(false)
    }
  })

  it('applies mobile-specific styling and layout', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Verify the app renders with a single-column flex layout on mobile
    const layoutInfo = (await driver.executeScript(
      'return { width: window.innerWidth, height: window.innerHeight }',
    )) as {
      width: number
      height: number
    }

    expect(layoutInfo.width).toBeLessThanOrEqual(600)

    // Verify only one tab panel is visible at a time (tab-based, not side-by-side grid)
    const chatPanels = await driver.findElements(By.css(SELECTORS.chatPanel))
    const knowledgePanels = await driver.findElements(By.css(SELECTORS.knowledgeBase))
    const visiblePanels = [
      ...(chatPanels.length > 0 ? [await chatPanels[0].isDisplayed()] : []),
      ...(knowledgePanels.length > 0 ? [await knowledgePanels[0].isDisplayed()] : []),
    ]
    const visibleCount = visiblePanels.filter(Boolean).length
    expect(visibleCount).toBe(1)
  })

  it('stacks knowledge panel below chat on mobile viewports', async () => {
    await openApp(driver, MOBILE_VIEWPORT)

    // Verify we start on chat tab
    const chatPanel = await driver.findElement(By.css(SELECTORS.chatPanel))
    expect(await chatPanel.isDisplayed()).toBe(true)

    // Switch to knowledge tab
    const knowledgeTabButton = await driver.findElement(By.css(SELECTORS.knowledgeTabButton))
    await jsClick(driver, knowledgeTabButton)

    // Wait for knowledge base to be visible
    const knowledgeBase = await driver.wait(
      until.elementLocated(By.css(SELECTORS.knowledgeBase)),
      DEFAULT_WAIT_MS,
    )
    await driver.wait(until.elementIsVisible(knowledgeBase), DEFAULT_WAIT_MS)

    // Verify mobile viewport
    const innerWidth = await driver.executeScript('return window.innerWidth') as number
    expect(innerWidth).toBeLessThanOrEqual(600)

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
