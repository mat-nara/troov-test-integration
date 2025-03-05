const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const { fakerFR } = require('@faker-js/faker');
const { generateRandomNIR, generateRandomPhone } = require('../utils/helper');



setDefaultTimeout(60 * 1000);

let nom, prenom;

Given("La fenêtre \"Informations de l'usager\" sans rendez-vous est ouverte", async function() {
	await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.waitForTimeout(1000);

	// Page principale signalement d'un arrivée
	const headingSignalement = await this.backofficePage.getByText("Je signale une arrivée pour :");
  await expect(headingSignalement).toBeVisible();

	const sansRdvButton = this.backofficePage.locator('button:has-text("Un usager sans RDV")');
  await sansRdvButton.click();
	await this.backofficePage.waitForTimeout(1000);

	// Choisir un service
	const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
  await expect(headingService).toBeVisible();

	const nextSibling = headingService.locator('xpath=following-sibling::*[1]');
	const firstServiceButton = nextSibling.locator('xpath=child::*[1]').locator('button');
	await firstServiceButton.click();

  const validerButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerButton.click();

	// Page Information de l'usager
	const heading = await this.backofficePage.getByText("Je renseigne les informations de l’usager qui souhaite prendre un RDV");
  await expect(heading).toBeVisible();  
});

// Scenario Nom uniquement
Given("Le nom uniquement est saisi | signalement sans rendez-vous", async function() {
	nom = fakerFR.person.lastName()
	await this.backofficePage.locator('#lastname').fill(nom);
});

// Scenario Prénom uniquement
Given("Le prénom uniquement est saisi | signalement sans rendez-vous", async function() {
	prenom = fakerFR.person.firstName()
	await this.backofficePage.locator('#firstname').fill(prenom);
});

// Scenario Nom et prénom sont saisie
Given("Le nom et le prénom sont saisis | signalement sans rendez-vous", async function() {
	nom = fakerFR.person.lastName()
	await this.backofficePage.locator('#lastname').fill(nom);

	prenom = fakerFR.person.firstName()
	await this.backofficePage.locator('#firstname').fill(prenom);
});

// Scenario NIR uniquement
Given("Le NIR uniquement est saisi | signalement sans rendez-vous", async function() {
	const NIR = generateRandomNIR()
	await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(NIR);
});

// Scenario Nom saisie au mauvais format
Given("que le nom est saisi au mauvais format dans un signalement sans rendez-vous", async function() {

  nom = fakerFR.person.lastName() + '21' // Ajouter un nombre au nom
	await this.backofficePage.locator('#lastname').fill(nom);

	prenom = fakerFR.person.firstName()
	await this.backofficePage.locator('#firstname').fill(prenom);
});

// Scenario Prénom saisie au mauvais format
Given("que le prénom est saisi dans un mauvais format dans un signalement sans rendez-vous", async function() {

  nom = fakerFR.person.lastName() 
	await this.backofficePage.locator('#lastname').fill(nom);

	prenom = fakerFR.person.firstName() + '21' // Ajouter un nombre au prenom
	await this.backofficePage.locator('#firstname').fill(prenom);
});

// Scenario Prénom saisie au mauvais format
Given("que le NIR est saisi au mauvais format dans un signalement sans rendez-vous", async function() {

	nom = fakerFR.person.lastName()
	await this.backofficePage.locator('#lastname').fill(nom);

	prenom = fakerFR.person.firstName() // Ajouter un nombre au prenom
	await this.backofficePage.locator('#firstname').fill(prenom);

	const NIR = generateRandomNIR().slice(0, -1);
	await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(NIR);
});

// ------------------------------------------------------------------------

When("L'utilisateur clique sur 'Valider' sur la page des informations de l'usager pour un signalement sans rendez-vous", async function() {
	const validerButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerButton.click();
});

When("L'utilisateur clique sur 'Retour' de la page des informations de l'usager", async function() {
  const validerButton = this.backofficePage.locator('button:has-text("Retour")');
	await validerButton.click();
});

// ------------------------------------------------------------------------

Then("L'étape suivante est atteinte : \"Sélectionnez le RDV qui concerne l'usager\" s'affiche sur la page après la page des informations de l'usager", async function() {
  const heading = await this.backofficePage.getByText("Sélectionnez le RDV qui concerne l'usager");
  await expect(heading).toBeVisible();
});

Then("Le nom saisi récemment s'affiche sur la page de confirmation", async function() {
  const element = await this.backofficePage.getByText(nom);
  await expect(element).toBeVisible();
});

Then("Le prénom saisi récemment s'affiche sur la page de confirmation", async function() {
  const element = await this.backofficePage.getByText(prenom);
  await expect(element).toBeVisible();
});

Then("Le nom et le prénom saisi récemment s'affiche sur la page de confirmation", async function() {
  const elementNom = await this.backofficePage.getByText(nom);
  await expect(elementNom).toBeVisible();

	const elementPrenom = await this.backofficePage.getByText(prenom);
  await expect(elementPrenom).toBeVisible();
});

Then("un message d'erreur relatif au nom s'affiche", async function() {
  const message = await this.backofficePage.locator("#firstname-invalid-feedback");
  await expect(message).toBeVisible();
});

Then("un message d'erreur relatif au prénom s'affiche", async function() {
  const message = await this.backofficePage.locator("#lastname-invalid-feedback");
  await expect(message).toBeVisible();
});

Then("un message d'erreur relatif au NIR s'affiche", async function() {
	const message = await this.backofficePage.locator("#NIR-invalid-feedback");
	await expect(message).toBeVisible();
});

Then("L'utilisateur revient sur la page de choix du service pour un signalement sans rendez-vous : \"Je choisis le service pour lequel l’usager souhaite prendre un RDV\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
  await expect(heading).toBeVisible();
});
