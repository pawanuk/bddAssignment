import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../../pages/LoginPage'; 
import { PoliticsPage } from '../../pages/PoliticsPage';
import { expect } from '@playwright/test';

let loginPage: LoginPage;
let politicsPage: PoliticsPage;

Given('I am logged in to Betfair application', async function() {
    loginPage = new LoginPage(this.page); // Initialize LoginPage
    await loginPage.login(process.env.BETFAIR_USERNAME!, process.env.BETFAIR_PASSWORD!); // Perform login
    politicsPage = new PoliticsPage(this.page); // Initialize PoliticsPage after login
});
  
When('I place a bet on "Donald Trump" with odds "2" and a stake of "123456789"', async function () {
    await politicsPage.placeFixedBetOnTrump(2, 123456789);
});
  
Then('an error message should be displayed indicating insufficient funds', async function() {
    const errorMessage = await politicsPage.getErrorMessage();
    expect(errorMessage).toContain('insufficient funds');
});

When('I enter only odds without entering a stake amount', async function () {
    await politicsPage.enterOddsWithoutStake("2"); // Example odds
});

When('I enter only a stake amount without entering any odds', async function () {
    await politicsPage.enterStakeWithoutOdds("100"); // Example stake
});

When('I place a bet on "Donald Trump" with odds "Ten" and stake "100"', async function () {
    await politicsPage.placeBet("Donald Trump", NaN, 100); // Passing NaN to simulate non-numeric odds
});

When('I place a bet on "Donald Trump" with odds "1" and a stake of "10"', async function () {
    await politicsPage.placeBet("Donald Trump", 1, 10);
});

Then('the "Place bets" button should not be enabled', async function () {
    const isButtonEnabled = await politicsPage.isPlaceBetButtonEnabled();
    expect(isButtonEnabled).toBeFalsy();
});

Then('the system should not allow entering non-numeric values', async function () {
    const oddsValue = await politicsPage.getOddsValue();
    expect(isNaN(Number(oddsValue))).toBe(true);
});

Then('it should display "The minimum odds are 1.01. Your odds have been updated accordingly."', async function () {
    const errorMessage = await politicsPage.getErrorMessage();
    expect(errorMessage).toContain('The minimum odds are 1.01');
});
