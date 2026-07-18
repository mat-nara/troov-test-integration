const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
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


When("Il clique sur \"Fil d'attente\", ensuite \"Signaler une arrivée\" puis \"Usager avec rendez-vous\"", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.locator('button').filter({ hasText: "Usager avec rendez-vous" }).click();
});


Then("La page \"Enregistrer l’usager\" s'affiche", async function() {
  await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();
});