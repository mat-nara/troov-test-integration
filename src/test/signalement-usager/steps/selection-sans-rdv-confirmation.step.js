const { Given, When, Then, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { initializeBrowser, closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')


setDefaultTimeout(60 * 1000);

let browser, context, page;

BeforeAll(async function () {
  ({ browser, context, page } = await initializeBrowser());
});

Given("La page de confirmation est ouverte", async () => {

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
  const inputOfficeTypeLocator = page.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = page.locator(`li[aria-label="Enfant"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe("Enfant");
  const inputOfficeLocator = page.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await page.locator(`li[aria-label="J'attends / J'accueille un enfant"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe("J'attends / J'accueille un enfant");
  await page.locator('button[aria-label="Continuer"]').click();

  // Page de confirmation
});

// La page de confirmation sans rendez-vous s'affiche correctement 
Then("Le titre \"Vous êtes bien enregistré !\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Le titre \"Votre numéro d’appel est le suivant :\" s'affiche sur la page", async () => {
  const heading = await page.getByText("Votre numéro d’appel est le suivant :");
  await expect(heading).toBeVisible();
});

// Téléchargement du ticket digital
Then("Cliquer sur le ticket digital à télécharger sur page de confirmation", async () => {
  await page.getByText('Télécharger mon ticket').click();
});

AfterAll(async function () {
  await closeBrowser();
})