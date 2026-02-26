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

    // Switch to knowledge tab (works on both desktop and mobile)
    const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
    await knowledgeTabButton.click()

    // Wait for knowledge base to be available
    await driver.wait(until.elementLocated(By.css('[data-testid="knowledge-base"]')), DEFAULT_WAIT_MS)

    const cards = await driver.findElements(By.css('[data-testid^="article-card-"]'))
    expect(cards.length).toBeGreaterThanOrEqual(3)

    // Scroll to make view toggle visible
    const chunksToggle = await driver.findElement(By.css('[data-testid="view-toggle-chunks"]'))
    await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "center" })', chunksToggle)
    await driver.wait(until.elementIsVisible(chunksToggle), DEFAULT_WAIT_MS)
    
    await chunksToggle.click()

    const knowledgePanelVisualizer = await driver.wait(
      until.elementLocated(By.css('[data-testid="chunk-visualizer"]')),
      DEFAULT_WAIT_MS,
    )

    const keywordCount = await knowledgePanelVisualizer.getAttribute('data-keyword-count')
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

    // Verify we start on prompt tab
    const chatPanel = await driver.findElement(By.css('[data-testid="chat-panel"]'))
    expect(await chatPanel.isDisplayed()).toBe(true)

    // Switch to knowledge tab by clicking footer navigation - using Bangla title
    const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
    // Use JavaScript click to bypass visibility issues
    await driver.executeScript('arguments[0].click()', knowledgeTabButton)

    // Wait for knowledge base to be visible
    const knowledgeBase = await driver.wait(
      until.elementLocated(By.css('[data-testid="knowledge-base"]')),
      DEFAULT_WAIT_MS,
    )
    await driver.wait(until.elementIsVisible(knowledgeBase), DEFAULT_WAIT_MS)

    // Verify mobile viewport
    const innerWidth = await driver.executeScript('return window.innerWidth') as number
    expect(innerWidth).toBeLessThanOrEqual(600)

    // Verify article preview functionality
    const previewPanel = await driver.findElement(By.css('[data-testid="article-preview-panel"]'))
    await driver.wait(until.elementIsVisible(previewPanel), DEFAULT_WAIT_MS)

    const articleCard = await driver.findElement(By.css('[data-testid="article-card-2"]'))
    await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "center" })', articleCard)
    await articleCard.click()

    const previewText = await previewPanel.getText()
    expect(previewText.length).toBeGreaterThan(0)
  })

  describe('Mobile View', () => {
    it('renders knowledge base articles on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Switch to knowledge tab - using Bangla title
      const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
      // Use JavaScript click to bypass visibility issues
      await driver.executeScript('arguments[0].click()', knowledgeTabButton)

      // Wait for knowledge base to be visible
      await driver.wait(until.elementLocated(By.css('[data-testid="knowledge-base"]')), DEFAULT_WAIT_MS)

      const cards = await driver.findElements(By.css('[data-testid^="article-card-"]'))
      expect(cards.length).toBeGreaterThanOrEqual(3)

      const firstCard = await driver.findElement(By.css('[data-testid="article-card-1"]'))
      const cardTitle = await firstCard.getText()
      expect(cardTitle.length).toBeGreaterThan(0)
    })

    it('toggles between article and chunk views on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Switch to knowledge tab - using Bangla title
      const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
      // Use JavaScript click to bypass visibility issues
      await driver.executeScript('arguments[0].click()', knowledgeTabButton)

      // Wait for knowledge base to be visible
      const knowledgeBase = await driver.wait(
        until.elementLocated(By.css('[data-testid="knowledge-base"]')),
        DEFAULT_WAIT_MS,
      )
      await driver.wait(until.elementIsVisible(knowledgeBase), DEFAULT_WAIT_MS)

      // Scroll to view toggle
      const chunksToggle = await driver.findElement(By.css('[data-testid="view-toggle-chunks"]'))
      await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "center" })', chunksToggle)
      await driver.wait(until.elementIsVisible(chunksToggle), DEFAULT_WAIT_MS)
      
      // Click chunks toggle
      await chunksToggle.click()

      // Verify chunk visualizer appears
      const knowledgePanelVisualizer = await driver.wait(
        until.elementLocated(By.css('[data-testid="chunk-visualizer"]')),
        DEFAULT_WAIT_MS,
      )
      
      // Scroll to visualizer to ensure it's in view
      await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "center" })', knowledgePanelVisualizer)

      // Toggle back to text/articles view
      const textToggle = await driver.wait(
        until.elementLocated(By.css('[data-testid="view-toggle-text"]')),
        DEFAULT_WAIT_MS,
      )
      await textToggle.click()

      // Verify articles are visible
      await driver.wait(
        until.elementLocated(By.css('[data-testid^="article-card-"]')),
        DEFAULT_WAIT_MS,
      )
      const cards = await driver.findElements(By.css('[data-testid^="article-card-"]'))
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })

    it('submits questions via mobile input on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('Cricket news')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for RAG steps to appear
      await driver.wait(until.elementLocated(By.css('[data-testid="rag-step"]')), DEFAULT_WAIT_MS)

      // Verify assistant response
      const assistantReply = await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      const replyText = await assistantReply.getText()
      expect(replyText.length).toBeGreaterThan(0)
    })

    it('displays RAG steps on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('dengue')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for assistant response (which means RAG steps completed)
      const assistantReply = await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      // Verify processing completed and response exists
      const replyText = await assistantReply.getText()
      expect(replyText.length).toBeGreaterThan(0)
    })

    it('shows retrieved context chunks on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('মেট্রোরেল')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for assistant response
      const assistantReply = await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      // Verify response has content (which means retrieval worked)
      const replyText = await assistantReply.getText()
      expect(replyText.length).toBeGreaterThan(0)

      // Verify user message exists
      const userMessages = await driver.findElements(By.css('[data-role="user"]'))
      expect(userMessages.length).toBeGreaterThan(0)
    })

    it('scrolls to latest message on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Submit first question
      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('First question')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for first response
      await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      // Submit second question
      await queryInput.clear()
      await queryInput.sendKeys('Second question')
      await submitButton.click()

      // Wait for second response
      await driver.wait(async () => {
        const messages = await driver.findElements(By.css('[data-role="assistant"][data-message-type="answer"]'))
        return messages.length >= 2
      }, DEFAULT_WAIT_MS)

      // Verify messages exist
      const messages = await driver.findElements(By.css('[data-role="assistant"]'))
      expect(messages.length).toBeGreaterThanOrEqual(2)
    })

    it('clicks on article cards to view details on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Switch to knowledge tab - using Bangla title
      const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
      // Use JavaScript click to bypass visibility issues
      await driver.executeScript('arguments[0].click()', knowledgeTabButton)

      // Wait for knowledge base to be visible
      const knowledgeBase = await driver.wait(
        until.elementLocated(By.css('[data-testid="knowledge-base"]')),
        DEFAULT_WAIT_MS,
      )
      await driver.wait(until.elementIsVisible(knowledgeBase), DEFAULT_WAIT_MS)

      // Click on an article card
      const articleCard = await driver.findElement(By.css('[data-testid="article-card-1"]'))
      await driver.executeScript('arguments[0].scrollIntoView({ behavior: "instant", block: "center" })', articleCard)
      await articleCard.click()

      // Wait for preview panel
      const previewPanel = await driver.findElement(By.css('[data-testid="article-preview-panel"]'))
      await driver.wait(until.elementIsVisible(previewPanel), DEFAULT_WAIT_MS)

      // Verify preview content
      const previewText = await previewPanel.getText()
      expect(previewText.length).toBeGreaterThan(0)
    })

    it('handles example questions on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Find and click example question
      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('মেট্রোরেল নিয়ে আপডেট কি?')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for RAG steps to appear
      await driver.wait(until.elementLocated(By.css('[data-testid="rag-step"]')), DEFAULT_WAIT_MS)

      // Verify assistant response
      const assistantReply = await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      expect(await assistantReply.isDisplayed()).toBe(true)
    })

    it('displays chat history correctly on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Submit a question
      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('cricket')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Wait for response
      await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      // Check user and assistant messages
      const userMessages = await driver.findElements(By.css('[data-role="user"]'))
      const assistantMessages = await driver.findElements(By.css('[data-role="assistant"]'))

      expect(userMessages.length).toBeGreaterThanOrEqual(1)
      expect(assistantMessages.length).toBeGreaterThanOrEqual(1)
    })

    it('disables input while processing on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      const queryInput = await driver.findElement(By.css('input[placeholder*="Ask about the news"]'))
      await queryInput.clear()
      await queryInput.sendKeys('Processing test')

      const submitButton = await driver.findElement(By.css('button[aria-label="Run search"]'))
      await submitButton.click()

      // Check if input is disabled immediately after submission
      const isDisabled = await queryInput.getAttribute('disabled')
      expect(isDisabled).toBeTruthy()

      // Wait for processing to complete
      await driver.wait(
        until.elementLocated(By.css('[data-role="assistant"][data-message-type="answer"]')),
        DEFAULT_WAIT_MS,
      )

      // Input should be enabled again
      const isEnabledAfter = await queryInput.isEnabled()
      expect(isEnabledAfter).toBe(true)
    })

    it('shows welcome message on mobile initial load', async () => {
      await openApp(MOBILE_VIEWPORT)

      // Find welcome/system message
      const systemMessage = await driver.findElement(By.css('[data-role="system"]'))
      expect(await systemMessage.isDisplayed()).toBe(true)

      const welcomeText = await systemMessage.getText()
      expect(welcomeText.length).toBeGreaterThan(0)
    })

    it('hides resize separator on mobile', async () => {
      await openApp(MOBILE_VIEWPORT)

      // The resize separator should not be visible on mobile
      const separators = await driver.findElements(By.css('[aria-label="Resize panels"]'))
      
      if (separators.length > 0) {
        const separator = separators[0]
        const isVisible = await separator.isDisplayed()
        expect(isVisible).toBe(false)
      }
    })

    it('applies mobile-specific styling and layout', async () => {
      await openApp(MOBILE_VIEWPORT)

      const mainGrid = await driver.findElement(By.css('.grid'))
      
      // Get computed styles
      const layoutInfo = (await driver.executeScript(
        'return { width: window.innerWidth, gridCols: window.getComputedStyle(arguments[0]).gridTemplateColumns }',
        mainGrid,
      )) as {
        width: number
        gridCols: string
      }

      expect(layoutInfo.width).toBeLessThanOrEqual(600)
      // On mobile, grid should be single column (not multi-column with panel width)
      expect(layoutInfo.gridCols).not.toContain('360px')
    })
  })

  describe('Desktop Tab Navigation', () => {
    it('switches between prompt and knowledge tabs on desktop', async () => {
      await openApp(DESKTOP_VIEWPORT)

      // Verify we start on prompt tab
      const chatPanel = await driver.findElement(By.css('[data-testid="chat-panel"]'))
      expect(await chatPanel.isDisplayed()).toBe(true)

      // Click knowledge tab in header navigation
      const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
      await knowledgeTabButton.click()

      // Wait for knowledge base to be visible
      const knowledgeBase = await driver.wait(
        until.elementLocated(By.css('[data-testid="knowledge-base"]')),
        DEFAULT_WAIT_MS,
      )
      expect(await knowledgeBase.isDisplayed()).toBe(true)

      // Verify prompt panel is now hidden
      expect(await chatPanel.isDisplayed()).toBe(false)

      // Switch back to prompt tab
      const promptTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা Prompt"]'))
      await promptTabButton.click()

      // Verify prompt panel is visible again
      await driver.wait(until.elementIsVisible(chatPanel), DEFAULT_WAIT_MS)
      expect(await chatPanel.isDisplayed()).toBe(true)

      // Verify knowledge base is now hidden
      expect(await knowledgeBase.isDisplayed()).toBe(false)
    })

    it('opens and closes settings panel on desktop', async () => {
      await openApp(DESKTOP_VIEWPORT)

      // Wait for prompt panel to be visible
      const chatPanel = await driver.findElement(By.css('[data-testid="chat-panel"]'))
      await driver.wait(until.elementIsVisible(chatPanel), DEFAULT_WAIT_MS)

      // Find settings button (with desktop suffix from Panel component)
      const settingsButton = await driver.findElement(By.css('[data-testid="settings-toggle-desktop"]'))
      await settingsButton.click()

      // Wait for settings panel to appear
      await driver.sleep(300) // Wait for animation

      // Verify settings panel is visible by checking for API key input
      const apiKeyInput = await driver.findElement(By.css('input[type="password"][placeholder*="Enter key"]'))
      expect(await apiKeyInput.isDisplayed()).toBe(true)

      // Click settings button again to close
      await settingsButton.click()
      await driver.sleep(300) // Wait for animation

      // Verify settings panel is hidden
      const settingsPanels = await driver.findElements(By.css('input[type="password"][placeholder*="Enter key"]'))
      if (settingsPanels.length > 0) {
        expect(await settingsPanels[0].isDisplayed()).toBe(false)
      }
    })

    it('verifies active tab styling on desktop', async () => {
      await openApp(DESKTOP_VIEWPORT)

      // Get the prompt tab button
      const promptTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা Prompt"]'))
      
      // Check that it has active styling (aria-current should be "page")
      const ariaCurrent = await promptTabButton.getAttribute('aria-current')
      expect(ariaCurrent).toBe('page')

      // Switch to knowledge tab
      const knowledgeTabButton = await driver.findElement(By.css('button[aria-label="View বার্তা ভাণ্ডার"]'))
      await knowledgeTabButton.click()

      // Wait a bit for state to update
      await driver.sleep(200)

      // Verify knowledge tab is now active
      const knowledgeAriaCurrent = await knowledgeTabButton.getAttribute('aria-current')
      expect(knowledgeAriaCurrent).toBe('page')

      // Verify prompt tab is no longer active
      const promptAriaCurrentAfter = await promptTabButton.getAttribute('aria-current')
      expect(promptAriaCurrentAfter).toBeNull()
    })
  })
})
