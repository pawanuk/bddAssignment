import { BasePage } from './BasePage';

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

  async placeBet(candidateName: string, odds: number, amount: number) {
    console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);
    const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await candidateRow.waitFor();
    const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await backButton.click();
    await this.page.waitForSelector('betslip-editable-bet');
    const betslip = this.page.locator('betslip-editable-bet').filter({ hasText: `${candidateName} £` });
    const textBoxLocator = betslip.locator('betslip-price-ladder').getByRole('textbox');
    const sizeInputLocator = betslip.locator('betslip-size-input').getByRole('textbox');
    await textBoxLocator.fill(odds.toString());
    await sizeInputLocator.fill(amount.toString());
    console.log(`Bet added to betslip for ${candidateName}.`);
  }

  async getDisplayedProfit(candidateName: string, betIndex: number): Promise<number> {
        const profitLocator = this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`);

    const profitText = await profitLocator.textContent();
    console.log(`Using locator for profit: ${profitLocator}`);
    return parseFloat(profitText!.replace(/[^0-9.-]+/g, ""));
  }

  async logout() {
    console.log("Logging out...");
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