import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  
  // Locators
  private loc_txtUsername = this.page.locator('input[placeholder="email/username"]');
  private loc_txtPassword = this.page.locator('input[placeholder="password"]');
  private loc_btnLogin = this.page.locator('input[value="Log In"]');
  private loc_txtWelcomeMessage = this.page.locator('#subnav'); // Assuming the subnav is visible post-login

  async login(username: string, password: string) {
    console.log('Attempting to log in...');
    
    await this.page.goto(process.env.BETFAIR_URL!, { waitUntil: 'networkidle' });

    await this.loc_txtUsername.fill(username);
    await this.loc_txtPassword.fill(password);
    await this.loc_btnLogin.click();

    console.log("Waiting for the main page to appear...");
    
    await this.loc_txtWelcomeMessage.waitFor({ timeout: 60000 });

    console.log('Login successful.');
  }
}
