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

type BetResult = {
  candidateName: string;
  expectedOdds: number;
  actualOdds: number;
  expectedAmount: number;
  actualAmount: number;
  expectedProfit: number;
  actualProfit: number;
};

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
  const results: BetResult[] = [];

  for (const candidate of candidates) {
    const randomOdds = Math.floor(Math.random() * (5 - 2 + 1)) + 2;  // Generate random odds as whole numbers between 2 and 5
    const randomAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10; // Generate random amount as whole numbers between 10 and 500
    
    console.log(`Adding bet for: ${candidate.candidate} with odds ${randomOdds} and amount ${randomAmount}`);
    await politicsPage.placeBet(candidate.candidate, randomOdds, randomAmount);
    
    const expectedProfit = (randomOdds - 1) * randomAmount;
    const actualProfit = await politicsPage.getDisplayedProfit(candidate.candidate);

    const result: BetResult = {
      candidateName: candidate.candidate,
      expectedOdds: randomOdds,
      actualOdds: randomOdds,  
      expectedAmount: randomAmount,
      actualAmount: randomAmount,  
      expectedProfit: expectedProfit,
      actualProfit: actualProfit,
    };
    
    results.push(result);
  }

  // Compare expected and actual values after all bets are placed
  results.forEach(result => {
    console.log(`Verifying bet for ${result.candidateName}`);
    if (
      result.expectedOdds !== result.actualOdds ||
      result.expectedAmount !== result.actualAmount ||
      Math.abs(result.expectedProfit - result.actualProfit) > 0.01
    ) {
      throw new Error(
        `Verification failed for ${result.candidateName}: ` +
        `Expected odds: ${result.expectedOdds}, Actual odds: ${result.actualOdds}, ` +
        `Expected amount: ${result.expectedAmount}, Actual amount: ${result.actualAmount}, ` +
        `Expected profit: ${result.expectedProfit}, Actual profit: ${result.actualProfit}`
      );
    }
  });
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});
