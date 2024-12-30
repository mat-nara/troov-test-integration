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
