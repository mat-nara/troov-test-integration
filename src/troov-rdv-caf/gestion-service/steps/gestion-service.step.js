const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');



setDefaultTimeout(120 * 1000);

let setupBrowser, setupPage, serviceName, serviceColor;

BeforeAll(async function () {
    setupBrowser = await chromium.launch({ headless: false });
    setupContext = await setupBrowser.newContext();
    setupPage = await setupContext.newPage();
    var setupLoginPage = new LoginPage(setupPage);
    await setupLoginPage.navigate(setupPage);
    await setupLoginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // *** Naviger vers parametres *** //
    await setupPage.locator('i[title="Paramètres"]').click(); 
    await setupPage.locator('h3[title="Gestion des services"]').click(); 

    await setupPage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    setupPage.locator('.link-btn-param > a').click();

    // Generate random data for appointment
    serviceName = 'Service test ' + faker.word.sample();
    await setupPage.locator('#name').fill(serviceName); 
    // setupPage.getByText('Type de service').locator('xpath=following-sibling::*').locator('div[title="Bloquer la modification de ce paramètre pour les équipes enfants"]').click();
    // await setupPage.waitForTimeout(2000);
    setupPage.locator('button[title="Enregistrer"]').click();

});


Given("L'utilisateur est connecté avec un profil Admin Caf ou CDR", async function() {
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

Given("La fiche de paramétrage d’un service est ouverte", async function() {

    // *** Naviger vers "Gestion des services" *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 

    // *** Ouvrir le paramétrage du premier service  *** //
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first().click(); 
});

Given("Un service est créé et sa fiche de paramétrage est ouverte", async function() {
    // *** Naviger vers "Gestion des services" *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 

    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('a[title="Paramétrer la semaine type"]').click();
});

Given("L'utilisateur est connecté en tant que membre d'une equipe", async function() {
    await this.backofficePage.locator('img[alt="Photo de profil"]').click();
    await this.backofficePage.locator('button[title="Changer de compte"]').click(); 
    await this.backofficePage.locator('h3').filter({ hasText: "CNAF Formation" }).locator('../../../../../../..').locator('.p-tree-node-toggle-button').click(); 
    await this.backofficePage.waitForTimeout(5000); 
    await this.backofficePage.locator('h3').filter({ hasText: "455 Caf" }).locator('../../../../../../..').locator('.p-tree-node-toggle-button').click(); 
    await this.backofficePage.locator('h3').filter({ hasText: "455 Caf Site physique" }).click();

});





// ----------------------------------------------------------


When("L'utilisateur navigue vers \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("L'utilisateur clique sur \"Mes calendriers - Gestion des Services\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

When("L'utilisateur clique sur l'icône crayon d’un service existant", async function() {
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').first().click(); 
});

When("L'utilisateur clique sur \"Affichez tout\"", async function() {
    await this.backofficePage.locator('button.expand_button').filter({ hasText: "Afficher tout" }).click(); 
});

When("L'utilisateur change la valeur de \"code couleur du calendrier\"", async function() {
    await this.backofficePage.locator('button#service_color').click(); 

    serviceColor = faker.color.rgb() 
    await setupPage.waitForTimeout(1000); 
    await this.backofficePage.locator('#service-color-modal input').first().fill(serviceColor); 
    await this.backofficePage.locator('#service-color-modal button').filter({ hasText: "Valider" }).click(); 
});

When("L'utilisateur clique sur \"Sauvegarder les changements\"", async function() {
    await this.backofficePage.locator('span').filter({ hasText: "Sauvegarder les changements" }).click();
});

When("L'utilisateur modifie la jauge de temps de réservation", async function() {
    await this.backofficePage.locator('#reservation-gauge').click();
    await setupPage.waitForTimeout(1000);
    await this.backofficePage.locator('input#session_duration').fill('');
    await this.backofficePage.locator('input#session_duration').type('20', { delay: 150, timeout: 10000 });
});

When("L'utilisateur active, désactive ou modifie les zones de la rubrique \"Personnalisation\"", async function() {
    // --- Ouvrir l'accordéon de personnalisation --- //
    await this.backofficePage.locator('button#service-personalize').click();
    await this.backofficePage.waitForTimeout(1000); 

    // --- Personnaliser chaque zone --- //
    await this.backofficePage.locator('span[title="Activer la page d\'information relative à la pré-demande à l\'ANTS dans le parcours usager"]').click(); 
    await this.backofficePage.locator('span').filter({ hasText: "Activer les réservations payantes" }).click();

    const annulationConditionLocator = this.backofficePage.locator('div').filter({ hasText: "Date de fin : les usagers peuvent annuler leur rendez-vous jusqu'à" });
    await annulationConditionLocator.locator('xpath=following-sibling::*').locator('select').selectOption({ index: 1 });
    await annulationConditionLocator.locator('xpath=following-sibling::*').locator('input[type="number"]').first().fill('12');
    
    await this.backofficePage.locator('input#external_link_for_documents').fill('https://www.exemple-documents.test');
    await this.backofficePage.locator('span[title="Cacher le nombre de personnes par réservation dans les emails"]').click(); 

    await this.backofficePage.locator('span[title="Ajouter une note"]').click(); 
    const noteLocator = await this.backofficePage.locator('#troov-editor-container div[contenteditable="true"]');
    await expect(noteLocator).toBeVisible();
    await noteLocator.click();
    await noteLocator.type('Note pour le service de test');

    await this.backofficePage.locator('span').filter({ hasText: "Activer le code couleur indiquant le remplissage des créneaux" }).click();
    await this.backofficePage.locator('span[title="Activer la répétition du formulaire"]').click(); 
    await this.backofficePage.locator('span[title="Activer le mail de non-arrivée"]').click(); 
});

When("L'utilisateur active, désactive ou modifie les zones de la rubrique \"Activation\"", async function() {
    // --- Ouvrir l'accordéon de "Activation" --- //
    await this.backofficePage.locator('button[title="Activation"]').click();
    await this.backofficePage.waitForTimeout(1000); 

    // --- Personnaliser chaque zone --- //
    await this.backofficePage.locator('span[title="Autoriser les réservations par vos usagers"]').click(); 
    await this.backofficePage.locator('span[title="Autoriser les réservations en interne"]').click(); 
    await this.backofficePage.locator('span[title="Empêcher le même utilisateur de réserver plusieurs fois pour ce service"]').click(); 
    await this.backofficePage.locator('span[title="Activer le calendrier en mode indépendant / sans famille"]').click(); 
    await this.backofficePage.locator('span[title="Activer la file d\'attente pour ce service"]').click(); 
});




// ----------------------------------------------------------


Then("La page \"Mes paramètres\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("L'utilisateur a la possibilité d’activer l’option \"Activer la prise de rendez-vous dans votre lieu\"", async function() {
    await expect(this.backofficePage.locator('#checkbox-enable-reservations')).not.toBeDisabled();
});

Then("L'utilisateur ne peut pas désactiver l’option \"Bloquer la création de services enfants\"", async function() {
    await expect(this.backofficePage.locator('#checkbox-disable-office-creation')).toBeDisabled();
});

Then("L'utilisateur ne peut pas créer de nouveaux motifs de RDV", async function() {
    await expect(this.backofficePage.locator('.link-btn-param')).toBeDisabled();
    await expect(this.backofficePage.locator('.link-btn-param')).not.toHaveAttribute('href', /./);
});

Then("L'utilisateur peut modifier et supprimer les services existants", async function() {
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    expect(await this.backofficePage.locator('table > tbody > tr:first-child > td a[title="Paramétrer la semaine type"]').count()).toBeGreaterThan(0);
    expect(await this.backofficePage.locator('table > tbody > tr:first-child > td i[title="Supprimer le service"]').count()).toBeGreaterThan(0);
});

Then("La fiche de paramétrage du service s’affiche", async function() {
    await expect(this.backofficePage.locator('label').filter({ hasText: 'Nom du service' })).toBeVisible();
});

Then("Toutes les zones de paramétrage sont dépliées", async function() {
    await expect(this.backofficePage.locator('#accordion-infos')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-gauge')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-personalize')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-activate')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-settingQueue')).toHaveClass(/show/);
});

Then("La couleur du calendrier est mise à jour", async function() {
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('a[title="Paramétrer la semaine type"]').click();
    
    await this.backofficePage.locator('label').filter({ hasText: 'Nom du service' }).waitFor({ state: 'visible' });
    await expect(this.backofficePage.locator('#service_color b').filter({ hasText: serviceColor })).toBeVisible();
});

Then("Le nom du Service est non modifiable", async function() {
    await expect(this.backofficePage.locator('input#name')).toBeDisabled();
});

Then("Le type de Service est non modifiable", async function() {
    await expect(this.backofficePage.locator('#service_type vue-treeselect').first()).toHaveClass(/vue-treeselect--disabled/);
});

Then("La jauge est mise à jour avec la nouvelle valeur", async function() {
    await setupPage.waitForTimeout(2000); 
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('a[title="Paramétrer la semaine type"]').click();
    
    console.log('session_duration: ', await this.backofficePage.locator('input#session_duration').first().inputValue())  
    await expect(this.backofficePage.locator('input#session_duration')).toHaveValue('20');
});

Then("Les modifications sont prises en compte", async function() {
    // --- Ouvrir le paramétrage du service --- //
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('a[title="Paramétrer la semaine type"]').click();
    
    // --- Ouvrir l'accordéon de personnalisation --- //
    await this.backofficePage.locator('button#service-personalize').click();
    await setupPage.waitForTimeout(1000); 

    // --- Vérifier les options de personnalisation --- //
    await expect(this.backofficePage.locator('input#enable_prerequest')).toBeEnabled();
    await expect(this.backofficePage.locator('span').filter({ hasText: "Activer les réservations payantes" }).locator('../../..').locator('input').first()).toBeEnabled();

    const annulationConditionLocator = this.backofficePage.locator('div').filter({ hasText: "Date de fin : les usagers peuvent annuler leur rendez-vous jusqu'à" });
    await expect(annulationConditionLocator.locator('xpath=following-sibling::*').locator('select')).toHaveValue('hours'); 
    await expect(annulationConditionLocator.locator('xpath=following-sibling::*').locator('input[type="number"]').first()).toHaveValue('12');

    await expect(this.backofficePage.locator('input#external_link_for_documents')).toHaveValue('https://www.exemple-documents.test');
    await expect(this.backofficePage.locator('span[title="Cacher le nombre de personnes par réservation dans les emails"]').locator('../..').locator('input#hide_number_of_people_in_email').first()).toBeEnabled();

    await expect(this.backofficePage.locator('span[title="Ajouter une note"]').locator('../..').locator('input#write_notes').first()).toBeEnabled();

    const noteLocator = await this.backofficePage.locator('#troov-editor-container div[contenteditable="true"]');
    await expect(noteLocator).toBeVisible();
    await expect(noteLocator).toHaveText('Note pour le service de test');

    await expect(this.backofficePage.locator('span').filter({ hasText: "Activer le code couleur indiquant le remplissage des créneaux" }).locator('../..').locator('input#enable_colors_reservation').first()).toBeEnabled();
    await expect(this.backofficePage.locator('span[title="Activer la répétition du formulaire"]').locator('../..').locator('input#enable_repeat_form').first()).toBeEnabled();
    await expect(this.backofficePage.locator('span[title="Activer le mail de non-arrivée"]').locator('../..').locator('input#enableNotHonoredReservationEmail').first()).toBeEnabled();
});

Then("Les modifications de la rubrique \"Activation\" sont prises en compte", async function() {

    // --- Ouvrir le paramétrage du service --- //
    await this.backofficePage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await this.backofficePage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('a[title="Paramétrer la semaine type"]').click();
    
    // --- Ouvrir l'accordéon de "Activation" --- //
    await this.backofficePage.locator('button[title="Activation"]').click();
    await setupPage.waitForTimeout(1000); 

    // --- Vérifier les options de "Activation" --- //
    await expect(this.backofficePage.locator('span[title="Autoriser les réservations par vos usagers"]').locator('../..').locator('input#is_open').first()).toBeChecked();
    await expect(this.backofficePage.locator('span[title="Autoriser les réservations en interne"]').locator('../..').locator('input#is_open_internal').first()).not.toBeChecked();
    await expect(this.backofficePage.locator('span[title="Empêcher le même utilisateur de réserver plusieurs fois pour ce service"]').locator('../..').locator('input#enable_only_one_reservation_per_user').first()).toBeChecked();
    await expect(this.backofficePage.locator('span[title="Activer le calendrier en mode indépendant / sans famille"]').locator('../..').locator('input#isIndependent').first()).toBeChecked();
    await expect(this.backofficePage.locator('span[title="Activer la file d\'attente pour ce service"]').locator('../..').locator('input#is_service_open').first()).toBeChecked();
});


AfterAll(async function () {
    console.log('serviceName: ', serviceName)

    await setupPage.locator('table > tbody > tr a').filter({ hasText: serviceName }).locator('../../..').locator('i[title="Supprimer le service"]').click();
    await setupPage.locator('.modal-dialog footer button').filter({ hasText: 'Supprimer' }).click();
    await setupPage.waitForSelector('#card-title-services-blue', { state: 'visible' });
    await setupPage.waitForTimeout(2000); 
    
    if (setupBrowser) {
        await setupBrowser.close();
        setupBrowser = null; 
    }
});


