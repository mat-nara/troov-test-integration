const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const {  expect } = require('@playwright/test');
const {  closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')


setDefaultTimeout(60 * 1000);

Given("La page 'Je choisis mon motif de visite' sans rendez-vous est ouverte", async function() {

  // Page principale
  await this.terminalPage.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = this.terminalPage.locator('button[name="with-rdv"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();

  // Page enregistrement
  const heading = await this.terminalPage.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
  const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891111');
  const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');
  const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
  await buttonLocator.click();

  // Page Motif de visite 
  const headingMotif = await this.terminalPage.getByText("Je choisis mon motif de visite");
  await expect(headingMotif).toBeVisible();
});

Given('Choisir motif: {string}', async function (motif) {
  const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("Choisir sous-motif: {string}", async function (sousMotif) {
  const inputOfficeLocator = this.terminalPage.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe(sousMotif);
});

// --------------------------------------
When("Cliquer sur 'Continuer' de la page motif", async function() {
  await this.terminalPage.locator('button[aria-label="Continuer"]').click();
});

When("Cliquer sur 'Quitter' de la page motif", async function() {
  await this.terminalPage.locator('button[aria-label="Quitter"]').click();
});

// --------------------------------------

Then("Passe à l'etape suivant: \"Vous êtes bien enregistré !\" s'affiche sur la page", async function() {
  const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Chaque sous-motif de la liste doit contenir: {string}", async function (sousMotif) {
  const liSousMotifLocator = await this.terminalPage.locator(`text=${sousMotif}`).first();
  const ariaLabels = await liSousMotifLocator.locator('..').locator('..').locator('li').allTextContents();
  const normalizedMotif = sousMotif.toLowerCase();
  const containsMotif = ariaLabels.every(label => label.toLowerCase().includes(normalizedMotif));
  expect(containsMotif).toBeTruthy();
});

Then("Revient sur la page initiale depuis la page motif: \"Je signale mon arrivée\" s'affiche sur la page", async function() {
  const heading = await this.terminalPage.getByText("Je signale mon arrivée");
  await expect(heading).toBeVisible();
});