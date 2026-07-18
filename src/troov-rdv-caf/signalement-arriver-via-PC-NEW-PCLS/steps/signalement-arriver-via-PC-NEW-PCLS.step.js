const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');

setDefaultTimeout(60 * 1000);

function randomNIR() {
  const sexe = Math.random() < 0.5 ? 1 : 2;          // 1 ou 2
  const annee = String(Math.floor(Math.random() * 100)).padStart(2, '0'); // 00..99
  const mois = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'); // 01..12
  const dept = String(Math.floor(Math.random() * 96) + 1).padStart(2, '0'); // 01..95
  const commune = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');
  const ordre = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');

  return `${sexe} ${annee} ${mois} ${dept} ${commune} ${ordre}`;
}


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
    world.email = world.name.toLowerCase() + '@test.com';
    // world.NIR = generateRandomNIR();
    world.NIR = randomNIR()
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
    const { name, firstname, NIR, phone, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
    this.name         = name;
    this.firstname    = firstname;
    this.NIR          = NIR;
    this.phone        = phone;
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
});


Given("L'utilisateur est connecté à l'application Troov", async function() {
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
    
    // const liFormationLocator = this.backofficePage.locator('li[aria-label="CNAF Formation"]');
    // if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
    //     await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > span.p-tree-node-label').click();
    // }

    await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > span.p-tree-node-label').click();

    currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});


Given("La page principale du signalement d'arrivée est ouverte", async function() {
    await this.terminalPage.goto(config.troovCafUserArrivalURL);
});








// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------



When("Il clique sur \"J'ai un rendez-vous\"", async function() {
    await this.terminalPage.locator('button[aria-label="J\'ai un rendez-vous"]').click();
});

When("Il saisie le NIR et Téléphone associé aux rendez-vous", async function() {
    if (!this.NIR) this.NIR     = generateRandomNIR();
    if (!this.phone) this.phone = generateRandomPhone();
    
    await this.terminalPage.locator('label[for="social-security-number"] + input').fill(this.NIR);
    await this.terminalPage.locator('label[for="phone-number"] + input').fill(this.phone);
});

When("Il clique sur le bouton \"Continuer\"", async function() {
    await this.terminalPage.locator('button').filter({ hasText: "Continuer" }).click();
});

When("Il clique sur \"Télécharger mon ticket\"", async function() {
    await this.terminalPage.getByText('Télécharger mon ticket').click();
});

When("Il ouvre la page File d'attente du backoffice Troov", async function() {
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await expect(this.backofficePage.getByText("Usagers en attente:")).toBeVisible(); 
});

When("Il clique sur \"Je n'ai pas rendez-vous\"", async function() {
    await this.terminalPage.locator('button[aria-label="Je n\'ai pas rendez-vous"]').click();
});

When("Il choisit un motif et un sous-motif", async function() {

    const motif = "Ressortissant étranger";
    const sousMotif = "J’ai besoin d’aide pour mes démarches en ligne";

    // Motif
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe(motif);

    // Sous-motif
    const inputOfficeLocator = this.terminalPage.locator('label[for="office"] + div span.p-select-label');
    await inputOfficeLocator.click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"]`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(sousMotif);
});







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("Le titre \"Je m'enregistre\" s'affiche sur la page", async function() {
    const heading = await this.terminalPage.getByText("Je m'enregistre");
    await expect(heading).toBeVisible();
});

Then("\"Vous êtes bien enregistré !\" s'affiche sur la page confirmation avec RDV", async function() {
    await expect(this.terminalPage.getByText("Vous êtes bien enregistré !")).toBeVisible();

    // Chercher le numero du ticket
    const pElement = this.terminalPage.locator('text="Vous êtes bien enregistré !"').locator('xpath=../following-sibling::*[1]/child::*[2]/p');
    this.ticket = await pElement.textContent();
});

Then("Le ticket est téléchargé avec succès", async function() {
    const download = await this.terminalPage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le signalement sans rendez-vous doit s'afficher dans \"Attente avec rendez vous\"", async function() {
    console.log('ticket number: ', this.ticket);

    const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
    const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
    const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
  
    await expect(ticketBlock).toBeVisible();
});

Then("Il est redirigé vers la page de choix du motif", async function() {
    await expect(this.terminalPage.getByText("Je choisis mon motif de visite")).toBeVisible();
});

Then("Le signalement sans rendez-vous doit s'afficher dans \"Attente sans rendez vous\"", async function() {
    console.log('ticket number: ', this.ticket);

    const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
    const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
    const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
  
    await expect(ticketBlock).toBeVisible();
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
});
