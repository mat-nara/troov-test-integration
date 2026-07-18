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
    //world.email = world.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    world.email = world.name.toLowerCase() + "-" + world.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

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
    
    return { name: world.name, firstname: world.firstname, NIR: world.NIR, phone: world.phone, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime};
};


Given("Un utilisateur a été créé lors d'une prise de rendez-vous précédente", async function() {
    const { name, firstname, NIR, phone, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
    this.name         = name;
    this.firstname    = firstname;
    this.NIR          = NIR;
    this.phone        = phone;
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
    await this.backofficePage.locator('i[title="Mon équipe"]').click();
    await this.backofficePage.waitForTimeout(2000);
    await this.backofficePage.locator('i[title="Calendrier"]').click();
    await this.backofficePage.waitForTimeout(2000);
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
});







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------






When("L'utilisateur clique sur le bouton \"Ajouter un RDV\"", async function() {
    await this.backofficePage.locator('button[title="Ajouter un RDV"]').click();
});

When("Il choisi le service \"Entretien d'urgence\"", async function() {
    const selectorService = this.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = this.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "Entretien d'urgence" }).first(); 
    await firstItemService.click();
});

When("Il sélectionne un mode de RDV", async function() {
    const selectorModeDuRDV = this.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    await selectorModeDuRDV.selectOption({ index: 0 });  
});

When("Il choisi la date et l'heure du RDV", async function() {
    // await this.terminalPage.locator('button[aria-label="J\'ai un rendez-vous"]').click();
});

When("Il recherche un usager déja connue par son nom dans le SI Cnaf", async function() {
    await this.backofficePage.getByPlaceholder('Rechercher un utilisateur').fill(this.name);
});

When("Il ajoute des notes internes relatives au rendez-vous", async function() {
    this.note = fakerFR .lorem.sentence(); 
    await this.backofficePage.getByPlaceholder('Notes').fill(this.note);
});

When("Il sélectionnne le mode de prise du rendez-vous", async function() {
    const selectorPriseRdv = this.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = this.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // Récuperer les valeurs choisi pour vérifier plus tard
    this.waitingReason          = await this.backofficePage.getByPlaceholder('Choisir un service').locator('xpath=following-sibling::span').textContent();
    this.reservationDate        = await this.backofficePage.getByPlaceholder('Cliquez ici pour choisir la date').inputValue();
    this.reservationStartTime   =  await this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select').inputValue();
    const freeToogleMode    = this.backofficePage.locator('.free-mode-toggle > label > span')
    this.mode               =  (await freeToogleMode.count()) > 0 && (await freeToogleMode.textContent()).includes('Activé')   ? 'libre' : 'non libre';
});

When("Il clique sur le bouton \"Bloquer ce créneau\" pour confirmer le rendez-vous", async function() {
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click();

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.userName           = await this.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();
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

When("Il recherche un usager inconnue par son nom dans le SI Cnaf", async function() {
    const searchLoctor = this.backofficePage.getByPlaceholder('Rechercher un utilisateur');

	await this.backofficePage.waitForTimeout(1000); 
	await searchLoctor.fill('');
    const unkownUSer = faker.person.lastName() + 'ielle';
    
    await searchLoctor.type(unkownUSer, { delay: 100 }); 
    await this.backofficePage.waitForTimeout(2000); 
});

When("Il clique sur le bouton \"Créer un utilisateur\"", async function() {
    await this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' }).click();
});

When("Il renseigne les informations de l'usager", async function() {
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
});

When("Il valide la création de l'usager", async function() {
    await this.backofficePage.locator('button[title="Confirmer"]').click();
});










  
  



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------






Then("Une fenêtre \"Ajouter un RDV\" s'ouvre", async function() {
    await expect(this.backofficePage.locator('#modal-reservation-internal header span').filter({ hasText: "Ajouter un RDV" })).toBeVisible();
});

Then("L'utilisateur est trouvé", async function() {
    const contactLocator = this.backofficePage.locator('.focus-contact').first();
    const contact = await contactLocator.textContent();
	await expect(contact).toContain(this.name);
    await contactLocator.click();
});

Then("Le rendez-vous est bien affiché dans l'agenda à la date, à l'heure sélectionnées et dans le guichet", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
});

Then("Les informations du RDV correspondent à celles saisies", async function() {
    const  appointmentDetailLocator = this.backofficePage.locator('#edit-reservation___BV_modal_body_ .tab-content .active ul > li').nth(0);
    const appointmentDetail = await appointmentDetailLocator.textContent();

    //console.log(appointmentDetail)
    const cleanedText = appointmentDetail.replace(/\s+/g, ' ').trim();

    console.log('cleanedText: ', cleanedText)

    // Regex pour extraire chaque information
    const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;
    //const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par (.+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode ?: ?(.+)/;
    //const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par (.+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.+?) - (\d+) minutes - Mode ?: ?(.+)/;
    
      const match = cleanedText.match(regex);

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

        // expect(this.appointmentDate).toBe(appointmentDate);
        // expect(this.appointmentTime).toBe(appointmentTime);
        // expect(this.userName.trim().toLowerCase()).toBe(userName.toLowerCase());
        // expect(this.reservationDate).toBe(reservationDate);
        // expect(this.reservationStartTime).toBe(reservationStartTime);
        // expect(this.waitingReason.trim()).toBe(waitingReason);
        // expect(this.mode).toBe(mode);
  
    } else {
        console.log('No match found.');
        // expect(false).toBe(true);
    }
});

Then("Aucun utilisateur n'est trouvé", async function() {
    await expect(this.backofficePage.locator('.focus-contact')).toHaveCount(0);
});

Then("L'utilisateur est créer et sélectionné pour le rendez-vous", async function() {
    var fullname = this.firstname + " " + this.name;
    await expect(this.backofficePage.locator('#reservation-contact-picker-tooltip > input')).toHaveAttribute('placeholder', fullname);
});

