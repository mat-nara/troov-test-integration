const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(120 * 1000);

Given("Un rendez-vous a été créé", async function() {
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

    // Open window Ajouter un RDV
    await this.backofficePage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = this.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = this.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    // Choix du mode
    const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    this.email = this.name.toLowerCase() + '@test.com';
    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();

    await this.backofficePage.getByPlaceholder('Ajouter un Nom').fill(this.name);
    await this.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(this.firstname);
    await this.backofficePage.getByPlaceholder('Ajouter un Email').fill(this.email);
    await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
    await this.backofficePage.locator('button[title="Confirmer"]').click()

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = this.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = this.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    
    // ------------------------- Récuperation de la date/heure du rendez-vous initial -----------//
    const dateInputLocator = this.backofficePage.getByText('Date du RDV').locator('xpath=following-sibling::*').locator('input[aria-label="Cliquez ici pour choisir la date"]');
    this.initialAppointmentDate  = await dateInputLocator.inputValue();

    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    this.initialAppointmentTime  = await selectorHeureDuRDV.inputValue();

    // Save value for next except
    this.waitingReason          = await this.backofficePage.getByPlaceholder('Choisir un service').locator('xpath=following-sibling::span').textContent();
    this.reservationDate        = await this.backofficePage.getByPlaceholder('Cliquez ici pour choisir la date').inputValue();
    this.reservationStartTime   =  await this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select').inputValue();

    const freeToogleMode    = this.backofficePage.locator('.free-mode-toggle > label > span')
    this.mode               =  (await freeToogleMode.count()) > 0 && (await freeToogleMode.textContent()).includes('Activé')   ? 'libre' : 'non libre';

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.userName           = await this.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
});

Given("L'utilisateur est sur la page d’accueil de Troov", async function() {
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
});


Given("La personne ayant rendez-vous a été signalée comme arrivée, et le ticket est passé dans la colonne \"Attente avec RDV\"", async function() {
    // Passer a la page File d'attente
    await this.backofficePage.locator('i[title="File d\'attente"]').click(); 

    // Activer la colone Rdv attendus
    const RdvAttenduLocator = this.backofficePage.locator('.view-filter-container > div').filter({ hasText: 'RDVs attendus' });
    const classAttr = await RdvAttenduLocator.getAttribute('class');
    if (classAttr?.includes('default-disabled-class')) {
        await RdvAttenduLocator.click();
    } else {
        console.log('Le filtre "RDVs attendus" est déjà active, aucune action nécessaire');
    }

    // Signaler comme arrivé
    const rdvAttenduHeader = this.backofficePage.getByText(/RDVs attendus \(\d+\)/);
	const parentBlock = rdvAttenduHeader.locator('xpath=..//..//..'); 
	const prenomLocator = parentBlock.getByText('● ' + this.firstname);
    const butonEstArrive = prenomLocator.locator('../../../..').locator('button').filter({ hasText: 'Est arrivé' });
    await butonEstArrive.click();

    // Vérifier qu'elle est passé vers "Attente avec RDV"
    const attenteAvecRdvHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
    const parentAvecRdvBlock = attenteAvecRdvHeader.locator('xpath=..//..//..'); 
    const prenomAvecRdvLocator = parentAvecRdvBlock.getByText('● ' + this.firstname);
    await expect(prenomAvecRdvLocator).toBeVisible();
});

Given("Le ticket est appelé et passe de \"Attente avec RDV\" à la colonne \"RDV en cours\"", async function() {

    //-- Il clique sur le bouton "Appeler" du ticket dans la file "Attente avec RDV"
    const attenteAvecRdvHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
    const parentAvecRdvBlock = attenteAvecRdvHeader.locator('xpath=..//..//..'); 
    const prenomAvecRdvLocator = parentAvecRdvBlock.getByText('● ' + this.firstname);
    const buttonAppeler = prenomAvecRdvLocator.locator('../../../..').locator('span').filter({ hasText: 'Appeler' });
    await buttonAppeler.click();
    await this.backofficePage.waitForTimeout(2000);

    //-- Select guichet
    const selectorGuichet = this.backofficePage.locator('#call-ticket-modal .multiselect');
    await selectorGuichet.click();
    const firstItemService = selectorGuichet.locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    // Click confirmer
    await this.backofficePage.locator('#call-ticket-modal button').filter({ hasText: 'Confirmer' }).click();

    // Le ticket passe dans la colone "En cours ..."
    const prenomRdvEnCoursLocator = this.backofficePage.getByText(/En cours \(\d+\)/).locator('xpath=..//..//..').getByText('● ' + this.firstname);
    await expect(prenomRdvEnCoursLocator).toBeVisible();
});





When("Il clique sur le menu \"File d'attente\"", async function() {
    await this.backofficePage.locator('i[title="File d\'attente"]').click(); 
});

When("Il clique sur le bouton \"Appeler\" du ticket dans la file \"Attente avec RDV\"", async function() {
    const attenteAvecRdvHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
    const parentAvecRdvBlock = attenteAvecRdvHeader.locator('xpath=..//..//..'); 
    const prenomAvecRdvLocator = parentAvecRdvBlock.getByText('● ' + this.firstname);
    const buttonAppeler = prenomAvecRdvLocator.locator('../../../..').locator('span').filter({ hasText: 'Appeler' });
    await buttonAppeler.click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur sélectionne un guichet et clique sur \"Confirmer\"", async function() {
    // Select guichet
    const selectorGuichet = this.backofficePage.locator('#call-ticket-modal .multiselect');
    await selectorGuichet.click();
    const firstItemService = selectorGuichet.locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    // Click confirmer
    await this.backofficePage.locator('#call-ticket-modal button').filter({ hasText: 'Confirmer' }).click();
});

When("L'agent clique sur le ticket", async function() {
    const ticketRdvEnCoursLocator = this.backofficePage.getByText(/En cours \(\d+\)/).locator('xpath=..//..//..').getByText('● ' + this.firstname).locator('xpath=..//..//..').first();
    await ticketRdvEnCoursLocator.click();
});





Then("La page \"File d'attente\" s'affiche", async function() {
    await expect(this.backofficePage.getByText('Usagers en attente')).toBeVisible();
});

Then("Une pop-up \"Choisir un guichet\" s’affiche", async function() {
    await expect(await this.backofficePage.locator('#call-ticket-modal h5').filter({ hasText: 'Choisir un guichet' })).toBeVisible();
});

Then("Le ticket passe dans la colonne \"RDV en cours\"", async function() {
    // Vérifier qu'elle est passé vers "En cours"
    const prenomRdvEnCoursLocator = this.backofficePage.getByText(/En cours \(\d+\)/).locator('xpath=..//..//..').getByText('● ' + this.firstname);
    console.log('this.firstname: ', this.firstname)
    await expect(prenomRdvEnCoursLocator).toBeVisible();
});

Then("La fenêtre \"Information RDV\" s'affiche", async function() {
    await expect(await this.backofficePage.locator('#modal-in-progress span').filter({ hasText: 'Information RDV' })).toBeVisible();
});

