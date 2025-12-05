const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');


setDefaultTimeout(60 * 1000);


Given("L'utilisateur est connecté à l'application Troov", async function() {
  
  //***********************   Login Backoffice *************************/
  this.loginPageAlt = new LoginPage(this.backofficePage);
  await this.loginPageAlt.navigate(this.backofficePage);
  await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

  // wait for backoffice loaded
  await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

  let currentURL = await this.backofficePage.url();
  while (!currentURL.includes('calendar')) {
      await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
      currentURL = await this.backofficePage.url();
  }
  expect(await this.backofficePage.url()).toContain('calendar');

  // Changer de compte en CNAF Formation
  await this.backofficePage.locator('img.header-profile-user').click();
  await this.backofficePage.locator('button[title="Changer de compte"]').click();
  await this.backofficePage.waitForTimeout(3000); 

  await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > span.p-tree-node-label').click();

  currentURL = await this.backofficePage.url();
  while (!currentURL.includes('calendar')) {
      await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
      currentURL = await this.backofficePage.url();
  }
  expect(await this.backofficePage.url()).toContain('calendar');
});


Given("La page \"Enregistrer l’usager\" d'un signalement sans rendez-vous est ouverte", async function() {
	await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.locator('button').filter({ hasText: "Usager sans rendez-vous" }).click();
	await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();
});


// Scenario NIR uniquement
Given("NIR uniquement est saisie", async function() {
  const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill(generateRandomNIR());
  const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
  await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone uniquement
Given("Téléphone uniquement est saisie", async function() {
  const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(generateRandomPhone());
  const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
  await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR et Téléphone sont saisie
Given("NIR et Téléphone sont saisie", async function() {
  const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill(generateRandomNIR());
  const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(generateRandomPhone());
  const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
  await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR saisie au mauvais format
Given("que le NIR est saisi au mauvais format dans un signalement sans rendez-vous", async function() {
	const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
	await inputNIRLocator.fill(generateRandomNIR().slice(0, -1)); // 12 caracter au lieu de 13
	// await this.backofficePage.mouse.click(10, 10);
	await this.backofficePage.evaluate(() => document.activeElement.blur());

	const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
	await inputPhoneLocator.fill(generateRandomPhone());

	//const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
	//await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone saisie au mauvais format
Given("que le téléphone est saisi au mauvais format dans un signalement sans rendez-vous", async function() {
  const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill(generateRandomNIR()); 

  const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(generateRandomPhone().slice(0, -1)); // 9 caracter au lieu de 10
  // await this.backofficePage.mouse.click(10, 10);
  await this.backofficePage.evaluate(() => document.activeElement.blur());

  // const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
  // await expect(buttonLocator).toBeEnabled();
});
// ------------------------------------------------------------------------

When("Cliquer sur le bouton 'Continuer' de la page d'enregistrement", async function() {
  await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page d'enregistrement", async function() {
  await this.backofficePage.locator('button[aria-label="Quitter"]').click();
});
// ------------------------------------------------------------------------

Then("Passe à l'etape suivant: \"Choisir le motif de visite\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("Choisir le motif de visite");
  await expect(heading).toBeVisible();
});

Then("Message d'erreur associé au NIR s'affiche", async function() {
  await expect(this.backofficePage.locator('div.p-message-text').filter({ hasText: "Format invalide : Le numéro de Sécurité sociale n'est pas valide (exemple : 2 94 03 75 120 005)" }).first()).toBeVisible();
});

Then("Message d'erreur associé au Téléphone s'affiche", async function() {
  await expect(this.backofficePage.locator('div.p-message-text').filter({ hasText: "Saisie incorrecte (10 caractères ; Exemple : 07 21 30 89 28)" }).first()).toBeVisible();
});

Then("Message d'erreur s'affiche", async function() {
  const heading = await this.backofficePage.getByText("Saisie incorrecte");
  await expect(heading).toBeVisible();
});

Then("Revient sur la page initiale depuis la page d'enregistrement, signalement sans rendez-vous: \"Signaler l’arrivée d’un usager\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("Signaler l’arrivée d’un usager");
  await expect(heading).toBeVisible();
});