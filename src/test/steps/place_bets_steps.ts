import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ENV } from '../../utils/env';
import { LoginPage } from '../../pages/LoginPage';
import fs from 'fs-extra';
import path from 'path';
import { PoliticsPage } from '../../pages/PoliticsPage';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

Before(async function () {
  console.log("Preparing test environment...");

  // Directories to clean
  const videoDir = path.join(__dirname, '../../videos');
  const screenshotDir = path.join(__dirname, '../../screenshots');

  // Delete existing videos and screenshots
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

  // Check if the environment is Docker
  const isDocker = process.env.DOCKER_ENV === 'true';

  // Launch the browser, headless in Docker
  console.log("Launching browser...");
  browser = await chromium.launch({
    headless: isDocker,  // Set to true if running in Docker
  });

  // Create a new browser context with video recording enabled
  context = await browser.newContext({
    storageState: 'auth.json',
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 1024 } }
  });

  // Create a new page within the context
  page = await context.newPage();

  // Initialize Page Objects
  loginPage = new LoginPage(page);
  politicsPage = new PoliticsPage(page);

  console.log("Browser launched and new page created.");
});

After(async function (scenario) {
  console.log("Tearing down...");

  try {
    // Take a screenshot if the scenario failed and the page is available
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotPath = path.join('screenshots', `${scenario.pickle.name}.png`);
      console.log(`Scenario failed. Taking screenshot: ${screenshotPath}`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.attach(fs.readFileSync(screenshotPath), 'image/png');
    }

    // Close the page if it exists and is not already closed
    if (this.page && !this.page.isClosed()) {
      console.log("Closing page...");
      await this.page.close();
    }

    // Close the context if it exists
    if (this.context) {
      console.log("Closing context...");
      await this.context.close();
    }

    // Close the browser if it exists
    if (this.browser) {
      console.log("Closing browser...");
      await this.browser.close();
    }

    console.log("Teardown completed.");
  } catch (error) {
    console.error("Error during teardown:", error);
  }
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  await loginPage.login(ENV.username!, ENV.password!);
});

When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
  await politicsPage.navigateToPoliticsSection();
});

When('I place a bet on the following candidates:', { timeout: 120 * 1000 }, async function (dataTable) {
  const candidates = dataTable.hashes();
  for (const candidate of candidates) {
    const randomOdds = (Math.random() * (5 - 1.01) + 1.01).toFixed(2);
    const randomAmount = (Math.random() * (500 - 10) + 10).toFixed(2);
    await politicsPage.placeBet(candidate.candidate, randomOdds, randomAmount);
  }
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});
