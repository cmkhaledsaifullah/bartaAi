import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { By, type WebDriver, until } from 'selenium-webdriver'
import {
  buildDriver,
  closeDriver,
  openApp,
  switchToKnowledgeTab,
  switchToPromptTab,
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
    await switchToPromptTab(driver)

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

    // Find settings button (with desktop suffix from Panel component)
    const settingsButton = await driver.findElement(By.css(SELECTORS.settingsToggleDesktop))
    await settingsButton.click()

    // Wait for settings panel to appear
    await driver.sleep(500) // Wait for animation

    // Verify settings panel is visible by checking for API key input
    const apiKeyInput = await driver.findElement(By.css(SELECTORS.apiKeyInput))
    expect(await apiKeyInput.isDisplayed()).toBe(true)

    // Click settings button again to close
    await settingsButton.click()
    await driver.sleep(500) // Wait for animation

    // Verify settings panel is hidden
    const settingsPanels = await driver.findElements(By.css(SELECTORS.apiKeyInput))
    if (settingsPanels.length > 0) {
      expect(await settingsPanels[0].isDisplayed()).toBe(false)
    }
  })

  it('verifies active tab styling on desktop', async () => {
    await openApp(driver, DESKTOP_VIEWPORT)

    // Get the prompt tab button
    const promptTabButton = await driver.findElement(By.css(SELECTORS.promptTabButton))
    
    // Check that it has active styling (aria-current should be "page")
    const ariaCurrent = await promptTabButton.getAttribute('aria-current')
    expect(ariaCurrent).toBe('page')

    // Switch to knowledge tab
    const knowledgeTabButton = await driver.findElement(By.css(SELECTORS.knowledgeTabButton))
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
