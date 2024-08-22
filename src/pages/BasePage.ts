import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    await this.page.goto(url, options);
  }

  async waitForSelector(locator: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(locator, options);
  }

  async clickElement(locator: string) {
    await this.page.click(locator);
  }

  async fillInputField(locator: string, value: string) {
    await this.page.fill(locator, value);
  }

  async getTextContent(locator: string): Promise<string | null> {
    return this.page.textContent(locator);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle', options?: { timeout?: number }) {
    await this.page.waitForLoadState(state, options);
  }

  async isVisible(locator: string): Promise<boolean> {
    return await this.page.isVisible(locator);
  }

  async screenshot(options?: { path?: string; fullPage?: boolean }) {
    await this.page.screenshot(options);
  }
}
