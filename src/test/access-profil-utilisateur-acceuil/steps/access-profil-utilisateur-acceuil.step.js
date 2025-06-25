const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');



Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate();
    await this.loginPageAlt.login(config.usernameProfileUtilisateurAcceuil, config.passwordProfileUtilisateurAcceuil);

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



When("L'utilisateur clique sur Calendrier", async function() {
    await this.backofficePage.locator('i[title="Calendrier"]').click(); 
});

When("L'utilisateur crée un rendez-vous", async function() {
    // Wait for the calendar page to load
    await this.backofficePage.waitForTimeout(2000); 

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

When("L'utilisateur clique sur File d'attente", async function() {
    await this.backofficePage.locator('i[title="File d\'attente"]').click(); 
});

When("L'utilisateur crée un signalement d'arrivée sans rendez-vous", async function() {
    
    // Open window "Signaler une arrivée"
    await this.backofficePage.locator('button[title="Signaler une arrivée"]').click();

    await this.backofficePage.locator('h3').filter({ hasText: 'Signaler l’arrivée d’un usager' }).waitFor({ state: 'visible' });

    // Page principale
    // await this.backofficePage.goto(config.troovCafUserArrivalURL);
    const sansRdvButton = this.backofficePage.locator('button[name="with-rdv"]');
    await sansRdvButton.waitFor();
    await sansRdvButton.click();

    // Page enregistrement
    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();

    const heading = await this.backofficePage.locator('p').filter({ hasText: 'Enregistrer l’usager' });
    await expect(heading).toBeVisible();
    const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(this.NIR);
    const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(this.phone);
    const buttonLocator = await this.backofficePage.locator('button[aria-label="Continuer"]');
    await expect(buttonLocator).toBeEnabled();
    await buttonLocator.click();

    // Page Motif de visite 
    const headingMotif = await this.backofficePage.locator('p').filter({ hasText: 'Choisir le motif de visite' })
    await expect(headingMotif).toBeVisible();
    const inputOfficeTypeLocator = this.backofficePage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.backofficePage.locator(`li[aria-label="Enfant"]`).first();
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe("Enfant");
    const inputOfficeLocator = this.backofficePage.locator('label[for="office"] + div span.p-select-label');
    await inputOfficeLocator.click();
    const liAttendEnfantLocator = await this.backofficePage.locator(`li[aria-label="J'attends / J'accueille un enfant - J'attends un enfant"]`).first();
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe("J'attends / J'accueille un enfant - J'attends un enfant");
    await this.backofficePage.locator('button[aria-label="Continuer"]').click();

    // Page Confirmation
    const headingConfirmation = await this.backofficePage.locator('p').filter({ hasText: 'L’usager a été ajouté dans la file d’attente' });
    await expect(headingConfirmation).toBeVisible();
    this.ticket = await this.backofficePage.locator('h4').filter({ hasText: 'Numéro à communiquer à l’usager' }).locator('+ div p.tui-text-sky-600').first().textContent();
    this.motif = await this.backofficePage.locator('span').filter({ hasText: 'Motif :' }).locator('b').first().textContent();
    
});

When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques RDV\"", async function() {
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click();
    await this.backofficePage.locator('i[title="Statistiques RDV"]').click();
});

When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click();
    await this.backofficePage.locator('i[title="Statistiques file d\'attente"]').click();
});

When("L'utilisateur clique sur \"Statistiques\"", async function() {
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click();
});



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

Then("La page \"Calendrier\" est accessible", async function() {
    await expect(this.backofficePage.locator('div.main-calendar')).toBeVisible();
});

Then("Le bouton \"Ajouter un RDV\" est cliquable", async function() {
    await expect(this.backofficePage.locator('button[title="Ajouter un RDV"]')).toBeEnabled();
});

Then("Le rendez-vous est créé avec succès et visible dans le calendrier", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    expect(appointmentLocator).toBeVisible();
});

Then("La page \"File d'attente\" est accessible", async function() {
    await expect(this.backofficePage.locator('h4').getByText('Usagers en attente').first() ).toBeVisible();
});

Then("Le bouton \"Signaler une arrivee\" est cliquable", async function() {
    await expect(this.backofficePage.locator('button[title="Signaler une arrivée"]')).toBeEnabled();
});

Then("Le signalement d'arrivée est créé avec succès et visible dans la file d'attente sur la colone \"attente sans RDV\"", async function() {
    
    const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
    const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
    const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');

    await expect(ticketBlock).toBeVisible();

    const motifBlock = ticketBlock.locator('xpath=..//..').getByText(this.motif);
    await expect(motifBlock).toBeVisible();
});


Then("La page \"Statistiques RDV\" est accessible", async function() {
    await expect(this.backofficePage.locator('.stat-card > span').filter({ hasText: "Réservations" }).first() ).toBeVisible();
});

Then("La page \"Statistiques file d'attente\" est accessible", async function() {
    await expect(this.backofficePage.locator('.queue-stats-navbar > span').filter({ hasText: "Statistiques" }).first() ).toBeVisible();
});

Then("Absence du bouton \"Pilotage file d'attente\"", async function() {
    expect(await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').count() ).not.toBeGreaterThan(0);
});

Then("Le boutton \"Paramètres\" n'est pas visible dans le menu de gauche", async function() {
    expect(await this.backofficePage.locator('i[title="Paramètres"]').count() ).not.toBeGreaterThan(0);
});

