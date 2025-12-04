const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const {  expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
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


Given("La page \"Choisir le motif de visite\" d'un signalement sans rendez-vous est ouverte", async function() {
	await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.locator('button').filter({ hasText: "Usager sans rendez-vous" }).click();
	await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();

	// Remplir les informations de l'usager
	const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
	await inputNIRLocator.fill(generateRandomNIR());
	const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
	await inputPhoneLocator.fill(generateRandomPhone());
	const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
	await expect(buttonLocator).toBeEnabled();
	await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();

	// Page Motif de visite 
	const headingMotif = await this.backofficePage.getByText("Choisir le motif de visite");
	await expect(headingMotif).toBeVisible();
});


Given('Choisir motif: {string}', async function (motif) {
  const inputOfficeTypeLocator = this.backofficePage.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = this.backofficePage.locator(`li[aria-label="${motif}"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("Choisir sous-motif: {string}", async function (sousMotif) {
  const inputOfficeLocator = this.backofficePage.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await this.backofficePage.locator(`li[aria-label="${sousMotif}"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe(sousMotif);
});

// --------------------------------------
When("Cliquer sur 'Continuer' de la page motif", async function() {
  await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page motif", async function() {
  await this.backofficePage.locator('button[aria-label="Quitter"]').click();
});

// --------------------------------------

Then("Passe à l'etape suivant: \"L’usager a été ajouté dans la file d’attente\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("L’usager a été ajouté dans la file d’attente");
  await expect(heading).toBeVisible();
});

Then("Chaque sous-motif de la liste doit contenir: {string}", async function (sousMotif) {
  const liSousMotifLocator = await this.backofficePage.locator(`text=${sousMotif}`).first();
  const ariaLabels = await liSousMotifLocator.locator('..').locator('..').locator('li').allTextContents();
  const normalizedMotif = sousMotif.toLowerCase();
  const containsMotif = ariaLabels.every(label => label.toLowerCase().includes(normalizedMotif));
  expect(containsMotif).toBeTruthy();
});

Then("Revient sur la page initiale depuis la page motif: \"Signaler l’arrivée d’un usager\" s'affiche sur la page", async function() {
  const heading = await this.backofficePage.getByText("Signaler l’arrivée d’un usager");
  await expect(heading).toBeVisible();
});

After(async function () {
    console.log('==> CLEANING OF TICKET CREATED');
    
    if (!(await this.backofficePage.locator('text="Numéro à communiquer à l’usager"').count() > 0)) {
        console.log('==> Aucun ticket à nettoyer');
        return;
    }
    
    // Chercher le numero du ticket
    const pElement = this.backofficePage.locator('text="Numéro à communiquer à l’usager"').locator('xpath=/following-sibling::div[1]/p');
    this.ticket = await pElement.textContent();
	console.log('==> Ticket to delete: ' + this.ticket);

    if (!this.ticket) {
        console.log('==> Aucun ticket a néttoyer');
        return;
    }
	this.backofficePage.locator('button').filter({ hasText: 'Terminer' }).click()


    //***********************   Supprimer le ticket créé *************************/
    
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await this.backofficePage.waitForTimeout(2000); 

    // Localiser le ticket dans la section "Attente sans RDV"
    const ticketBlock = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/)
                                           .locator('xpath=..//..//..')
                                           .locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    
    await ticketBlock.locator('..').locator('button[title="Annuler le ticket"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('.modal-dialog footer button').filter({ hasText: 'Oui' }).click();

    await ticketBlock.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> Ticket deleted');
});

