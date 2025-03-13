const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
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
});

Given("L'utilisateur saisit un email et un numéro de téléphone", async function() {
    const email = faker.person.firstName().toLowerCase() + '@test.com';
    const phone = generateRandomPhone();

    await this.terminalPage.locator('input[name="email"]').fill(email);
    await this.terminalPage.locator('input[name="mobile"]').fill(phone);
});

Given("L'utilisateur choisit un mode de contact", async function() {
    await this.terminalPage.locator('div[name="notification-method"] > button:first-child').click();
});

Given("L'utilisateur saisit un email au format incorrect", async function() {
    const email = faker.person.firstName().toLowerCase() + '@test'; // Pas de .com a l'adresse email
    const phone = generateRandomPhone();

    await this.terminalPage.locator('input[name="email"]').fill(email);
    await this.terminalPage.locator('input[name="mobile"]').fill(phone);

});

Given("L'utilisateur saisit un numéro de téléphone au format incorrect", async function() {
    const email = faker.person.firstName().toLowerCase() + '@test.com';
    const phone = generateRandomPhone().slice(0, -1); // Il manque un chiffre au numero téléphone

    await this.terminalPage.locator('input[name="email"]').fill(email);
    await this.terminalPage.locator('input[name="mobile"]').fill(phone);

});

// ----------------------------------------

When("L'utilisateur clique sur le bouton \"Valider\" sur la page de contact", async function() {
    await this.terminalPage.locator('button[aria-label="Valider"]').click();
});

// ----------------------------------------

Then("Le titre \"Confirmer vos coordonnées :\" s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Confirmer vos coordonnées :");
    await expect(heading).toBeVisible();
});

Then("L'utilisateur est redirigé vers l'écran de confirmation et le message \"Votre rendez-vous sur site est confirmé\" s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Votre rendez-vous sur site est confirmé");
    await expect(heading).toBeVisible();
});

Then("Un message d'erreur lié à l'email s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte");
    await expect(heading).toBeVisible();
});

Then("Un message d'erreur lié au téléphone s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte");
    await expect(heading).toBeVisible();
});
  
Then("Le mode de contact est défini correctement et les boutons de sélection sont cliquables", async function() {
    const notificationMethodLocator = this.terminalPage.locator('div[name="notification-method"]');
    const smsBtnLocator = notificationMethodLocator.locator('button').nth(0);
    const emailBtnLocator = notificationMethodLocator.locator('button').nth(1);

    // Expect button to be clickable
    await expect(smsBtnLocator).toBeEnabled();
    await expect(emailBtnLocator).toBeEnabled();

    // When one button is selected, the another one is not
    await smsBtnLocator.click();
    await expect(smsBtnLocator).toHaveClass(/.*p-togglebutton-checked.*/);
    expect(await emailBtnLocator.evaluate((button) => button.classList.contains('p-togglebutton-checked'))).toBe(false);

    await emailBtnLocator.click();
    await expect(emailBtnLocator).toHaveClass(/.*p-togglebutton-checked.*/);
    expect(await smsBtnLocator.evaluate((button) => button.classList.contains('p-togglebutton-checked'))).toBe(false);
});

