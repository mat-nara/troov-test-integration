const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { fakerFR } = require('@faker-js/faker');


setDefaultTimeout(60 * 1000);

Given("La fenêtre \"Retrouver le RDV\" du signalement avec rendez-vous est ouverte", async function() {
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
		await signalerArriveeButton.waitFor({ state: 'visible' });
		await signalerArriveeButton.click();

		// Page de signalement usager principale
    const element = await this.backofficePage.getByText("Je signale une arrivée pour :");
    await expect(element).toBeVisible();
		const avecRdvButton = this.backofficePage.locator('button:has-text("Un usager avec RDV")');
  	await avecRdvButton.click();

		// Page de Recherche de rendez-vous 
		const heading = await this.backofficePage.getByText("Retrouver le RDV");
  	await expect(heading).toBeVisible();
});

// Recherche par nom uniquement: Le RDV est retrouvé
Given("que l'utilisateur saisit uniquement le nom de la personne", async function() {
	
	const inputLocator = this.backofficePage.getByPlaceholder('Nom');
	await inputLocator.focus();
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(global.nom, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.fill('');
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(global.nom, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000);
});

// Recherche par téléphone uniquement: Le RDV est retrouvé
Given("que l'utilisateur saisit uniquement le téléphone de la personne", async function() {
	const phone = '+33' + global.phone
	const inputLocator = this.backofficePage.getByPlaceholder('Numéro de téléphone');
	await inputLocator.focus();
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(phone, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.fill('');
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(phone, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000);
});
  
Given("que la liste des suggestions affiche la personne recherchée via nom en première position", async function() {
	const firstSuggestion = this.backofficePage.locator('.focus-contact').first();
	const element = firstSuggestion.getByText(global.nom);
	await expect(element).toBeVisible();
});

Given("que la liste des suggestions affiche la personne recherchée via téléphone en première position", async function() {
	const firstSuggestion = this.backofficePage.locator('.focus-contact').first();
	const phone = '+33' + global.phone
	const element = firstSuggestion.getByText(phone);
	await expect(element).toBeVisible();
});

Given("que l'utilisateur sélectionne cette personne", async function() {
	const firstSuggestion = this.backofficePage.locator('.focus-contact').first();
	await firstSuggestion.click();
});

// Nom sans RDV - Aucune suggestion affichée
Given("que l'utilisateur saisit un nom sans rendez-vous associé", async function() {

	const nomSansRdv = fakerFR.person.lastName()
	
	const inputLocator = this.backofficePage.getByPlaceholder('Nom');
	await inputLocator.focus();
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(nomSansRdv, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.fill('');
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(nomSansRdv, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000);
});

// Téléphone sans RDV - Aucune suggestion affichée 
Given("que l'utilisateur saisit un téléphone sans rendez-vous associé", async function() {
	const phoneSansRdv = '+33' + generateRandomPhone();
	const inputLocator = this.backofficePage.getByPlaceholder('Numéro de téléphone');
	await inputLocator.focus();
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(phoneSansRdv, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.fill('');
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(phoneSansRdv, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000);
});

Given("aucune suggestion ne s'affiche", async function() {
	await expect(this.backofficePage.locator('.focus-contact')).toHaveCount(0);
});

// ---------------------------------------------------------------------------------------------------------

When("il clique sur le bouton \"Valider\" sur la page de recherche de RDV", async function() {
	const validerButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerButton.click();
});

When("Cliquer sur 'Retour' de la page: recherche de RDV", async function() {
	const retourButton = this.backofficePage.locator('button:has-text("Retour")');
	await retourButton.click();
});

// ---------------------------------------------------------------------------------------------------------

Then("le rendez-vous correspondant est affiché et disponible pour la confirmation", async function() {
	const infoRdv = this.backofficePage.locator('.info-rdv').first();
	await expect(infoRdv).toBeVisible();
});

Then("aucun rendez-vous n'est affiché et disponible pour la confirmation", async function() {
	await expect(this.backofficePage.locator('.info-rdv')).toHaveCount(0);
});

Then("Revient sur la page initiale: \"Je signale une arrivée pour :\" s'affiche sur la page", async function() {
	const heading = this.backofficePage.getByText('Je signale une arrivée pour :');
	await expect(heading).toBeVisible();
});