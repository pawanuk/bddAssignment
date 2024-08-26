import path from 'path';
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private locators: {
    usernameInput: Locator;
    passwordInput: Locator;
    loginButton: Locator;
    allowCookiesButton: Locator;
    subnav: Locator;
  };

  constructor(page: Page) {
    this.page = page;

    // Initialize locators after the page has been assigned
    this.locators = {
      usernameInput: this.page.locator('input[placeholder="email/username"]'),
      passwordInput: this.page.locator('input[placeholder="password"]'),
      loginButton: this.page.getByRole('button', { name: 'Log In' }),
      allowCookiesButton: this.page.getByRole('button', { name: 'Allow all cookies' }),
      subnav: this.page.locator('#subnav')
    };
  }

  async login(username: string, password: string) {
    try {
      console.log("Navigating to Betfair login page...");
      await this.goto('https://www.betfair.com/');
      console.log("Navigated to https://www.betfair.com/");

      // Hard wait to ensure page is fully loaded
      console.log("Waiting for page to fully load...");
      await this.page.waitForTimeout(10000);

      console.log("Handling cookies...");
      await this.acceptCookies();

      console.log("Taking screenshot before filling in login details...");
      await this.takeScreenshot('before-login.png');

      console.log("Filling in login details...");
      await this.page.waitForTimeout(3000); // Hard wait before interacting with username
      console.log("Filling username...");
      await this.locators.usernameInput.waitFor({ state: 'visible', timeout: 60000 });
      await this.locators.usernameInput.fill(username);

      console.log("Filling password...");
      await this.page.waitForTimeout(3000); // Hard wait before interacting with password
      await this.locators.passwordInput.waitFor({ state: 'visible', timeout: 60000 });
      await this.locators.passwordInput.fill(password);

      console.log("Taking screenshot before clicking 'Log In' button...");
      await this.takeScreenshot('before-click-login.png');

      console.log("Clicking 'Log In' button...");
      await this.page.waitForTimeout(3000); // Hard wait before clicking login
      await this.clickElement(this.locators.loginButton);

      console.log("Waiting for the main page to appear...");
      await this.page.waitForTimeout(10000); // Hard wait to ensure the next page loads

      console.log("Taking screenshot after login...");
      await this.takeScreenshot('after-login.png');

      console.log("Login process completed.");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Login failed: ${error.message}`);
        await this.takeScreenshot('login-failed.png');
        throw new Error(`Login failed: ${error.message}`);
      } else {
        console.error('Login failed: An unknown error occurred');
        await this.takeScreenshot('login-failed.png');
        throw new Error('Login failed: An unknown error occurred');
      }
    }
  }

  private async goto(url: string) {
    try {
      await this.page.goto(url);
      console.log(`Navigated to ${url}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to navigate to ${url}: ${error.message}`);
        throw new Error(`Failed to navigate to ${url}: ${error.message}`);
      } else {
        console.error(`Failed to navigate to ${url}: An unknown error occurred`);
        throw new Error(`Failed to navigate to ${url}: An unknown error occurred`);
      }
    }
  }

  private async clickElement(locator: Locator) {
    try {
      await locator.click();
      console.log(`Clicked on element ${locator}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to click on ${locator}: ${error.message}`);
        throw new Error(`Failed to click on ${locator}: ${error.message}`);
      } else {
        console.error(`Failed to click on ${locator}: An unknown error occurred`);
        throw new Error(`Failed to click on ${locator}: An unknown error occurred`);
      }
    }
  }

  private async acceptCookies() {
    console.log("Checking for 'Allow all cookies' button...");
    if (await this.isElementVisible(this.locators.allowCookiesButton)) {
      console.log("Clicking 'Allow all cookies' button...");
      await this.page.waitForTimeout(3000); // Hard wait before clicking cookies button
      await this.clickElement(this.locators.allowCookiesButton);
    } else {
      console.log("No 'Allow all cookies' button found.");
    }
  }

  private async takeScreenshot(filename: string) {
    const screenshotPath = path.join('screenshots', filename);
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot taken: ${screenshotPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to take screenshot: ${error.message}`);
        throw new Error(`Failed to take screenshot: ${error.message}`);
      } else {
        console.error('Failed to take screenshot: An unknown error occurred');
        throw new Error('Failed to take screenshot: An unknown error occurred');
      }
    }
  }

  private async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      const visible = await locator.isVisible();
      console.log(`Element ${locator} is ${visible ? 'visible' : 'not visible'}`);
      return visible;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error checking visibility of ${locator}: ${error.message}`);
        return false;
      } else {
        console.error(`Error checking visibility of ${locator}: An unknown error occurred`);
        return false;
      }
    }
  }
}
