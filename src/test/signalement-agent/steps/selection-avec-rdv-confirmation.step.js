const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');

setDefaultTimeout(60 * 1000);

Given("La fenêtre de confirmation de la création de ticket avec rendez-vous est ouverte", async function() {
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
});

// ---------------------------------
// Confirmation et téléchargement du ticket digital
When("L'utilisateur clique sur le bouton \"Je confirme et j'imprime le ticket\" de la page confirmation signalement avec rendez-vous", async function() {
	// Selectionne le premier rendez-vous au cas ou plusieurs ont été enregistré
	const rdvLocator = this.backofficePage.locator('span:has-text("' + global.nom + '")').first().locator('xpath=..');
	await rdvLocator.click();

	// Imprimer le ticket
  await this.backofficePage.getByText("Je confirme et j'imprime le ticket").click();
});

When("Cliquer sur \"Ce n'est pas le bon RDV\" de la page: confirmation de RDV", async function() {
	await this.backofficePage.getByText("Ce n'est pas le bon RDV").click();
});

// ---------------------------------

Then("Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la fenêtrer avec rendez-vous", async function() {
	// Vérifier le prenoms s'affiche
	const nomLocator = this.backofficePage.locator('span:has-text("' + global.nom + '")').first();
	await expect(nomLocator).toBeVisible();
	
	const prenoms = await nomLocator.locator('xpath=..').evaluate(el => {
			return el.childNodes[el.childNodes.length - 1].textContent.trim();
	});
	expect(prenoms).toBe(global.prenoms);

	// Vérifier le motif s'affiche
	const motifTextLocator = this.backofficePage.locator(".info-rdv").first();
	await expect(motifTextLocator).toBeVisible();
});

Then("Le fichier ticket digital sur page de confirmation avec rendez-vous doit être téléchargé", async function() {
	const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Revient sur la page de recherche de rendez-vous: \"Retrouver le RDV\" s'affiche sur la page", async function() {
	const headLocator = this.backofficePage.getByText('Retrouver le RDV');
	await expect(headLocator).toBeVisible();
});


