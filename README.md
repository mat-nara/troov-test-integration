# TROOV-TEST
## Description

End-to-end testing of the TROOV project.

## Installation

```bash
$ git clone https://mahefa1@bitbucket.org/troov/troov-test-integration.git
$ npm install
$ create and configure .env file (".env.development" for development configuration, and .env.production for production)
```

## Running the test

1) First, run all TROOV services.
2) Run test:

```bash
# development
$ set NODE_ENV=development && npx playwright test

# production mode
$ set NODE_ENV=production && npx playwright test
```

## Note
if you'd like to run the tests with the browser UI visible, use the --headed option.
