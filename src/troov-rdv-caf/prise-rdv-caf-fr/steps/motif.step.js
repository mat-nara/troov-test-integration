const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')

setDefaultTimeout(60 * 1000);

// Scenario 1: Affichage du parcours de prise de RDV
Given("L'utilisateur ouvre le lien du prise de rendez-vous", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');
});

Then("Le parcours de prise de RDV s'affiche correctement à l'écran dans un délai acceptable", async function() {
    
    const locator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await expect(locator).toBeVisible({ timeout: 20000 }); // Quel est le motif du rendez-vous ? visible délai acceptable (5s) 
});

// Scenario 2: Selection du motif/sous-motif
Given("La page sélection de motif du parcours rendez-vous est ouvert", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');
});

Given("L'utilisateur choisit le motif de rendez-vous: {string}", async function (motif) {
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    console.log('updatedTextOfficeType: ', updatedTextOfficeType)
    expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("L'utilisateur choisit le sous-motif de rendez-vous: {string}", async function (sousMotif) {

    const inputOfficeLocator = this.terminalPage.locator('label[for="sub-officeType"] + div span.p-select-label');
    console.log('wait for visible click ...')
    await inputOfficeLocator.locator('..').locator('.p-select-dropdown-icon').waitFor({ state: 'visible' });
    await inputOfficeLocator.locator('..').click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"] span:not(.tui-hidden)`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(sousMotif);
});

When("Il clique sur le bouton 'Continuer' de la page de sélection du motif", async function() {
    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
});

Then("Il est redirigé vers la page suivante avec le titre \"Choisir votre créneau\"", async function() {
    const label = this.terminalPage.locator('label', { hasText: /Choisir votre créneau - \d+\/\d+/ });
    await expect(label).toBeVisible();
});