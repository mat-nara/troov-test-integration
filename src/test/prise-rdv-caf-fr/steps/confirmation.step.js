const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker  } = require('@faker-js/faker');

setDefaultTimeout(30 * 1000);

Given("La page de confirmation est ouverte", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');

    this.motif = 'Enfant'
    this.sousMotif = "J'attends / J'accueille un enfant"

    // Choix du motif
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${this.motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe(this.motif);

    // choix du sous-motif
    const inputOfficeLocator = this.terminalPage.locator('label[for="sub-officeType"] + div span.p-select-label');
    await inputOfficeLocator.locator('..').locator('.p-select-dropdown-icon').waitFor({ state: 'visible' });
    await inputOfficeLocator.locator('..').click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${this.sousMotif}"] span:not(.tui-hidden)`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(this.sousMotif);

    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
    
    // Page choix du creneau
    const rdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span').nth(0);

    this.day   = await rdvLocator.locator('xpath=../../../../../preceding-sibling::*').locator('.tui-font-bold').textContent();
    this.date  = await rdvLocator.locator('xpath=../../../../../preceding-sibling::*').locator('.tui-font-normal').textContent();
    this.time  = await rdvLocator.locator('xpath=../../h2').textContent();
    let content = await rdvLocator.textContent(); 
    content = content.split(" ");
    this.mode  = content[content.length -1];

    await rdvLocator.click()
    const firstRdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel').nth(0);
    await firstRdvLocator.locator('button[aria-label="Sélectionner"]').click();


    // Page Contact
    const email = faker.person.firstName().toLowerCase() + '@test.com';
    const phone = generateRandomPhone();

    await this.terminalPage.locator('input[name="email"]').fill(email);
    await this.terminalPage.locator('input[name="mobile"]').fill(phone);
    await this.terminalPage.locator('div[name="notification-method"] > button:first-child').click();

    await this.terminalPage.locator('button[aria-label="Valider"]').click();

    // Page Confirmation
});

Then("Les informations du rdv sont correctes", async function() {
    const heading = await this.terminalPage.getByText("Votre rendez-vous sur site est confirmé");
    await expect(heading).toBeVisible();

    // Convert date
    const [dayNumber, monthNumber] = this.date.split("/");
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const monthName = months[parseInt(monthNumber, 10) - 1];

    // Format final date
    const fullDate = `${this.day} ${dayNumber} ${monthName} - ${this.time}`;

    const dateRdv = await this.terminalPage.getByText(fullDate);
    await expect(dateRdv).toBeVisible();

    const modeRdv = await this.terminalPage.getByText(this.mode);
    await expect(modeRdv).toBeVisible();

    const motifRdv = await this.terminalPage.getByText(this.motif, { exact: true }).first();
    await expect(motifRdv).toBeVisible();

    const sousMotifRdv = await this.terminalPage.getByText(this.sousMotif, { exact: true }).first();
    await expect(sousMotifRdv).toBeVisible();
});

