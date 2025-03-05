const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

Given("qu’un signalement d’arrivée côté agent avec rendez-vous est confirmé.", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
	await this.backofficePage.mouse.move(0, 0);

	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();

	// Page de signalement usager principale
	const element = await this.backofficePage.getByText("Je signale une arrivée pour :");
	await expect(element).toBeVisible();
	const avecRdvButton = this.backofficePage.locator('button:has-text("Un usager avec RDV")');
	await avecRdvButton.click();

	// Page de Recherche de rendez-vous 
	const headingRechercher = await this.backofficePage.getByText("Retrouver le RDV");
	await expect(headingRechercher).toBeVisible();

	const inputLocator = this.backofficePage.getByPlaceholder('Nom');
	await inputLocator.focus();
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(global.nom, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.fill('');
	await this.backofficePage.waitForTimeout(1000); 
	await inputLocator.type(global.nom, { delay: 100 }); 
	await this.backofficePage.waitForTimeout(1000);
	
	const firstSuggestion = this.backofficePage.locator('.focus-contact').first(); 
	await firstSuggestion.click(); // selectionne le premier suggestion 

	const validerRechercheButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerRechercheButton.click(); // Clique sur valider

	// Page confirmation
	const headingConfirmation = await this.backofficePage.getByText("Sélectionnez le RDV qui concerne l'usager");
	await expect(headingConfirmation).toBeVisible();

	const rdvLocator = this.backofficePage.locator('span:has-text("' + global.prenoms + '")').first().locator('xpath=..');
	await rdvLocator.click(); // Selectionne le premier rendez-vous au cas ou plusieurs ont été enregistré

  await this.backofficePage.getByText("Je confirme sans imprimer le ticket").click(); 
});

When("la page de la file d'attente du backoffice est ouverte | signalement avec rendez-vous côté agent", async function() {
	await this.backofficePage.locator('i[title="Mon équipe"]').click();
  const headEquipe = await this.backofficePage.getByText("Liste de vos équipes");
  await expect(headEquipe).toBeVisible();
	
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const element = await this.backofficePage.getByText("Usagers en attente:");
  await expect(element).toBeVisible();
});


Then("Le signalement avec rendez-vous côté agent doit s'afficher dans la file d'attente avec les informations correspondantes", async function() {

	const attenteAvecRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
	const parentBlock = attenteAvecRDVHeader.locator('xpath=..//..//..'); 
	const prenomLocator = parentBlock.getByText('● ' + global.nom);

	// Vérification prénom
	await expect(prenomLocator).toBeVisible();
	});


