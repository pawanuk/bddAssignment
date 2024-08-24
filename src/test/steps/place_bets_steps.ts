import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ENV } from '../../utils/env';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import fs from 'fs-extra';
import path from 'path';

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
  await cleanDirectories(); // Clean screenshots and videos directories

  browser = await chromium.launch({
    headless: process.env.DOCKER_ENV === 'true',
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
  await takeScreenshotOnFailure(scenario); // Take screenshot if scenario fails
  await closeResources(); // Close page, context, and browser
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  await loginPage.login(ENV.username!, ENV.password!);
});

When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
  await politicsPage.navigateToPoliticsSection();
});

When('I place a bet on the following candidates:', { timeout: 120 * 1000 }, async function (dataTable) {
  const candidates = dataTable.hashes();
  const expectedResults: BetResult[] = [];

  for (const candidate of candidates) {
    const randomOdds = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    const randomAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
    const expectedProfit = (randomOdds - 1) * randomAmount;

    expectedResults.push({
      name: candidate.candidate,
      odds: randomOdds,
      amount: randomAmount,
      profit: expectedProfit,
    });

    await politicsPage.addBetToBetslip(candidate.candidate, randomOdds, randomAmount);
  }

  // Verification step
  for (let i = 0; i < expectedResults.length; i++) {
    const candidate = expectedResults[i];
    const actualProfit = await politicsPage.getDisplayedProfit(candidate.name);
    console.log(`Verifying bet for ${candidate.name}`);

    if (candidate.profit !== actualProfit) {
      throw new Error(`Verification failed for ${candidate.name}: Expected profit: ${candidate.profit}, Actual profit: ${actualProfit}`);
    }
  }
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});

// Utility functions

async function cleanDirectories() {
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

async function takeScreenshotOnFailure(scenario: any) {
  if (scenario.result?.status === Status.FAILED && page) {
    const screenshotPath = path.join('screenshots', `${scenario.pickle.name}.png`);
    console.log(`Scenario failed. Taking screenshot: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
}

async function closeResources() {
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
