// import { BasePage } from './BasePage';
// import { BetResult } from '../types/BetResult';
// import { Locator } from '@playwright/test';

// export class PoliticsPage extends BasePage {
//   private pageElements = {
//     politicsLinks: [
//       this.page.locator('#subnav').getByRole('link', { name: 'Politics' }),
//       this.page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' }),
//       this.page.locator('a[data-event-type-name="politics"]'),
//       this.page.locator('a[href="en/politics-betting-2378961"]'),
//       this.page.locator('a:has-text("Politics")')
//     ],
//     placeBetButton: this.page.locator("//highlighted-button[contains(@class, 'potentials-footer__action')]//button[@type='submit' and not(@disabled)]"),
//     confirmBetButton: this.page.locator("//ours-button[contains(.,'Confirm bets')]"),
//     logoutButton: this.page.getByRole('button', { name: 'Log Out' }),
//     myAccountButton: this.page.getByText('My Account pawanuk My Betfair'),
//     betslip: (candidateName: string) => this.page.locator(`betslip-editable-bet`).filter({ hasText: `${candidateName} £` }),
//     betslipOdds: (betslip: Locator) => betslip.locator('betslip-price-ladder').getByRole('textbox'),
//     betslipAmount: (betslip: Locator) => betslip.locator('betslip-size-input').getByRole('textbox'),
//     profitLocator: (candidateName: string) => this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`),
//     errorMessage: this.page.locator('p.error-message__statement'),
//     cancelAllSelectionsButton: this.page.locator('//button[normalize-space()="Cancel all selections"]'),
//     consentOverlay: this.page.locator('#onetrust-consent-sdk'), // Locator for consent overlay
//     acceptCookiesButton: this.page.locator('button:has-text("Accept Cookies")') // Locator for accept cookies button
//   };

//   async handleConsentOverlay(): Promise<void> {
//     const consentOverlay = this.pageElements.consentOverlay;
//     const acceptCookiesButton = this.pageElements.acceptCookiesButton;

//     if (await consentOverlay.isVisible()) {
//       console.log("Consent overlay detected. Attempting to accept cookies...");
//       if (await acceptCookiesButton.isVisible()) {
//         await acceptCookiesButton.click();
//         console.log("Clicked 'Accept Cookies' button.");
//       } else {
//         console.warn("Accept Cookies button not found. Consent overlay might block interactions.");
//       }
//       await consentOverlay.waitFor({ state: 'hidden', timeout: 5000 });
//       console.log("Consent overlay dismissed.");
//     } else {
//       console.log("No consent overlay detected.");
//     }
//   }

//   async navigateToPoliticsSection(): Promise<void> {
//     console.log("Attempting to click the Politics tab...");
//     let elementFound = false;

//     for (const locator of this.pageElements.politicsLinks) {
//       try {
//         const element = await locator.first();
//         if (await element.isVisible()) {
//           console.log('Politics link found and visible.');
//           await element.click();
//           elementFound = true;
//           break;
//         }
//       } catch (error) {
//         console.log('Locator failed, trying next one...');
//         continue;
//       }
//     }

//     if (!elementFound) {
//       console.log('Politics link not found or not clickable, navigating directly to the URL...');
//       await this.goto('https://www.betfair.com/exchange/plus/en/politics-betting-2378961', { waitUntil: 'networkidle' });
//     } else {
//       console.log("Waiting for the Politics page to load...");
//       await this.page.waitForLoadState('networkidle', { timeout: 20000 });
//     }

//     console.log("Politics page loaded.");
//   }

//   async login(username: string, password: string): Promise<void> {
//     console.log("Logging in...");
//     await this.page.goto('https://www.betfair.com/login', { waitUntil: 'networkidle' });
//     await this.handleConsentOverlay(); // Ensure the consent overlay is handled before proceeding
//     await this.page.fill('input[name="username"]', username);
//     await this.page.fill('input[name="password"]', password);
//     await this.page.click('button[type="submit"]');
//     await this.page.waitForNavigation({ waitUntil: 'networkidle' });
//   }

//   async enterOddsWithoutStake(odds: string): Promise<void> {
//     console.log(`Entering odds: ${odds}`);
//     const betslip = this.page.locator('betslip-editable-bet');
//     await this.pageElements.betslipOdds(betslip).fill(odds);
//   }

//   async placeBackBetOnCandidate(candidateName: string): Promise<void> {
//     console.log(`Placing a back bet on ${candidateName}...`);
  
//     const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
//     await candidateRow.waitFor({ state: 'visible', timeout: 60000 });
  
//     const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
//     await backButton.click();
  
//     console.log(`Back bet placed on ${candidateName}.`);
//   }
  
//   async enterStakeWithoutOdds(stake: string): Promise<void> {
//     console.log(`Entering stake: ${stake}`);
  
//     const betslip = this.page.locator('betslip-editable-bet');
  
//     console.log('Clearing the odds field...');
//     await this.pageElements.betslipOdds(betslip).fill('');
  
//     await this.page.waitForTimeout(500);
  
//     await this.pageElements.betslipAmount(betslip).fill(stake);
  
//     await this.page.waitForTimeout(500);
  
//     const isEnabled = await this.isPlaceBetButtonEnabled();
//     console.log(`After entering stake, is "Place bets" button enabled? ${isEnabled}`);
//   }

//   async cancelAllSelections(): Promise<void> {
//     console.log('Clicking "Cancel all selections" button...');
//     await this.pageElements.cancelAllSelectionsButton.click();
//   }

//   async getErrorMessage(): Promise<string> {
//     const errorMessage = await this.pageElements.errorMessage.textContent();
//     console.log(`Error message: ${errorMessage}`);
//     return errorMessage || ''; 
//   }

//   async isPlaceBetButtonEnabled(): Promise<boolean> {
//     console.log('Checking if "Place bets" button is enabled...');
  
//     const isEnabled = await this.pageElements.placeBetButton.isVisible(); 
//     console.log(`Is place bet button enabled? ${isEnabled}`);
    
//     return isEnabled;
//   }

//   async getOddsValue(): Promise<string> {
//     const betslip = this.page.locator('betslip-editable-bet');
//     const oddsValue = await this.pageElements.betslipOdds(betslip).inputValue();
//     console.log(`Odds value: ${oddsValue}`);
//     return oddsValue;
//   }

//   async placeBetsOnCandidates(candidates: string[]): Promise<BetResult[]> {
//     const betResults: BetResult[] = [];
  
//     for (const candidateName of candidates) {
//       const randomOdds = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
//       const randomAmount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
//       const expectedProfit = (randomOdds - 1) * randomAmount;
  
//       try {
//         await this.placeBet(candidateName, randomOdds, randomAmount);
//         betResults.push({ 
//           name: candidateName, 
//           odds: randomOdds, 
//           amount: randomAmount, 
//           profit: expectedProfit,
//         });
//       } catch (error) {
//         console.error(`Error placing bet for ${candidateName}: ${error}`);
//         betResults.push({ 
//           name: candidateName, 
//           odds: randomOdds, 
//           amount: randomAmount, 
//           profit: expectedProfit,
//         });
//       }
//     }
  
//     return betResults;
//   }

//   async placeBet(candidateName: string, odds: number, amount: number): Promise<void> {
//     console.log(`Adding bet for: ${candidateName} with odds ${odds} and amount ${amount}`);
    
//     const candidateRow = this.page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
//     await candidateRow.waitFor();

//     const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
//     await backButton.click();

//     const betslip = this.pageElements.betslip(candidateName);
//     await this.pageElements.betslipOdds(betslip).fill(odds.toString());
//     await this.pageElements.betslipAmount(betslip).fill(amount.toString());

//     console.log(`Bet added to betslip for ${candidateName}.`);
//   }

//   async clickPlaceBetsButton(): Promise<void> {
//     console.log('Clicking "Place bets" button...');
//     await this.pageElements.placeBetButton.waitFor({ state: 'visible', timeout: 60000 });
//     await this.pageElements.placeBetButton.click();
//     console.log('Clicked "Place bets" button.');
//   }

//   async clickConfirmBetsButton(): Promise<void> {
//     console.log('Clicking "Confirm bets" button...');
//     await this.pageElements.confirmBetButton.waitFor({ state: 'visible', timeout: 60000 });
//     await this.pageElements.confirmBetButton.click();
//     console.log('Clicked "Confirm bets" button.');
//   }

//   async verifyBets(betResults: BetResult[]): Promise<boolean> {
//     let scenarioPassed = true;
  
//     for (const result of betResults) {
//       const actualProfit = await this.getDisplayedProfit(result.name);
//       console.log(`Verifying bet for ${result.name}`);
  
//       console.log(`Candidate: "${result.name}", Odds: "${result.odds}", Stake: "${result.amount}", ExpectedProfit: "${result.profit}", ActualProfit: "${actualProfit}"`);
  
//       if (result.profit !== actualProfit) {
//         console.error(`Verification failed for ${result.name}: Expected profit: ${result.profit}, Actual profit: ${actualProfit}`);
//         scenarioPassed = false;
//       }
//     }
  
//     return scenarioPassed;
//   }

//   async getDisplayedProfit(candidateName: string): Promise<number | undefined> {
//     const profitLocator1 = this.page.locator(`//span[text()="${candidateName}"]/ancestor::div/following-sibling::div//span[contains(text(),'£')]`);
//     const profitLocator2 = this.page.locator(`//span[text()="${candidateName}"]/ancestor::section[contains(@class, 'betslip__potential-bet') or contains(@class, 'betslip-editable-bet')]//span[contains(@ng-bind, '$ctrl.liabilityValue')]`);
  
//     try {
//       await profitLocator1.waitFor({ state: 'visible', timeout: 60000 });
//       const profitText1 = await profitLocator1.textContent();
//       if (profitText1) {
//         console.log(`Profit for ${candidateName} found using first locator: ${profitText1}`);
//         return parseFloat(profitText1.replace(/[^0-9.-]+/g, ""));
//       }
//     } catch (error1) {
//       console.warn(`First locator failed for ${candidateName}: ${(error1 as Error).message}`);
//     }
  
//     try {
//       await profitLocator2.waitFor({ state: 'visible', timeout: 60000 });
//       const profitText2 = await profitLocator2.textContent();
//       if (profitText2) {
//         console.log(`Profit for ${candidateName} found using second locator: ${profitText2}`);
//         return parseFloat(profitText2.replace(/[^0-9.-]+/g, ""));
//       }
//     } catch (error2) {
//       console.error(`Could not find profit for ${candidateName} using any locator. Error: ${(error2 as Error).message}`);
//       return undefined;
//     }
  
//     return undefined;
//   }

//   async logout(): Promise<void> {
//     console.log("Logging out...");
//     await this.pageElements.myAccountButton.click();

//     let logoutButton;
//     const locators = [this.pageElements.logoutButton, this.page.locator('button:has-text("Log Out")')];

//     for (const locator of locators) {
//       try {
//         logoutButton = await locator.first();
//         if (await logoutButton.isVisible()) {
//           console.log('Log Out button found and visible.');
//           await logoutButton.click();
//           break;
//         }
//       } catch (error) {
//         console.log('Locator failed, trying next one');
//         continue;
//       }
//     }

//     if (!logoutButton) {
//       throw new Error('Log Out button not found using any of the locators');
//     }

//     // Ensure proper teardown after logout
//     console.log("Tearing down after logout...");
//     await this.page.close();
//   }
// }
