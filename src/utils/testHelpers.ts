import fs from 'fs-extra';
import path from 'path';
import { Page, BrowserContext, Browser } from '@playwright/test';
import { Status } from '@cucumber/cucumber';

export async function cleanDirectories() {
  const videoDir = path.join(__dirname, '../../videos');
  const screenshotDir = path.join(__dirname, '../../screenshots');

  try {
    console.log("Deleting old videos and screenshots...");
    if (fs.existsSync(videoDir)) {
      await fs.remove(videoDir);
      console.log(`Deleted video directory: ${videoDir}`);
    }
    if (fs.existsSync(screenshotDir)) {
      await fs.remove(screenshotDir);
      console.log(`Deleted screenshot directory: ${screenshotDir}`);
    }
  } catch (err) {
    console.error("Error cleaning up directories:", err);
  }
}

export async function takeScreenshotOnFailure(scenario: any, page: Page) {
  if (scenario.result?.status === Status.FAILED && page) {
    const screenshotPath = path.join('screenshots', `${scenario.pickle.name}.png`);
    console.log(`Scenario failed. Taking screenshot: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
}

export async function closeResources(page: Page, context: BrowserContext, browser: Browser) {
  if (page && !page.isClosed()) {
    console.log("Closing page...");
    await page.close();
  }

  if (context) {
    console.log("Closing context...");
    await context.close();
  }

  if (browser) {
    console.log("Closing browser...");
    await browser.close();
  }

  console.log("Teardown completed.");
}
