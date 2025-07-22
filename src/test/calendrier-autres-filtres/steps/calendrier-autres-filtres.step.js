const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');

setDefaultTimeout(120 * 1000);

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


Given("Une date avec des rendez-vous est séléctionné", async function() {
    await this.backofficePage.locator('span[aria-label="lundi 21 juillet 2025"]').click(); 
});

Given("Le filtre zoom est sur \"zoom X 1\"", async function() {    
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x1" }).click(); 
    await expect(this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single label').filter({ hasText: "ZOOM x1" }) ).toBeVisible();
    await this.backofficePage.waitForTimeout(2000); // wait for the calendar to refresh
    
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur clique sur \"Horaires d'ouverture\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Horaires d'ouverture" }) .click(); 
});

When("L'utilisateur clique sur le filtre \"Services\"", async function() {
   await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags').first().click(); 
   await this.backofficePage.waitForTimeout(2000); 
});

When("L'utilisateur déselectionne un services particulier", async function() {
    await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags').first().click(); 
    await this.backofficePage.waitForTimeout(2000); 

    const serviceLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select');
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de présence parentale (AJPP)" }).first().click();
    console.log('Counteur commence ...')
    await this.backofficePage.waitForTimeout(10000); // Wait for the Rendez-vous to be hidden
});

When("L'utilisateur resélectionne le service précédemment déselectionné", async function() {
    // await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags').first().click(); 
    // await this.backofficePage.waitForTimeout(2000); 

    const serviceLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select');
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de présence parentale (AJPP)" }).first().click()
    await this.backofficePage.waitForTimeout(10000); // Wait for the Rendez-vous to be hidden
});

When("L'utilisateur désélectionne un a un chaque service", async function() {
    // await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags').first().click(); 
    // await this.backofficePage.waitForTimeout(2000); 

    const serviceLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select');
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li:first-child').filter({ hasText: "Sélectionner tout" });
    await this.backofficePage.waitForTimeout(10000);
});

When("L'utilisateur resélectionne tous les services", async function() {
    // await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags').first().click(); 
    // await this.backofficePage.waitForTimeout(2000); 

    const serviceLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select');
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li:first-child').filter({ hasText: "Sélectionner tout" });
    await this.backofficePage.waitForTimeout(10000);
});

When("L'utilisateur déselectionne tout les guichet apart le \"Guichet 1\"", async function() {
    const guichetLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').nth(1); 
    await guichetLocator.locator('div').filter({ hasText: "Guichet d'urgence" }).locator('..').locator('.removeBtn').first().click();
    await this.backofficePage.waitForTimeout(1000); 
    await guichetLocator.locator('div').filter({ hasText: "Guichet 2" }).locator('..').locator('.removeBtn').first().click();
    await this.backofficePage.waitForTimeout(1000); 
    await guichetLocator.locator('div').filter({ hasText: "Guichet 3" }).locator('..').locator('.removeBtn').first().click();
    await this.backofficePage.waitForTimeout(1000); 
    await guichetLocator.locator('div').filter({ hasText: "Guichet 4" }).locator('..').locator('.removeBtn').first().click();
    await this.backofficePage.waitForTimeout(1000); 
    await guichetLocator.locator('div').filter({ hasText: "Approche pop" }).locator('..').locator('.removeBtn').first().click();
    await this.backofficePage.waitForTimeout(1000); 
});

When("L'utilisateur clique sur le menu déroulant des guichets puis sur le \"Guichet 2\"", async function() {
    const guichetLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').nth(1); 
    await guichetLocator.locator('.multiselect__select').first().click();

    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Guichet 2" }).first().click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur rajoute tous les autres guichets", async function() {
    const guichetLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').nth(1); 
    await guichetLocator.locator('.multiselect__select').first().click();

    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Guichet d'urgence" }).first().click();
    await this.backofficePage.waitForTimeout(1000);
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Guichet 3" }).first().click();
    await this.backofficePage.waitForTimeout(1000);
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Guichet 4" }).first().click();
    await this.backofficePage.waitForTimeout(1000);
    await serviceLocator.locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Approche pop" }).first().click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur sélectionne un compte particuler", async function() {
    await this.backofficePage.locator('.custom-team-select .custom-placeholder').filter({ hasText: "Choisissez un compte" }).first().click();
    await this.backofficePage.locator('.custom-team-select .dropdown-menu .custom-dropdown-item span').filter({ hasText: "Caf de l'Essonne" }).first().click();
});

When("L'utilisateur clique sur le bouton \"zoom X 2\"", async function() {
    this.oldHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x2" }).click();
    await this.backofficePage.waitForTimeout(2000);
    this.newHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
});

When("L'utilisateur clique sur le bouton \"zoom X 3\"", async function() {
    this.oldHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x3" }).click();
    await this.backofficePage.waitForTimeout(2000);
    this.newHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
});

When("L'utilisateur clique sur le bouton \"zoom X 4\"", async function() {
    this.oldHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x4" }).click();
    await this.backofficePage.waitForTimeout(2000);
    this.newHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
});

When("L'utilisateur clique sur le bouton \"zoom X 8\"", async function() {
    this.oldHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x8" }).click();
    await this.backofficePage.waitForTimeout(2000);
    this.newHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
});

When("L'utilisateur clique sur le bouton \"zoom X 1\"", async function() {
    this.oldHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__single').click(); 
    await this.backofficePage.locator('.calendar-mode-select').first().locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "ZOOM x1" }).click();
    await this.backofficePage.waitForTimeout(2000);
    this.newHeight = await this.backofficePage.locator('.calendar .vuecal__time-cell-label').first().locator('..').evaluate(el => el.style.height);
});

When("L'utilisateur sélectionne sur le filtre journée  \"Semaine 5 jours\"", async function() {
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__single').click();
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Semaine 5 jours", exact: true }).first().click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur sélectionne sur le filtre journée  \"Semaine 5 jours - multi guichets\"", async function() {
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__single').click();
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).first().click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur sélectionne sur le filtre journée  \"Semaine 7 jours\"", async function() {
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__single').click();
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Semaine 7 jours", exact: true }).first().click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur sélectionne sur le filtre journée  \"Semaine 7 jours - multi guichets\"", async function() {
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__single').click();
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Semaine 7 jours (multi guichets)", exact: true }).first().click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur sélectionne sur le filtre journée  \"Journée\"", async function() {
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__single').click();
    await this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect__content-wrapper > ul > li').filter({ hasText: "Journée", exact: true }).first().click();
    await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur clique sur \"RDV MAINTENUS\"", async function() {
    await this.backofficePage.locator('#page-topbar button').filter({ hasText: "rdv maintenus" }).click();
    await this.backofficePage.waitForTimeout(1000);
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------






Then("La page \"Gestion de plages horaires exceptionnelles\" s'affiche", async function() {
    await expect(this.backofficePage.locator('button.blue-custom-days > span').filter({ hasText: "Ajouter une plage horaire exceptionnelle" }) ).toBeVisible();
});

Then("Tous les services sont pré-sélectonner et sont en vert", async function() {
    const serviceLocator        = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select');
    expect(await serviceLocator.locator('.multiselect__content-wrapper > ul > li:first-child').filter({ hasText: "Sélectionner tout" }).first().locator('span.multiselect__option--group-selected').count() ).toBeGreaterThan(0);
});

Then("Les rendez-vous associés à ce service sont masqués", async function() {
    this.fullname = "PATRICK Jane";
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: this.fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).toBeHidden();
});

Then("Le chiffre ecrit sur le bouton \"Services\" diminue", async function() {
    const serviceLocator  = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').first();
    const optionAvailable =  await serviceLocator.locator('.multiselect__content-wrapper > ul > li[role="option"]').count();

    const text = await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags span').textContent();
    console.log('Text content:', text);
    const parts = text.trim().split(" ");
    const number = parseInt(parts[0], 10);
    console.log('Nombre de services sélectionnés:', number);
    console.log('Nombre de services disponibles:', optionAvailable);    
    expect(number).toBeLessThan(optionAvailable);
});

Then("Les rendez-vous associés à ce service sont de nouveau affichés", async function() {
    this.fullname = "PATRICK Jane";
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: this.fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).toBeVisible();
});

Then("Le chiffre ecrit sur le bouton \"Services\" augmente", async function() {
    const serviceLocator  = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').first();
    const optionAvailable =  await serviceLocator.locator('.multiselect__content-wrapper > ul > li[role="option"]').count();

    const text = await this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select .multiselect__tags span').textContent();
    console.log('Text content:', text);
    const parts = text.trim().split(" ");
    const number = parseInt(parts[0], 10);
    console.log('Nombre de services sélectionnés:', number);
    console.log('Nombre de services disponibles:', optionAvailable);    
    expect(number).toBe(optionAvailable);
});

Then("Tous les rendez-vous disparait", async function() {
    expect(await this.backofficePage.locator('.desk-agenda-label').count() ).toBe(0);
});

Then("Tous les rendez-vous sont de nouveau affichés", async function() {
    expect(await this.backofficePage.locator('.desk-agenda-label').count() ).toBeGreaterThan(0);
});

Then("Seule le \"Guichet 1\" est affiché dans le calendrier", async function() {
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 1" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 2" }).count() ).not.toBeGreaterThan(0);
});

Then("On a maintenant sur le calendrier le \"Guichet 1\" et le \"Guichet 2\"", async function() {
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 1" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 2" }).count() ).toBeGreaterThan(0);
});

Then("Tous les guichets sont affichés dans le calendrier", async function() {
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet d'urgence" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 1" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 2" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 3" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Guichet 4" }).count() ).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('.calendar .vuecal__header .title-container').filter({ hasText: "Approche pop" }).count() ).toBeGreaterThan(0);
});

Then("Le filtre sur le compte est appliqué", async function() {
    await expect(this.backofficePage.locator('.custom-team-select .dropdown-menu .custom-dropdown-item span').filter({ hasText: "Caf de l'Essonne" }).first() ).toBeVisible();
});

Then("Le zoom est appliqué au calendrier", async function() {
    const oldHeight = parseInt(this.oldHeight.replace("px", ""));
    const newHeight = parseInt(this.newHeight.replace("px", ""));
    expect(newHeight).toBeGreaterThan(oldHeight);
});

Then("Le calendrier affiche les 5 jours de la semaine en cours", async function() {
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    for (const jour of jours) {
      await expect(this.backofficePage.locator('.calendar .vuecal__header .h4').filter({ hasText: jour })).toBeVisible();
    }
});

Then("Le calendrier affiche les 5 jours de la semaine en cours avec tous les guichets sur chaque jour", async function() {
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    for (const jour of jours) {
      await expect(this.backofficePage.locator('.calendar .vuecal__header .h4').filter({ hasText: jour })).toBeVisible();
    }

    const guichetLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').nth(1); 
    const nbrSelectedGuichet = await guichetLocator.locator('.multiselect__content-wrapper > ul > li').first().locator('span.multiselect__option--selected').count()
    const nbrGuichets = await guichetLocator.locator('.calendar .vuecal__header .day-split-header .h6').count();
    expect(nbrSelectedGuichet).toBe(nbrGuichets);
});

Then("Le calendrier affiche les 7 jours de la semaine en cours", async function() {
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    for (const jour of jours) {
      await expect(this.backofficePage.locator('.calendar .vuecal__header .h4').filter({ hasText: jour })).toBeVisible();
    }
});

Then("Le calendrier affiche les 7 jours de la semaine en cours avec tous les guichets sur chaque jour", async function() {
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    for (const jour of jours) {
      await expect(this.backofficePage.locator('.calendar .vuecal__header .h4').filter({ hasText: jour })).toBeVisible();
    }

    // Vérifier que tous les guichets sont affichés pour chaque jour
    const guichetLocator = this.backofficePage.locator('.main-calendar  .left-panel .desk-multi-select').nth(1); 
    const nbrSelectedGuichet = await guichetLocator.locator('.multiselect__content-wrapper > ul > li').first().locator('span.multiselect__option--selected').count()
    const nbrGuichets = await guichetLocator.locator('.calendar .vuecal__header .day-split-header .h6').count();
    expect(nbrSelectedGuichet).toBe(nbrGuichets);
});

Then("Le calendrier affiche la journée en cours", async function() {
    await expect(this.backofficePage.locator('.calendar .vuecal__header .title-container > .text-primary')).toBeVisible();
});

Then("Le bouton change en \"RDV ANNULES\" et les rendez-vous annulé sont affichés", async function() {
    await expect(await this.backofficePage.locator('#page-topbar button').filter({ hasText: "rdv maintenus" })).not.toBeVisible();
    await expect(await this.backofficePage.locator('#page-topbar button').filter({ hasText: "rdv annulés" })).toBeVisible();
});