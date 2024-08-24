import { BasePage } from './BasePage';
import { BetResult } from '../types/BetResult';
import { Locator } from '@playwright/test'; 

export class PoliticsPage extends BasePage {

  private loc_politicsLink = this.page.locator('#subnav').getByRole('link', { name: 'Politics' });
  private loc_politicsAltLinks = [
    this.page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' }),
    this.page.locator('a[data-event-type-name="politics"]'),
    this.page.locator('a[href="en/politics-betting-2378961"]'),
    this.page.locator('a:has-text("Politics")')
  ];

  private locators = {
    betslip: this.page.locator('betslip-editable-bet'),
    profitLocator: (candidateName: string) => this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`),
    loc_placeBetButton: this.page.locator("//ours-button[contains(.,'Place bets')]"),
    betslipOdds: (betslip: Locator) => betslip.locator('betslip-price-ladder').getByRole('textbox'),
    betslipAmount: (betslip: Locator) => betslip.locator('betslip-size-input').getByRole('textbox'),
    logoutButton: this.page.getByRole('button', { name: 'Log Out' }),
    myAccountButton: this.page.getByText('My Account pawanuk My Betfair'),
  };

  async navigateToPoliticsSection(): Promise<void> {
    console.log("Attempting to click the Politics tab...");
    let elementFound = false;

    for (const locator of [this.loc_politicsLink, ...this.loc_politicsAltLinks]) {
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

  async addBetToBetslip(candidateName: string, odds: number, amount: number): Promise<void> {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);
    const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await candidateRow.waitFor();

    // Click the last back bet button in the candidate's row
    const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await backButton.click();
    console.log(`Clicked back bet button for candidate: ${candidateName}`);

    // Wait for the betslip to be visible
    await this.page.waitForSelector('betslip-editable-bet');

    // Locate the corresponding betslip entry
    const betslip = this.locators.betslip.filter({ hasText: `${candidateName} £` });
    
    // Fill in the odds and stake in the betslip
    await this.locators.betslipOdds(betslip).fill(odds.toString());
    await this.locators.betslipAmount(betslip).fill(amount.toString());

    console.log(`Bet added to betslip for ${candidateName} with odds ${odds} and stake ${amount}`);
  }

  async getDisplayedProfit(candidateName: string): Promise<number> {
    const profitLocator = this.locators.profitLocator(candidateName);
    const profitText = await profitLocator.textContent();

    if (profitText === null) {
      throw new Error(`Profit text for ${candidateName} was not found.`);
    }

    console.log(`Using locator for profit: ${profitLocator}`);
    return parseFloat(profitText.replace(/[^0-9.-]+/g, ""));
  }

  async logout(): Promise<void> {
    console.log("Logging out...");
    await this.locators.myAccountButton.click();

    const locators = [this.locators.logoutButton, this.page.locator('button:has-text("Log Out")')];
    let logoutButton;
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
