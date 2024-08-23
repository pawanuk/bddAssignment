# Betfair Automation Framework

## Overview

This automation framework is designed to automate the testing of the Betfair web application using Playwright, Cucumber, and TypeScript. The framework follows the principles of Behavior-Driven Development (BDD) and uses the Page Object Model (POM) for organizing test scripts.

## Features

- **BDD with Cucumber:** Write test cases in Gherkin syntax for clear, understandable scenarios.
- **Playwright Integration:** Automate browser interactions using Playwright's powerful API.
- **TypeScript Support:** Type-safe scripting with TypeScript to catch errors early during development.
- **Page Object Model:** Organized code structure with reusable page components.
- **Parallel Execution:** Run multiple test scenarios in parallel to reduce execution time.
- **Comprehensive Reporting:** Generate HTML and JSON reports for test results.

## Project Structure

```plaintext
.
├── src
│   ├── pages
│   │   ├── BasePage.ts          # Base class for all pages with common utilities
│   │   ├── LoginPage.ts         # Page object for login-related actions
│   │   ├── PoliticsPage.ts      # Page object for actions related to the Politics section
│   ├── test
│   │   ├── features
│   │   │   ├── place_bets.feature      # Feature file for placing bets
│   │   │   ├── edge_cases.feature      # Feature file for testing edge cases
│   │   ├── steps
│   │   │   ├── place_bets_steps.ts     # Step definitions for placing bets
│   │   │   ├── edge_cases_steps.ts     # Step definitions for edge cases
│   ├── utils
│   │   ├── env.ts               # Configuration file for environment variables
│   │   ├── helpers.ts           # Helper functions for various utilities
│   ├── types
│   │   ├── BetResult.ts         # Type definitions related to betting results
├── cucumber.json                # Cucumber configuration file
├── package.json                 # Node.js dependencies and scripts
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation (this file)

Page Objects
BasePage.ts: Contains common methods like goto, click, fillInputField, and isElementVisible. All other pages inherit from this class.

LoginPage.ts: Handles actions related to logging into the Betfair application, such as filling in the username and password fields and clicking the login button.

PoliticsPage.ts: Manages interactions within the Politics section of the Betfair site, such as placing bets, verifying bet results, and logging out.

Test Features and Steps
place_bets.feature: Defines scenarios for placing bets on various candidates. Each scenario is written in Gherkin syntax.

edge_cases.feature: Defines scenarios to test various edge cases, such as entering non-numeric values or exceeding account balance.

place_bets_steps.ts: Implements the steps defined in place_bets.feature using TypeScript. This includes logging in, navigating to the Politics section, placing bets, and verifying results.

edge_cases_steps.ts: Implements the steps defined in edge_cases.feature using TypeScript. Handles testing for edge cases like invalid inputs.

Utilities
env.ts: Stores environment variables such as URLs, usernames, and passwords.

helpers.ts: Contains utility functions for tasks like cleaning directories, taking screenshots on failure, and closing browser contexts.

Types
BetResult.ts: Defines TypeScript types and interfaces related to betting results, ensuring strong type checking throughout the test scripts.
Setup and Installation
Prerequisites
Node.js (v14 or higher)
npm or yarn
Playwright: Playwright will be installed automatically with the project dependencies.
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your-repository/betfair-automation.git
cd betfair-automation
Install dependencies:

bash
Copy code
npm install
Install Playwright browsers:

bash
Copy code
npx playwright install
Environment Configuration
Configure the environment variables by creating an .env file in the root directory. Example:

env
Copy code
BETFAIR_URL=https://www.betfair.com
USERNAME=your_username
PASSWORD=your_password
DOCKER_ENV=false
Running Tests
Run All Tests:

bash
Copy code
npm run test
Run Specific Feature:

bash
Copy code
npx cucumber-js src/test/features/place_bets.feature
Generate HTML Report:

bash
Copy code
npm run test
The HTML report will be generated in the reports/ directory.

Parallel Execution
To run tests in parallel, ensure the "parallel": 5 setting in the cucumber.json file is configured. This will run up to 5 scenarios simultaneously.

Debugging
View Test Run Video: Videos of the test runs are stored in the videos/ directory.
View Screenshots: Screenshots are stored in the screenshots/ directory for both successes and failures.
Best Practices
Use Page Objects: Ensure all page-specific actions are encapsulated in Page Object classes.
Avoid Hardcoding: Use environment variables and centralized locators to avoid hardcoded values.
Write Reusable Steps: Make step definitions as reusable as possible by using parameters.
Error Handling: Implement robust error handling to make debugging easier.
Keep Feature Files Clean: Focus on high-level actions and business logic in feature files. Leave implementation details to step definitions.
Future Enhancements
CI/CD Integration: Set up continuous integration to automatically run tests on each push.
Data-Driven Testing: Externalize test data to JSON or CSV files for more flexible test scenarios.
Enhanced Reporting: Integrate with tools like Allure for more detailed test reports.
Conclusion
This automation framework provides a robust foundation for testing the Betfair web application. With proper setup and adherence to best practices, it can be extended and scaled to cover a wide range of test scenarios.