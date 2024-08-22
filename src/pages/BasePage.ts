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
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  async clickElement(locator: Locator): Promise<void> {
    try {
      await locator.click();
      console.log(`Clicked on element ${locator}`);
    } catch (error) {
      throw new Error(`Failed to click on ${locator}: ${error}`);
    }
  }

  async fillInputField(locator: Locator, value: string): Promise<void> {
    try {
      await locator.fill(value);
      console.log(`Filled input ${locator} with value ${value}`);
    } catch (error) {
      throw new Error(`Failed to fill input ${locator}: ${error}`);
    }
  }

  async getTextContent(locator: Locator): Promise<string | null> {
    try {
      const textContent = await locator.textContent();
      console.log(`Got text content from ${locator}`);
      return textContent;
    } catch (error) {
      throw new Error(`Failed to get text content from ${locator}: ${error}`);
    }
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load', options?: { timeout?: number }): Promise<void> {
    try {
      await this.page.waitForLoadState(state, options);
      console.log(`Waited for load state ${state}`);
    } catch (error) {
      throw new Error(`Failed to wait for load state ${state}: ${error}`);
    }
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch (error) {
      console.log(`Element ${locator} is not visible: ${error}`);
      return false;
    }
  }

  async screenshot(options?: { path?: string; fullPage?: boolean }): Promise<void> {
    try {
      await this.page.screenshot(options);
      console.log(`Screenshot taken with options: ${JSON.stringify(options)}`);
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}
