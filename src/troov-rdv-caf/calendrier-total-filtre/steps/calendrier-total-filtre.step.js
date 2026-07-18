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
    // const selectorModeDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

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
    // await world.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(world.NIR);
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

Given("L'utilisateur est sur la page calendrier", async function() {
    // await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('span[aria-label="lundi 21 juillet 2025"]').click(); 
    this.firstName = "Jane";
    this.name = "Simpson";
});

Given("Quatre rendez-vous de différente status ont été créés", async function() {
    const { name_1, firstname_1, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
    this.name_1         = name_1;
    this.firstname_1    = firstname_1;
    console.log('==> Rendez-vous 1 créé pour ' + this.name_1 + " " + this.firstname_1); 
    // this.oldDateRdv_1 = oldDateRdv;
    // this.oldHeureRdv_1 = oldHeureRdv;  
    // this.appointmentDate_1 = appointmentDate;
    // this.appointmentTime_1 = appointmentTime;

    // console.log('==> Ancienne date du RDV : ' + oldDateRdv);
    // console.log('==> Ancienne heure du RDV : ' + oldHeureRdv);
    // console.log('==> Date de création du RDV : ' + appointmentDate);
    // console.log('==> Heure de la création du RDV : ' + appointmentTime);

    const { name_2, firstname_2, oldDateRdv_2, oldHeureRdv_2, appointmentDate_2, appointmentTime_2 } = await setupRdv(this);
    this.name_2         = name_2;
    this.firstname_2    = firstname_2;
    console.log('==> Rendez-vous 2 créé pour ' + this.name_2 + " " + this.firstname_2); 

    const { name_3, firstname_3, oldDateRdv_3, oldHeureRdv_3, appointmentDate_3, appointmentTime_3 } = await setupRdv(this);
    this.name_3         = name_3;
    this.firstname_3    = firstname_3;
    console.log('==> Rendez-vous 3 créé pour ' + this.name_3 + " " + this.firstname_3); 

    const { name_4, firstname_4, oldDateRdv_4, oldHeureRdv_4, appointmentDate_4, appointmentTime_4 } = await setupRdv(this);
    this.name_4         = name_4;
    this.firstname_4    = firstname_4;
    console.log('==> Rendez-vous 4 créé pour ' + this.name_4 + " " + this.firstname_4); 
});

Given("Le filtre sur le prenom est réinitialisé", async function() {
    await this.backofficePage.locator('#current-view-address-book').getByPlaceholder('Prénom').fill(''); 
});

Given("Le filtre sur le nom de famille est réinitialisé", async function() {
    await this.backofficePage.locator('#current-view-address-book').getByPlaceholder('Nom', { exact: true }).fill(''); 
});

Given("Le filtre sur \"RDV pris par\" est réinitialisé", async function() {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Sélectionner tout" }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Sélectionner tout" }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

Given("L'utilisateur remet le filtre sur \"RDV pris par\" en \"Sélectionner tout\"", async function() {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Sélectionner tout" }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

Given("L'utilisateur ferme la fenetre d'envoie d'email", async function() {
    // await this.backofficePage.locator('#send-message footer button').filter({ hasText: "Fermer" }).nth(2).click();
    // await this.backofficePage.mouse.click(10, 10);
    // await this.backofficePage.mouse.click(10, 10);

    // 2 Fenetre s'ouvre en même temps, on ferme la 2eme puis la 1ere
    await this.backofficePage.locator('#send-message button.close').nth(1).click();
    await this.backofficePage.locator('#send-message button.close').nth(0).click();
});

Given("L'utilisateur ferme la fenetre de confirmation de la suppression", async function() {
    // 2 Fenetre s'ouvre en même temps, on ferme la 2eme puis la 1ere
    await this.backofficePage.locator('#send-message button.close').nth(1).click();
    await this.backofficePage.locator('#send-message button.close').nth(0).click();
});

Given("Le filtre sur \"statut RDV\" est réinitialisé", async function() {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').nth(1).click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Sélectionner tout" }).nth(1).click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Sélectionner tout" }).nth(1).click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

Given("La fenetre Total est fermée", async function() {
    await this.backofficePage.locator('#current-view-address-book footer button').filter({ hasText: "OK" }).click();
});








// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur clique sur Calendrier", async function() {
    // await this.backofficePage.locator('i[title="Calendrier"]').click(); 
});

When("L'utilisateur clique sur \"Total\"", async function() {
    await this.backofficePage.getByText('Total :').click(); 
});

When("L'utilisateur fitre par prénom uniquement", async function() {
    // this.firstName = fakerFR.person.firstName();
    await this.backofficePage.locator('#current-view-address-book').getByPlaceholder('Prénom').fill(this.firstName); 
});

When("Il clique sur \"Rechercher\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Rechercher" }).click(); 
    await this.backofficePage.waitForTimeout(2000); // wait for the search to complete
});

When("L'utilisateur saisie un nom de famille", async function() {
    await this.backofficePage.locator('#current-view-address-book').getByPlaceholder('Nom', { exact: true }).fill(this.name); 
});

When("L'utilisateur applique un filtre sur \"RDV pris par\" en \"Agent\" uniquement", async function() {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Agent" }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

When("L'utilisateur applique un filtre sur \"RDV pris par\" en \"Usager\" uniquement", async function() {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: "Usager" }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

When("L'utilisateur clique sur l'icone d'envoie d'email sur un rendez-vous de la liste", async function() {
    await this.backofficePage.locator('table#address-book > tbody > tr:first-child td:last-child button i.bx-message-dots').first().click();
});

When("L'utilisateur clique sur l'icone de suppression sur un rendez-vous de la liste", async function() {
    await this.backofficePage.locator('table#address-book > tbody > tr:first-child td:last-child button i.bx-x-circle').first().click();
});

When("L'utilisateur applique un filtre sur \"statut RDV\" en {string} uniquement", async function (statutRDV) {
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .input-value').nth(1).click();
    await this.backofficePage.locator('#current-view-address-book .modal-body .row:nth-child(2) .dropdown-menu span').filter({ hasText: statutRDV }).first().click();
    await this.backofficePage.locator('#current-view-address-book .modal-body').click();
});

When("L'utilisateur clique sur un rendez-vous sur le calendrier", async function() {
    // const fullname = this.name.toUpperCase() + ' ' + this.firstname;
    this.fullname = "PATRICK Jane";
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: this.fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
});

When("L'utilisateur clique sur historique", async function() {
    await this.backofficePage.locator('#edit-reservation button span').filter({ hasText: "Historique" }).first().click();
});










// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------



Then("La fenetre Total s'affiche", async function() {
    await expect(this.backofficePage.locator('#current-view-address-book')).toBeVisible();
});

Then("Seule les rendez-vous associé a ce prénom s'affiche", async function() {
    // await expect(this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: this.firstName })).toBeVisible();

    const allFourthTds = await this.backofficePage.locator('table#address-book > tbody > tr td:nth-child(4)').allInnerTexts();
    for (const tdText of allFourthTds) {
        // console.log(tdText)
        expect(tdText.toLowerCase()).toContain(this.firstName.toLowerCase());
    }
});

Then("Seule les rendez-vous associé a ce nom de famille s'affiche", async function() {
    // await expect(this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: this.name }).first()).toBeVisible();

    const allFourthTds = await this.backofficePage.locator('table#address-book > tbody > tr td:nth-child(4)').allInnerTexts();
    for (const tdText of allFourthTds) {
        // console.log(tdText)
        expect(tdText.toLowerCase()).toContain(this.name.toLowerCase());
    }
});

Then("Seule les rendez-vous associé a ce filtre \"RDV pris par\" en \"Agent\" s'affiche", async function() {
    const allFourthTds = await this.backofficePage.locator('table#address-book > tbody > tr td:nth-child(1)').allInnerTexts();
    for (const tdText of allFourthTds) {
        // console.log(tdText)
        expect(tdText.toLowerCase()).toContain(("Agent").toLowerCase());
    }
});

Then("Seule les rendez-vous associé a ce filtre \"RDV pris par\" en \"Usager\" s'affiche", async function() {
    const allFourthTds = await this.backofficePage.locator('table#address-book > tbody > tr td:nth-child(1)').allInnerTexts();
    for (const tdText of allFourthTds) {
        // console.log(tdText)
        expect(tdText.toLowerCase()).toContain(("Usager").toLowerCase());
    }
});

Then("Une fenetre d'envoie d'email s'affiche et le bouton d'envoie est cliquable", async function() {    
    await expect(await this.backofficePage.locator('#send-message h5').filter({ hasText: "Envoyer un email" }).first()).toBeVisible();
    await expect(await this.backofficePage.locator('#send-message footer button').filter({ hasText: "Envoyer" }).first()).toBeVisible();
});

Then("Une fenetre de confirmation de la suppression s'affiche et le bouton d'annulation du rendez-vous est cliquable", async function() {    
    await expect(await this.backofficePage.locator('#send-message h5').filter({ hasText: "Êtes-vous certain(e) de vouloir annuler ce rendez-vous ?" }).first()).toBeVisible();
    await expect(await this.backofficePage.locator('#send-message footer button').filter({ hasText: "Annuler ce/ces rendez-vous" }).first()).toBeVisible();
});

Then("Seule les rendez-vous associé a ce filtre sur \"statut RDV\" en {string} s'affiche", async function(statutRDV) {    
    const allSelects = this.backofficePage.locator('table#address-book > tbody > tr td:nth-child(2) select');
    const count = await allSelects.count();

    for (let i = 0; i < count; i++) {
        const selectedValue = await allSelects.nth(i).locator('option:checked').textContent();
        console.log(`Selected value in select ${i + 1}: ${selectedValue}`);
        expect(selectedValue.toLowerCase()).toContain(statutRDV.toLowerCase()); 
    }
});

Then("Les information sur le rendez-vous sont visible", async function() {    
    await expect(await this.backofficePage.locator('#edit-reservation h5').filter({ hasText: "Rendez-vous " + this.fullname }).first()).toBeVisible();
});

Then("Les information sur l'historique du rendez-vous avec plusieur onglet sont visible", async function() {    
    expect(await this.backofficePage.locator('#edit-reservation ul>li .nav-link').count()).toBeGreaterThan(0);
});
