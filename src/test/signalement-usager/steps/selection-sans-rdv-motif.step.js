const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const {  expect } = require('@playwright/test');
const {  closeBrowser } = require('./browserSetup');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');



setDefaultTimeout(60 * 1000);

Given("La page 'Je choisis mon motif de visite' sans rendez-vous est ouverte", async function() {

  // Page principale
  await this.terminalPage.goto(config.troovCafUserArrivalURL);
  const sansRdvButton = this.terminalPage.locator('button[name="with-rdv"]');
  await sansRdvButton.waitFor();
  await sansRdvButton.click();

  // Page enregistrement
  const heading = await this.terminalPage.getByText("Je m'enregistre");
  await expect(heading).toBeVisible();
  const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
  await inputNIRLocator.fill(generateRandomNIR());
  const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(generateRandomPhone());
  const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
  await expect(buttonLocator).toBeEnabled();
  await buttonLocator.click();

  // Page Motif de visite 
  const headingMotif = await this.terminalPage.getByText("Je choisis mon motif de visite");
  await expect(headingMotif).toBeVisible();
});

Given('Choisir motif: {string}', async function (motif) {
  const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("Choisir sous-motif: {string}", async function (sousMotif) {
  const inputOfficeLocator = this.terminalPage.locator('label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe(sousMotif);
});

// --------------------------------------
When("Cliquer sur 'Continuer' de la page motif", async function() {
  await this.terminalPage.locator('button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page motif", async function() {
  await this.terminalPage.locator('button[aria-label="Quitter"]').click();
});

// --------------------------------------

Then("Passe à l'etape suivant: \"Vous êtes bien enregistré !\" s'affiche sur la page", async function() {
  const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
});

Then("Chaque sous-motif de la liste doit contenir: {string}", async function (sousMotif) {
  const liSousMotifLocator = await this.terminalPage.locator(`text=${sousMotif}`).first();
  const ariaLabels = await liSousMotifLocator.locator('..').locator('..').locator('li').allTextContents();
  const normalizedMotif = sousMotif.toLowerCase();
  const containsMotif = ariaLabels.every(label => label.toLowerCase().includes(normalizedMotif));
  expect(containsMotif).toBeTruthy();
});

Then("Revient sur la page initiale depuis la page motif: \"Je signale mon arrivée\" s'affiche sur la page", async function() {
  const heading = await this.terminalPage.getByText("Je signale mon arrivée");
  await expect(heading).toBeVisible();
});

After(async function () {
    console.log('==> CLEANING OF TICKET CREATED');
    
    if (!(await this.terminalPage.locator('text="Vous êtes bien enregistré !"').count() > 0)) {
        console.log('==> Aucun ticket à nettoyer');
        return;
    }
    
    // Chercher le numero du ticket
    const pElement = this.terminalPage.locator('text="Vous êtes bien enregistré !"').locator('xpath=../following-sibling::*[1]/child::*[2]/p');
    this.ticket = await pElement.textContent();

    if (!this.ticket) {
        console.log('==> Aucun ticket a néttoyer');
        return;
    }

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

