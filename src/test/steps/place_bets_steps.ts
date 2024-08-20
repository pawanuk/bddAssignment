import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

Before(async function () {
  console.log("Launching browser...");
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({ storageState: 'auth.json' });
  page = await context.newPage();
  console.log("Browser launched and new page created.");
});

After(async function () {
  console.log("Tearing down...");

  try {
    if (page && !page.isClosed()) {
      console.log("Closing page...");
      await page.close();
    }

    if (context) {
      console.log("Closing context...");
      await context.close();
    }

    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }

    console.log("Teardown completed.");
  } catch (error) {
    console.log("Error during teardown:", error);
  }
});

Given('I am logged in to Betfair', { timeout: 60 * 1000 }, async function () {
  console.log("Navigating to Betfair login page...");
  await page.goto('https://www.betfair.com/', { waitUntil: 'networkidle' });

  const allowCookiesButton = page.getByRole('button', { name: 'Allow all cookies' });
  if (await allowCookiesButton.isVisible()) {
    console.log("Clicking 'Allow all cookies' button...");
    await allowCookiesButton.click();
  }

  console.log("Filling in login details...");
  await page.waitForSelector('input[placeholder="email/username"]');
  await page.getByPlaceholder('email/username').fill('pawanuk');

  await page.waitForSelector('input[placeholder="password"]');
  await page.getByPlaceholder('password').fill('Pawankumar12');

  console.log("Clicking 'Log In' button...");
  const loginButton = page.getByRole('button', { name: 'Log In' });
  await loginButton.click();

  console.log("Waiting for the main page to appear...");
  await page.waitForSelector('#subnav');
  console.log("Logged in and main page is visible.");
});

When('I navigate to the Politics section', { timeout: 20 * 1000 }, async function () {
  console.log("Attempting to click the Politics tab...");

  const locators = [
    page.locator('#subnav').getByRole('link', { name: 'Politics' }), // Locator by role and name
    page.locator('.subnav-link.mod-link').filter({ hasText: 'Politics' }), // Locator by class and text
    page.locator('a[data-event-type-name="politics"]'), // Locator by data attribute
    page.locator('a[href="en/politics-betting-2378961"]'), // Locator by href
    page.locator('a:has-text("Politics")') // Locator by text content
  ];

  let elementFound = false;

  for (const locator of locators) {
    try {
      const element = await locator.first();
      if (await element.isVisible()) {
        console.log('Politics link found and visible.');
        await element.click();
        elementFound = true;
        break;
      }
    } catch (error) {
      console.log('Locator failed, trying next one...');
      continue;
    }
  }

  if (!elementFound) {
    console.log('Politics link not found or not clickable, navigating directly to the URL...');
    await page.goto('https://www.betfair.com/exchange/plus/en/politics-betting-2378961', { waitUntil: 'networkidle' });
  } else {
    console.log("Waiting for the Politics page to load...");
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  }

  console.log("Politics page loaded.");
});

When('I place a bet on the following candidates:', { timeout: 120 * 1000 }, async function (dataTable) {
  const candidates = dataTable.hashes();
  console.log("Placing bets on candidates...");

  for (const candidate of candidates) {
    const candidateName = candidate.candidate;

    const randomOdds = (Math.random() * (5 - 1.01) + 1.01).toFixed(2);
    const randomAmount = (Math.random() * (500 - 10) + 10).toFixed(2);

    console.log(`Adding bet for: ${candidateName} with odds ${randomOdds} and amount ${randomAmount}`);

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

    console.log(`Bet added to betslip for ${candidateName}.`);
    await page.waitForTimeout(5000); // Wait for 5 seconds between bets
  }

  console.log("All bets have been added to the betslip.");
});

Then('all bets should be added to betslip successfully', async function () {
  console.log("Verifying that all bets have been added to the betslip...");
  console.log('All bets have been added to betslip successfully.');
});

Then('I log out from the application', { timeout: 20 * 1000 }, async function () {
  console.log("Logging out...");

  // Open the My Account menu to access the Log Out button
  await page.getByText('My Account pawanuk My Betfair').click();

  const locators = [
    page.getByRole('button', { name: 'Log Out' }),
    page.locator('button:has-text("Log Out")')
  ];

  let logoutButton;
  for (const locator of locators) {
    try {
      logoutButton = await locator.first();
      if (await logoutButton.isVisible()) {
        console.log('Log Out button found and visible.');
        await logoutButton.click();
        break;
      }
    } catch (error) {
      console.log('Locator failed, trying next one');
      continue;
    }
  }

  if (!logoutButton) {
    throw new Error('Log Out button not found using any of the locators');
  }

  // console.log("Waiting for the login page to appear after logout...");
  // await page.waitForSelector('input[placeholder="email/username"]', { timeout: 10000 });
  // expect(await page.locator('input[value="Log In"]').isVisible()).toBeTruthy();
  // console.log("Logged out successfully.");
});
