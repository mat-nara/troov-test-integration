const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(60 * 1000);

async function cleanLastRdv(world) {

    console.log('==> CLEANING OF RDV');

    //***********************   Selectionne le rendez-vous *************************/
    var fullname = world.name.toUpperCase() + ' ' + world.firstname
    const appointmentLocator = world.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await world.backofficePage.waitForTimeout(1000);

    //***********************   Clique sur annuler, puis Annuler ce/ces rendez-vous *************************/
    const annulerBtnLocator = world.backofficePage.locator('#edit-reservation___BV_modal_content_ button:has-text("Annuler ce/ces rendez-vous")');
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = world.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();


    console.log('==> RDV deleted');
}

Given("L'utilisateur est sur la page de connexion", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
});

Given("L'utilisateur est connecté à Troov RDV et le menu calendrier est ouvert", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
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

Given("La fenêtre \"Ajouter un RDV\" est ouverte", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
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
});

Given("Un utilisateur a été créé lors d'une prise de rendez-vous précédente", async function() {
    this.tempContext = await this.browser.newContext();
    this.tempPage = await this.tempContext.newPage();

    this.loginPageAlt = new LoginPage(this.tempPage);
    await this.loginPageAlt.navigate(this.tempPage);
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // wait for backoffice loaded
    await this.tempPage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.tempPage.url();
    while (!currentURL.includes('calendar')) {
        await this.tempPage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.tempPage.url();
    }
    expect(await this.tempPage.url()).toContain('calendar');

    // Open window Ajouter un RDV
    await this.tempPage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = this.tempPage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = this.tempPage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    // Choix du mode
    // const selectorModeDuRDV = this.tempPage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.tempPage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();

    await this.tempPage.getByPlaceholder('Ajouter un Nom').fill(this.name);
    await this.tempPage.getByPlaceholder('Ajouter un Prénom').fill(this.firstname);
    await this.tempPage.getByPlaceholder('Ajouter un Email').fill(this.email);
    await this.tempPage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    await this.tempPage.getByPlaceholder('Numéro de téléphone').fill(this.phone);

    await this.tempPage.locator('button[title="Confirmer"]').click()

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = this.tempPage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = this.tempPage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // Bloquer le créneau
    await this.tempPage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.tempPage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.tempPage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.tempPage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.tempPage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

});

Given("L'utilisateur a renseigné toutes les informations du RDV", async function() {
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
    // const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

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
});

Given("Un rendez-vous avec un guichet spécifique est confirmé", async function() {
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


    // change account to 455 caf physique
//    await this.backofficePage.locator('img.header-profile-user').click();
//    await this.backofficePage.locator('button[title="Changer de compte"]').click();
//    await this.backofficePage.waitForTimeout(3000); 
//    
//    const liFormationLocator = this.backofficePage.locator('li[aria-label="CNAF Formation"]');
//    if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
//        await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
//    }
//
//    const li455CafLocator = this.backofficePage.locator('li[aria-label="455 Caf"]');
//    if (await li455CafLocator.getAttribute('aria-expanded') === 'false') {
//        await this.backofficePage.locator('li[aria-label="455 Caf"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
//    }
//
//    const liPhysiqueLocator = this.backofficePage.locator('li[aria-label="455 Caf Site physique"]');
//    if (await liPhysiqueLocator.getAttribute('aria-expanded') === 'false') {
//        await this.backofficePage.locator('li[aria-label="455 Caf Site physique"] > div.p-tree-node-content > span.p-tree-node-label').click();
//    }
//
//    currentURL = await this.backofficePage.url();
//    while (!currentURL.includes('calendar')) {
//        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
//        currentURL = await this.backofficePage.url();
//    }
//    expect(await this.backofficePage.url()).toContain('calendar');

    // Open window Ajouter un RDV
    await this.backofficePage.waitForSelector('button[title="Ajouter un RDV"]', { state: 'visible' });
    await this.backofficePage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = this.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = this.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    // Choix du mode
    // const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();

    await this.backofficePage.getByPlaceholder('Ajouter un Nom').fill(this.name);
    await this.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(this.firstname);
    await this.backofficePage.getByPlaceholder('Ajouter un Email').fill(this.email);
    await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
    await this.backofficePage.locator('button[title="Confirmer"]').click();

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = this.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = this.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // Récuperer l'heure
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    const heure = await selectorHeureDuRDV.inputValue();

//    // Activer le mode libre
//    await this.backofficePage.locator('.free-mode-toggle > label').check();
//
//    // Set guichet
//    const guichetSelect = this.backofficePage.getByPlaceholder('Choisir un guichet').locator('xpath=following-sibling::span');
//    await guichetSelect.click()
//    const firstOption = this.backofficePage.getByPlaceholder('Choisir un guichet').locator('xpath=../following-sibling::div').locator('ul > li > span').first();
//
//    await firstOption.click();
//    let guichet = await this.backofficePage.getByPlaceholder('Choisir un guichet').locator('xpath=following-sibling::span').textContent();
//    // Set heure
//    const selectorHeureDuRDVTime = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//input');
//    await selectorHeureDuRDVTime.fill(heure);
//
//    // Set durée du RDV
//    const selectorDureeDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Durée du RDV' }).locator('xpath=following-sibling::div//div//input');
//    selectorDureeDuRDV.fill("30");
//
//    this.guichet    = guichet;
    this.heureRdv   = heure;
    this.date       = await this.backofficePage.getByPlaceholder('Cliquez ici pour choisir la date').inputValue();
    

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(2000); 
    this.guichet = await this.backofficePage.locator('span').filter({ hasText: "Guichet :" }).locator('xpath=following-sibling::span').textContent();
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.mouse.click(10, 10);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('footer button').filter({ hasText: "Quitter sans sauvegarder" }).click();
    await this.backofficePage.waitForTimeout(2000); 

});

Given("Un rendez-vous a été confirmé", async function() {
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
    // const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

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

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
});

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
    // const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

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
 
Given("L'application Troov RDV est ouverte", async function() {
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



// ----------------------------------------------------------

When("Il entre ses identifiants et clique sur \"Se connecter\"", async function() {
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
});

When("L'utilisateur clique sur le bouton \"Ajouter un RDV\"", async function() {
    await this.backofficePage.locator('button[title="Ajouter un RDV"]').click();
});

When("L'utilisateur sélectionne une date {string} dans le planning", async function(date) {
    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours", exact: true }).nth(0).click();

    // Selectionner une date
    let today = new Date(); // Définir "today" comme la date actuelle
    let selectedDate = new Date(); // Date d'aujourd'hui par défaut

    // Si la date est "Aujourd'hui", on garde la date actuelle
    if (date === "Aujourd'hui") {
        selectedDate = today;
    } else {
        const isFriday = today.getDay() === 5; // Vérifie si aujourd'hui est vendredi

        if (isFriday) {
            // Si c'est vendredi, sélectionne hier
            selectedDate = new Date(today);
            selectedDate.setDate(today.getDate() - 1); 
        } else {
            // Sinon, sélectionne demain
            selectedDate = new Date(today);
            selectedDate.setDate(today.getDate() + 1); 
        }
    }

    // Formater la date sous le format jj/mm
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    this.selectedFormattedDate = `${day}/${month}`;
    
    // Cliquer sur la date
    //this.backofficePage.locator('.vuecal__weekdays-headings .h5').filter({ hasText: this.selectedFormattedDate }).click(); // Header bug always today selected

    this.selectedDay = selectedDate.getDay();
    this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(this.selectedDay - 1).click()
});

When("L'utilisateur recherche un usager par son nom dans le SI Cnaf", async function() {
    // Choix du Service (1st item)
    const selectorService = this.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = this.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();

    await this.backofficePage.getByPlaceholder('Rechercher un utilisateur').fill(this.name);
});

When("L'utilisateur effectue une recherche par nom pour un usager inexistant dans le SI Cnaf", async function() {
    const searchLoctor = this.backofficePage.getByPlaceholder('Rechercher un utilisateur');

	await this.backofficePage.waitForTimeout(1000); 
	await searchLoctor.fill('');
    const unkownUSer = faker.person.lastName() + 'ielle';
    
    await searchLoctor.type(unkownUSer, { delay: 100 }); 
    await this.backofficePage.waitForTimeout(2000); 
});

When("L'utilisateur crée un rendez-vous et y ajoute des notes internes", async function() {
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
    // const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();
    this.note = fakerFR .lorem.sentence(); 

    await this.backofficePage.getByPlaceholder('Ajouter un Nom').fill(this.name);
    await this.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(this.firstname);
    await this.backofficePage.getByPlaceholder('Ajouter un Email').fill(this.email);
    await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
    await this.backofficePage.locator('button[title="Confirmer"]').click()

    await this.backofficePage.getByPlaceholder('Notes').fill(this.note);

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = this.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = this.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
});

When("L'utilisateur clique sur \"Bloquer ce créneau\"", async function() {

    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click();

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();
});

When("L'utilisateur consulte l'agenda de la Caf à la date et à l'heure sélectionnées", async function() {
    
});

When("L'utilisateur clique sur le RDV et ouvre \"Historique\"", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();

    await this.backofficePage.locator('span:has-text("Historique")').waitFor({ state: 'visible' });

    await this.backofficePage.locator('span:has-text("Historique")').locator('xpath=..').click();
});

When("L'utilisateur sélectionne \"Rendez-vous pris\"", async function() {
    await this.backofficePage.locator('a:has-text("Rendez-vous pris")').click();
});

When("L'utilisateur ferme l'onglet du navigateur", async function() {
    await this.backofficePage.close(); 
});



// ----------------------------------------------------------

Then("Il accède à l'application Troov RDV", async function() {
    const topbarLocator = this.backofficePage.locator('#page-topbar');
    await expect(topbarLocator).toBeVisible();
}); 

Then("Une fenêtre \"Ajouter un RDV\" s'ouvre", async function() {
    const modalHeaderLocator = this.backofficePage.locator('#modal-reservation-internal header span').filter({ hasText: "Ajouter un RDV" });
    await expect(modalHeaderLocator).toBeVisible();
}); 

Then("Une fenêtre \"Ajouter un RDV\" s'ouvre avec la date choisi pré-séléctionné", async function() {
    
    const today = new Date();
    const year = today.getFullYear();
    this.selectedDate = this.selectedFormattedDate + '/' + year

    const inputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]');
    await expect(inputLocator).toHaveValue(this.selectedDate);
}); 

Then("L'utilisateur peut choisir un service", async function() { //  "J'attends/J'accueille un enfant" 
    // Select service (1st item)
    const selectorService = this.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();

    const selectorServiceLegend = this.backofficePage.locator('legend').filter({ hasText: 'Service' })
    
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemService.click();
    const expectedSelect = await firstItemService.textContent();

    const selectedService = await this.backofficePage.getByPlaceholder('Choisir un service').locator('xpath=following-sibling::*[1]').textContent();
    expect(selectedService.trim()).toBe(expectedSelect.trim());
});

Then("L'utilisateur peut sélectionner un mode de RDV", async function() { // (physique/visio/téléphone)  
//    const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
//    await selectorModeDuRDV.selectOption({ index: 0 });  
//
//    const firstOptionValue = await selectorModeDuRDV.locator('option').first().getAttribute('value');
//    const selectedValue = await selectorModeDuRDV.inputValue();
//    expect(selectedValue).toBe(firstOptionValue);
});

Then("L'utilisateur peut choisit la date et l'heure du RDV", async function() { 
    // Select date
    const dateInputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]')
    await dateInputLocator.click();

    const today = new Date();
    today.setDate(today.getDate() + 1); // Add one day
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('fr-FR', options);

    const datePickerLocator = this.backofficePage.locator(`#modal-reservation-internal span[aria-label="${formattedDate}"]`);
    await datePickerLocator.click();

    // Format as "DD/MM/YYYY"
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = today.getFullYear();
    const expectedDate = `${day}/${month}/${year}`;

    const inputValue = await dateInputLocator.inputValue();
    expect(inputValue).toBe(expectedDate);

    // Select Heure (2nd choice)
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  

    const secondOptionValue = await selectorHeureDuRDV.locator('option').nth(1).getAttribute('value');
    const selectedValue = await selectorHeureDuRDV.inputValue();
    expect(selectedValue).toBe(secondOptionValue);
});

Then("L'utilisateur est trouvé", async function() {
    const contactLocator = this.backofficePage.locator('.focus-contact').first();
    const contact = await contactLocator.textContent();
	await expect(contact).toContain(this.name);
}); 

Then("Aucun utilisateur n'est trouvé", async function() {
    await expect(this.backofficePage.locator('.focus-contact')).toHaveCount(0);
}); 

Then("Les notes internes sont bien enregistrées dans la fiche du rendez-vous", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();

    const notes = await this.backofficePage.getByPlaceholder('Écrire un commentaire').inputValue();
    console.log('notes: ', notes)
    expect(notes).toBe(this.note);

    await this.backofficePage.waitForTimeout(2000);
    await this.backofficePage.mouse.click(10, 10);
    await this.backofficePage.waitForTimeout(2000);
    await this.backofficePage.locator('footer button').filter({ hasText: "Quitter sans sauvegarder" }).click();
    await this.backofficePage.waitForTimeout(1000);
    await cleanLastRdv(this);
});

Then("Le rendez-vous est confirmé", async function() {
    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    await cleanLastRdv(this);
});

Then("Le rendez-vous est bien présent sur le guichet sélectionné", async function() {
    console.log('this.guichet: ', this.guichet)  
    console.log('this.heureRdv: ', this.heureRdv) 
    console.log('this.date: ', this.date)     

    //// Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();

    // Rechercher le rendez-vous
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);

    // Vérification de l'heure
    const minTop =  parseInt(this.heureRdv.split(":")[0]) * 70;
    const maxTop = (parseInt(this.heureRdv.split(":")[0]) + 1) * 70;

    const topValueRdv = await appointmentLocator.evaluate((element) => { return window.getComputedStyle(element).top; });
    
    console.log('minTop: ', minTop)
    console.log('maxTop: ', maxTop)
    console.log('topValueRdv: ', topValueRdv)  

    expect(parseInt(topValueRdv)).toBeGreaterThanOrEqual(minTop);
    expect(parseInt(topValueRdv)).toBeLessThanOrEqual(maxTop);

    // Vérification de la date
    const [day, month, year] = this.date.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const dayNumber = date.getDay();

    const dayLocator = this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1);
    const appointmentDayLocator = dayLocator.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);
    expect(await appointmentDayLocator.count()).toBeGreaterThanOrEqual(1);

    // Vérification du guichet
    const headingLocator = this.backofficePage.locator('.vuecal__weekdays-headings .vuecal__heading').first();
    const guichetLocators = headingLocator.locator('.vuecal__split-days-headers .day-split-header .text-center .h6'); 
    const count = await guichetLocators.count();
    console.log("Number of guichet elements found:", count);

    // Get the index of the 'Guichet' based on the text content
    const guichetIndex = await guichetLocators.evaluateAll((guichets, guichetName) => {
        return guichets.findIndex(guichet => {
            return guichet.textContent.trim() === guichetName.trim();
        });
    }, this.guichet);

    console.log('guichetIndex: ', guichetIndex)
    const appointmentGuichetLocator = dayLocator.locator('.vuecal__cell-split').nth(guichetIndex).locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);
    expect(await appointmentGuichetLocator.count()).toBeGreaterThanOrEqual(1);

    await cleanLastRdv(this);
});

Then("Le rendez-vous est bien attribué à un guichet automatiquement", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();

    const guichet = await this.backofficePage.locator('span:has-text("Guichet :")').locator("xpath=following-sibling::span").textContent();
    expect(guichet.trim()).not.toBe('');

    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.mouse.click(10, 10);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('footer button').filter({ hasText: "Quitter sans sauvegarder" }).click();
    await this.backofficePage.waitForTimeout(2000); 
    await cleanLastRdv(this);
});

Then("Les informations du RDV correspondent à celles saisies", async function() {

    const  appointmentDetailLocator = this.backofficePage.locator('#edit-reservation___BV_modal_body_ .tab-content .active ul > li').nth(0);
    const appointmentDetail = await appointmentDetailLocator.textContent();

    //console.log(appointmentDetail)
    const cleanedText = appointmentDetail.replace(/\s+/g, ' ').trim();

    // Regex pour extraire chaque information
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;
    const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (?:- |(.*?)) - (\d+) minutes - Mode : (.+)/;
    const match = cleanedText.match(regex);
    
    console.log('cleanedText: ', cleanedText)

    if (match) {
        const appointmentDate = match[1];    // 25/03/2025
        const appointmentTime = match[2];    // 17:20
        const userName = match[3];           // Admin Troovst
        const userRole = match[4];           // membre
        const reservationDate = match[5];    // 25/03/2025
        const reservationStartTime = match[6]; // 18:00
        const reservationEndTime = match[7];  // 18:30
        const waitingReason = match[8];       // J'attends / J'accueille un enfant
        const duration = match[9];           // 30
        const mode = match[10];               // non libre

        console.log(`Appointment Date: ${appointmentDate}`);
        console.log(`Appointment Time: ${appointmentTime}`);
        console.log(`User Name: ${userName}`);
        console.log(`User Role: ${userRole}`);  // Rôle dynamique
        console.log(`Reservation Date: ${reservationDate}`);
        console.log(`Reservation Start Time: ${reservationStartTime}`);
        console.log(`Reservation End Time: ${reservationEndTime}`);
        console.log(`Waiting Reason: ${waitingReason}`);
        console.log(`Duration: ${duration} minutes`);
        console.log(`Mode: ${mode}`);

        console.log('this.appointmentDate: ', this.appointmentDate)
        console.log('this.appointmentTime: ', this.appointmentTime)
        console.log('this.userName: ', this.userName.trim().toLowerCase())
        console.log('this.reservationDate: ', this.reservationDate)
        console.log('this.reservationStartTime: ', this.reservationStartTime)
        console.log('this.waitingReason: ', this.waitingReason.trim())
        console.log('this.mode: ', this.mode)

        expect(this.appointmentDate).toBe(appointmentDate);
        expect(this.appointmentTime).toBe(appointmentTime);
        expect(this.userName.trim().toLowerCase()).toBe(userName.toLowerCase());
        expect(this.reservationDate).toBe(reservationDate);
        expect(this.reservationStartTime).toBe(reservationStartTime);
        expect(this.waitingReason.trim()).toBe(waitingReason);
        expect(this.mode).toBe(mode);
  
    } else {
        console.log('No match found.');
        expect(false).toBe(true);
    }
        await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.mouse.click(10, 10);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('footer button').filter({ hasText: "Quitter sans sauvegarder" }).click();
    await this.backofficePage.waitForTimeout(2000); 
    await cleanLastRdv(this);
});

Then("L'application Troov RDV doit être complètement fermée", async function() {
    expect(await this.backofficePage.isClosed()).toBeTruthy();
});
