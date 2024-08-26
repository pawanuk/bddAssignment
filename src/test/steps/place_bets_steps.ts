import { Given, When, Then } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
import { BetResult } from '../../types/BetResult';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

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

Then('I place a bet on the following candidates:', { timeout: 60000 }, async function (dataTable) {
  type CandidateRow = { candidate: string };
  const candidates = dataTable.hashes().map((row: CandidateRow) => row.candidate);

  const betResults = await politicsPage.placeBetsOnCandidates(candidates);
  this.betResults = betResults;

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
    await politicsPage.clickPlaceBetsButton();
    await politicsPage.clickConfirmBetsButton();

    console.log(`Bet placed and confirmed for ${candidateName} with odds ${odds} and stake ${stake}.`);
  } catch (error) {
    console.error(`Error placing bet: ${error}`);
    throw error;
  }
});

Then('an error message should be displayed indicating insufficient funds', async function () {
  // Capture and log the error message
  const errorMessage = await politicsPage.getErrorMessage();
  console.log(`Received error message: ${errorMessage}`);

  // Verify the error message contains the expected text
  const expectedSubstrings = ["You do not have", "Deposit now"];
  const containsExpectedMessage = expectedSubstrings.some(substring => errorMessage.includes(substring));

  if (!containsExpectedMessage) {
    throw new Error(`Expected error message to contain one of the following: ${expectedSubstrings.join(', ')}, but received: ${errorMessage}`);
  }

  expect(containsExpectedMessage).toBe(true);

  // After verifying the error message, place a back bet on Kamala Harris
  const candidateName = "Kamala Harris";
  console.log(`Placing a back bet on ${candidateName}...`);
  await politicsPage.placeBackBetOnCandidate(candidateName);

  // Finally, cancel all selections to clean up the betslip
  console.log('Clicking "Cancel all selections" button...');
  await politicsPage.cancelAllSelections();
});

When('I enter only odds without entering a stake amount', async function () {
  const odds = '2'; 
  const candidateName = 'Donald Trump';

  console.log(`Placing a back bet on ${candidateName} and entering only odds: ${odds}`);

  await politicsPage.placeBackBetOnCandidate(candidateName);
  await politicsPage.enterOddsWithoutStake(odds);
});

Then('the "Place bets" button should not be enabled', async function () {
  await page.waitForTimeout(500); 

  const isEnabled = await politicsPage.isPlaceBetButtonEnabled();
  console.log(`Checking if "Place bets" button is enabled: ${isEnabled}`);
  
  expect(isEnabled).toBe(false);
});

When('I enter only a stake amount without entering any odds', async function () {
  const stake = '50'; 
  console.log(`Entering only stake amount: ${stake}`);
  
  await politicsPage.enterStakeWithoutOdds(stake);
});

Then('I log out from the application', async function () {
  await politicsPage.logout();

  console.log("Tearing down...");
  await takeScreenshotOnFailure(this, page);
  await closeResources(page, context, browser);
});
