import { Page } from '@playwright/test';

export class PoliticsPage {
    private page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }

    // Method to navigate to the Politics section
    async navigateToPoliticsSection(): Promise<void> {
        await this.page.goto('https://www.betfair.com/exchange/plus/en/politics-betting-2378961');
    }

    // Method to enter odds without a stake
    async enterOddsWithoutStake(odds: string): Promise<void> {
        const oddsInput = this.page.locator('.betslip-odds-input');
        await oddsInput.fill(odds);
    }

    // Method to enter a stake without entering odds
    async enterStakeWithoutOdds(stake: string): Promise<void> {
        const stakeInput = this.page.locator('.betslip-size-input');
        await stakeInput.fill(stake);
    }

    // Method to place a bet
    async placeBet(candidateName: string, odds: number, stake: number): Promise<void> {
        const candidateLocator = this.page.locator(`text=${candidateName}`);
        await candidateLocator.click();
        await this.enterOddsWithoutStake(odds.toString());
        await this.enterStakeWithoutOdds(stake.toString());
        const placeBetsButton = this.page.locator("//ours-button[contains(.,'Place bets')]");
        await placeBetsButton.click();
        const confirmButton = this.page.locator("//ours-button[contains(.,'Confirm bets')]");
        await confirmButton.click();
    }

    // Method to get the error message
    async getErrorMessage(): Promise<string> {
        return await this.page.locator('p.error-message__statement').innerText();
    }

    // Method to check if the "Place bets" button is enabled
    async isPlaceBetButtonEnabled(): Promise<boolean> {
        return await this.page.locator("//ours-button[contains(.,'Place bets')]").isEnabled();
    }

    // Method to get the odds value
    async getOddsValue(): Promise<string> {
        return await this.page.locator('.betslip-odds-input').inputValue();
    }

    // Method to get the minimum odds message
    async getMinimumOddsMessage(): Promise<string> {
        return await this.page.locator('p.minimum-odds-message').innerText(); // Adjust the locator as necessary
    }

    // Method to log out
    async logout(): Promise<void> {
        const logoutButton = this.page.locator("//button[contains(.,'Logout')]");
        await logoutButton.click();
    }

    // Method to place bets and verify (example)
    async placeBetsAndVerify(dataTable: any): Promise<void> {
        for (const row of dataTable.raw()) {
            const [candidateName, odds, stake] = row;
            await this.placeBet(candidateName, parseFloat(odds), parseFloat(stake));
        }
    }
}
