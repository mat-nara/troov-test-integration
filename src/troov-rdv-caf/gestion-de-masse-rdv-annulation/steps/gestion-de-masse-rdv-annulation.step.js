const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');



async function setupRdv(world) {

    console.log('==> CREATION OF RDV');

    // Open window Ajouter un RDV
    await world.backofficePage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = world.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = world.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de proche aidant (AJPA)" }).first(); 
    await firstItemService.click();

    // Choix du mode
    const selectorModeDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = world.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    world.name = faker.person.lastName();
    world.firstname = faker.person.firstName();
    world.email = world.name.toLowerCase() + '@test.com';
    world.NIR = generateRandomNIR();
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

    const selectorHeureDuRDV = world.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
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
    const appointmentLocator = world.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    world.oldDateRdv     = world.initialAppointmentDate
    world.oldHeureRdv    = world.initialAppointmentTime

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    world.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    world.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    world.userName           = await world.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();

    console.log('==> RDV CREATED');
    
    
    return { name: world.name, firstname: world.firstname, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime};
};


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
});

Given("Un rendez-vous a été créer", async function() {
    const { name, firstname, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
    this.name         = name;
    this.firstname    = firstname;
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
    
    // Récuperer le guichet du rendez-vous
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    this.guichet = await this.backofficePage.locator('#edit-reservation span').filter({ hasText: 'Guichet :' }).locator('xpath=following-sibling::*').textContent();
    await this.backofficePage.mouse.click(10, 10);
});

Given("L'utilisateur est sur la page \"Mes paramètres - Gestion des Services\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur navigue vers \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("L'utilisateur clique sur \"Mes calendriers - Gestion des Services\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

When("L'utilisateur clique sur cliquer sur le calendrier avec étoile d'un guichet", async function() {
    await this.backofficePage.locator('div.desks-table > table > tbody > tr > td:first-child').filter({ hasText: this.guichet })
                             .locator('..').locator('td a[title="Paramétrer une plage exceptionnelle"]')
                             .click();
});

When("L'utilisateur sélectionne la date du jour ou il y a des rendez-vous", async function() {
    const today = new Date().toISOString().split('T')[0];
    await this.backofficePage.locator(`.date-picker-custom-days .id-${today}`).click();
});

When("Il clique sur \"Fermer la journée\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Fermer la journée" }).click(); 
});

When("L'utilisateur sélectionne \"Fermer la prise de nouveaux rendez-vous et maintenir les rendez-vous déjà pris\"", async function() {
    await this.backofficePage.locator('#custom-days-closing-modal label').filter({ hasText: 'Fermer la prise de nouveaux rendez-vous et maintenir les rendez-vous déjà pris' }).click();
    await this.backofficePage.locator('#custom-days-closing-modal footer button').filter({ hasText: 'OK' }).click();
});

When("L'utilisateur clique sur \"Calendrier\"", async function() {
    await this.backofficePage.locator('i[title="Calendrier"]').click(); 
});

When("L'utilisateur sélectionne \"Fermer la prise de nouveaux rendez-vous et annuler les rendez-vous déjà pris\"", async function() {
    await this.backofficePage.locator('#custom-days-closing-modal label').filter({ hasText: 'Fermer la prise de nouveaux rendez-vous et annuler les rendez-vous déjà pris' }).click();
    await this.backofficePage.locator('#custom-days-closing-modal footer button').filter({ hasText: 'OK' }).click();
});

When("L'utilisateur confirme la fermeture du jour et l'annulation des rendez-vous", async function() {
    await this.backofficePage.locator('#send-message footer button').filter({ hasText: 'Supprimer ce créneau et annuler les RDV' }).click();
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page \"Mes paramètres\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("La page \"Gestion des horaires exceptionnels\" s'affiche", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Ajouter une plage horaire exceptionnelle' })).toBeVisible();
});

Then("Une fenetre de choix du mode de suppression s'affiche", async function() {
    await expect(this.backofficePage.locator('#custom-days-closing-modal h5').filter({ hasText: 'Supprimer les réservations associées ?' })).toBeVisible();
});

Then("La journée concerne est fermée sans que les rendez-vous soit annulés", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    await expect(this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0)).toBeVisible();

    // Vérifie le vérouillage du jour
    const texts = await this.backofficePage.locator('.calendar .title-container___desk').allInnerTexts();
    // console.log('Guichet : ' + this.guichet);
    // console.log('Texts : ' + texts);
    const index = texts.findIndex(text => text.trim() === this.guichet.trim());
    // console.log('Index of guichet in texts: ' + index);
    await expect(this.backofficePage.locator('.calendar .vuecal__bg .vuecal__cell-content').nth(index).locator('.desk-range-holiday-event')).toBeVisible(); 

    // Annuler la fermeture de la journée
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
    await this.backofficePage.locator('div.desks-table > table > tbody > tr > td:first-child').filter({ hasText: this.guichet })
                             .locator('..').locator('td a[title="Paramétrer une plage exceptionnelle"]')
                             .click();
    await this.backofficePage.locator('.setting-card-default .grid-row-default:last-child i.bxs-trash').click(); 
    await this.backofficePage.waitForTimeout(1000);  
});

Then("La journée concerne est fermée et que tous les rendez-vous de ce guichet sont annulés", async function() {
    // Wait for the calendar to be visible
    await this.backofficePage.locator('.calendar .title-container___desk').first().waitFor({ state: 'visible' });

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    await expect(this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0)).not.toBeVisible();


    // Vérifie le vérouillage du jour
    const texts = await this.backofficePage.locator('.calendar .title-container___desk').allInnerTexts();
    console.log('Guichet : ' + this.guichet);
    console.log('Texts : ' + texts);
    const index = texts.findIndex(text => text.trim() === this.guichet.trim());
    console.log('Index of guichet in texts: ' + index);
    await expect(this.backofficePage.locator('.calendar .vuecal__bg .vuecal__cell-content').nth(index).locator('.desk-range-holiday-event')).toBeVisible(); 

    // Annuler la fermeture de la journée
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
    await this.backofficePage.locator('div.desks-table > table > tbody > tr > td:first-child').filter({ hasText: this.guichet })
                             .locator('..').locator('td a[title="Paramétrer une plage exceptionnelle"]')
                             .click();
    await this.backofficePage.locator('.setting-card-default .grid-row-default:last-child i.bxs-trash').click(); 
    await this.backofficePage.waitForTimeout(1000);  
});

