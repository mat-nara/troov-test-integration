const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

Given("La fenêtre \"signaler une arrivée\" est ouverte | signalement sans rendez-vous", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();

	const element = await this.backofficePage.getByText("Je signale une arrivée pour :");
  await expect(element).toBeVisible();
});

When("Cliquer sur \"Un usager sans RDV\"", async function() {
  const sansRdvButton = this.backofficePage.locator('button:has-text("Un usager sans RDV")');
  await sansRdvButton.click();
});

Then("On passe aux choix du motif", async function() {
  const heading = await this.backofficePage.getByText("Je choisis le service pour lequel l’usager souhaite prendre un RDV ");
  await expect(heading).toBeVisible();
});