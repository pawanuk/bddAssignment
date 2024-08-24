// import { Given, When, Then } from '@cucumber/cucumber';
// import { PoliticsPage } from '../../pages/PoliticsPage';
// import { expect } from '@playwright/test';

// let politicsPage: PoliticsPage;

// Given('I am logged in to Betfair', async function() {
//   politicsPage = new PoliticsPage(this.page);
//   await politicsPage.login(process.env.BETFAIR_USERNAME!, process.env.BETFAIR_PASSWORD!);
// });

// When('I place a bet on {string} with odds {string} and a stake of {string}', async function(candidate: string, odds: string, stake: string) {
//   await politicsPage.placeBet(candidate, parseFloat(odds), parseFloat(stake));
// });

// Then('an error message should be displayed indicating insufficient funds', async function() {
//   const errorMessage = await politicsPage.getErrorMessage();
//   expect(errorMessage).toContain('insufficient funds');
// });
