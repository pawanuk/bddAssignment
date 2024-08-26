import { Given, When, Then, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium ,expect} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
import { BetResult } from '../../types/BetResult';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

// After(async function (scenario) {
//   console.log("Tearing down...");
//   await takeScreenshotOnFailure(scenario, page); // Take screenshot if scenario fails
//   await closeResources(page, context, browser); // Close page, context, and browser
// });

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

When('I place a bet on {string} with odds {string} and a stake of {string}', async function (candidateName: string, odds: string, stake: string) {
  console.log(`Placing a bet on ${candidateName} with odds ${odds} and stake ${stake}`);
  
  try {
    await politicsPage.placeBet(candidateName, parseFloat(odds), parseFloat(stake));
  } catch (error) {
    console.error(`Error placing bet: ${error}`);
    throw error;
  }
});

Then('an error message should be displayed indicating insufficient funds', async function () {
  const errorMessage = await politicsPage.getErrorMessage();
  console.log(`Verifying the error message: ${errorMessage}`);
  
  expect(errorMessage).toContain('insufficient funds');  // Adjust the text to match the actual error message
});

When('I enter only odds without entering a stake amount', async function () {
  const odds = '2';  // You can parameterize this if needed
  console.log(`Entering only odds: ${odds}`);
  
  await politicsPage.enterOddsWithoutStake(odds);
});

Then('the "Place bets" button should not be enabled', async function () {
  const isEnabled = await politicsPage.isPlaceBetButtonEnabled();
  console.log(`Checking if "Place bets" button is enabled: ${isEnabled}`);
  
  expect(isEnabled).toBe(false);
});

When('I enter only a stake amount without entering any odds', async function () {
  const stake = '50';  // You can parameterize this if needed
  console.log(`Entering only stake amount: ${stake}`);
  
  await politicsPage.enterStakeWithoutOdds(stake);
});
Then('I log out from the application', async function () {
  await politicsPage.logout();
});
