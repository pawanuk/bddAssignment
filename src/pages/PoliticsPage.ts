import { BasePage } from './BasePage';
import { BetResult } from '../types/BetResult';
import { Locator } from '@playwright/test';

export class PoliticsPage extends BasePage {
  private pageElements = {
    politicsLinks: [
      this.page.locator('#subnav').getByRole('link', { name: 'Politics' }),
      this.page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' }),
      this.page.locator('a[data-event-type-name="politics"]'),
      this.page.locator('a[href="en/politics-betting-2378961"]'),
      this.page.locator('a:has-text("Politics")')
    ],
    placeBetButton: this.page.locator("//ours-button[contains(.,'Place bets')]"),
    logoutButton: this.page.getByRole('button', { name: 'Log Out' }),
    myAccountButton: this.page.getByText('My Account pawanuk My Betfair'),
    betslip: (candidateName: string) => this.page.locator(`betslip-editable-bet`).filter({ hasText: `${candidateName} £` }),
    betslipOdds: (betslip: Locator) => betslip.locator('betslip-price-ladder').getByRole('textbox'),
    betslipAmount: (betslip: Locator) => betslip.locator('betslip-size-input').getByRole('textbox'),
    profitLocator: (candidateName: string) => this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`),
    errorMessage: this.page.locator('p.error-message__statement')  // Added error message locator
  };

  async navigateToPoliticsSection(): Promise<void> {
    console.log("Attempting to click the Politics tab...");
    let elementFound = false;

    for (const locator of this.pageElements.politicsLinks) {
      try {
        const element = await locator.first();
        if (await element.isVisible()) {
          console.log('Politics link found and visible.');
          await element.click();
          elementFound = true;
          break;
        }
      } catch (error) {
        console.log('Locator failed, trying next one...');
        continue;
      }
    }

    if (!elementFound) {
      console.log('Politics link not found or not clickable, navigating directly to the URL...');
      await this.goto('https://www.betfair.com/exchange/plus/en/politics-betting-2378961', { waitUntil: 'networkidle' });
    } else {
      console.log("Waiting for the Politics page to load...");
      await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    }

    console.log("Politics page loaded.");
  }

  async login(username: string, password: string): Promise<void> {
    console.log("Logging in...");
    // Assuming there's a login page or modal to handle login
    await this.page.goto('https://www.betfair.com/login', { waitUntil: 'networkidle' });
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle' });
  }

  async enterOddsWithoutStake(odds: string): Promise<void> {
    console.log(`Entering odds: ${odds}`);
    const betslip = this.page.locator('betslip-editable-bet');
    await this.pageElements.betslipOdds(betslip).fill(odds);
  }

  async enterStakeWithoutOdds(stake: string): Promise<void> {
    console.log(`Entering stake: ${stake}`);
    const betslip = this.page.locator('betslip-editable-bet');
    await this.pageElements.betslipAmount(betslip).fill(stake);
  }

  async getErrorMessage(): Promise<string> {
    const errorMessage = await this.pageElements.errorMessage.textContent();
    console.log(`Error message: ${errorMessage}`);
    return errorMessage || '';  // Return an empty string if the error message is null
  }

  async isPlaceBetButtonEnabled(): Promise<boolean> {
    const isEnabled = await this.pageElements.placeBetButton.isEnabled();
    console.log(`Is place bet button enabled? ${isEnabled}`);
    return isEnabled;
  }

  async getOddsValue(): Promise<string> {
    const betslip = this.page.locator('betslip-editable-bet');
    const oddsValue = await this.pageElements.betslipOdds(betslip).inputValue();
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
    
    const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await candidateRow.waitFor();

    const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await backButton.click();

    const betslip = this.pageElements.betslip(candidateName);
    await this.pageElements.betslipOdds(betslip).fill(odds.toString());
    await this.pageElements.betslipAmount(betslip).fill(amount.toString());

    console.log(`Bet added to betslip for ${candidateName}.`);
  }

  async verifyBets(betResults: BetResult[]): Promise<boolean> {
    let scenarioPassed = true;

    for (const result of betResults) {
      const actualProfit = await this.getDisplayedProfit(result.name);
      console.log(`Verifying bet for ${result.name}`);

      if (result.profit !== actualProfit) {
        console.error(`Verification failed for ${result.name}: Expected profit: ${result.profit}, Actual profit: ${actualProfit}`);
        scenarioPassed = false;
      }
    }

    return scenarioPassed;
  }

  async getDisplayedProfit(candidateName: string): Promise<number | undefined> {
    const profitLocator = this.pageElements.profitLocator(candidateName);

    try {
      await profitLocator.waitFor({ state: 'visible', timeout: 5000 });
      const profitText = await profitLocator.textContent();
      if (!profitText) {
        console.error(`Profit text for ${candidateName} was not found.`);
        return undefined;
      }
      console.log(`Profit for ${candidateName}: ${profitText}`);
      return parseFloat(profitText.replace(/[^0-9.-]+/g, ""));
    } catch (error) {
      console.error(`Could not find profit for ${candidateName}. Error: ${error}`);
      return undefined;
    }
  }

  async logout(): Promise<void> {
    console.log("Logging out...");
    await this.pageElements.myAccountButton.click();

    let logoutButton;
    const locators = [this.pageElements.logoutButton, this.page.locator('button:has-text("Log Out")')];

    for (const locator of locators) {
      try {
        logoutButton = await locator.first();
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
  }
}
