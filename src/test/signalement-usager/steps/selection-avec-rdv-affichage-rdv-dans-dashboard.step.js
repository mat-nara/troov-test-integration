const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const config = require('../../../../config/env.js')
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const LoginPage = require('../pages/LoginPage');
const { faker, fakerFR  } = require('@faker-js/faker');

let ticket = ""
let motif = ""

setDefaultTimeout(60 * 1000);


async function setupRdv(world) {

    console.log('==> CREATION OF RDV');
    await world.backofficePage.waitForTimeout(2000);

    // Open window Ajouter un RDV
    await world.backofficePage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    world.motif = "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de proche aidant (AJPA)"
    const selectorService = world.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = world.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: world.motif }).first(); 

    await firstItemService.click();

    // Choix du mode
    // const selectorModeDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Select heure du RDV 
    // const selectorDateDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Date du RDV' }).locator('xpath=following-sibling::span//div//input');
    // await selectorDateDuRDV.click();
    // world.backofficePage.locator('span[aria-label="jeudi 28 août 2025"]').nth(1).click();
    // await selectorDateDuRDV.fill('28/08/2025');

    const selectorHeureDuRDV = world.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  //

    // Create new user
    const selectorButtonCreerUser = world.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    world.name = faker.person.lastName();
    world.firstname = faker.person.firstName();
    // world.email = world.name.toLowerCase() + '@test.com';
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    world.email = world.name.toLowerCase() + "-" + world.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    // world.NIR = generategenerateRandomNIR();
    world.NIR = generateRandomNIR()
    world.phone = generateRandomPhone();

    await world.backofficePage.getByPlaceholder('Ajouter un Nom').fill(world.name);
    await world.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(world.firstname);
    await world.backofficePage.getByPlaceholder('Ajouter un Email').fill(world.email);
    await world.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(world.NIR);
    await world.backofficePage.getByPlaceholder('Numéro de téléphone').fill(world.phone);
    
    await world.backofficePage.locator('button[title="Confirmer"]').click()

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = world.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = world.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // ------------------------- Récuperation de la date/heure du rendez-vous initial -----------//
    const dateInputLocator = world.backofficePage.getByText('Date du RDV').locator('xpath=following-sibling::*').locator('input[aria-label="Cliquez ici pour choisir la date"]');
    world.initialAppointmentDate  = await dateInputLocator.inputValue();

    // const selectorHeureDuRDV = world.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    world.initialAppointmentTime  = await selectorHeureDuRDV.inputValue();

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await world.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = world.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = world.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await world.backofficePage.waitForTimeout(1000);

    var fullname = world.name.toUpperCase() + ' ' + world.firstname
    const appointmentLocator = world.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    world.oldDateRdv     = world.initialAppointmentDate
    world.oldHeureRdv    = world.initialAppointmentTime
    console.log('Initial date RDV: ' + world.initialAppointmentDate);
    console.log('Initial heure RDV: ' + world.initialAppointmentTime);
    console.log('old date RDV: ' + world.oldDateRdv);
    console.log('old heure RDV: ' + world.oldHeureRdv);


    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    world.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    world.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    world.userName           = await world.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();

    console.log('==> RDV CREATED');
    
    return { name: world.name, firstname: world.firstname, NIR: world.NIR, phone: world.phone, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime, motif: world.motif};
};


Given("Un rendez-vous a été créer", async function() {
        
    //****************** Se connecter ******************/ 
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate();
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


    //****************** Création d'un rendez-vous ******************/
    this.backofficePage.waitForTimeout(2000); 
    const { name, firstname, NIR, phone, oldDateRdv, oldHeureRdv, appointmentDate, appointmentTime, motif } = await setupRdv(this);
    this.name           = name;
    this.firstname      = firstname;
    this.NIR            = NIR;
    this.phone          = phone;
    this.dateRdv        = oldDateRdv;
    this.heureRdv       = oldHeureRdv;
    this.datePriseRdv  = appointmentDate;
    this.heurePriseRdv  = appointmentTime;
    this.motif          = motif;

    console.log('oldDateRdv_1 ' + oldDateRdv);
    console.log('oldHeureRdv_1 ' + oldHeureRdv);

    console.log('this.dateRdv ' + this.dateRdv);
    console.log('this.heureRdv ' + this.heureRdv);
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
});

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
  await inputNIRLocator.fill(this.NIR);
  const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
  await inputPhoneLocator.fill(this.phone);
  const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
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
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")').first();

  await expect(ticketBlock).toBeVisible();
});


Then("le numéro et le motif du ticket confirmé doivent correspondre à ceux présents dans la file d'attente", async function() {
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + ticket + '")').first();

  await expect(ticketBlock).toBeVisible();

  const motifBlock = ticketBlock.locator('xpath=..//..').getByText(motif);
  await expect(motifBlock).toBeVisible();
});


After(async function () {
    console.log('==> CLEANING OF RDV');

    if (!this.name || !this.firstname) {
        console.log('==> Aucun rendez-vous a néttoyer');
        return;
    }

    this.backofficePage.locator('i[title="Calendrier"]').click();
    await this.backofficePage.waitForTimeout(2000);

    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    //***********************   Clique sur annuler, puis Annuler ce/ces rendez-vous *************************/
    const annulerBtnLocator = this.backofficePage.locator('#reservation-edit-modal button').filter({ hasText: "Annuler ce/ces rendez-vous" });
    
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();


    await appointmentLocator.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> RDV deleted');


    //*********************************************** End of suppression du rendez-vous *************************/


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
    
    //***********************   Supprimer le ticket créé *************************/
    
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await this.backofficePage.waitForTimeout(2000); 

    // Localiser le ticket dans la section "Attente sans RDV"
    const ticketBlock = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/)
                                           .locator('xpath=..//..//..')
                                           .locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    
    await ticketBlock.locator('..').locator('button[title="Annuler le ticket"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('.modal-dialog footer button').filter({ hasText: 'Oui' }).click();

    await ticketBlock.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> Ticket deleted');
});
