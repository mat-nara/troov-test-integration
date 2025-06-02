const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const exp = require('constants');



setDefaultTimeout(120 * 1000);

function getRandomDate() {
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3); // 3 mois plus tard
    return faker.date.between(start, end);
}

async function selectChoix(thisContext, selecteurLabel, label, choisissezText, choix) {
    const serviceLocator = thisContext.backofficePage.locator(selecteurLabel).filter({ hasText: label }).locator('xpath=following-sibling::*');
  
    // Ouvre le menu de sélection
    await serviceLocator.locator('span').filter({ hasText: choisissezText }).first().click();
  
    // Sélectionne le service désiré
    await serviceLocator.locator('ul > li  span').filter({ hasText: choix }).first().click();
}

Given("Un rendez-vous a été créé", async function() {
//    this.loginPageAlt = new LoginPage(this.backofficePage);
//    await this.loginPageAlt.navigate();
//    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
//
//    // wait for backoffice loaded
//    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 
//
//    let currentURL = await this.backofficePage.url();
//    while (!currentURL.includes('calendar')) {
//        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
//        currentURL = await this.backofficePage.url();
//    }
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

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();

    await this.backofficePage.waitForTimeout(1000);

    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
    await appointmentLocator.click();
    this.guichet = await this.backofficePage.locator('span').filter({ hasText: 'Guichet :' }).locator('xpath=following-sibling::span').textContent();

    this.oldDateRdv     = this.initialAppointmentDate
    this.oldHeureRdv    = this.initialAppointmentTime

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    this.userName           = await this.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();
   
    // close the appointment popup
    await this.backofficePage.mouse.click(10, 10);
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

Given("L'utilisateur est sur la page \"Gestion des Services\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

Given("La page \"plage horaire exceptionnel\" du {string} est ouverte", async function(guichet) {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
    await this.backofficePage.locator('table > tbody > tr > td').filter({ hasText: guichet }).locator('..').locator('td:last-child i.bx-calendar-star ').click(); 
});

Given("La fenetre \"Deplacer les RDV\" étape 1\\/3 est ouverte", async function() {
    await this.backofficePage.locator('span').filter({ hasText: 'Déplacer les RDV en masse' }).click(); 
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

When("Il clique sur le calendrier avec étoile du {string}", async function(guichet) {
    await this.backofficePage.locator('table > tbody > tr > td').filter({ hasText: guichet }).locator('..').locator('td:last-child i.bx-calendar-star ').click(); 
});

When("L'utilisateur clique sur \"Déplacer les RDV en masse\"", async function() {
    await this.backofficePage.locator('span').filter({ hasText: 'Déplacer les RDV en masse' }).click(); 
});

When("L'utilisateur remplit les champs de l'étape 1\\/3 et clique sur \"Valider 1\\/3\"", async function() {

    if (this.guichet === undefined || this.guichet === null) this.guichet = "Guichet 1";
    
    await selectChoix(this, selecteurLabel="#move-rdv label", label="Service", choisissezText="Choisissez les services", choix="J'attends / J'accueille un enfant");
    await selectChoix(this, selecteurLabel="#move-rdv label", label="Guichet", choisissezText="Guichet", choix=this.guichet);
    
    // Choix date a déplacer
    const dateLocator = this.backofficePage.locator('#move-rdv label').filter({ hasText: 'Date du RDV' }).locator('xpath=following-sibling::*');
    await dateLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').click(); 

    dateRdvToMove = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = dateRdvToMove.toLocaleDateString('fr-FR', options);
    await dateLocator.locator(`.vc-popover-content-wrapper span[aria-label="${formattedDate}"]`).nth(0).click();

    // Choix plage horaire  
    const plageHoraireLocator = this.backofficePage.locator('#move-rdv label').filter({ hasText: 'Plage horaire' }).locator('xpath=following-sibling::*');
    await plageHoraireLocator.getByPlaceholder('Heure de début').fill("09:00");
    await plageHoraireLocator.getByPlaceholder('Heure de fin').fill("18:00");

    // Cliquer sur le bouton "Valider 1/3" 
    await this.backofficePage.locator('button[title="Valider (1/3)"]').click();
});

When("L'utilisateur remplit les champs de l'étape 2\\/3 et clique sur \"Valider 2\\/3\"", async function() {

    if (this.guichet === undefined || this.guichet === null) this.guichet = "Guichet 1";


    await selectChoix(this, selecteurLabel="#move-rdv label", label="Equipe", choisissezText="Equipe", choix="CNAF Formation");
    await this.backofficePage.waitForTimeout(1000);
    await selectChoix(this, selecteurLabel="#move-rdv label", label="Service", choisissezText="Service", choix="J'attends / J'accueille un enfant");
    await selectChoix(this, selecteurLabel="#move-rdv label", label="Guichet", choisissezText="Guichet", choix=this.guichet);

    //*******************  Choix date a déplacer *******************/
    const dateLocator = this.backofficePage.locator('#move-rdv label').filter({ hasText: 'Date du RDV' }).locator('xpath=following-sibling::*');
    await dateLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').click(); 

    const today = new Date();
    const nextDay = new Date();

    nextDay.setDate(today.getDate() + 1);

    // Check if it's Friday and set to next Monday
    if (nextDay.getDay() === 6) { nextDay.setDate(nextDay.getDate() + 2); }
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = nextDay.toLocaleDateString('fr-FR', options);

    // check if today date is last month click next on calendar
    const currentFormattedDate = today.toLocaleDateString('fr-FR', options);
    const currentDatePickerLocator = this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${currentFormattedDate}"]`);

    const classList = await currentDatePickerLocator.locator('..').getAttribute('class');
    const hasLastDayClass = classList.includes('is-last-day');
    const hasInMonthClass = classList.includes('in-month');

    if (hasLastDayClass && hasInMonthClass) {
        const arrowRightLocator = this.backofficePage.locator('div.vc-arrow.is-right').nth(1);
        await arrowRightLocator.click();
    } 

    // Now locate the date picker and click on the correct next date
    await dateLocator.locator(`.vc-popover-content-wrapper span[aria-label="${formattedDate}"]`).nth(0).click();
    /***********************************/
    
    // Choix plage horaire  
    const plageHoraireLocator = this.backofficePage.locator('#move-rdv label').filter({ hasText: /^Plage concernée: \d{2}:\d{2}$/ }).locator('xpath=following-sibling::*');
    await plageHoraireLocator.getByPlaceholder('Heure de début').fill("09:00");
    //await plageHoraireLocator.getByPlaceholder('Heure de fin').fill("18:00");

    // Cliquer sur le bouton "Valider 2/3" 
    await this.backofficePage.locator('button[title="Valider (2/3)"]').click();


    const formattedNextDate = nextDay.toLocaleDateString('fr-FR');
    this.newDateRdv     = formattedNextDate;
});

When("L'utilisateur clique sur le bouton de validation de l’étape 3", async function() {
    await this.backofficePage.locator('button[title="Valider (3/3)"]').click();
});

When("L'utilisateur retourne dans le calendrier", async function() {
    await this.backofficePage.locator('i[title="Calendrier"]').click(); 
});








// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page \"Gestion des services\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("La page \"Plage horaire exceptionnel\" du guichet s'affiche", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Ajouter une plage horaire exceptionnelle' })).toBeVisible();
});

Then('La fenetre "Deplacer les RDV" étape 1\\/3 s\'affiche', async function() {
    await expect(this.backofficePage.locator('#move-rdv header span').filter({ hasText: 'Déplacer les RDV' })).toBeVisible();
});

Then("La fenetre \"Deplacer les RDV\" étape 2\\/3 s'affiche", async function() {
    await expect(this.backofficePage.locator('#move-rdv span').filter({ hasText: "2/3 - Séléction de l'endroit où déplacer les RDV" })).toBeVisible();
}); 

Then("La fenetre \"Deplacer les RDV\" étape 3\\/3 s'affiche", async function() {
    await expect(this.backofficePage.locator('#move-rdv span').filter({ hasText: "3/3 - Confirmation du déplacement massif de RDV" })).toBeVisible();
}); 

Then("Un message de confirmation du déplacement en masse s’affiche", async function() {    
    await this.backofficePage.waitForTimeout(2000); 
    const notificationLocator = this.backofficePage.locator('.Vue-Toastification__container').first();
    await expect(await notificationLocator.locator('.Vue-Toastification__toast-body').count()).toBeGreaterThan(0);
    await expect(await notificationLocator.getByText('Une erreur est survenue').count()).not.toBeGreaterThan(0);
}); 


Then("Les rendez-vous sont correctement placé", async function() {

    console.log("this.guichet: ", this.guichet);
    console.log("this.oldDateRdv: ", this.oldDateRdv);
    console.log("this.newDateRdv: ", this.newDateRdv);


    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(2000);

    //***********************   Check la nouvelle date *************************/
    const dateInputLocator = this.backofficePage.locator('input[aria-label="Cliquez ici pour choisir la date"]');
    const currentDate = await dateInputLocator.inputValue();
    expect(currentDate).toBe(this.newDateRdv);

    //***********************   Netoyer la base de donnée *************************/
    const annulerBtnLocator = this.backofficePage.locator('#edit-reservation___BV_modal_content_ button:has-text("Annuler ce/ces rendez-vous")');
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();
}); 

