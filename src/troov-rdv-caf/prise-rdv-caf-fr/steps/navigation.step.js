const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker  } = require('@faker-js/faker');


setDefaultTimeout(30 * 1000);

Given("La page de contact est ouverte", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');

    let motif = 'Enfant'
    let sousMotif = "J'attends / J'accueille un enfant"

    // Choix du motif
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe(motif);

    // choix du sous-motif
    const inputOfficeLocator = this.terminalPage.locator('label[for="sub-officeType"] + div span.p-select-label');
    await inputOfficeLocator.locator('..').locator('.p-select-dropdown-icon').waitFor({ state: 'visible' });
    await inputOfficeLocator.locator('..').click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"] span:not(.tui-hidden)`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(sousMotif);

    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
    
    // Page choix du creneau
    const rdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span').nth(0);
    await rdvLocator.click()
    const firstRdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel').nth(0);
    await firstRdvLocator.locator('button[aria-label="Sélectionner"]').click();

    // Page Contact
    const heading = await this.terminalPage.getByText("Confirmer vos coordonnées :");
    await expect(heading).toBeVisible();
});

Given("L'écran de choix du créneau est ouvert", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');

    let motif = 'Enfant'
    let sousMotif = "J'attends / J'accueille un enfant"

    // Choix du motif
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe(motif);

    // choix du sous-motif
    const inputOfficeLocator = this.terminalPage.locator('label[for="sub-officeType"] + div span.p-select-label');
    await inputOfficeLocator.locator('..').locator('.p-select-dropdown-icon').waitFor({ state: 'visible' });
    await inputOfficeLocator.locator('..').click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"] span:not(.tui-hidden)`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(sousMotif);

    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
    
    // Page choix du creneau
    const heading = await this.terminalPage.getByText("Choisir votre créneau");
    await expect(heading).toBeVisible();
});


// -----------------------------------------------------------------------------

When("L'utilisateur clique sur \"Créneau\" dans la barre d'étape", async function() {
    await this.terminalPage.locator('.p-steplist .p-button div').filter({ hasText: "Créneau" }).click();
});

When("L'utilisateur clique sur le bouton \"Précédent\"", async function() {
    await this.terminalPage.locator('button[aria-label="Précédent"]').click();
});

When("L'utilisateur clique sur \"Motif\" dans la barre d'étape", async function() {
    await this.terminalPage.locator('.p-steplist .p-button div').filter({ hasText: "Motif" }).click();
});

When("L'utilisateur clique sur le bouton \"Modifier le motif\"", async function() {
    await this.terminalPage.locator('button[aria-label="Modifier le motif"]').click();
});


// -----------------------------------------------------------------------------

Then("L'utilisateur est redirigé vers l'écran de choix du créneau et le message \"Choisir votre créneau\" s'affiche", async function() {
    const label = this.terminalPage.locator('label', { hasText: /Choisir votre créneau - \d+\/\d+/ });
    await expect(label).toBeVisible();
});

Then("L'utilisateur est redirigé vers l'écran de choix du motif et le message \"Quel est le motif du rendez-vous ?\" s'affiche", async function() {
    const locator = this.terminalPage.locator('label:has-text("Quel est le motif du rendez-vous ?")');
    await expect(locator).toBeVisible();
});