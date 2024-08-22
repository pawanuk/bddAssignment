// import { Page } from 'playwright';

// export class PoliticsPage {
//   constructor(private page: Page) {}

//   async navigateToPoliticsSection() {
//     const politicsLink = this.page.locator('text=Politics');
//     await politicsLink.waitFor({ state: 'visible', timeout: 10000 });
//     await politicsLink.click();
//     await this.page.waitForLoadState('networkidle');
//   }

//   async placeBet(candidateName: string, odds: number, amount: number) {
//     // Find the candidate betslip row
//     const betslipRowLocator = this.page.locator(`.betslip__editable-bet__container:has-text("${candidateName}")`);
    
//     // Wait for the row to appear
//     await betslipRowLocator.waitFor({ state: 'visible', timeout: 10000 });

//     // Enter the stake amount
//     const stakeInputLocator = betslipRowLocator.locator('input[ng-model="$ctrl.size"]');
//     await stakeInputLocator.fill(amount.toString());

//     // Enter the odds
//     const oddsInputLocator = betslipRowLocator.locator('input[ng-model="$ctrl.price"]');
//     await oddsInputLocator.fill(odds.toString());

//     // Submit the bet
//     const placeBetButton = this.page.locator('button:has-text("Place bets")');
//     await placeBetButton.click();

//     // Wait for confirmation (or another state that indicates the bet was placed)
//     await this.page.waitForSelector('.confirmation-message', { timeout: 10000 });
//   }

//   async getDisplayedProfit(candidateName: string) {
//     // Use a more specific locator to target the betslip row containing the candidate's name
//     const betslipRowLocator = this.page.locator(`.betslip__editable-bet__container:has-text("${candidateName}")`);

//     // Wait for the betslip row to be visible
//     await betslipRowLocator.waitFor({ state: 'visible', timeout: 10000 });

//     // Find the profit element within the betslip row, ensuring it contains the '£' symbol
//     const profitLocator = betslipRowLocator.locator('span.betslip__editable-bet__cell:has-text("£")');

//     // Wait for the profit element to be visible
//     await profitLocator.waitFor({ state: 'visible', timeout: 10000 });

//     // Get the text content of the profit element
//     const profitText = await profitLocator.textContent();
    
//     // Parse the profit value, removing the '£' symbol
//     const profitValue = parseFloat(profitText?.replace('£', '').replace(',', '') || '0');

//     return profitValue;
//   }

//   async logOut() {
//     const logoutButton = this.page.locator('text=Log Out');
//     await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
//     await logoutButton.click();
//     await this.page.waitForLoadState('networkidle');
//   }

//   async tearDown() {
//     await this.page.close();
//   }
// }
