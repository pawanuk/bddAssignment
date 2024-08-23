import { Given, When, Then } from '@cucumber/cucumber';
import { PoliticsPage } from '../../pages/PoliticsPage';

let politicsPage: PoliticsPage;

Given('I am logged in to Betfair', async function () {
  // Implement the login logic if not already handled in place_bets_steps.ts
});

When('I place a bet on {string} with odds {string} and a stake of {string}', async function (candidateName, odds, stake) {
  await politicsPage.placeBet(candidateName, parseFloat(odds), parseFloat(stake));
});

When('I enter only odds without entering a stake amount', async function () {
  await politicsPage.enterOddsWithoutStake('5'); // Replace '5' with the desired odds
});

When('I enter only a stake amount without entering any odds', async function () {
  await politicsPage.enterStakeWithoutOdds('100'); // Replace '100' with the desired stake
});

Then('an error message should be displayed indicating insufficient funds', async function () {
  const errorMessage = await politicsPage.getErrorMessage();
  if (!errorMessage.includes('Insufficient funds')) {
    throw new Error(`Expected an error message indicating insufficient funds, but got: ${errorMessage}`);
  }
});

Then('the "Place bets" button should not be enabled', async function () {
  const isEnabled = await politicsPage.isPlaceBetButtonEnabled();
  if (isEnabled) {
    throw new Error('Place bets button is enabled when it should not be.');
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
