import { BasePage } from './BasePage';
import path from 'path';

export class LoginPage extends BasePage {
  // Centralized locators for better organization
  private locators = {
    usernameInput: this.page.locator('input[placeholder="email/username"]'),
    passwordInput: this.page.locator('input[placeholder="password"]'),
    loginButton: this.page.getByRole('button', { name: 'Log In' }),
    allowCookiesButton: this.page.getByRole('button', { name: 'Allow all cookies' }),
    subnav: this.page.locator('#subnav')
  };

  async login(username: string, password: string) {
    try {
      console.log("Navigating to Betfair login page...");
      await this.goto(process.env.BETFAIR_URL || 'default_url_here');

      await this.takeScreenshot('before-login.png');
      await this.acceptCookies();

      console.log("Filling in login details...");
      await this.fillInputField(this.locators.usernameInput, username);
      await this.fillInputField(this.locators.passwordInput, password);

      console.log("Clicking 'Log In' button...");
      await this.clickElement(this.locators.loginButton);

      console.log("Waiting for the main page to appear...");
      await this.locators.subnav.waitFor({ timeout: 60000 });

      console.log("Logged in and main page is visible.");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Login failed: ${error.message}`);
        throw new Error(`Login failed: ${error.message}`);
      } else {
        console.error('Login failed: An unknown error occurred');
        throw new Error('Login failed: An unknown error occurred');
      }
    }
  }

  private async acceptCookies() {
    if (await this.isElementVisible(this.locators.allowCookiesButton)) {
      console.log("Clicking 'Allow all cookies' button...");
      await this.clickElement(this.locators.allowCookiesButton);
    }
  }

  protected async takeScreenshot(filename: string) {
    const screenshotPath = path.join('screenshots', filename);
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot taken: ${screenshotPath}`);
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}
