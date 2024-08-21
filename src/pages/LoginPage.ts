import { BasePage } from './BasePage';
import fs from 'fs-extra';
import path from 'path';

export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    console.log("Navigating to Betfair login page...");

    // Navigate to the Betfair URL, with a network idle condition
    await this.page.goto(process.env.BETFAIR_URL!, { waitUntil: 'networkidle' });

    // Take a screenshot before interacting with the page
    const screenshotPath = path.join('screenshots', 'before-login.png');
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot taken before login: ${screenshotPath}`);

    // Handle the 'Allow all cookies' button if it appears
    const allowCookiesButton = this.page.getByRole('button', { name: 'Allow all cookies' });
    if (await allowCookiesButton.isVisible()) {
      console.log("Clicking 'Allow all cookies' button...");
      await allowCookiesButton.click();
    }

    console.log("Filling in login details...");

    // Increase the timeout to 60 seconds (60000 ms)
    await this.page.waitForSelector('input[placeholder="email/username"]', { timeout: 60000 });
    await this.page.getByPlaceholder('email/username').fill(username);

    await this.page.waitForSelector('input[placeholder="password"]', { timeout: 60000 });
    await this.page.getByPlaceholder('password').fill(password);

    console.log("Clicking 'Log In' button...");
    
    // Click the 'Log In' button
    const loginButton = this.page.getByRole('button', { name: 'Log In' });
    await loginButton.click();

    console.log("Waiting for the main page to appear...");

    // Wait for the main navigation to ensure that the login was successful
    await this.page.waitForSelector('#subnav', { timeout: 60000 });
    
    console.log("Logged in and main page is visible.");
  }
}
