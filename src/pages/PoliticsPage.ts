import { BasePage } from './BasePage';

export class PoliticsPage extends BasePage {
  
  // Locators
  private loc_navPolitics = this.page.locator('#subnav').getByRole('link', { name: 'Politics' });

  async navigateToPoliticsSection() {
    console.log("Navigating to the Politics section...");
    await this.loc_navPolitics.click();
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
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
    await this.page.waitForTimeout(5000);
  }

  async getDisplayedProfit(candidateName: string): Promise<number> {
    console.log(`Retrieving displayed profit for candidate: ${candidateName}`);
    const profitLocator = this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`);
    const profitText = await profitLocator.textContent();
    return parseFloat(profitText!.replace(/[^0-9.-]+/g, ""));
  }

  async logout() {
    console.log("Logging out...");
    const loc_myAccount = this.page.getByText('My Account');
    await loc_myAccount.click();
    
    const loc_logoutButton = this.page.getByRole('button', { name: 'Log Out' });
    await loc_logoutButton.click();
    console.log("Logout successful.");
  }
}
