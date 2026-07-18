const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')

setDefaultTimeout(60 * 1000);

Given("La fenêtre \"signaler une arrivée\" est ouverte | signalement sans rendez-vous", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();

  await expect(this.backofficePage.locator('header').filter({ hasText: "Signaler une arrivée" }).first()).toBeVisible();
});

When("Cliquer sur \"Un usager sans RDV\"", async function() {
  await this.backofficePage.locator('button').filter({ hasText: "Usager sans rendez-vous" }).click();
});

Then("On passe a la page \"Enregistrer l'usager\"", async function() {
  await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();
});