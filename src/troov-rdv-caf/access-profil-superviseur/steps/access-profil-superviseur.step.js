const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');



Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate();
    await this.loginPageAlt.login(config.usernameProfileSuperviseur, config.passwordProfileSuperviseur);

    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});

Given("L'utilisateur est sur la page paramètres", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

Given("La fiche de l’utilisateur est ouverte", async function() {
    // *** Recherche du membre *** //
    var fullname = this.firstname + ' ' + this.name
    await this.backofficePage.getByPlaceholder('Tapez pour rechercher').fill(fullname);
    await this.backofficePage.waitForTimeout(1000);

    await this.backofficePage.locator('table tbody tr td').filter({ hasText: fullname }).click();
});

Given("La page \"Gestion des Services\" est ouverte", async function() {

    // *** Naviger vers "Gestion des services" *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
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

When("L'utilisateur clique sur \"Statistiques\" puis \"Pilotage file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});

When("L'utilisateur clique sur \"Paramètres\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("L'utilisateur clique sur le profil puis \"Changer de compte\" dans le menu de droite", async function() {
    await this.backofficePage.locator('img.header-profile-user').click(); 
    await this.backofficePage.locator('button[title="Changer de compte"]').click(); 
});

When("L'utilisateur clique sur \"Ajouter un nouveau compte\"", async function() {
    await this.backofficePage.locator('h5').filter({ hasText: 'Ajouter un nouveau compte' }).click(); 
});

When("L'utilisateur clique sur \"Gestion des équipes\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des équipes"]').click(); 
});

When("L'utilisateur clique sur \"Ajouter un membre\"", async function() {
    await this.backofficePage.locator('i[aria-hidden="Ajouter un membre"]').click(); 
});

When("L'utilisateur remplit les champs du formulaire et enregistre", async function() {
    // *** Générer des données *** //  
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    this.email = this.name.toLowerCase() + '@test.com';
    this.job = "Testeur"

    await this.backofficePage.locator('#email').fill(this.email);
    await this.backofficePage.locator('#firstname').fill(this.firstname);
    await this.backofficePage.locator('#lastname').fill(this.name);
    await this.backofficePage.locator('#job').fill(this.job); 

    await this.backofficePage.waitForTimeout(1000); 
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    await this.backofficePage.waitForTimeout(1000); 
    await this.backofficePage.locator('h2').filter({ hasText: 'Gérer mes équipes' }).waitFor({ state: 'visible' });
});

When("On modifie les informations de l'utilisateur", async function() {
    await this.backofficePage.locator('input#externalId').fill("https://external-link-test.com");
});

When("L'utilisateur clique sur le bouton \"Mettre à jour\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: 'Mettre à jour' }).click(); 
});

When("L'utilisateur clique sur le bouton \"Supprimer\" en bas de la fiche et confirme la suppression via la pop-up", async function() {
    this.backofficePage.once('dialog', async dialog => {
        console.log('Message de la popup :', dialog.message());
        await dialog.accept();
    });
      
    await this.backofficePage.locator('button:has-text("Supprimer")').click();
});

When("L'utilisateur clique sur \"Mes calendriers - Gestion des Services\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});



When("L'utilisateur clique sur l'icone de calendrier avec une étoile", async function() {
    // await this.backofficePage.locator('button.expand_button').filter({ hasText: "Afficher tout" }).click(); 
    await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer une plage exceptionnelle"]').first().click();
});

When("L'utilisateur déplier le bloc \"Paramétres généraux\"", async function() {
    await this.backofficePage.locator('h2').filter({ hasText: "Paramètres généraux ( salle d'attente, membres, divers...)" }).click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur déplier le bloc \"Paramétrage du matériel\"", async function() {
    await this.backofficePage.locator('h2').filter({ hasText: "Paramétrage du matériel" }).click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques RDV\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click();
    await this.backofficePage.locator('i[title="Statistiques RDV"]').click();
});

When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click();
    await this.backofficePage.locator('i[title="Statistiques file d\'attente"]').click();
});

When("L'utilisateur clique sur \"Statistiques\" puis sur \"Pilotage file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click();
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

Then("La page \"Pilotage file d'attente\" est accessible", async function() {
    await expect(this.backofficePage.locator('span.text-uppercase ').filter({ hasText: 'Pilotage' }).first()  ).toBeVisible();
});

Then("La page Paramètres est accessible, avec les quatre modules de paramétrage cliquables", async function() {

    await expect(this.backofficePage.locator('h3[title="Gestion du lieu"]') ).toBeVisible();
    await expect(this.backofficePage.locator('h3[title="Gestion des équipes"]') ).toBeVisible();
    await expect(this.backofficePage.locator('h3[title="Gestion des services"]') ).toBeVisible();
    await expect(this.backofficePage.locator('h3[title="Gestion de la file d\'attente"]') ).toBeVisible();

    await expect(this.backofficePage.locator('h3[title="Gestion du lieu"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('h3[title="Gestion des équipes"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('h3[title="Gestion des services"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('h3[title="Gestion de la file d\'attente"]') ).toBeEnabled();
});

Then("La liste des comptes existants s'affiche avec l'option \"Ajouter un nouveau compte\"", async function() {
    await this.backofficePage.locator('h1[title="Changer de compte"]').waitFor({ state: 'visible' });
    await this.backofficePage.locator('.p-tree li.p-tree-node ').first().waitFor({ state: 'visible' });
    await expect(this.backofficePage.locator('h5').filter({ hasText: 'Ajouter un nouveau compte' }) ).toBeVisible();
});

Then("La page créer un nouveau compte s'affiche et le bouton \"Accepter\" pour valider la création du site est cliquable", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Créer une équipe pro' }) ).toBeVisible();
    await expect(this.backofficePage.locator('button').filter({ hasText: 'Accepter' }) ).toBeVisible();
    await expect(this.backofficePage.locator('button').filter({ hasText: 'Accepter' }) ).toBeEnabled();
});


Then("La page \"Gestion des équipes\" est accessible", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Gérer mes équipes' }) ).toBeVisible();
});

Then("Le nouveau membre est créer et apparaît dans la liste des membres", async function() {
    // *** Recherche du membre *** //
    var fullname = this.firstname + ' ' + this.name
    await this.backofficePage.getByPlaceholder('Tapez pour rechercher').fill(fullname);
    await this.backofficePage.waitForTimeout(1000);

    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: fullname }) ).toBeVisible();
});

Then("Un message de confirmation de la mise a jours s’affiche", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Nous avons pris en compte vos changements')).toBeVisible();
});

Then("Un message de confirmation de la suppression s’affiche", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Membre supprimé')).toBeVisible();
});

Then("La page \"Gestion des Services\" est accessible", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' }) ).toBeVisible();
});


Then("Une icone de calendrier avec une étoile est présent sur chaques guichets", async function() {
    await this.backofficePage.waitForSelector('div.desks-table > table', { state: 'visible' });
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer une plage exceptionnelle"]').count()).toBeGreaterThan(0);
});

Then("La page \"Plage horaire exceptionnelles\" s'affiche", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Ajouter une plage horaire exceptionnelle' })).toBeVisible();
});

Then("La page \"Statistiques RDV\" est accessible", async function() {
    await expect(this.backofficePage.locator('.stat-card > span').filter({ hasText: "Réservations" }).first() ).toBeVisible();
});

Then("La page \"Statistiques file d'attente\" est accessible", async function() {
    await expect(this.backofficePage.locator('.queue-stats-navbar > span').filter({ hasText: "Statistiques" }).first() ).toBeVisible();
});

// Then("La page \"Pilotage file d'attente\" est accessible", async function() {
//     await expect(this.backofficePage.locator('.queue-stats-navbar > span').filter({ hasText: "Pilotage" }).first() ).toBeVisible();
// });

Then("La page Paramètres est accessible, avec les trois modules de paramétrage cliquables et absence du module \"File d'attente\"", async function() {
    await expect(this.backofficePage.locator('h3[title="Gestion du lieu"]') ).toBeVisible();
    await expect(this.backofficePage.locator('h3[title="Gestion des équipes"]') ).toBeVisible();
    await expect(this.backofficePage.locator('h3[title="Gestion des services"]') ).toBeVisible();

    await expect(this.backofficePage.locator('h3[title="Gestion du lieu"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('h3[title="Gestion des équipes"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('h3[title="Gestion des services"]') ).toBeEnabled();

    expect(await this.backofficePage.locator('h3[title="Gestion de la file d\'attente"]').count() ).not.toBeGreaterThan(0);
});

Then("Le boutton \"Ajouter un nouveau compte\" est absent", async function() {
    expect(await this.backofficePage.locator('h5').filter({ hasText: 'Ajouter un nouveau compte' }).count() ).not.toBeGreaterThan(0);
});

Then("Les icones de modification, suppression et création de service sont absente", async function() {

    expect(await this.backofficePage.locator('button.create-services > i.bx-plus').count()).not.toBeGreaterThan(0);

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).not.toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td i[title="Supprimer le service"]').count()).not.toBeGreaterThan(0);
});

Then("Accès au guichet sur un périmètre local, avec les icônes de modification, de suppression absent et uniquement icone \"calendrier à étoile\" visibles et cliquable", async function() {

    expect(await this.backofficePage.locator('.create-desks > i.bx-plus').count()).not.toBeGreaterThan(0);

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).not.toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').count()).not.toBeGreaterThan(0);

    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer une plage exceptionnelle"]').count()).toBeGreaterThan(0);
});

Then("Possibilité d'intervenir sur \"Déplacer les RDV en masse\"", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Déplacer les RDV en masse' }).count() ).toBeVisible();
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Déplacer les RDV en masse' })).toBeEnabled();
});
