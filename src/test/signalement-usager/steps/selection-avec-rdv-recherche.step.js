const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const { generateRandomNIR, generateRandomPhone } = require('../utils/helper');


setDefaultTimeout(60 * 1000);

Given("La page \"Je m'enregistre\" avec rendez-vous est ouverte", async function() {
    await this.terminalPage.goto(config.troovCafUserArrivalURL);
    const avecRdvButton = this.terminalPage.locator('button[aria-label="J\'ai un rendez-vous"]');
    await avecRdvButton.click();
    const heading = await this.terminalPage.getByText("Je m'enregistre");
    await expect(heading).toBeVisible();
});

// Scenario NIR uniquement
Given("que NIR uniquement est saisie", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(global.NIR);
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone uniquement
Given("que Téléphone uniquement est saisie", async function() {
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(global.phone);
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR et Téléphone sont saisie
Given("que NIR et Téléphone sont saisie", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(global.NIR);
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(global.phone);
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// NIR sans RDV: Un message d'erreur s'affiche
Given("que NIR sans RDV est saisie", async function() {
    var NIR = generateRandomNIR();
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(NIR);

    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// Phone sans RDV: Un message d'erreur s'affiche
Given("que phone sans RDV est saisie", async function() {
    var phone = generateRandomPhone();
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(phone);
    
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// NIR dans un mauvais format: Un message d'erreur s'affiche
Given("NIR saisie au mauvais format", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');

    // remove one character from NIR
    var NIR = global.NIR
    NIR = NIR.substring(0, NIR.length - 1)
    await inputNIRLocator.fill(NIR); // 12 caracter au lieu de 13
  
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(global.phone);
  
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
});

// Téléphone dans un mauvais format: Un message d'erreur s'affiche
Given("Téléphone saisie au mauvais format", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(global.NIR); 

    // remove one character from Phone number
    var phone = global.phone
    phone = phone.substring(0, phone.length - 1)
  
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(phone); // 9 caracter au lieu de 10
  
    const buttonLocator = await this.terminalPage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
  });


// ------------------------------------------------------------------------

When("Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV", async function() {
    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
});

When("Cliquer sur 'Quitter' de la page: Enregistrement avec RDV", async function() {
    await this.terminalPage.locator('button[aria-label="Quitter"]').click();
  });

// ------------------------------------------------------------------------

Then("Passe à l'etape suivant: \"Vous êtes bien enregistré !\" s'affiche sur la page confirmation avec RDV", async function() {
    const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
    await expect(heading).toBeVisible();
});

Then("Revient sur la page initiale: \"Je signale mon arrivée\" s'affiche sur la page", async function() {
    const heading = await this.terminalPage.getByText("Je signale mon arrivée");
    await expect(heading).toBeVisible();
});



Then("Message d'erreur NIR incorrecte s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte (13 caractères ; Exemple : 2 94 03 75 120 005)");
    await expect(heading).toBeVisible();
});

Then("Message d'erreur phone incorrecte s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte (10 caractères ; Exemple : 07 21 30 89 28)");
    await expect(heading).toBeVisible();
});

Then("Message d'erreur 'Aucun rendez-vous' s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Aucun rendez-vous");
    await expect(heading).toBeVisible();
});