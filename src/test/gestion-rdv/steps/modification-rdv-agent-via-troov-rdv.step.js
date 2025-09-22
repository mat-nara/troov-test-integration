const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(120 * 1000);

Given("L'utilisateur est sur la page de connexion", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
});

Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
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

    // Select heure du RDV 
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  

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
    // await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    // await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
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

    // const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    this.initialAppointmentTime  = await selectorHeureDuRDV.inputValue();

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
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
    console.log('fullname', fullname);

    this.oldDateRdv     = this.initialAppointmentDate
    this.oldHeureRdv    = this.initialAppointmentTime

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.userName           = await this.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();
});

Given("L'utilisateur est sur l'agenda", async function() {
    expect(await this.backofficePage.url()).toContain('calendar');
});

Given("Il modifie la date et l'heure du rendez-vous", async function() {
    await this.backofficePage.waitForTimeout(2000);

    //--- Select date
    const dateInputLocator = this.backofficePage.getByText('Date du rendez-vous :').locator('xpath=following-sibling::*').locator('input[aria-label="Cliquez ici pour choisir la date"]');
    //const dateInputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]').first();
    await dateInputLocator.click(); // Click to focus
    const currentDate = await dateInputLocator.inputValue();

    // Parse the current date from input value
    const parsedDate = new Date(currentDate.split('/').reverse().join('-')); // assuming the format is dd/mm/yyyy
    // Calculate the next day
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.isNextdayfriday = nextDay.getDay() === 6;


    // Check if it's Friday and set to next Monday
    if (nextDay.getDay() === 6) { // 6 corresponds to Samedi
        nextDay.setDate(nextDay.getDate() + 2); // Move to next Monday (add 2 days)
    }

    // Format the date to match the date format used in the picker
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = nextDay.toLocaleDateString('fr-FR', options);


    // check if current date is last month click next on calendar
    currentRdvDate = new Date(parsedDate);
    const currentFormattedDate = currentRdvDate.toLocaleDateString('fr-FR', options);
    const currentDatePickerLocator = this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${currentFormattedDate}"]`);

    const classList = await currentDatePickerLocator.locator('..').getAttribute('class');
    const hasLastDayClass = classList.includes('is-last-day');
    const hasInMonthClass = classList.includes('in-month');

    if (hasLastDayClass && hasInMonthClass) {
        const arrowRightLocator = this.backofficePage.locator('div.vc-arrow.is-right').nth(1);
        await arrowRightLocator.click();
    } 

    // Now locate the date picker and click on the correct next date
    const datePickerLocator = this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${formattedDate}"]`).nth(0);
    await datePickerLocator.click();


    //--- Select Heure (random choice excluding pre-selected one)
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du rendez-vous' }).locator('xpath=following-sibling::div//select');
    const currentHeureRdv = await selectorHeureDuRDV.inputValue();
    const allOptions = await selectorHeureDuRDV.locator('option');

    // Get the number of options available
    const optionsCount = await allOptions.count();

    // If there's more than one option, select a random one excluding the pre-selected
    if (optionsCount > 1) {
        // Get the pre-selected option value
//--        const selectedOption = await selectorHeureDuRDV.locator('option:checked').getAttribute('value');
//--
//--        // Generate a random index excluding the pre-selected one
//--        let randomIndex;
//--        do {
//--            randomIndex = Math.floor(Math.random() * optionsCount);  // Generate random index
//--        } while (await allOptions.nth(randomIndex).getAttribute('value') === selectedOption);  // Ensure it's not the pre-selected option

        let randomIndex;
        randomIndex = Math.floor(Math.random() * optionsCount);  // Generate random index

        // Select the randomly chosen option
        await selectorHeureDuRDV.selectOption({ index: randomIndex });

        // Verify that the selected option is not the pre-selected one
        const selectedValue = await selectorHeureDuRDV.inputValue();
        const secondOptionValue = await selectorHeureDuRDV.locator('option').nth(randomIndex).getAttribute('value');
        expect(selectedValue).toBe(secondOptionValue);
    } else {
        // If there is only one option, select it
        await selectorHeureDuRDV.selectOption({ index: 0 });
    }

    await this.backofficePage.waitForTimeout(1000);
    this.oldDateRdv     = currentDate
    this.oldHeureRdv    = currentHeureRdv
    this.newDateRdv     = await dateInputLocator.inputValue();
    this.newHeureRdv    = await selectorHeureDuRDV.inputValue();
});

Given("L'utilisateur a modifié le rendez-vous dans l'agenda", async function() {

    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();

    await this.backofficePage.waitForTimeout(1000);

    
    //***********************  Modifier le rendez-vous  *************************/
    //--- Select date
    const dateInputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]');
    await dateInputLocator.click(); // Click to focus
    const currentDate = await dateInputLocator.inputValue();

    // Parse the current date from input value
    const parsedDate = new Date(currentDate.split('/').reverse().join('-')); // assuming the format is dd/mm/yyyy
    // Calculate the next day
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.isNextdayfriday = nextDay.getDay() === 6;

    // Check if it's Friday and set to next Monday
    if (nextDay.getDay() === 6) { // 6 corresponds to Samedi
        nextDay.setDate(nextDay.getDate() + 2); // Move to next Monday (add 2 days)
    }

    // Format the date to match the date format used in the picker
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = nextDay.toLocaleDateString('fr-FR', options);


    // check if current date is last month click next on calendar
    currentRdvDate = new Date(parsedDate);
    const currentFormattedDate = currentRdvDate.toLocaleDateString('fr-FR', options);
    const currentDatePickerLocator = this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${currentFormattedDate}"]`);

    const classList = await currentDatePickerLocator.locator('..').getAttribute('class');
    const hasLastDayClass = classList.includes('is-last-day');
    const hasInMonthClass = classList.includes('in-month');

    if (hasLastDayClass && hasInMonthClass) {
        const arrowRightLocator = this.backofficePage.locator('div.vc-arrow.is-right').nth(1);
        await arrowRightLocator.click();
    } 

    // Now locate the date picker and click on the correct next date
    const datePickerLocator = this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${formattedDate}"]`).nth(0);
    await datePickerLocator.click();
    await this.backofficePage.waitForTimeout(2000);


    //--- Select Heure (random choice excluding pre-selected one)
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du rendez-vous' }).locator('xpath=following-sibling::div//select');
    const currentHeureRdv = await selectorHeureDuRDV.inputValue();
    const allOptions = await selectorHeureDuRDV.locator('option');

    // Get the number of options available
    const optionsCount = await allOptions.count();

    // If there's more than one option, select a random one excluding the pre-selected
    if (optionsCount > 1) {
        // Get the pre-selected option value
// --        const selectedOption = await selectorHeureDuRDV.locator('option:checked').getAttribute('value');
// --
// --        // Generate a random index excluding the pre-selected one
// --        let randomIndex;
// --        do {
// --            randomIndex = Math.floor(Math.random() * optionsCount);  // Generate random index
// --        } while (await allOptions.nth(randomIndex).getAttribute('value') === selectedOption);  // Ensure it's not the pre-selected option

        let randomIndex;
        randomIndex = Math.floor(Math.random() * optionsCount);  // Generate random index

        // Select the randomly chosen option
        await selectorHeureDuRDV.selectOption({ index: randomIndex });
    } else {
        // If there is only one option, select it
        await selectorHeureDuRDV.selectOption({ index: 0 });
    }

    //***********************  Valider la modification  *************************/
    const modifierButton = this.backofficePage.locator('button:has-text("Modifier")');
    await modifierButton.waitFor(async (btn) => !(await btn.getAttribute('disabled')), { timeout: 5000 });
    await modifierButton.click();

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentEditDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentEditTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    this.oldDateRdv     = currentDate
    this.oldHeureRdv    = currentHeureRdv
    this.newDateRdv     = await dateInputLocator.inputValue();
    this.newHeureRdv    = await selectorHeureDuRDV.inputValue();
});

Given("Un rendez-vous a été créé et ses informations ont été enregistrées", async function() {
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

    // Select heure du RDV 
    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  

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
    // await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    // await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
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

    // const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
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
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
    console.log('fullname', fullname);
});
 
Given("L'utilisateur ouvre le carnet d'adresse", async function() {
    await this.backofficePage.locator('i[title="Carnet d\'adresses"]').click();
});

Given("L'utilisateur a recherché le rendez-vous depuis le carnet d'adresses et l'a ouvert", async function() {
    await this.backofficePage.locator('i[title="Carnet d\'adresses"]').click();
    await this.backofficePage.getByPlaceholder('Email').first().fill(this.email); // Test passe
    //await this.backofficePage.getByPlaceholder('Prénom').first().fill(this.firstname);
    //await this.backofficePage.getByPlaceholder('Nom').first().fill(this.name);
    
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Rechercher' });
    await selectorButtonCreerUser.click();

    var invertedFullname =  this.firstname + ' ' + this.name.toUpperCase();
    console.log('invertedFullname: ', invertedFullname)
    const resultLocator = this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: invertedFullname });
    await resultLocator.click();
});

Given("Le bouton \"Déplacer des RDVs\" est désélectionné et affiché en blanc", async function() {
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).not.toHaveClass(/active/);
});

Given("Le bouton \"Déplacer des RDVs\" est activé", async function() {
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).toHaveClass(/active/);
});

Given("Le rendez-vous a été placé dans la pochette de déplacement", async function() {
    // Activer le boutton "Déplacer des RDV" 
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).toHaveClass(/active/);

    await this.backofficePage.waitForTimeout(1000);
    // Selectionne le rendez-vous pour le placer dans la pochette
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);
});

Given("Le rendez-vous a été repositionné via un glisser-déposer", async function() {

    //***********************  Le bouton "Déplacer des RDVs" est activé *************************/
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).toHaveClass(/active/);

    //***********************  Selectionne le rendez-vous pour le placer dans la pochette *************************/ 
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    // *************************** L'utilisateur glisse-dépose le rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure *************************** //
    // ---  Calcule de la nouvelle date/heure (date courant +1 jours et 1 heure)  //

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
    const formattedNextDate = nextDay.toLocaleDateString('fr-FR');
    const formattedNextTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
    
    // -- Changer selecteur de nombre de jours a afficher -- //
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();
    await this.backofficePage.waitForTimeout(3000);

    // -- Calcule l'emplacement du drop et executer le déplacement -- //
    const dayNumber = nextDay.getDay();
    
    console.log('dayNumber: ', dayNumber)
    expect(this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1)).toBeVisible();
    const boxDay    = await this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1).boundingBox();
    const boxHeure  = await this.backofficePage.locator('.vuecal__time-column').getByText(formattedNextTime).boundingBox();
    const dropToX   = boxDay.x;
    const dropToY   = boxHeure.y;
    console.log('dropToX: ', dropToX);
    console.log('dropToY: ', dropToY);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname;
    await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: fullname }).hover();
    await this.backofficePage.mouse.down();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.move(dropToX + 5, dropToY + 5);
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.up();
    await this.backofficePage.waitForTimeout(2000);

    //***********************  Confirmer la repositionnement *************************/
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    await this.backofficePage.waitForTimeout(1000);

    this.newDateRdv     = formattedNextDate;
    this.newHeureRdv    = formattedNextTime;
    console.log("this.newDateRdv: ", this.newDateRdv)
    console.log("this.newHeureRdv: ", this.newHeureRdv)

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentEditDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentEditTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    //***********************  Désactiver le bouton "Déplacer des RDVs" *************************/
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).not.toHaveClass(/active/);
});







// ----------------------------------------------------------

When("Il entre ses identifiants et clique sur \"Se connecter\"", async function() {
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
});

When("Il clique sur \"Calendrier\"", async function() {
    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
});

When("Il sélectionne le rendez-vous à modifier", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(2000);
});

When("Il clique sur le bouton \"Modifier\" de la fiche de rendez-vous.", async function() {
    const modifierButton = this.backofficePage.locator('button:has-text("Modifier")');
    await modifierButton.waitFor(async (btn) => !(await btn.getAttribute('disabled')), { timeout: 5000 });
    await modifierButton.click();
});

When("Il consulte l'agenda", async function() {
    await this.backofficePage.locator('i[title="Mon équipe"]').click();
    await this.backofficePage.waitForTimeout(3000);
    await this.backofficePage.locator('i[title="Calendrier"]').click();
    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }

    // *************************** Changer selecteur de nombre de jours a afficher *************************** //
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours", exact: true }).nth(0).click();
    await this.backofficePage.waitForTimeout(3000);

    if (this.isNextdayfriday) {
        // Click on the left arrow to go back one day   
        await this.backofficePage.locator('#page-topbar .bx-chevron-right').click();
    }
});

When("Il sélectionne le rendez-vous, puis clique sur \"Historique\", suivi de \"Rendez-vous pris\"", async function() {
        
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    //***********************  Clique  Historique *************************/
    await this.backofficePage.locator('span:has-text("Historique")').waitFor({ state: 'visible' });
    await this.backofficePage.locator('span:has-text("Historique")').locator('xpath=..').click();

    //***********************  Clique  Rendez-vous pris *************************/
    await this.backofficePage.locator('a:has-text("Rendez-vous pris")').click();
});

When("Il renseigne les informations de l'usager et recherche un rendez-vous", async function() {
    //await this.backofficePage.getByPlaceholder('Email').first().fill(this.email); // Test passe
    console.log("this.firstname: ", this.firstname)
    console.log("this.name: ", this.name)
    await this.backofficePage.locator('input[placeholder="Prénom"]').first().fill(this.firstname);
    await this.backofficePage.locator('input[placeholder="Nom"]').first().fill(this.name);
    
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Rechercher' });
    await selectorButtonCreerUser.click();
});

When("Il clique sur le bouton \"Déplacer des RDVs\"", async function() {
    await this.backofficePage.locator('button[title="Déplacer des RDV"]').click();
});

When("L'utilisateur clique sur le rendez-vous pour le déplacer", async function() {
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur glisse-dépose le rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure", async function() {

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

    var fullname = this.name.toUpperCase() + ' ' + this.firstname;
    await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: fullname }).hover();
    await this.backofficePage.mouse.down();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.move(dropToX + 5, dropToY + 5);
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.up();
    await this.backofficePage.waitForTimeout(2000);
    console.log('Rendez-vous déplacé vers la nouvelle date et heure');
});

When("L'utilisateur fait glisser le rendez-vous d'un emplacement à un autre, en mettant à jour la date et l'heure", async function() {
    
    //***********************   Selectionne le rendez-vous *************************/
    //var fullname = this.name.toUpperCase() + ' ' + this.firstname
    //const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    //await appointmentLocator.click();
    //await this.backofficePage.waitForTimeout(1000);

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

    //if (nextHour < 18) {
        nextHour += 2; // Add one hour
    //}
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedNextDate = nextDay.toLocaleDateString('fr-FR', options);
    const formattedNextTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
    
    // *************************** Changer selecteur de nombre de jours a afficher *************************** //
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 7 jours (multi guichets)", exact: true }).nth(0).click();
    await this.backofficePage.waitForTimeout(3000);

    console.log('this.initialAppointmentDate:' , this.initialAppointmentDate)
    console.log('this.initialAppointmentTime:' , this.initialAppointmentTime)
    console.log('formattedNextDate:' , formattedNextDate)
    console.log('formattedNextTime:' , formattedNextTime)
    

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

    var fullname = this.name.toUpperCase() + ' ' + this.firstname;
    console.log('fullname: ', fullname)
    // await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: fullname }).hover();
    console.log('commencement du drag and drop')


    const elementHandle = await this.backofficePage
        .locator('strong')
        .filter({ hasText: fullname })
        .locator('xpath=..//..//..//..')
        .nth(0)
        .elementHandle();

    await this.backofficePage.evaluate((el) => {
        el.style.border = '3px solid red';
    }, elementHandle);

    await this.backofficePage.exposeFunction('logEvent', (type, element) => {
        console.log(`Event ${type} on`, element);
      });
      
      await this.backofficePage.evaluate(() => {
        document.addEventListener('dragstart', (e) => logEvent('dragstart', e.target));
        document.addEventListener('dragover', (e) => logEvent('dragover', e.target));
        document.addEventListener('drop', (e) => logEvent('drop', e.target));
      });
    
    //console.log('attente 5 seconde avant action')
    //await this.backofficePage.waitForTimeout(5000);
    //await this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0).click();

    //await this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0).hover();
    // Attendre que l'élément à déplacer soit visible
const dragElement = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);
const sourceBox = await dragElement.boundingBox();

/*
//await dragElement.waitFor({ state: 'visible' });

// Vérifiez que l'élément est cliquable et ensuite hover dessus
//await dragElement.hover();
await this.backofficePage.mouse.move((sourceBox.x + sourceBox.width / 2), (sourceBox.y + sourceBox.height / 2));

    await this.backofficePage.waitForTimeout(2000);
    console.log('mouse down')
    await this.backofficePage.mouse.down();
    await this.backofficePage.waitForTimeout(2000);
    console.log('mouse move progressive')
    
    //console.log('Click ...')
    //await this.backofficePage.mouse.click(dropToX + 5, dropToY + 5);
    // await this.backofficePage.mouse.move(dropToX + 5 , dropToY + 500);
    // await this.backofficePage.mouse.move(dropToX + 5, dropToY + 500);
    
// Move mouse to target position gradually (simulates human-like movement)
console.log('sourceBox.x: ', sourceBox.x)
console.log('sourceBox.y: ', sourceBox.y)
console.log('dropToX: ', dropToX)
console.log('dropToY: ', dropToY)

for (let i = 0; i <= 10; i++) {
    const x = sourceBox.x + (dropToX  - sourceBox.x) * (i / 10);
    const y = sourceBox.y + (dropToY  - sourceBox.y) * (i / 10);
    await this.backofficePage.mouse.move(x, y);
    await this.backofficePage.waitForTimeout(500);
    
  }
  // 7. Solution cruciale : forcer les événements drop
  await this.backofficePage.evaluate(({dropToX, dropToY}) => {
    const target = document.elementFromPoint(dropToX, dropToY);
    if (target) {
        // Déclencher tous les événements nécessaires
        target.dispatchEvent(new DragEvent('dragover', {
            bubbles: true,
            clientX: dropToX,
            clientY: dropToY
        }));
        
        const dropEvent = new DragEvent('drop', {
            bubbles: true,
            dataTransfer: new DataTransfer(), // Essentiel
            clientX: dropToX,
            clientY: dropToY
        });
        target.dispatchEvent(dropEvent);
    }
}, {dropToX, dropToY});

    //await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.mouse.up();
    
    console.log('mouse up')
 */
    async function fixedDragDrop(page, fullname, dropToX, dropToY) {
        const dragElement = page.locator('strong')
            .filter({ hasText: fullname })
            .locator('xpath=..//..//..//..')
            .nth(0);
    
        await dragElement.waitFor({ state: 'visible' });
        const sourceBox = await dragElement.boundingBox();
    
        // 1. Création du DataTransfer dans le contexte de la page
        await page.evaluate(() => {
            window._playwrightDataTransfer = new DataTransfer();
        });
    
        // 2. DragStart avec DataTransfer
        await page.mouse.move(
            sourceBox.x + sourceBox.width / 2,
            sourceBox.y + sourceBox.height / 2
        );
        await page.mouse.down();
        await page.waitForTimeout(300);
    
        // Injection de dragstart avec DataTransfer
        await page.evaluate(() => {
            const event = new DragEvent('dragstart', {
                bubbles: true,
                dataTransfer: window._playwrightDataTransfer
            });
            document.activeElement.dispatchEvent(event);
        });
    
        // 3. Mouvement progressif avec dragover
        const steps = 15;
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const x = sourceBox.x + (dropToX - sourceBox.x) * progress;
            const y = sourceBox.y + (dropToY - sourceBox.y) * progress;
    
            await page.mouse.move(x, y);
            
            await page.evaluate(([x, y]) => {
                const target = document.elementFromPoint(x, y);
                if (target) {
                    const event = new DragEvent('dragover', {
                        bubbles: true,
                        clientX: x,
                        clientY: y,
                        dataTransfer: window._playwrightDataTransfer
                    });
                    target.dispatchEvent(event);
                }
            }, [x, y]);
            
            await page.waitForTimeout(50);
        }
    
        // 4. Drop final
        await page.evaluate(([x, y]) => {
            const target = document.elementFromPoint(x, y);
            if (target) {
                const dropEvent = new DragEvent('drop', {
                    bubbles: true,
                    clientX: x,
                    clientY: y,
                    dataTransfer: window._playwrightDataTransfer
                });
                target.dispatchEvent(dropEvent);
            }
        }, [dropToX, dropToY]);
    
        // 5. Fin de l'opération
        await page.mouse.up();
        await page.waitForTimeout(500);
    }
    fixedDragDrop(this.backofficePage, fullname, dropToX, dropToY)
    console.log('en attente du modal')
    await this.backofficePage.waitForTimeout(10000);
});





// ----------------------------------------------------------

Then("Il accède à l'application Troov RDV", async function() {
    const topbarLocator = this.backofficePage.locator('#page-topbar');
    await expect(topbarLocator).toBeVisible();
}); 

Then("L'agenda s'affiche correctement", async function() {
    expect(await this.backofficePage.url()).toContain('calendar');
}); 

Then("La fiche du rendez-vous doit être affichée correctement", async function() {
    const headerLocator = this.backofficePage.locator('#reservation-edit-modal h5').filter({ hasText: 'Rendez-vous '+ this.name + ' ' + this.firstname });
    await expect(headerLocator).toBeVisible();
}); 

Then("Une pop-up de confirmation affichant \"La réservation a été modifiée\" s'affiche", async function() {

    const notificationLocator = this.backofficePage.locator('.Vue-Toastification__container').getByText('La reservation a été modifiée.').first();
    await expect(notificationLocator).toBeVisible({ timeout: 5000 });
}); 

Then("Le rendez-vous doit être déplacé à la date et à l'heure choisies", async function() {
    console.log('this.newHeureRdv: ', this.newHeureRdv)
    
    //// Changer selecteur de nombre de jours a afficher
    // const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    // await filterLocator.click();
    // await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();

    // Rechercher le rendez-vous
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);

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
    const appointmentDayLocator = dayLocator.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);
    expect(await appointmentDayLocator.count()).toBeGreaterThanOrEqual(1);
}); 

Then("Les modifications de la date et de l'heure du rendez-vous doivent être correctement enregistrées", async function() {
    
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(2000);

    const dateInputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]');
    const currentDate = await dateInputLocator.inputValue();
    expect(currentDate).toBe(this.newDateRdv);

    const selectorHeureDuRDV = this.backofficePage.locator('legend').filter({ hasText: 'Heure du rendez-vous' }).locator('xpath=following-sibling::div//select');
    const heureRdv   = await selectorHeureDuRDV.inputValue();
    expect(heureRdv).toBe(this.newHeureRdv);
}); 

Then("L'historique affiche les informations correspondant à la prise et à la modification du rendez-vous", async function() {
    console.log('this.name: ', this.name)
    console.log('this.firstname: ', this.firstname)
    console.log('this.oldDateRdv: ', this.oldDateRdv)  
    console.log('this.oldHeureRdv: ', this.oldHeureRdv ) 
    console.log('this.newDateRdv: ', this.newDateRdv  )  
    console.log('this.newHeureRdv: ', this.newHeureRdv ) 

    console.log('attente 2 secondes pour que le modal se charge correctement')
    await this.backofficePage.waitForTimeout(3000);

    //***********************   Vérification des informations sur la prise du rendez-vous  *************************/
    const  appointmentDetailLocator = this.backofficePage.locator('#reservation-edit-modal .tab-content .active ul > li').nth(0);
    const appointmentDetail = await appointmentDetailLocator.textContent();

    //console.log(appointmentDetail)
    const cleanedText = appointmentDetail.replace(/\s+/g, ' ').trim();

    // Regex pour extraire chaque information
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (?:- |(.*?)) - (\d+) minutes - Mode : (.+)/;
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;
    // const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (?:\s*-\s*|(.*?)) - (\d+) minutes - Mode : (.+)/;
    const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?)(?: \(([^)]+)\))? - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) -\s*(.*?)?\s*- (\d+) minutes - Mode : (.+)/;
    console.log("cleanedText: ", cleanedText)

    // console.log('attente 20 secondes pour que le modal soit visible')
    // await this.backofficePage.waitForTimeout(20000);

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

        console.log('except appointmentTime ', this.appointmentTime)
        expect(this.appointmentDate).toBe(appointmentDate);
        console.log('except appointmentTime: ', appointmentTime)
        expect(this.appointmentTime).toBe(appointmentTime);
        console.log('except userName: ', this.userName.trim().toLowerCase())
        expect(this.userName.trim().toLowerCase()).toBe(userName.toLowerCase());
        console.log('except reservationDate: ', this.reservationDate)
        expect(this.reservationDate).toBe(reservationDate);
        console.log('except reservationStartTime: ', this.reservationStartTime)
        expect(this.reservationStartTime).toBe(reservationStartTime);
        console.log('except waitingReason: ', this.waitingReason.trim())
        expect(this.waitingReason.trim()).toBe(waitingReason);
        expect(this.mode).toBe(mode);
  
    } else {
        console.log('No match found.');
        expect(false).toBe(true);
    }

    //***********************   Vérification des informations sur la modification du rendez-vous  *************************/
    console.log('Vérification des informations sur la modification du rendez-vous');

    const  appointmentDetailEditLocator = this.backofficePage.locator('#reservation-edit-modal .tab-content .active ul > li').nth(1);
    const appointmentEditDetail = await appointmentDetailEditLocator.textContent();

    // console.log(appointmentEditDetail)
    const cleanedEditText = appointmentEditDetail.replace(/\s+/g, ' ').trim();

    // Regex pour extraire chaque information
    const regexEdit = /Déplacé le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) -(?: (.*?))? - (\d+) minutes - Mode : (.+)/;

    const matchEdit = cleanedEditText.match(regexEdit);
    console.log('matchEdit: ', matchEdit)

    if (matchEdit) {
        const appointmentDate = matchEdit[1];    // 25/03/2025
        const appointmentTime = matchEdit[2];    // 17:20
        const userName = matchEdit[3];           // Admin Troovst
        const userRole = matchEdit[4];           // membre
        const reservationDate = matchEdit[5];    // 25/03/2025
        const reservationStartTime = matchEdit[6]; // 18:00
        const reservationEndTime = matchEdit[7];  // 18:30
        const waitingReason = matchEdit[8];       // J'attends / J'accueille un enfant
        const duration = matchEdit[9];           // 30
        const mode = matchEdit[10];               // non libre

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

        console.log('this.appointmentEditDate: ', this.appointmentEditDate)
        console.log('this.appointmentEditTime: ', this.appointmentEditTime)
        console.log('this.userName: ', this.userName.trim().toLowerCase())
        console.log('this.newDateRdv: ', this.newDateRdv)
        console.log('this.newHeureRdv: ', this.newHeureRdv)
        console.log('this.waitingReason: ', this.waitingReason.trim())
        console.log('this.mode: ', this.mode)

        expect(this.appointmentEditDate).toBe(appointmentDate);
        expect(this.appointmentTime).toBe(appointmentTime);
        expect(this.userName.trim().toLowerCase()).toBe(userName.toLowerCase());
        expect(this.newDateRdv).toBe(reservationDate);
        expect(this.newHeureRdv).toBe(reservationStartTime);
        expect(this.waitingReason.trim()).toBe(waitingReason);
        expect(this.mode).toBe(mode);
  
    } else {
        console.log('No match found.');
        expect(false).toBe(true);
    }

}); 


Then("Le rendez-vous modifié précédemment est trouvé", async function() {
    var invertedFullname =  this.firstname + ' ' + this.name.toUpperCase();
    console.log('invertedFullname: ', invertedFullname)
    const resultLocator = this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: invertedFullname });
    await expect(resultLocator.first()).toBeVisible({timeout: 5000 });
    expect(await resultLocator.count()).toBeGreaterThanOrEqual(1);
}); 

Then("Le bouton \"Déplacer des RDVs\" est sélectionné et reste affiché en verte", async function() {
    await expect(this.backofficePage.locator('button[title="Déplacer des RDV"]')).toHaveClass(/active/);
}); 

Then("Le rendez-vous apparaît dans la pochette de déplacement sous le bouton \"Déplacer des RDVs\"", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    expect(await this.backofficePage.locator('.move-rdv .container strong').filter({ hasText: fullname }).count()).toBeGreaterThanOrEqual(1);
}); 

Then("Une fenêtre de confirmation du déplacement s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-confirm-move-slot label').filter({ hasText: 'Date du RDV' })).toBeVisible();
}); 
