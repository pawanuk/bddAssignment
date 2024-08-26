// import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
// import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
// import { ENV } from '../../utils/env';
// import { LoginPage } from '../../pages/LoginPage';
// import { PoliticsPage } from '../../pages/PoliticsPage';
// import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
// import { BetResult } from '../../types/BetResult';

// let browser: Browser;
// let context: BrowserContext;
// let page: Page;
// let loginPage: LoginPage;
// let politicsPage: PoliticsPage;

// Before(async function () {
//   console.log("Preparing test environment...");

//   await cleanDirectories(); // Clean screenshots and videos directories

//   browser = await chromium.launch({
//     headless: process.env.DOCKER_ENV === 'true',
//   });

//   context = await browser.newContext({
//     storageState: 'auth.json',
//     recordVideo: { dir: 'videos/', size: { width: 1280, height: 1024 } }
//   });

//   page = await context.newPage();
//   loginPage = new LoginPage(page);
//   politicsPage = new PoliticsPage(page);
//   console.log("Browser launched and new page created.");
// });

// After(async function (scenario) {
//   console.log("Tearing down...");
//   await takeScreenshotOnFailure(scenario, page); // Take screenshot if scenario fails
//   await closeResources(page, context, browser); // Close page, context, and browser
// });

// Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
//   await loginPage.login(ENV.username!, ENV.password!);
// });

// When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
//   await politicsPage.navigateToPoliticsSection();
// });

// Then('I place a bet on the following candidates:', async function (dataTable) {
//   type CandidateRow = { candidate: string }; // Define the type of each row
//   const candidates = dataTable.hashes().map((row: CandidateRow) => row.candidate);
//   const betResults = await politicsPage.placeBetsOnCandidates(candidates);
//   this.betResults = betResults;
// });

// Then('I log out from the application', async function () {
//   await politicsPage.logout();
// });

// // Edge case scenarios
// Given('I am logged in to Betfair application', async function() {
//   await loginPage.login(ENV.username!, ENV.password!);
// });

// When('I place a bet on "Donald Trump" with odds "2" and a stake of "123456789"', async function () {
//   await politicsPage.placeFixedBetOnTrump(2, 123456789);
// });

// Then('an error message should be displayed indicating insufficient funds', async function() {
//   const errorMessage = await politicsPage.getErrorMessage();
//   if (errorMessage) {
//     console.log(`Error message displayed: ${errorMessage}`);
//   } else {
//     throw new Error("Expected error message indicating insufficient funds, but none was found.");
//   }
// });

// When('I enter only odds without entering a stake amount', async function () {
//   await politicsPage.enterOddsWithoutStake("2"); // Example odds
// });

// When('I enter only a stake amount without entering any odds', async function () {
//   await politicsPage.enterStakeWithoutOdds("100"); // Example stake
// });

// When('I place a bet on "Donald Trump" with odds "Ten" and stake "100"', async function () {
//   await politicsPage.placeBet("Donald Trump", NaN, 100); // Passing NaN to simulate non-numeric odds
// });

// When('I place a bet on "Donald Trump" with odds "1" and a stake of "10"', async function () {
//   await politicsPage.placeBet("Donald Trump", 1, 10);
// });

// Then('the "Place bets" button should not be enabled', async function () {
//   const isButtonEnabled = await politicsPage.isPlaceBetButtonEnabled();
//   if (isButtonEnabled) {
//     throw new Error('Expected "Place bets" button to be disabled, but it is enabled.');
//   }
// });

// Then('the system should not allow entering non-numeric values', async function () {
//   const oddsValue = await politicsPage.getOddsValue();
//   if (!isNaN(Number(oddsValue))) {
//     throw new Error('Expected non-numeric odds input to be prevented, but it was allowed.');
//   }
// });

// Then('it should display "The minimum odds are 1.01. Your odds have been updated accordingly."', async function () {
//   const errorMessage = await politicsPage.getErrorMessage();
//   if (!errorMessage.includes('The minimum odds are 1.01')) {
//     throw new Error('Expected error message indicating minimum odds, but found none.');
//   }
// });
