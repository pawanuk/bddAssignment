import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

Before(async function () {
  // Launch the browser before all scenarios
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({ storageState: 'auth.json' });
  page = await context.newPage();
});

After(async function () {
  // Close the browser after all scenarios
  if (page) await page.close();
  if (context) await context.close();
  if (browser) await browser.close();
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  await page.goto('https://www.betfair.com/', { waitUntil: 'networkidle' });

  const allowCookiesButton = page.getByRole('button', { name: 'Allow all cookies' });
  if (await allowCookiesButton.isVisible()) {
    await allowCookiesButton.click();
  }

  await page.waitForSelector('input[placeholder="email/username"]');
  await page.getByPlaceholder('email/username').fill('pawanuk');

  await page.waitForSelector('input[placeholder="password"]');
  await page.getByPlaceholder('password').fill('Pawankumar12');

  const loginButton = page.getByRole('button', { name: 'Log In' });
  await loginButton.click();

  // Wait for the Politics section to appear after login
  await page.waitForSelector('#subnav');
});

When('I navigate to the Politics section', async function () {
  // Click on the "Politics" link
  await page.locator('#subnav').getByRole('link', { name: 'Politics' }).click();

  // Wait for the Politics page to load completely
  await page.waitForLoadState('networkidle');
});

When('I place a bet on the following candidates:', { timeout: 120 * 1000 }, async function (dataTable) {
  const candidates = dataTable.hashes();

  for (const candidate of candidates) {
    const candidateName = candidate.candidate;

    const randomOdds = (Math.random() * (5 - 1.01) + 1.01).toFixed(2);
    const randomAmount = (Math.random() * (500 - 10) + 10).toFixed(2);

    console.log(`Placing bet for: ${candidateName} with odds ${randomOdds} and amount ${randomAmount}`);

    const candidateRow = page.locator(`//h3[text()="${candidateName}"]/ancestor::tr`);
    await candidateRow.waitFor();

    const backButton = candidateRow.locator('.bet-buttons.back-cell.last-back-cell button:has-text("£")');
    await backButton.click();

    await page.waitForSelector('betslip-editable-bet');

    const betslip = page.locator('betslip-editable-bet').filter({ hasText: `${candidateName} £` });
    const textBoxLocator = betslip.locator('betslip-price-ladder').getByRole('textbox');
    const sizeInputLocator = betslip.locator('betslip-size-input').getByRole('textbox');

    await textBoxLocator.fill(randomOdds);
    await sizeInputLocator.fill(randomAmount);

     await page.waitForTimeout(5000); // Wait for 5 seconds between bets
  }
});

Then('all bets should be placed successfully', async function () {
  console.log('All bets have been added to betslip successfully.');
});

Then('I log out from the application', async function () {
  const logoutButton = page.getByRole('button', { name: 'Log Out' });
  await logoutButton.click();

  // Wait for the login page or some other indicator that the user has logged out
  await page.waitForSelector('input[placeholder="email/username"]');
  expect(await page.getByRole('button', { name: 'Log In' }).isVisible()).toBeTruthy();
});
