import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class PoliticsPage extends BasePage {

  // Locators
  private loc_lnkPoliticsTab = this.page.locator('#subnav').getByRole('link', { name: 'Politics' });
  private loc_lnkPoliticsSubNavLink = this.page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' });
  private loc_lnkPoliticsEventType = this.page.locator('a[data-event-type-name="politics"]');
  private loc_lnkPoliticsHref = this.page.locator('a[href="en/politics-betting-2378961"]');
  private loc_lnkPoliticsHasText = this.page.locator('a:has-text("Politics")');

  async navigateToPoliticsSection() {
    console.log("Attempting to click the Politics tab...");

    const locators = [
      this.loc_lnkPoliticsTab,
      this.loc_lnkPoliticsSubNavLink,
      this.loc_lnkPoliticsEventType,
      this.loc_lnkPoliticsHref,
      this.loc_lnkPoliticsHasText
    ];

    let elementFound = false;

    for (const locator of locators) {
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

  async placeBet(candidateName: string, odds: number, amount: number) {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);

    const loc_candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await loc_candidateRow.waitFor();

    const loc_btnBack = loc_candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await loc_btnBack.click();

    await this.page.waitForSelector('betslip-editable-bet');

    const loc_betslip = this.page.locator('betslip-editable-bet').filter({ hasText: `${candidateName} £` });
    const loc_txtOdds = loc_betslip.locator('betslip-price-ladder').getByRole('textbox');
    const loc_txtAmount = loc_betslip.locator('betslip-size-input').getByRole('textbox');

    await loc_txtOdds.fill(odds.toString());
    await loc_txtAmount.fill(amount.toString());

    // Verify the entered odds and amount
    const enteredOdds = await loc_txtOdds.inputValue();
    const enteredAmount = await loc_txtAmount.inputValue();

    if (enteredOdds !== odds.toString() || enteredAmount !== amount.toString()) {
      throw new Error(`Verification failed: Expected odds: ${odds}, Actual odds: ${enteredOdds}, Expected amount: ${amount}, Actual amount: ${enteredAmount}`);
    }

    // Calculate the expected profit and verify it
    const expectedProfit = (parseFloat(enteredOdds) - 1) * parseFloat(enteredAmount);
    const actualProfit = await this.getDisplayedProfit(candidateName);

    console.log(`Expected profit calculated: ${expectedProfit}, Displayed profit: ${actualProfit}`);

    if (Math.abs(actualProfit - expectedProfit) > 0.01) {
      throw new Error(`Profit verification failed: Expected profit: ${expectedProfit}, Displayed profit: ${actualProfit}`);
    }

    console.log(`Bet added to betslip for ${candidateName}.`);
    await this.page.waitForTimeout(5000); // Wait for 5 seconds between bets
  }

  async getDisplayedProfit(candidateName: string): Promise<number> {
    console.log(`Retrieving displayed profit for candidate: ${candidateName}`);
    const loc_profit = this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`);
    const profitText = await loc_profit.textContent();
    return parseFloat(profitText!.replace(/[^0-9.-]+/g, ""));
  }

  async logout() {
    console.log("Logging out...");

    // Open the My Account menu to access the Log Out button
    const loc_lnkMyAccount = this.page.getByText('My Account pawanuk My Betfair');
    await loc_lnkMyAccount.click();

    const loc_btnLogout = this.page.getByRole('button', { name: 'Log Out' });
    await loc_btnLogout.click();

    console.log("Logged out successfully.");
  }
}
