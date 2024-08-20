import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ENV } from '../../utils/env';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

Before(async function () {
  console.log("Launching browser...");
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({ storageState: 'auth.json' });
  page = await context.newPage();
  
  loginPage = new LoginPage(page);
  politicsPage = new PoliticsPage(page);
  console.log("Browser launched and new page created.");
});

After(async function () {
  console.log("Tearing down...");

  try {
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
  } catch (error) {
    console.log("Error during teardown:", error);
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
