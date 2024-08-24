import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    try {
      await this.page.goto(url, options);
      console.log(`Navigated to ${url}`);
    } catch (error) {
      console.error(`Failed to navigate to ${url}: ${error}`);
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  async clickElement(locator: Locator, timeout: number = 30000): Promise<void> {
    try {
      await locator.click({ timeout });
      console.log(`Clicked on element ${locator}`);
    } catch (error) {
      console.error(`Failed to click on ${locator}: ${error}`);
      throw new Error(`Failed to click on ${locator}: ${error}`);
    }
  }

  async fillInputField(locator: Locator, value: string, timeout: number = 30000): Promise<void> {
    try {
      await locator.fill(value, { timeout });
      console.log(`Filled input ${locator} with value ${value}`);
    } catch (error) {
      console.error(`Failed to fill input ${locator} with value ${value}: ${error}`);
      throw new Error(`Failed to fill input ${locator} with value ${value}: ${error}`);
    }
  }

  async getTextContent(locator: Locator): Promise<string | null> {
    try {
      const textContent = await locator.textContent();
      console.log(`Got text content from ${locator}`);
      return textContent;
    } catch (error) {
      console.error(`Failed to get text content from ${locator}: ${error}`);
      throw new Error(`Failed to get text content from ${locator}: ${error}`);
    }
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load', options?: { timeout?: number }): Promise<void> {
    try {
      await this.page.waitForLoadState(state, options);
      console.log(`Waited for load state ${state}`);
    } catch (error) {
      console.error(`Failed to wait for load state ${state}: ${error}`);
      throw new Error(`Failed to wait for load state ${state}: ${error}`);
    }
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      const visible = await locator.isVisible();
      console.log(`Element ${locator} is ${visible ? 'visible' : 'not visible'}`);
      return visible;
    } catch (error) {
      console.error(`Error checking visibility of ${locator}: ${error}`);
      return false;
    }
  }

  async screenshot(options?: { path?: string; fullPage?: boolean }): Promise<void> {
    try {
      await this.page.screenshot(options);
      console.log(`Screenshot taken with options: ${JSON.stringify(options)}`);
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}
