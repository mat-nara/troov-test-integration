const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR, th  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');



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

    return { fullname, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime};
};


Given("Un rendez-vous a été créé", async function() {
    const { fullname, oldDateRdv, oldHeureRdv, appointmentDate, appointmentTime } = await setupRdv(this);
    this.fullname_1 = fullname;
    this.oldDateRdv_1 = oldDateRdv;
    this.oldHeureRdv_1 = oldHeureRdv;  
    this.appointmentDate_1 = appointmentDate;
    this.appointmentTime_1 = appointmentTime;

    console.log('==> Rendez-vous créé pour ' + fullname);
    console.log('==> Ancienne date du RDV : ' + oldDateRdv);
    console.log('==> Ancienne heure du RDV : ' + oldHeureRdv);
    console.log('==> Date de création du RDV : ' + appointmentDate);
    console.log('==> Heure de la création du RDV : ' + appointmentTime);
});

Given("Un second rendez-vous a été créé", async function() {
    await this.backofficePage.locator('i[title="Mon équipe"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('i[title="Calendrier"]').click();
    await this.backofficePage.waitForTimeout(1000);

    const { fullname, oldDateRdv, oldHeureRdv, appointmentDate, appointmentTime } = await setupRdv(this);
    this.fullname_2 = fullname;
    this.oldDateRdv_2 = oldDateRdv;
    this.oldHeureRdv_2 = oldHeureRdv;
    this.appointmentDate_2 = appointmentDate;
    this.appointmentTime_2 = appointmentTime;
    
    console.log('==> Rendez-vous numero 2:  ');
    console.log('==> Rendez-vous créé pour ' + fullname);
    console.log('==> Ancienne date du RDV : ' + oldDateRdv);
    console.log('==> Ancienne heure du RDV : ' + oldHeureRdv);
    console.log('==> Date de création du RDV : ' + appointmentDate);
    console.log('==> Heure de la création du RDV : ' + appointmentTime);
});

Given("Le bouton \"Déplacer des RDVs\" est désélectionné et affiché en blanc", async function() {
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).not.toHaveClass(/active/);
});

Given("Pour le premier rendez-vous", async function() {
    // Parametrage des variables pour le premier rendez-vous
    this.initialAppointmentDate = this.oldDateRdv_1; // Date du RDV initial
    this.initialAppointmentTime = this.oldHeureRdv_1; // Heure du RDV initial
    this.fullname               = this.fullname_1; // Nom complet du rendez-vous
});

Given("Pour le second rendez-vous", async function() {
        // Parametrage des variables pour le second rendez-vous
        this.initialAppointmentDate = this.oldDateRdv_2; // Date du RDV initial
        this.initialAppointmentTime = this.oldHeureRdv_2; // Heure du RDV initial
        this.fullname               = this.fullname_2; 
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("Il clique sur le bouton \"Déplacer des RDVs\"", async function() {
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
});

When("L'utilisateur clique sur le rendez-vous pour le déplacer", async function() {
    await this.backofficePage.locator('strong').filter({ hasText: this.fullname_1 }).locator('xpath=..//..//..//..').nth(0).click();
});

When("L'utilisateur clique sur le second rendez-vous pour le déplacer", async function() {
    await this.backofficePage.locator('strong').filter({ hasText: this.fullname_2 }).locator('xpath=..//..//..//..').nth(0).click();
});

When("L'utilisateur clique sur une autres journée dans le calendrier", async function() {     
    // await this.backofficePage.locator('.main-calendar .vc-weeks .vc-day .vc-highlights').locator('..').locator('xpath=following-sibling::*').nth(0).click();
});

When("L'utilisateur glisse-dépose le premier rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure", async function() {

    // *************************** Calcule de la nouvelle date/heure (date courant +1 jours et 1 heure) *************************** //

    // Parse the current date from input value
    const parsedDate = new Date(this.initialAppointmentDate.split('/').reverse().join('-')); // assuming the format is dd/mm/yyyy
    const parsedTime = this.initialAppointmentTime.split(':').map(Number); // assuming the format is HH:mm

    // Calculate the next day
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if it's Friday and don't change date in case
    if (nextDay.getDay() === 6) { // 6 corresponds to Samedi
        nextDay.setDate(nextDay.getDate() - 1); // keep it to Friday (remove 1 days)
    }

    // Calculate the next hour
    let nextHour = parsedTime[0];
    //let nextMinute = parsedTime[1];
    let nextMinute = 0;

    if (nextHour < 18) {
        nextHour += 1; // Add one hour
    }

    // Format the date to match the date format used in the picker
    //const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    //const formattedNextDate = nextDay.toLocaleDateString('fr-FR', options);
    const formattedNextTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
    
    // *************************** Changer selecteur de nombre de jours a afficher *************************** //
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();
    await this.backofficePage.waitForTimeout(3000);
    console.log('Maintenant drag and drop');

    // *************************** Calcule l'emplacement du drop et executer le déplacement *************************** //
    const dayNumber = nextDay.getDay();
    
    console.log('dayNumber: ', dayNumber)
    expect(this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1)).toBeVisible();
    const boxDay    = await this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1).boundingBox();
    const boxHeure  = await this.backofficePage.locator('.vuecal__time-column').getByText(formattedNextTime).boundingBox();
    const dropToX   = boxDay.x;
    const dropToY   = boxHeure.y;
    console.log('dropToX: ', dropToX);
    console.log('dropToY: ', dropToY);

    //var fullname = this.name.toUpperCase() + ' ' + this.firstname;
    await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: this.fullname }).hover();
    await this.backofficePage.mouse.down();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.move(dropToX + 5, dropToY + 5);
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.up();
    await this.backofficePage.waitForTimeout(2000);

    this.newDateRdv     = formattedNextDate;
    this.newHeureRdv    = formattedNextTime;
});


When("L'utilisateur confirme le déplacement du rendez-vous", async function() {
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    await this.backofficePage.waitForTimeout(1000);
});

When("Il clique a nouveau sur le bouton \"Déplacer des RDVs\"", async function() {
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
});








// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

Then("Le bouton \"Déplacer des RDVs\" est sélectionné et reste affiché en verte", async function() {
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).toHaveClass(/active/);
});

Then("Le rendez-vous se \"glisse\" automatiquement en dessous de la case \"Déplacer des RDVs\"", async function() {
    expect(await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: this.fullname_1 }).count()).toBeGreaterThanOrEqual(1);
});

Then("Les deux rendez-vous apparaissent en dessous de la case \"Déplacer des RDV\"", async function() {
    expect(await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: this.fullname_2 }).count()).toBeGreaterThanOrEqual(1);
});

Then("Une fenêtre de confirmation du déplacement s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-confirm-move-slot label').filter({ hasText: 'Date du RDV' })).toBeVisible();
});

Then("Le rendez-vous est déplacé vers le nouvel emplacement", async function() {
    console.log('this.newHeureRdv: ', this.newHeureRdv)
    
    //// Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();

    // Rechercher le rendez-vous
    // var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: this.fullname }).locator('xpath=..//..//..//..').nth(0);

    // Vérification de l'heure
    const minTop =  parseInt(this.newHeureRdv.split(":")[0]) * 70;
    const maxTop = (parseInt(this.newHeureRdv.split(":")[0]) + 1) * 70;

    const topValueRdv = await appointmentLocator.evaluate((element) => { return window.getComputedStyle(element).top; });
    
    console.log('minTop: ', minTop)
    console.log('maxTop: ', maxTop)
    console.log('topValueRdv: ', topValueRdv)  

    expect(parseInt(topValueRdv)).toBeGreaterThanOrEqual(minTop);
    expect(parseInt(topValueRdv)).toBeLessThanOrEqual(maxTop);

    // Vérification de la date
    const [day, month, year] = this.newDateRdv.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const dayNumber = date.getDay();

    const dayLocator = this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1);
    const appointmentDayLocator = dayLocator.locator('strong').filter({ hasText: this.fullname }).locator('xpath=..//..//..//..').nth(0);
    expect(await appointmentDayLocator.count()).toBeGreaterThanOrEqual(1);
});


Then("Le bouton \"Déplacer des RDVs\" est désélectionné et devient blanc", async function() {
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).not.toHaveClass(/active/);
});

