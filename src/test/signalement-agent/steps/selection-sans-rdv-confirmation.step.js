const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
const { fakerFR } = require('@faker-js/faker');


setDefaultTimeout(60 * 1000);

let motif, nom, prenom;

Given("La fenêtre de confirmation de la création de ticket sans rendez-vous est ouverte", async function() {
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
	const validerInfoUserButton = this.backofficePage.locator('button:has-text("Valider")');
	await validerInfoUserButton.click();

	// Page confirmation
});


// Confirmation et téléchargement du ticket digital
When("L'utilisateur clique sur le bouton \"Télécharger mon ticket\" de la page confirmation signalement sans rendez-vous", async function() {
    await this.backofficePage.getByText("Je confirme et j'imprime le ticket").click();
});


Then("Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la fenêtrer sans rendez-vous", async function() {
	const motifTextLocator = this.backofficePage.locator(".info-rdv").getByText(motif);
	await expect(motifTextLocator).toBeVisible();
});

Then("Le fichier ticket digital sur page de confirmation sans rendez-vous doit être téléchargé", async function() {
	const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});