const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

let ticket = ""
let motif = ""

Given("que un signalement d'arrivée avec rendez-vous est confirmé", async function() {
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

  // Chercher le numero du ticket
  const enregistrerTextLocator = this.terminalPage.locator('text="Vous êtes bien enregistré !"');
  const parentNode = enregistrerTextLocator.locator('xpath=..');
  const nextSibling = parentNode.locator('xpath=following-sibling::*'); 
  const secondChild = nextSibling.locator('xpath=child::*[2]');
  const pElement = secondChild.locator('p');

  // Cherche le motif du ticket
  const thirdChild = nextSibling.locator('xpath=child::*[3]');
  const motifInfo = await thirdChild.getByText('Motif :').textContent();

  const match = motifInfo.match(/Motif :\s*(.*)/);
  
  ticket = await pElement.textContent();
  motif = match[1].trim()
});

When("la page de la file d'attente du backoffice est ouverte", async function() {
  await this.backofficePage.locator('i[title="File d\'attente"]').click();
  const element = await this.backofficePage.getByText("Usagers en attente:");
  await expect(element).toBeVisible();
});

Then("le ticket doit s'afficher dans la file d'attente avec rendez-vous", async function() {
  console.log('ticket number: ', ticket);
  console.log('ticket motif: ', motif);
  
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")');

  await expect(ticketBlock).toBeVisible();
});


Then("le numéro et le motif du ticket confirmé doivent correspondre à ceux présents dans la file d'attente", async function() {
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")');

  await expect(ticketBlock).toBeVisible();

  const motifBlock = ticketBlock.locator('xpath=..//..').getByText(motif);
  await expect(motifBlock).toBeVisible();
});