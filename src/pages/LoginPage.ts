import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    console.log("Navigating to Betfair login page...");
    await this.goto('https://www.betfair.com/', { waitUntil: 'networkidle' });

    const allowCookiesButton = this.page.getByRole('button', { name: 'Allow all cookies' });
    if (await allowCookiesButton.isVisible()) {
      console.log("Clicking 'Allow all cookies' button...");
      await allowCookiesButton.click();
    }

    console.log("Filling in login details...");
    await this.page.waitForSelector('input[placeholder="email/username"]', { timeout: 15000 });
    await this.page.getByPlaceholder('email/username').fill(username);

    await this.page.waitForSelector('input[placeholder="password"]', { timeout: 15000 });
    await this.page.getByPlaceholder('password').fill(password);

    console.log("Clicking 'Log In' button...");
    const loginButton = this.page.getByRole('button', { name: 'Log In' });
    await loginButton.click();

    console.log("Waiting for the main page to appear...");
    await this.page.waitForSelector('#subnav', { timeout: 20000 }); // Increased timeout for waiting on subnav
    console.log("Logged in and main page is visible.");
  }
}
