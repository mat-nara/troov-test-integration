const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

Given("La fenêtre \"Choix du service\" est ouverte pour un signalement sans rendez-vous", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.waitForTimeout(1000);

	const headingSignalement = await this.backofficePage.getByText("Je signale une arrivée pour :");
  await expect(headingSignalement).toBeVisible();

	const sansRdvButton = this.backofficePage.locator('button:has-text("Un usager sans RDV")');
  await sansRdvButton.click();
	await this.backofficePage.waitForTimeout(1000);

	const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
  await expect(headingService).toBeVisible();
	
});

Given("L'utilisateur choisi sur un service pour un signalement sans rendez-vous", async function() {
	// Choisir un service
	const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
	const nextSibling = headingService.locator('xpath=following-sibling::*[1]');
	const firstServiceButton = nextSibling.locator('xpath=child::*[1]').locator('button');
	await firstServiceButton.click();

	// Le boutton doit etre bleu
	await expect(firstServiceButton).toHaveClass(/btn-primary/);
});

When("L'utilisateur clique sur 'Valider' sur la page de choix du service pour un signalement sans rendez-vous", async function() {
  const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
	const parentNode = headingService.locator('xpath=..');
	const validerButton = parentNode.locator('button:has-text("Valider")');
	await validerButton.click();
});

When("L'utilisateur clique sur 'Retour' de la fenêtre de choix du service", async function() {
  const headingService = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV");
	const parentNode = headingService.locator('xpath=..');
	const retourButton = parentNode.locator('button:has-text("Retour")');
	await retourButton.click();
});

Then("Passe à l'etape suivant: \"Je renseigne les informations de l’usager qui souhaite prendre un RDV\" s'affiche sur la page depuis la page choix du service", async function() {
  const heading = await this.backofficePage.getByText("Je renseigne les informations de l’usager qui souhaite prendre un RDV");
  await expect(heading).toBeVisible();
});

Then("L'utilisateur revient sur la page initiale depuis le choix du service : \"Je signale une arrivée pour :\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("Je signale une arrivée pour :");
  await expect(heading).toBeVisible();
});