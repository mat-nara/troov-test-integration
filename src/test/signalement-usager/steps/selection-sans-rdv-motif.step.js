const { Given, When, Then, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { initializeBrowser, closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')


setDefaultTimeout(60 * 1000);

let browser, context, page;

BeforeAll(async function () {
  ({ browser, context, page } = await initializeBrowser());
});

Given("La page 'Je choisis mon motif de visite' sans rendez-vous est ouverte", async () => {

  // Page principale
  await page.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = page.locator('button[name="with-rdv"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();

  // Page enregistrement
  const heading = await page.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
  const inputNIRLocator = page.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891111');
  const inputPhoneLocator = page.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');
  const buttonLocator = await page.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
  await buttonLocator.click();

  // Page Motif de visite 
  const headingMotif = await page.getByText("Je choisis mon motif de visite");
  await expect(headingMotif).toBeVisible();
});

Given('Choisir motif: {string}', async function (motif) {
  const inputOfficeTypeLocator = page.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = page.locator(`li[aria-label="${motif}"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("Choisir sous-motif: {string}", async function (sousMotif) {
  const inputOfficeLocator = page.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await page.locator(`li[aria-label="${sousMotif}"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe(sousMotif);
});

// --------------------------------------
When("Cliquer sur 'Continuer' de la page motif", async () => {
  await page.locator('button[aria-label="Continuer"]').click();
});

When("Cliquer sur 'Quitter' de la page motif", async () => {
  await page.locator('button[aria-label="Quitter"]').click();
});

// --------------------------------------

Then("Passe à l'etape suivant: \"Vous êtes bien enregistré !\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Chaque sous-motif de la liste doit contenir: {string}", async function (sousMotif) {
  const liSousMotifLocator = await page.locator(`text=${sousMotif}`).first();
  const ariaLabels = await liSousMotifLocator.locator('..').locator('..').locator('li').allTextContents();
  const normalizedMotif = sousMotif.toLowerCase();
  const containsMotif = ariaLabels.every(label => label.toLowerCase().includes(normalizedMotif));
  expect(containsMotif).toBeTruthy();
});

Then("Revient sur la page initiale depuis la page motif: \"Je signale mon arrivée\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Je signale mon arrivée");
  await expect(heading).toBeVisible();
});

AfterAll(async function () {
  await closeBrowser();
})