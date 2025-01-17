# TROOV-TEST
## Description

End-to-end testing of the TROOV project.

## Installation

```bash
$ git clone https://mahefa1@bitbucket.org/troov/troov-test-integration.git
$ npm install
$ Create and configure the .env file (use .env.development for development settings and .env.production for production settings).
```

## Running the test

1. First, run all TROOV services.
2. Run test:

```bash
# development
$ set NODE_ENV=development && npx playwright test

# production mode
$ set NODE_ENV=production && npx playwright test
```

## Note
if you'd like to run the tests with the browser UI visible, use the --headed option.

## Running new version of test with Gherkin/Cucumber and playwright 

The scenario list can be found in the files located in src/test/signalement-usager/features.

```bash
# Run all test
$ npm test

# Run specific feature, use the tag (placed at the top of the Feature keyword in each file, ex: @sansRdvAffichage).
$ npx cucumber-js --name "@tagName"

# Run specific scenario, use the scenario name (the word or sentence that follows the "Scenario:" keyword, ex: La page de confirmation sans rendez-vous s'affiche correctement).
$ npx cucumber-js --name "scenarioName"
```

The result will be saved as an HTML file named: cucumber-report.html.

## Configuration
The configuration for running tests is stored in the `.env` file

- **BROWSER**: Specifies the browser to use for testing.
  - Example: chromium, firefox, webkit (Safari)

- **HEADLESS**: Specifies whether the browser should run in headless mode (true/false)

- **MOBILE_DEVICE**: Specifies the mobile device to emulate during tests.
  - Example: 'Galaxy S5', 'iPhone 12', 'Pixel 5'
  - If not set, tests will run on a desktop browser.