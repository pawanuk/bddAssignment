import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ENV } from '../../utils/env';
import { LoginPage } from '../../pages/LoginPage';
import fs from 'fs-extra';
import path from 'path';
import { PoliticsPage } from '../../pages/PoliticsPage';

type BetResult = {
  name: string;
  odds: number;
  amount: number;
  profit: number;
};

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

Before(async function () {
  console.log("Preparing test environment...");
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
  const isDocker = process.env.DOCKER_ENV === 'true';
  console.log("Launching browser...");
  browser = await chromium.launch({
    headless: isDocker,  
  });
  context = await browser.newContext({
    storageState: 'auth.json',
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 1024 } }
  });
  page = await context.newPage();
  loginPage = new LoginPage(page);
  politicsPage = new PoliticsPage(page);
  console.log("Browser launched and new page created.");
});

After(async function (scenario) {
  console.log("Tearing down...");
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotPath = path.join('screenshots', `${scenario.pickle.name}.png`);
      console.log(`Scenario failed. Taking screenshot: ${screenshotPath}`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.attach(fs.readFileSync(screenshotPath), 'image/png');
    }
    if (this.page && !this.page.isClosed()) {
      console.log("Closing page...");
      await this.page.close();
    }
    if (this.context) {
      console.log("Closing context...");
      await this.context.close();
    }
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
    await politicsPage.placeBetsAndVerify(dataTable);
});

Then('I log out from the application', async function () {
    await politicsPage.logout();
});