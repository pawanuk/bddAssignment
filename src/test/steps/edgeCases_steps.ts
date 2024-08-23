import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PoliticsPage } from '../../pages/PoliticsPage';
import { ENV } from '../../utils/env';

// Page Object Instances
let loginPage: LoginPage;
let politicsPage: PoliticsPage;

Given('I am logged in to Betfair', async function () {
  loginPage = new LoginPage(this.page);
  politicsPage = new PoliticsPage(this.page);
  await loginPage.login(ENV.username!, ENV.password!);
});

When('I place a bet on {string} with odds {string} and stake {string}', async function (candidateName: string, odds: string, stake: string) {
  await politicsPage.placeBet(candidateName, parseFloat(odds), parseFloat(stake));
});

When('I enter only odds without entering a stake amount', async function () {
  await politicsPage.enterOddsWithoutStake('2'); // Replace '2' with the desired odds
});

When('I enter only a stake amount without entering any odds', async function () {
  await politicsPage.enterStakeWithoutOdds('100'); // Replace '100' with the desired stake
});

Then('an error message should be displayed indicating insufficient funds', async function () {
  const errorMessage = await politicsPage.getErrorMessage();
  expect(errorMessage).toContain('insufficient funds'); // Adjust the expected message based on actual UI
});

Then('the "Place bets" button should not be enabled', async function () {
  const isButtonEnabled = await politicsPage.isPlaceBetButtonEnabled();
  expect(isButtonEnabled).toBeFalsy();
});

Then('the system should not allow entering non-numeric values', async function () {
  const oddsValue = await politicsPage.getOddsValue();
  expect(isNaN(parseFloat(oddsValue))).toBeTruthy(); // Check that the odds are not a number
});

Then('it should display {string}', async function (expectedMessage: string) {
  const actualMessage = await politicsPage.getMinimumOddsMessage();
  expect(actualMessage).toBe(expectedMessage);
});

//confirm bet  //*[text()='Confirm bets']
//error meage  p.error-message__statement

//  //highlighted-button[@class='potentials-footer__action']//ours-button
// //ours-button[contains(.,'Place bets')]