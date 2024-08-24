import { BasePage } from './BasePage';
import { BetResult } from '../types/BetResult';
import { Locator, Page } from '@playwright/test'; 

// Define an interface for pageElements
interface PageElements {
  politicsLinks: Locator[];
  placeBetButton: Locator;
  logoutButton: Locator;
  myAccountButton: Locator;
  betslip: (candidateName: string) => Locator;
  betslipOdds: (betslip: Locator) => Locator;
  betslipAmount: (betslip: Locator) => Locator;
  profitLocator: (candidateName: string) => Locator;
}

export class PoliticsPage extends BasePage {
  private pageElements: PageElements = {
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

  async placeBet(candidateName: string, odds: number, amount: number): Promise<void> {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);

    try {
      const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
      await candidateRow.waitFor();

      const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
      await backButton.click();

      await this.page.waitForSelector('betslip-editable-bet');

      const betslip = this.pageElements.betslip(candidateName);
      await this.pageElements.betslipOdds(betslip).fill(odds.toString());
      await this.pageElements.betslipAmount(betslip).fill(amount.toString());

      console.log(`Bet added to betslip for ${candidateName}.`);
    } catch (error) {
      console.error(`Error placing bet for ${candidateName}: ${error}`);
    }
  }

  async getDisplayedProfit(candidateName: string): Promise<number | undefined> {
    const profitLocator = this.pageElements.profitLocator(candidateName);

    try {
      await profitLocator.waitFor({ state: 'visible', timeout: 5000 }); // Explicit wait
      const profitText = await profitLocator.textContent();
      console.log(`Profit for ${candidateName}: ${profitText}`);
      return parseFloat(profitText!.replace(/[^0-9.-]+/g, ""));
    } catch (error) {
      console.error(`Could not find profit for ${candidateName}. Error: ${error}`);
      return undefined; // Graceful error handling
    }
  }

  async logout(): Promise<void> {
    console.log("Logging out...");
    await this.pageElements.myAccountButton.click();

    let logoutButton;
    for (const locator of [this.pageElements.logoutButton, this.page.locator('button:has-text("Log Out")')]) {
      try {
        logoutButton = await locator.first();
        if (await logoutButton.isVisible()) {
          console.log('Log Out button found and visible.');
          await logoutButton.click();
          break;
        }
      } catch (error) {
        console.log('Locator failed, trying next one...');
        continue;
      }
    }

    if (!logoutButton) {
      throw new Error('Log Out button not found using any of the locators');
    }
  }
}
