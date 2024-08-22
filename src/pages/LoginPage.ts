import { BasePage } from './BasePage';

export class LoginPage extends BasePage {

  // Locators
  private loc_txtUsername = this.page.locator('input[placeholder="email/username"]');
  private loc_txtPassword = this.page.locator('input[placeholder="password"]');
  private loc_btnLogin = this.page.getByRole('button', { name: 'Log In' }); 
  private loc_btnAllowCookies = this.page.getByRole('button', { name: 'Allow all cookies' });

  async login(username: string, password: string) {
    console.log('Navigating to Betfair login page...');
    
    // Navigate to the Betfair URL
    await this.page.goto(process.env.BETFAIR_URL!, { waitUntil: 'networkidle' });

    // Handle 'Allow all cookies' button if it appears
    if (await this.loc_btnAllowCookies.isVisible()) {
      console.log("Clicking 'Allow all cookies' button...");
      await this.loc_btnAllowCookies.click();
    }

    console.log('Attempting to log in...');
    await this.loc_txtUsername.fill(username);
    await this.loc_txtPassword.fill(password);

    // Click the 'Log In' button
    console.log("Clicking 'Log In' button...");
    await this.loc_btnLogin.click();

    console.log("Waiting for the main page to appear...");

    // Wait for the main navigation to ensure that the login was successful
    await this.page.waitForSelector('#subnav', { timeout: 60000 });

      console.log('Login successful.');
  }
}
