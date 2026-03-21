import { Builder, By, until, type WebDriver, type WebElement } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

// Constants
export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173'
export const DEFAULT_WAIT_MS = 30000

export const DESKTOP_VIEWPORT = { width: 1280, height: 720 }
export const MOBILE_VIEWPORT = { width: 390, height: 844 }

// Common selectors
export const SELECTORS = {
  chatPanel: '[data-testid="chat-panel"]',
  knowledgeBase: '[data-testid="knowledge-base"]',
  knowledgeTabButton: 'button[aria-label="View বার্তা ভাণ্ডার"]',
  chatTabButton: 'button[aria-label="View বার্তা জিজ্ঞাসা"]',
  queryInput: 'input[placeholder*="Ask about the news"]',
  submitButton: 'button[aria-label="Run search"]',
  ragStep: '[data-testid="rag-step"]',
  assistantReply: '[data-role="assistant"][data-message-type="answer"]',
  userMessage: '[data-role="user"]',
  systemMessage: '[data-role="system"]',
  retrievedChunk: '[data-testid="retrieved-chunk"]',
  articleCard: '[data-testid^="article-card-"]',
  articlePreviewPanel: '[data-testid="article-preview-panel"]',
  viewToggleChunks: '[data-testid="view-toggle-chunks"]',
  viewToggleText: '[data-testid="view-toggle-text"]',
  chunkVisualizer: '[data-testid="chunk-visualizer"]',
  settingsToggleDesktop: '[data-testid="models-toggle"]',
  apiKeyInput: 'input[type="password"][placeholder*="API key"]',
} as const

/**
 * Build a new Chrome WebDriver with headless options
 */
export async function buildDriver(): Promise<WebDriver> {
  const options = new chrome.Options()
  options.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,720',
  )

  return await new Builder().forBrowser('chrome').setChromeOptions(options).build()
}

/**
 * Close the WebDriver instance
 */
export async function closeDriver(driver: WebDriver): Promise<void> {
  if (driver) {
    await driver.quit()
  }
}

/**
 * Set the viewport size for the driver
 */
export async function setViewport(
  driver: WebDriver,
  viewport: { width: number; height: number },
): Promise<void> {
  await driver.manage().window().setRect({ 
    width: viewport.width, 
    height: viewport.height, 
    x: 0, 
    y: 0 
  })
}

/**
 * Open the application and wait for it to load
 */
export async function openApp(
  driver: WebDriver,
  viewport = DESKTOP_VIEWPORT,
): Promise<void> {
  await setViewport(driver, viewport)
  await driver.get(BASE_URL)
  // Wait for the chat panel (chat tab) to load - this is the default view
  await driver.wait(until.elementLocated(By.css(SELECTORS.chatPanel)), DEFAULT_WAIT_MS)
}

/**
 * Switch to knowledge base tab and wait for it to load
 */
export async function switchToKnowledgeTab(driver: WebDriver): Promise<void> {
  const knowledgeTabButton = await driver.findElement(By.css(SELECTORS.knowledgeTabButton))
  // Use JavaScript click to bypass visibility issues
  await driver.executeScript('arguments[0].click()', knowledgeTabButton)
  
  // Wait for knowledge base to be visible
  const knowledgeBase = await driver.wait(
    until.elementLocated(By.css(SELECTORS.knowledgeBase)),
    DEFAULT_WAIT_MS,
  )
  await driver.wait(until.elementIsVisible(knowledgeBase), DEFAULT_WAIT_MS)
}

/**
 * Switch to chat tab and wait for it to load
 */
export async function switchToChatTab(driver: WebDriver): Promise<void> {
  const chatTabButton = await driver.findElement(By.css(SELECTORS.chatTabButton))
  await chatTabButton.click()
  
  // Verify chat panel is visible
  const chatPanel = await driver.wait(
    until.elementLocated(By.css(SELECTORS.chatPanel)),
    DEFAULT_WAIT_MS,
  )
  await driver.wait(until.elementIsVisible(chatPanel), DEFAULT_WAIT_MS)
}

/**
 * Submit a query and wait for the assistant response
 */
export async function submitQuery(
  driver: WebDriver,
  query: string,
): Promise<void> {
  const queryInput = await driver.findElement(By.css(SELECTORS.queryInput))
  await queryInput.clear()
  await queryInput.sendKeys(query)

  const submitButton = await driver.findElement(By.css(SELECTORS.submitButton))
  await submitButton.click()

  // Wait for assistant response
  await driver.wait(
    until.elementLocated(By.css(SELECTORS.assistantReply)),
    DEFAULT_WAIT_MS,
  )
}

/**
 * Scroll an element into view
 */
export async function scrollIntoView(
  driver: WebDriver,
  element: WebElement,
): Promise<void> {
  await driver.executeScript(
    'arguments[0].scrollIntoView({ behavior: "instant", block: "center" })',
    element,
  )
}

/**
 * Click an element using JavaScript (bypasses visibility issues)
 */
export async function jsClick(driver: WebDriver, element: WebElement): Promise<void> {
  await driver.executeScript('arguments[0].click()', element)
}
