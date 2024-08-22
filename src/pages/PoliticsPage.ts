import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class PoliticsPage extends BasePage {

  async navigateToPoliticsSection() {
    console.log("Attempting to click the Politics tab...");

    const locators = [
      this.page.locator('#subnav').getByRole('link', { name: 'Politics' }),
      this.page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' }),
      this.page.locator('a[data-event-type-name="politics"]'),
      this.page.locator('a[href="en/politics-betting-2378961"]'),
      this.page.locator('a:has-text("Politics")')
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

  async placeBet(candidateName: string, odds: string, amount: string) {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);

    const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await candidateRow.waitFor();

    const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await backButton.click();

    await this.page.waitForSelector('betslip-editable-bet');

    const betslip = this.page.locator('betslip-editable-bet').filter({ hasText: `${candidateName} £` });
    const textBoxLocator = betslip.locator('betslip-price-ladder').getByRole('textbox');
    const sizeInputLocator = betslip.locator('betslip-size-input').getByRole('textbox');

    // Verify that the odds and amount are entered correctly
    await textBoxLocator.fill(odds);
    await sizeInputLocator.fill(amount);

    const enteredOdds = await textBoxLocator.inputValue();
    const enteredAmount = await sizeInputLocator.inputValue();

    expect(enteredOdds).toBe(odds);
    expect(enteredAmount).toBe(amount);

    console.log(`Bet added to betslip for ${candidateName}.`);

    // Calculate expected profit and verify it
    const expectedProfit = (parseFloat(odds) - 1) * parseFloat(amount);
    const displayedProfit = await this.getDisplayedProfit(candidateName);

    // Verify profit ignoring decimals
    expect(Math.floor(displayedProfit)).toBe(Math.floor(expectedProfit));

    console.log(`Expected profit: £${expectedProfit.toFixed(2)}, Displayed profit: £${displayedProfit.toFixed(2)}`);
    await this.page.waitForTimeout(5000); // Wait for 5 seconds between bets
  }

  async getDisplayedProfit(candidateName: string): Promise<number> {
    // Use a more specific locator to target the betslip row containing the candidate
    const betslipRowLocator = this.page.locator(`.betslip-editable-bet:has-text("${candidateName}")`);

    // Wait for the betslip row to be visible, indicating the bet details are loaded
    await betslipRowLocator.waitFor({ state: 'visible' });

    // Find the profit element within that row, ensuring it contains the '£' symbol
    const profitLocator = betslipRowLocator.locator('span.betslip__editable-bet__cell:has-text("£")'); 

    // Wait for the profit element to be visible
    await profitLocator.waitFor({ state: 'visible' });

    const profitText = await profitLocator.textContent();
    const profitValue = parseFloat(profitText?.replace('£', '') || '0');
    return profitValue;
  }

  async logout() {
    console.log("Logging out...");

    // Open the My Account menu to access the Log Out button
    await this.page.getByText('My Account pawanuk My Betfair').click();

    const locators = [
      this.page.getByRole('button', { name: 'Log Out' }),
      this.page.locator('button:has-text("Log Out")')
    ];

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
