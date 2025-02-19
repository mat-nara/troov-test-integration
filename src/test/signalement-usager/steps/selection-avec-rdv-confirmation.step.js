const { Given, When, Then, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { initializeBrowser, closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')
const fs = require('fs');


setDefaultTimeout(60 * 1000);

Given("La page de confirmation de la création de ticket avec rendez-vous est ouverte", async function() {

  // Page principale
  await this.terminalPage.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = this.terminalPage.locator('button[aria-label="J\'ai un rendez-vous"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();

  // Page recherche
  const heading = await this.terminalPage.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
  const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill(global.NIR);
  const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(global.phone);
  const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
  await buttonLocator.click();

  // Page de confirmation
  const headingConfirmation = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(headingConfirmation).toBeVisible();
});

// La page de confirmation sans rendez-vous s'affiche correctement 
Then("Le titre \"Vous êtes bien enregistré !\" s'affiche sur la page", async function() {
  const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page", async function() {

  //***** */ Heure du rendez-vous
	const rendezVousTextLocator = this.terminalPage.getByText('Votre rendez-vous de');
	const timeLocator = rendezVousTextLocator.locator('b');
	const rendezVousTime = await timeLocator.textContent();
  // Vérifier que l'heure est au format "HHhMM" (e.g., "19h30")
  expect(rendezVousTime).toMatch(/^\d{2}h\d{2}$/);

	//***** */ Date/Heure de l'enregistrement
	const dateTextLocator = this.terminalPage.getByText('Enregistré le');
  const dateEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(1)');
  const timeEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(2)');
  
  const recordedDate = await dateEnregistrementLocator.textContent();
  const recordedTime = await timeEnregistrementLocator.textContent();

  // Vérifier que la date est au format "DD/MM/YYYY"
  expect(recordedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

  // Vérifier que l'heure est au format "HHhMM"
  expect(recordedTime).toMatch(/^\d{2}h\d{2}$/);

	 //***** */ Motif
		const motifTextLocator = this.terminalPage.getByText('Motif :');
		const motifLocator = motifTextLocator.locator('b');
		const motif = await motifLocator.textContent();
		expect(motif).toBeTruthy();
});

// Téléchargement du ticket digital
When("l'utilisateur clique sur le bouton \"Télécharger mon ticket\"", async function() {
    const buttonDownload = this.terminalPage.getByText('Télécharger mon ticket');
    await buttonDownload.click();
});

Then("le fichier ticket digital sur page de confirmation avec rendez-vous doit être téléchargé", async function() {

	const download = await this.terminalPage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});
