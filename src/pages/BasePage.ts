import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string, options?: Parameters<Page['goto']>[1]) {
    await this.page.goto(url, options); // Passing both the URL and the options
  }
}
