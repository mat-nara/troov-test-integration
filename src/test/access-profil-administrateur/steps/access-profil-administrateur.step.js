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

Given("La fiche de paramétrage d’un guichet est ouverte", async function() {

    // *** Naviger vers "Gestion des services" *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 

    // *** Ouvrir le paramétrage du premier guichet  *** //
    await this.backofficePage.waitForSelector('#card-title-counters-blue', { state: 'visible' });
    await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first().click(); 
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

When("L'utilisateur clique sur \"Affichez tout\"", async function() {
    await this.backofficePage.locator('button.expand_button').filter({ hasText: "Afficher tout" }).click(); 
});

When("L'utilisateur clique sur l'icone de calendrier avec une étoile", async function() {
    // await this.backofficePage.locator('button.expand_button').filter({ hasText: "Afficher tout" }).click(); 
    await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer une plage exceptionnelle"]').first().click();
});

When("L'utilisateur clique sur \"File d'attente - Gestion de la file d'attente\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion de la file d\'attente"]').click(); 
    
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

When("L'utilisateur clique sur l'icone modification d'un service", async function() {
    await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first().click();
});

When("L'utilisateur clique sur l'icone supprimer d'un service", async function() {
    this.serviceName = this.backofficePage.locator('div.services-table > table > tbody > tr:last-child > td:first-child').textContent();
    await this.backofficePage.locator('div.services-table > table > tbody > tr:last-child > td i[title="Retirer le service"]').click();
});

When("L'utilisateur clique sur \"Associer Magasins - Services\" pour récupérer le Service supprimé localement", async function() {
    await this.backofficePage.locator('span').filter({ hasText: "Associer Magasins/Services" }).click();
});

When("L'utilisateur sélectionne le service concerné et clique sur \"Associer\"", async function() {

    await this.backofficePage.locator('div').filter({ hasText: "Choisir un service" }).click();
    await this.backofficePage.getByText(this.serviceName).click();
    await this.backofficePage.locator('h5').filter({ hasText: "Associer Magasins/Services" }).click();
    await this.backofficePage.locator('button').filter({ hasText: "Associer" }).click();
});

When("L'utilisateur clique sur modifier un guichet", async function() {
    // await this.backofficePage.locator('span').filter({ hasText: "Associer Magasins/Services" }).click();
    await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first().click();
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

Then("Les icones de modification, suppression et création de service sont visible et cliquables", async function() {
    
    await expect(this.backofficePage.locator('button.create-services > i.bx-plus')).toBeVisible();
    await expect(this.backofficePage.locator('button.create-services > i.bx-plus')).toBeEnabled();

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    // await this.backofficePage.waitForSelector('div.services-table > table  > tbody > tr:first-child', { state: 'visible' });
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td i[title="Supprimer le service"]').count()).toBeGreaterThan(0);
    
    await expect(this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first()).toBeEnabled();
    await expect(this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td i[title="Supprimer le service"]').first()).toBeEnabled();
});

Then("Accès au guichet sur un périmètre national, avec les icônes de modification, de suppression et de création de guichet visibles et cliquables", async function() {

    await expect(this.backofficePage.locator('.create-desks > i.bx-plus')).toBeVisible();
    await expect(this.backofficePage.locator('.create-desks > i.bx-plus')).toBeEnabled();

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    // await this.backofficePage.waitForSelector('div.desks-table > table > tbody > tr:first-child', { state: 'visible' });
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').count()).toBeGreaterThan(0);
    
    await expect(this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first()).toBeEnabled();
    await expect(this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').first()).toBeEnabled();
});

Then("Toutes les zones de paramétrage du guichet sont dépliées", async function() {
    await expect(this.backofficePage.locator('#accordion-infos')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-openning')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-planning')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-members')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-activate')).toHaveClass(/show/);
});

Then("Toutes les zones de paramétrage de chaque section sont modifiable", async function() {

    // --- Informations pratiques --- //
    await expect(this.backofficePage.locator('#accordion-infos #name').first()).toBeEnabled();
    await expect(this.backofficePage.locator('#accordion-infos #name').nth(1)).toBeEnabled();
    
    // --- ouverture du calendrier --- //
    await expect(this.backofficePage.locator('#accordion-openning').getByPlaceholder('Cliquez ici pour choisir la date').first()).toBeEnabled();
    await expect(this.backofficePage.locator('#accordion-openning').getByPlaceholder('Cliquez ici pour choisir la date').nth(1)).toBeEnabled();

    await expect(this.backofficePage.locator('#dynamic-calendar-checkbox')).toBeEnabled();
    await expect(this.backofficePage.locator('#dynamic-calendar-date-openning')).toBeEnabled();
    await expect(this.backofficePage.locator('#dynamic-calendar-date-closing')).toBeEnabled();

    await expect(this.backofficePage.locator('div').filter({ hasText: "Heure d'ouverture du calendrier dynamique (en heure locale) :" }).locator('..').locator('select').first()  ).toBeEnabled();
    await expect(this.backofficePage.locator('div').filter({ hasText: "Heure de fermeture du calendrier dynamique (en heure locale) :" }).locator('..').locator('select').nth(1)  ).toBeEnabled();    
    
    await expect(this.backofficePage.locator('button').filter({ hasText: "Ajouter un jour de fermeture" })).toBeEnabled();
    await expect(this.backofficePage.locator('button').filter({ hasText: "Ajouter une plage de fermeture" })).toBeEnabled();
    await expect(this.backofficePage.locator('button').filter({ hasText: "Supprimer tous les jours fériés" })).toBeEnabled();

    // --- Planning de la semaine --- //
    await expect(this.backofficePage.locator('span').filter({ hasText: "Jour de la semaine:" }).locator('xpath=following-sibling::*').first() ).toBeEnabled();
    await expect(this.backofficePage.locator('span').filter({ hasText: "Plage d'ouverture" }).locator('xpath=following-sibling::*').locator('button > i.bx-trash').first() ).toBeEnabled();
    
    await expect(this.backofficePage.locator('button[title="Ajouter une plage d\'ouverture"]')).toBeEnabled();
    await expect(this.backofficePage.locator('button[title="Supprimer toutes les plages d\'ouverture"]')).toBeEnabled();
    
    // --- Membres --- //
    await expect(this.backofficePage.locator('#accordion-members #select-members .vue-treeselect__control')).toBeEnabled();
    await expect(this.backofficePage.locator('#accordion-members').filter({ hasText: "Ajouter un membre" })).toBeEnabled();
    
    // --- Activation --- //
    await expect(this.backofficePage.locator('span').filter({ hasText: "Autoriser les réservations par vos usagers" }) ).toBeEnabled();
    await expect(this.backofficePage.locator('span').filter({ hasText: "Autoriser les réservations en interne" }) ).toBeEnabled();
    
    // Sauvegarder les changements
    await expect(this.backofficePage.locator('button > span').filter({ hasText: "Sauvegarder les changements" }) ).toBeEnabled();
});

Then("Une icone de calendrier avec une étoile est présent sur chaques guichets", async function() {
    await this.backofficePage.waitForSelector('div.desks-table > table', { state: 'visible' });
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer une plage exceptionnelle"]').count()).toBeGreaterThan(0);
});

Then("La page \"Plage horaire exceptionnelles\" s'affiche", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: 'Ajouter une plage horaire exceptionnelle' })).toBeVisible();
});

Then("La page \"Gestion de la file d'attente\" est accessible", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: "Paramètres généraux ( salle d'attente, membres, divers...)" }) ).toBeVisible();
});

Then("La section \"Paramétres généraux\" s'affiche et chaques zone est modifiable", async function() {

    await expect(this.backofficePage.locator('h3').filter({ hasText: "Salles d'attentes" }) ).toBeVisible();

    //
    await expect(this.backofficePage.locator('button[title="Ajouter une salle d\'attente"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('button[title="Ajouter un membre"]') ).toBeEnabled();
    await expect(this.backofficePage.locator('div.weekday-closing-hours .day-row select').first() ).toBeEnabled();

    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation d'une alerte sonore et visuelle quand un nouvel usager arrive en file d'attente sur un de mes services" }).first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Phrase à afficher pour le public prioritaire" }).first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation du mode selection de guichet" }).first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la lecture du numéro de ticket" }).first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la mise en pause d'un rendez-vous" }).first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la visibilité du temps d'attente sur l'écran d'appel" }).first() ).toBeEnabled();    
});

Then("La section \"Paramétres du matériel\" s'affiche et chaques zone est modifiable", async function() {
    // await this.backofficePage.waitForTimeout(5000);
    await expect(this.backofficePage.locator('h2').filter({ hasText: "Ecran d'appel" }) ).toBeVisible();

    await expect(this.backofficePage.locator('label').filter({ hasText: "Adresse IP" }).locator('xpath=following-sibling::*').locator('input').first() ).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "PORT" }).locator('xpath=following-sibling::*').locator('input').first() ).toBeEnabled();
});

Then("Il est possible de sauvegarder les changements au niveau national", async function() {
    await expect(this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).first() ).toBeEnabled();
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

Then("Absence du bouton \"+ Magasins - Services\"", async function() {
    expect(await this.backofficePage.locator('button.create-services > i.bx-plus').count()).not.toBeGreaterThan(0);
});

Then("Les icones de modification, suppression sont visible et cliquables", async function() {   

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    // await this.backofficePage.waitForSelector('div.services-table > table  > tbody > tr:first-child', { state: 'visible' });
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td i[title="Supprimer le service"]').count()).toBeGreaterThan(0);
    
    await expect(this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first()).toBeEnabled();
    await expect(this.backofficePage.locator('div.services-table > table > tbody > tr:first-child > td i[title="Supprimer le service"]').first()).toBeEnabled();
});

Then("Les informations sur le service sont modifiables a part son nom", async function() {
   
   await expect(this.backofficePage.locator('input#name')).toBeDisabled();

   await expect(this.backofficePage.locator('button#service_color')).toBeVisible();
   await expect(this.backofficePage.locator('button#service_color')).toBeEnabled();
});

Then("Le bouton \"Sauvegarder les changements\" est cliquable", async function() {
    await expect(this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).first() ).toBeEnabled();
});

Then("Le service concerné est supprimé localement", async function() {
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr > td').filter({ hasText: this.serviceName }).count()).not.toBeGreaterThan(0);
});

Then("Le service est de nouveau disponible dans la liste des services", async function() {
    expect(await this.backofficePage.locator('div.services-table > table > tbody > tr > td').filter({ hasText: this.serviceName }).count()).toBeGreaterThan(0);
});

Then("Accès au guichet sur un périmètre local, avec les icônes de modification, de suppression et de création de guichet visibles et cliquables", async function() {

    await expect(this.backofficePage.locator('.create-desks > i.bx-plus')).toBeVisible();
    await expect(this.backofficePage.locator('.create-desks > i.bx-plus')).toBeEnabled();

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    // await this.backofficePage.waitForSelector('div.desks-table > table > tbody > tr:first-child', { state: 'visible' });
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').count()).toBeGreaterThan(0);
    
    await expect(this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first()).toBeEnabled();
    await expect(this.backofficePage.locator('div.desks-table > table > tbody > tr:first-child > td i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').first()).toBeEnabled();

});

Then("Ouverture du paramétrage des guichet au niveau local uniquement", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: "Guichet" }).first() ).toBeVisible();
});
