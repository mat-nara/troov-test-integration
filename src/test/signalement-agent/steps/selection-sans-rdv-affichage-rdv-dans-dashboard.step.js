const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
const exp = require('constants');
const { fakerFR } = require('@faker-js/faker');

setDefaultTimeout(60 * 1000);

let motif, nom, prenom;

Given("qu’un signalement d’arrivée côté agent sans rendez-vous est confirmé.", async function() {
	await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.waitForTimeout(2000);

	// Page principale signalement d'un arrivée
	const headingSignalement = await this.backofficePage.getByText("Je signale une arrivée pour :");
	await expect(headingSignalement).toBeVisible();

	const sansRdvButton = this.backofficePage.locator('button:has-text("Un usager sans RDV")');
	await sansRdvButton.click();
	await this.backofficePage.waitForTimeout(2000);

	// Choisir un service
	const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
	await expect(headingService).toBeVisible();

	const nextSibling = headingService.locator('xpath=following-sibling::*[1]');
	const firstServiceButton = nextSibling.locator('xpath=child::*[1]').locator('button');
	await firstServiceButton.click();

	motif = await firstServiceButton.textContent();

	const validerButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerButton.click();

	// Page Information de l'usager
	const heading = await this.backofficePage.getByText("Je renseigne les informations de l’usager qui souhaite prendre un RDV");
	await expect(heading).toBeVisible();  

	nom = fakerFR.person.lastName();
	await this.backofficePage.locator('#lastname').fill(nom);
	prenom = fakerFR.person.firstName();
	await this.backofficePage.locator('#firstname').fill(prenom);
	await this.backofficePage.waitForTimeout(1000);
	const validerInfoUserButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerInfoUserButton.click();
	await this.backofficePage.waitForTimeout(1000);

	// Page confirmation
	await this.backofficePage.getByText("Je confirme sans imprimer le ticket").click();
	await this.backofficePage.waitForTimeout(5000);
	
});

When("la page de la file d'attente du backoffice est ouverte | signalement sans rendez-vous côté agent", async function() {
	await this.backofficePage.locator('i[title="Mon équipe"]').click();
  const headEquipe = await this.backofficePage.getByText("Liste de vos équipes");
  await expect(headEquipe).toBeVisible();
	
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const element = await this.backofficePage.getByText("Usagers en attente:");
  await expect(element).toBeVisible();
	
});

Then("Le signalement sans rendez-vous côté agent doit s'afficher dans la file d'attente avec les informations correspondantes", async function() {

  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  //const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")');
	const prenomLocator = parentBlock.getByText('● ' + prenom);

	// Vérification prénom
	await expect(prenomLocator).toBeVisible();

	// Vérification nom et prénom
	const nomLocator = prenomLocator.getByText(nom);
	await expect(nomLocator).toBeVisible();

	// vérification motif
	const motifLocator = prenomLocator.getByText(motif);
	await expect(motifLocator).toBeVisible();
});