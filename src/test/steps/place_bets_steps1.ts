// import { Given, When, Then, After } from '@cucumber/cucumber';
// import { Browser, BrowserContext, Page, chromium ,expect} from '@playwright/test';
// import { LoginPage } from '../../pages/LoginPage';
// import { PoliticsPage } from '../../pages/PoliticsPage';
// import { cleanDirectories, takeScreenshotOnFailure, closeResources } from '../../utils/testHelpers';
// import { BetResult } from '../../types/BetResult';

// let browser: Browser;
// let context: BrowserContext;
// let page: Page;
// let loginPage: LoginPage;
// let politicsPage: PoliticsPage;

// // After(async function (scenario) {
// //   console.log("Tearing down...");
  
// //   // Take a screenshot if the scenario failed
// //   await takeScreenshotOnFailure(scenario, page); 
  
// //   // Close page, context, and browser
// //   await closeResources(page, context, browser); 
// // });

// Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
//   console.log("Setting up browser and context...");

//   browser = await chromium.launch({
//     headless: false, // Set to false for better debugging visuals
//   });

//   context = await browser.newContext({
//     recordVideo: { dir: 'videos/', size: { width: 1280, height: 1024 } }
//   });

//   page = await context.newPage();
//   loginPage = new LoginPage(page);
//   politicsPage = new PoliticsPage(page);

//   console.log("Logging in to Betfair...");

//   const username = 'pawanuk';
//   const password = 'Pawankumar12';

//   await loginPage.login(username, password);

//   console.log("Login completed.");
// });

// When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
//   await politicsPage.navigateToPoliticsSection();
// });

// Then('I place a bet on the following candidates:',{ timeout: 60000 }, async function (dataTable) {
//   type CandidateRow = { candidate: string }; // Define the type of each row
//   const candidates = dataTable.hashes().map((row: CandidateRow) => row.candidate);
  
//   // Place bets on all candidates
//   const betResults = await politicsPage.placeBetsOnCandidates(candidates);
//   this.betResults = betResults;
  
//   // Verify the profits after placing all bets
//   const scenarioPassed = await politicsPage.verifyBets(betResults);
//   if (!scenarioPassed) {
//     throw new Error("Profit verification failed for one or more candidates.");
//   }
//   await politicsPage.cancelAllSelections();
//   console.log("All selections canceled.");
// });

// When('I place a bet on {string} with odds {string} and a stake of {string}', async function (candidateName: string, odds: string, stake: string) {
//   console.log(`Placing a bet on ${candidateName} with odds ${odds} and stake ${stake}`);

//   try {
//     // Step 1: Place the bet using the provided candidate name, odds, and stake
//     await politicsPage.placeBet(candidateName, parseFloat(odds), parseFloat(stake));

//     // Step 2: Click "Place bets" button
//     await politicsPage.clickPlaceBetsButton();

//     // Step 3: Click "Confirm bets" button
//     await politicsPage.clickConfirmBetsButton();

//     console.log(`Bet placed and confirmed for ${candidateName} with odds ${odds} and stake ${stake}.`);
    
//   } catch (error) {
//     console.error(`Error placing bet: ${error}`);
//     throw error;
//   }
// });


// Then('an error message should be displayed indicating insufficient funds', async function () {
//   const errorMessage = await politicsPage.getErrorMessage();
//   console.log(`Received error message: ${errorMessage}`);

//   // Check that the error message contains either "You do not have" or "Deposit now"
//   const expectedSubstrings = ["You do not have", "Deposit now"];
//   const containsExpectedMessage = expectedSubstrings.some(substring => errorMessage.includes(substring));

//   if (!containsExpectedMessage) {
//     throw new Error(`Expected error message to contain one of the following: ${expectedSubstrings.join(', ')}, but received: ${errorMessage}`);
//   }

//   expect(containsExpectedMessage).toBe(true);
// });

// When('I enter only odds without entering a stake amount', async function () {
//   const odds = '2';  // You can parameterize this if needed
//   const candidateName = 'Donald Trump';

//   console.log(`Placing a back bet on ${candidateName} and entering only odds: ${odds}`);

//   // Place the back bet on Donald Trump
//   await politicsPage.placeBackBetOnCandidate(candidateName);

//   // Enter only the odds without entering a stake amount
//   await politicsPage.enterOddsWithoutStake(odds);
// });


// Then('the "Place bets" button should not be enabled', async function () {
//   // Wait for a short period to ensure the page has updated the button's state
//   await page.waitForTimeout(500);  // Wait for 500 milliseconds

//   const isEnabled = await politicsPage.isPlaceBetButtonEnabled();
//   console.log(`Checking if "Place bets" button is enabled: ${isEnabled}`);
  
//   expect(isEnabled).toBe(false);
// });

// When('I enter only a stake amount without entering any odds', async function () {
//   const stake = '50';  // You can parameterize this if needed
//   console.log(`Entering only stake amount: ${stake}`);
  
//   await politicsPage.enterStakeWithoutOdds(stake);
// });

// Then('I log out from the application', async function () {
//   await politicsPage.logout();

//   // After logout, close the resources
//   console.log("Tearing down...");
//   await takeScreenshotOnFailure(this, page);
//   await closeResources(page, context, browser);
// });
