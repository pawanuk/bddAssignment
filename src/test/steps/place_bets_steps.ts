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

When('I place a bet on {string} with odds {string} and a stake of {string}', async function (candidateName, odds, stake) {
  await politicsPage.placeBet(candidateName, parseFloat(odds), parseFloat(stake));
});

When('I enter only a stake amount without entering any odds', async function () {
  await politicsPage.enterStakeWithoutOdds('100'); // Replace '100' with the desired stake
});

When('I enter only odds without entering a stake amount', async function () {
  await politicsPage.enterOddsWithoutStake('5'); // Replace '5' with the desired odds
});

When('I place a bet on the following candidates:', async function (dataTable) {
  const candidates = dataTable.raw().flat();
  for (const candidate of candidates) {
    await politicsPage.placeBet(candidate, 2, 10); // Replace with appropriate odds and stake
  }
});

Then('the "Place bets" button should not be enabled', async function () {
  const isEnabled = await politicsPage.isPlaceBetButtonEnabled();
  if (isEnabled) {
    throw new Error('Place bets button is enabled when it should not be.');
  }
});

Then('an error message should be displayed indicating insufficient funds', async function () {
  const errorMessage = await politicsPage.getErrorMessage();
  if (!errorMessage.includes('Insufficient funds')) {
    throw new Error(`Expected an error message indicating insufficient funds, but got: ${errorMessage}`);
  }
});

Then('the odds value should be displayed', async function () {
  const oddsValue = await politicsPage.getOddsValue();
  if (!oddsValue) {
    throw new Error('Odds value is not displayed.');
  }
});

Then('a minimum odds message should be displayed', async function () {
  const actualMessage = await politicsPage.getMinimumOddsMessage();
  if (!actualMessage) {
    throw new Error('Minimum odds message is not displayed.');
  }
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});
