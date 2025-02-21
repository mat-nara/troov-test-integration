const { Given, When, Then, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { initializeBrowser, closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')


setDefaultTimeout(60 * 1000);

let browser, context, page;

BeforeAll(async function () {
  ({ browser, context, page } = await initializeBrowser());
});

Given("La page \"Je m'enregistre\" sans rendez-vous est ouverte", async () => {
  await page.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = page.locator('button[name="with-rdv"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();
  const heading = await page.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
});


// Scenario NIR uniquement
Given("NIR uniquement est saisie", async () => {
  const inputNIRLocator = page.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891234');
  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone uniquement
Given("Téléphone uniquement est saisie", async () => {
  const inputPhoneLocator = page.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');
  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR et Téléphone sont saisie
Given("NIR et Téléphone sont saisie", async () => {
  const inputNIRLocator = page.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891234');
  const inputPhoneLocator = page.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');
  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR saisie au mauvais format
Given("que le NIR est saisi au mauvais format dans un signalement sans rendez-vous", async () => {
  const inputNIRLocator = page.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('123456789111'); // 12 caracter au lieu de 13

  const inputPhoneLocator = page.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');

  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone saisie au mauvais format
Given("que le téléphone est saisi au mauvais format dans un signalement sans rendez-vous", async () => {
  const inputNIRLocator = page.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891111'); 

  const inputPhoneLocator = page.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('123456789'); // 9 caracter au lieu de 10

  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
});
// ------------------------------------------------------------------------

When("Cliquer sur le bouton 'Continuer' de la page d'enregistrement", async () => {
  await page.locator('button[aria-label="Continuer"]').click();
});

When("Cliquer sur 'Quitter' de la page d'enregistrement", async () => {
  await page.locator('button[aria-label="Quitter"]').click();
});
// ------------------------------------------------------------------------

Then("Passe à l'etape suivant: \"Je choisis mon motif de visite\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Je choisis mon motif de visite");
  await expect(heading).toBeVisible();
});

Then("Message d'erreur s'affiche", async () => {
  const heading = await page.getByText("Saisie incorrecte");
  await expect(heading).toBeVisible();
});

Then("Revient sur la page initiale depuis un signalement sans rendez-vous: \"Je signale mon arrivée\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Je signale mon arrivée");
  await expect(heading).toBeVisible();
});


AfterAll(async function () {
  await closeBrowser();
})