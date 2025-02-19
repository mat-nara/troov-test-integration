const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

let ticket = ""
let motif = ""

Given("que un signalement d'arrivée sans rendez-vous est confirmé", async function() {
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
  const headingConfirmation = await this.terminalPage.getByText("Vous êtes bien enregistré !");
  await expect(headingConfirmation).toBeVisible();

  // Chercher le numero du ticket
  const enregistrerTextLocator = this.terminalPage.locator('text="Vous êtes bien enregistré !"');
  const parentNode = enregistrerTextLocator.locator('xpath=..');
  const nextSibling = parentNode.locator('xpath=following-sibling::*'); 
  const secondChild = nextSibling.locator('xpath=child::*[2]');
  const pElement = secondChild.locator('p');

  ticket = await pElement.textContent();
  
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

Then("le ticket doit s'afficher dans la file d'attente sans rendez-vous", async function() {
  console.log('ticket number: ', ticket);
  
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")');

  await expect(ticketBlock).toBeVisible();
});


Then("le numéro et le motif du ticket confirmé doivent correspondre à ceux présents dans la file d'attente", async function() {
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")');

  await expect(ticketBlock).toBeVisible();

  const motifBlock = ticketBlock.locator('xpath=..//..').getByText(motif);
  await expect(motifBlock).toBeVisible();
});