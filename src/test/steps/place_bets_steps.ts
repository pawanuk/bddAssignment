import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ENV } from '../../utils/env';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
import { BetResult } from '../../types/BetResult';

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
  await takeScreenshotOnFailure(scenario, page); // Take screenshot if scenario fails
  await closeResources(page, context, browser); // Close page, context, and browser
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  await loginPage.login(ENV.username!, ENV.password!);
});

When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
  await politicsPage.navigateToPoliticsSection();
});

Then('I place a bet on the following candidates:', async function (dataTable) {
  type CandidateRow = { candidate: string }; // Define the type of each row
  const candidates = dataTable.hashes().map((row: CandidateRow) => row.candidate);
  const betResults = await politicsPage.placeBetsOnCandidates(candidates);
  this.betResults = betResults;
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});
