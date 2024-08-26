import { Given, When, Then, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
import { BetResult } from '../../types/BetResult';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

After(async function (scenario) {
  console.log("Tearing down...");
  await takeScreenshotOnFailure(scenario, page); // Take screenshot if scenario fails
  await closeResources(page, context, browser); // Close page, context, and browser
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  console.log("Setting up browser and context...");

  browser = await chromium.launch({
    headless: false, // Set to false for better debugging visuals
  });

  context = await browser.newContext({
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 1024 } }
  });

  page = await context.newPage();
  loginPage = new LoginPage(page);
  politicsPage = new PoliticsPage(page);

  console.log("Logging in to Betfair...");

  const username = 'pawanuk';
  const password = 'Pawankumar12';

  await loginPage.login(username, password);

  console.log("Login completed.");
});

When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
  await politicsPage.navigateToPoliticsSection();
});

Then('I place a bet on the following candidates:',{ timeout: 60000 }, async function (dataTable) {
  type CandidateRow = { candidate: string }; // Define the type of each row
  const candidates = dataTable.hashes().map((row: CandidateRow) => row.candidate);
  
  // Place bets on all candidates
  const betResults = await politicsPage.placeBetsOnCandidates(candidates);
  this.betResults = betResults;
  
  // Verify the profits after placing all bets
  const scenarioPassed = await politicsPage.verifyBets(betResults);
  if (!scenarioPassed) {
    throw new Error("Profit verification failed for one or more candidates.");
  }
  await politicsPage.cancelAllSelections();
  console.log("All selections canceled.");
});

Then('I log out from the application', async function () {
  await politicsPage.logout();
});
