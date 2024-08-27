import { BasePage } from './BasePage';
import { BetResult } from '../types/BetResult';
import { Locator } from '@playwright/test';

export class PoliticsPage extends BasePage {
  // Private selectors object containing all locators
  private locators  = {
    // URLs
    politicsPageURL: process.env.POLITICS_PAGE_URL || 'https://www.betfair.com/exchange/plus/en/politics-betting-2378961',
    loginPageURL: 'https://www.betfair.com/login',

    // Buttons and inputs
    submitButton: 'button[type="submit"]',
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    placeBetButton: "//highlighted-button[contains(@class, 'potentials-footer__action')]//button[@type='submit' and not(@disabled)]",
    confirmBetButton: "//ours-button[contains(.,'Confirm bets')]",
    logoutButton: 'button:has-text("Log Out")',
    myAccountButton: 'text=My Account pawanuk My Betfair',
    acceptCookiesButton: 'button:has-text("Accept Cookies")',
    cancelAllSelectionsButton: '//button[normalize-space()="Cancel all selections"]',

    // Overlays and error messages
    consentOverlay: '#onetrust-consent-sdk',
    errorMessage: 'p.error-message__statement',

    // Betslip and odds
    betslip: (candidateName: string) => `betslip-editable-bet >> text=${candidateName} £`,
    betslipOdds: 'betslip-price-ladder >> role=textbox',
    betslipAmount: 'betslip-size-input >> role=textbox',

    // Candidate row and buttons
    candidateRow: (candidateName: string) => `//h3[text()="${candidateName}"]/ancestor::tr`,
    backButton: '.bet-buttons.back-cell.last-back-cell button:has-text("£")',

    // Profit locator
    profitLocator: (candidateName: string) => `//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`,
    profitLocator1: (candidateName: string) => `//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`,
    profitLocator2: (candidateName: string) => `//span[text()="${candidateName}"]/ancestor::section[contains(@class, 'betslip__potential-bet') or contains(@class, 'betslip-editable-bet')]//span[contains(@ng-bind, '$ctrl.liabilityValue')]`,
    logoutButton1: 'button[role="button"][name="Log Out"]',
    fallbackLogoutButton: 'button:has-text("Log Out")',
  };

  async handleConsentOverlay(): Promise<void> {
    const { consentOverlay, acceptCookiesButton } = this.locators ;
    if (await this.page.locator(consentOverlay).isVisible()) {
      console.log("Consent overlay detected. Attempting to accept cookies...");
      if (await this.page.locator(acceptCookiesButton).isVisible()) {
        await this.page.locator(acceptCookiesButton).click();
        console.log("Clicked 'Accept Cookies' button.");
      } else {
        console.warn("Accept Cookies button not found. Consent overlay might block interactions.");
      }
      await this.page.locator(consentOverlay).waitFor({ state: 'hidden', timeout: 5000 });
      console.log("Consent overlay dismissed.");
    } else {
      console.log("No consent overlay detected.");
    }
  }

  async navigateToPoliticsSection(): Promise<void> {
    console.log("Navigating to Politics page...");
    await this.goto(this.locators .politicsPageURL, { waitUntil: 'networkidle' });
    console.log("Politics page loaded.");
  }

  async login(username: string, password: string): Promise<void> {
    console.log("Logging in...");
    await this.page.goto(this.locators .loginPageURL, { waitUntil: 'networkidle' });
    await this.handleConsentOverlay();
    await this.page.locator(this.locators .usernameInput).fill(username);
    await this.page.locator(this.locators .passwordInput).fill(password);
    await this.page.locator(this.locators .submitButton).click();
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  async enterOddsWithoutStake(odds: string): Promise<void> {
    console.log(`Entering odds: ${odds}`);
    await this.page.locator(this.locators .betslipOdds).fill(odds);
  }

  async placeBackBetOnCandidate(candidateName: string): Promise<void> {
    console.log(`Placing a back bet on ${candidateName}...`);
    const candidateRow = this.page.locator(this.locators .candidateRow(candidateName));
    await candidateRow.waitFor({ state: 'visible', timeout: 60000 });

    const backButton = candidateRow.locator(this.locators .backButton);
    await backButton.click();

    console.log(`Back bet placed on ${candidateName}.`);
  }

  async enterStakeWithoutOdds(stake: string): Promise<void> {
    console.log(`Entering stake: ${stake}`);
    await this.page.locator(this.locators .betslipOdds).fill('');
    await this.page.waitForTimeout(500);
    await this.page.locator(this.locators .betslipAmount).fill(stake);
    await this.page.waitForTimeout(500);

    const isEnabled = await this.isPlaceBetButtonEnabled();
    console.log(`After entering stake, is "Place bets" button enabled? ${isEnabled}`);
  }

  async cancelAllSelections(): Promise<void> {
    console.log('Clicking "Cancel all selections" button...');
    await this.page.locator(this.locators .cancelAllSelectionsButton).click();
  }

  async getErrorMessage(): Promise<string> {
    const errorMessage = await this.page.locator(this.locators .errorMessage).textContent();
    console.log(`Error message: ${errorMessage}`);
    return errorMessage || '';
  }

  async isPlaceBetButtonEnabled(): Promise<boolean> {
    console.log('Checking if "Place bets" button is enabled...');
    const isEnabled = await this.page.locator(this.locators .placeBetButton).isVisible();
    console.log(`Is place bet button enabled? ${isEnabled}`);
    return isEnabled;
  }

  async getOddsValue(): Promise<string> {
    const oddsValue = await this.page.locator(this.locators .betslipOdds).inputValue();
    console.log(`Odds value: ${oddsValue}`);
    return oddsValue;
  }

  async placeBetsOnCandidates(candidates: string[]): Promise<BetResult[]> {
    const betResults: BetResult[] = [];

    for (const candidateName of candidates) {
      const randomOdds = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
      const randomAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
      const expectedProfit = (randomOdds - 1) * randomAmount;

      try {
        await this.placeBet(candidateName, randomOdds, randomAmount);
        betResults.push({ 
          name: candidateName, 
          odds: randomOdds, 
          amount: randomAmount, 
          profit: expectedProfit,
        });
      } catch (error) {
        console.error(`Error placing bet for ${candidateName}: ${error}`);
        betResults.push({ 
          name: candidateName, 
          odds: randomOdds, 
          amount: randomAmount, 
          profit: expectedProfit,
        });
      }
    }

    return betResults;
  }

  async placeBet(candidateName: string, odds: number, amount: number): Promise<void> {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);
    const candidateRow = this.page.locator(this.locators .candidateRow(candidateName));
    await candidateRow.waitFor();

    const backButton = candidateRow.locator(this.locators .backButton);
    await backButton.click();

    const betslip = this.page.locator(this.locators .betslip(candidateName));
    await betslip.locator(this.locators .betslipOdds).fill(odds.toString());
    await betslip.locator(this.locators .betslipAmount).fill(amount.toString());

    console.log(`Bet added to betslip for ${candidateName}.`);
  }

  async clickPlaceBetsButton(): Promise<void> {
    console.log('Clicking "Place bets" button...');
    await this.page.locator(this.locators .placeBetButton).waitFor({ state: 'visible', timeout: 60000 });
    await this.page.locator(this.locators .placeBetButton).click();
    console.log('Clicked "Place bets" button.');
  }

  async clickConfirmBetsButton(): Promise<void> {
    console.log('Clicking "Confirm bets" button...');
    await this.page.locator(this.locators .confirmBetButton).waitFor({ state: 'visible', timeout: 60000 });
    await this.page.locator(this.locators .confirmBetButton).click();
    console.log('Clicked "Confirm bets" button.');
  }

  async verifyBets(betResults: BetResult[]): Promise<boolean> {
    let scenarioPassed = true;

    for (const result of betResults) {
      const actualProfit = await this.getDisplayedProfit(result.name);
      console.log(`Verifying bet for ${result.name}`);

      console.log(`Candidate: "${result.name}", Odds: "${result.odds}", Stake: "${result.amount}", ExpectedProfit: "${result.profit}", ActualProfit: "${actualProfit}"`);

      if (result.profit !== actualProfit) {
        console.error(`Verification failed for ${result.name}: Expected profit: ${result.profit}, Actual profit: ${actualProfit}`);
        scenarioPassed = false;
      }
    }

    return scenarioPassed;
  }
  async getDisplayedProfit(candidateName: string): Promise<number | undefined> {
    const profitLocator1 = this.page.locator(this.locators.profitLocator1(candidateName));
    const profitLocator2 = this.page.locator(this.locators.profitLocator2(candidateName));
  
    try {
      await profitLocator1.waitFor({ state: 'visible', timeout: 60000 });
      const profitText1 = await profitLocator1.textContent();
      if (profitText1) {
        console.log(`Profit for ${candidateName} found using first locator: ${profitText1}`);
        return parseFloat(profitText1.replace(/[^0-9.-]+/g, ""));
      }
    } catch (error1) {
      console.warn(`First locator failed for ${candidateName}: ${(error1 as Error).message}`);
    }
  
    try {
      await profitLocator2.waitFor({ state: 'visible', timeout: 60000 });
      const profitText2 = await profitLocator2.textContent();
      if (profitText2) {
        console.log(`Profit for ${candidateName} found using second locator: ${profitText2}`);
        return parseFloat(profitText2.replace(/[^0-9.-]+/g, ""));
      }
    } catch (error2) {
      console.error(`Could not find profit for ${candidateName} using any locator. Error: ${(error2 as Error).message}`);
      return undefined;
    }
  
    return undefined;
  }

  async logout(): Promise<void> {
    console.log("Logging out...");
    await this.page.locator(this.locators.myAccountButton).click();

    let logoutButton: Locator | undefined;
    const locators = [this.page.locator(this.locators.logoutButton), this.page.locator(this.locators.fallbackLogoutButton)];

    for (const locator of locators) {
      try {
        logoutButton = locator.first();
        if (await logoutButton.isVisible()) {
          console.log('Log Out button found and visible.');
          await logoutButton.click();
          break;
        }
      } catch (error) {
        console.log('Locator failed, trying next one');
        continue;
      }
    }

    if (!logoutButton) {
      throw new Error('Log Out button not found using any of the locators');
    }

    // Ensure proper teardown after logout
    console.log("Tearing down after logout...");
    await this.page.close();
  }
}