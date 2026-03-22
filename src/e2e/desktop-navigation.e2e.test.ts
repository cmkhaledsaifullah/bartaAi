import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { By, type WebDriver, until } from 'selenium-webdriver'
import {
  buildDriver,
  closeDriver,
  openApp,
  switchToKnowledgeTab,
  switchToChatTab,
  SELECTORS,
  DEFAULT_WAIT_MS,
  DESKTOP_VIEWPORT,
} from './helpers'

describe('Desktop - Tab Navigation and Settings', () => {
  let driver: WebDriver

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await closeDriver(driver)
  })

  it('switches between prompt and knowledge tabs on desktop', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Verify we start on prompt tab
    let chatPanel = await driver.findElement(By.css(SELECTORS.chatPanel))
    expect(await chatPanel.isDisplayed()).toBe(true)

    // Click knowledge tab in header navigation
    await switchToKnowledgeTab(driver)

    // Verify knowledge base is visible
    const knowledgeBase = await driver.findElement(By.css(SELECTORS.knowledgeBase))
    expect(await knowledgeBase.isDisplayed()).toBe(true)

    // Verify prompt panel is now hidden (re-query to avoid stale element)
    const chatPanels = await driver.findElements(By.css(SELECTORS.chatPanel))
    expect(chatPanels.length === 0 || !(await chatPanels[0]?.isDisplayed())).toBe(true)

    // Switch back to prompt tab
    await switchToChatTab(driver)

    // Verify prompt panel is visible again (re-query to get fresh element)
    chatPanel = await driver.findElement(By.css(SELECTORS.chatPanel))
    expect(await chatPanel.isDisplayed()).toBe(true)

    // Verify knowledge base is now hidden (re-query to avoid stale element)
    const knowledgeBases = await driver.findElements(By.css(SELECTORS.knowledgeBase))
    expect(knowledgeBases.length === 0 || !(await knowledgeBases[0]?.isDisplayed())).toBe(true)
  })

  it('opens and closes settings panel on desktop', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Wait for prompt panel to be visible
    const chatPanel = await driver.findElement(By.css(SELECTORS.chatPanel))
    await driver.wait(until.elementIsVisible(chatPanel), DEFAULT_WAIT_MS)

    // Open hamburger menu to access settings
    const menuButton = await driver.findElement(By.css(SELECTORS.menuButton))
    await menuButton.click()
    await driver.sleep(300) // Wait for side panel animation

    // Click 'Model' button in side panel to open settings modal
    const modelButton = await driver.wait(
      until.elementLocated(By.xpath('//button[text()="Model"]')),
      DEFAULT_WAIT_MS,
    )
    await modelButton.click()
    await driver.sleep(300) // Wait for modal animation

    // Verify settings modal is visible by checking for API key input
    const apiKeyInput = await driver.findElement(By.css(SELECTORS.apiKeyInput))
    expect(await apiKeyInput.isDisplayed()).toBe(true)

    // Close the settings modal
    const closeButton = await driver.findElement(By.css(SELECTORS.closeConfigModal))
    await closeButton.click()
    await driver.sleep(300) // Wait for animation

    // Verify settings modal is hidden
    const settingsPanels = await driver.findElements(By.css(SELECTORS.apiKeyInput))
    if (settingsPanels.length > 0) {
      expect(await settingsPanels[0].isDisplayed()).toBe(false)
    }
  })

  it('verifies active tab styling on desktop', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Get the chat tab button
    const chatTabButton = await driver.findElement(By.css(SELECTORS.chatTabButton))
    
    // Check that it has active styling (aria-current should be "page")
    const ariaCurrent = await chatTabButton.getAttribute('aria-current')
    expect(ariaCurrent).toBe('page')

    // Switch to knowledge tab
    const knowledgeTabButton = await driver.findElement(By.css(SELECTORS.knowledgeTabButton))
    await knowledgeTabButton.click()

    // Wait a bit for state to update
    await driver.sleep(200)

    // Verify knowledge tab is now active
    const knowledgeAriaCurrent = await knowledgeTabButton.getAttribute('aria-current')
    expect(knowledgeAriaCurrent).toBe('page')

    // Verify chat tab is no longer active
    const chatAriaCurrentAfter = await chatTabButton.getAttribute('aria-current')
    expect(chatAriaCurrentAfter).toBeNull()
  })
})
