const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')


setDefaultTimeout(60 * 1000);

Given("La page de confirmation de la création de ticket sans rendez-vous est ouverte", async function() {

  // Page principale
  await this.terminalPage.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = this.terminalPage.locator('button[name="with-rdv"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();

  // Page enregistrement
  const heading = await this.terminalPage.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
  const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill('1234567891111');
  const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill('1234567891');
  const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
  await expect(buttonLocator).toBeEnabled();
  await buttonLocator.click();

  // Page Motif de visite 
  const headingMotif = await this.terminalPage.getByText("Je choisis mon motif de visite");
  await expect(headingMotif).toBeVisible();
  const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = this.terminalPage.locator(`li[aria-label="Enfant"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe("Enfant");
  const inputOfficeLocator = this.terminalPage.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="J'attends / J'accueille un enfant"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe("J'attends / J'accueille un enfant");
  await this.terminalPage.locator('button[aria-label="Continuer"]').click();

  // Page de confirmation
});

// Téléchargement du ticket digital
When("L'utilisateur clique sur le bouton \"Télécharger mon ticket\" de la page confirmation signalement sans rendez-vous", async function() {
  await this.terminalPage.getByText('Télécharger mon ticket').click();
});

// La page de confirmation sans rendez-vous s'affiche correctement 
Then("Le titre \"Vous êtes bien enregistré !\" s'affiche sur la page de confirmation signalement sans rendez-vous", async function() {
  const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la page", async function() {

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

Then("Le fichier ticket digital sur page de confirmation sans rendez-vous doit être téléchargé", async function() {
  const download = await this.terminalPage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

