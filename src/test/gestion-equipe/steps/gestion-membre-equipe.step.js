const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');



setDefaultTimeout(120 * 1000);



async function setupMember() {

    console.log('==> HOOK BEFORE START');

    const setupBrowser = await chromium.launch({ headless: false });
    const setupContext = await setupBrowser.newContext();
    var setupPage = await setupContext.newPage();
    var setupLoginPage = new LoginPage(setupPage);
    await setupLoginPage.navigate(setupPage);
    await setupLoginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // *** Naviger vers parametres *** //
    await setupPage.locator('i[title="Paramètres"]').click(); 
    await setupPage.locator('#common-members').click(); 

    // *** Créer un membre *** //
    setupPage.locator('i[aria-hidden="Ajouter un membre"]').click(); 

    // Generate random data for appointment
    name = faker.person.lastName();
    firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    email = name.toLowerCase() + "-" + firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    //email = name.toLowerCase() + '@test.com';
    job = "Testeur"

    await setupPage.locator('#email').fill(email); 
    await setupPage.locator('#firstname').fill(firstname); 
    await setupPage.locator('#lastname').fill(name); 
    await setupPage.locator('#job').fill(job); 

    await setupPage.waitForTimeout(2000);

    await setupPage.locator('button[title="Enregistrer"]').click();
    console.log('wait for the member to be created')
    await setupPage.waitForTimeout(5000); // wait for the member to be created

    console.log('==> HOOK BEFORE END');
    return { setupBrowser, setupContext, setupPage, name, firstname, email, job };
};

async function cleanupMember(browser, page, name, firstname, email) {
    console.log('==> HOOK AFTER START');

    // *** Naviger vers parametres *** //
    await page.locator('i[title="Paramètres"]').click(); 
    await page.locator('#common-members').click(); 

    // *** Recherche du membre *** //
    var fullname = firstname + ' ' + name
    await page.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(email);
    await page.waitForTimeout(2000); 
    await page.locator('button[title="Rechercher"]').click();
    await page.waitForTimeout(1000); 
    await page.locator('table tbody tr td').filter({ hasText: fullname }).click();

    // *** Suppression *** //
    await page.locator('button').filter({ hasText: 'Supprimer' }).click();

    browser.close();
    console.log('==> HOOK AFTER END');
}




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

Given("L'utilisateur est sur la page \"Gérer mes équipes\"", async function() {

    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 
});

Given("Plusieurs équipes sont séléctionné", async function() {
    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Sélectionner 3 equipes *** //
    await this.backofficePage.locator('span:has-text("Choisissez une ou plusieurs équipes")').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const equipesLocator = this.backofficePage.locator('h3').filter({ hasText: 'Voir tous les membres de votre équipe' }).locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li');
    const count = await equipesLocator.count();
    this.equipes = [];
    const limit = count > 3 ? 3 : count;
    for (let i = 0; i < limit; i++) {
        const item = equipesLocator.nth(i+1);
        await item.click();
        const text = (await item.textContent())?.trim();
        this.equipes.push(text)
    }
    // console.log('this.equipes: ', this.equipes)
});


Given("Un utilisateur est affiché dans les résultats", async function() {
    const { setupBrowser, setupContext, setupPage, name, firstname, email, job } = await setupMember();
    this.setupBrowser = setupBrowser;
    this.setupContext = setupContext;
    this.setupPage = setupPage;
    this.name = name;
    this.firstname = firstname;
    this.fullname = this.firstname + ' ' + this.name;
    this.email = email;
    console.log('fullname: ', this.fullname)

    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Rechercher la membre *** //
    //console.log('Waiting for 5 seconds before searching for the member...');
    //await this.backofficePage.waitForTimeout(5000); 

    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000); 
    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname })).toBeVisible(); 
});

Given("La fiche de l’utilisateur est ouverte", async function() {
    const { setupBrowser, setupContext, setupPage, name, firstname, email, job } = await setupMember();
    this.setupBrowser = setupBrowser;
    this.setupContext = setupContext;
    this.setupPage = setupPage;
    this.name = name;
    this.firstname = firstname;
    this.fullname = this.firstname + ' ' + this.name;
    this.email = email;
    console.log('fullname: ', this.fullname)

    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Rechercher la membre *** //
    //console.log('Waiting for 5 seconds before searching for the member...');
    //await this.backofficePage.waitForTimeout(5000); 

    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000);
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(2000); 
    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname })).toBeVisible(); 

    // ***  L'utilisateur clique sur le nom dans le tableau des résultats  *** //
    this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname }).click();

    // ***  La fiche de l’utilisateur est ouverte  *** //
    await expect(this.backofficePage.locator('.card .card-body .card-title').filter({ hasText: 'Membres' })).toBeVisible(); 
});

Given("Tous les services sont attribués a un membre", async function() {

    // *** Ouvrir la fiche d'un membre *** //
    const { setupBrowser, setupContext, setupPage, name, firstname, email, job } = await setupMember();
    this.setupBrowser = setupBrowser;
    this.setupContext = setupContext;
    this.setupPage = setupPage;
    this.name = name;
    this.firstname = firstname;
    this.fullname = this.firstname + ' ' + this.name;
    this.email = email;
    console.log('fullname: ', this.fullname)

    // --- Naviger vers parametres 
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // --- Rechercher la membre 
    // console.log('Waiting for 5 seconds before searching for the member...');
    // await this.backofficePage.waitForTimeout(5000); 

    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000); 
    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname })).toBeVisible(); 

    // ---  L'utilisateur clique sur le nom dans le tableau des résultats
    this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname }).click();

    // ---  La fiche de l’utilisateur est ouverte
    await expect(this.backofficePage.locator('.card .card-body .card-title').filter({ hasText: 'Membres' })).toBeVisible(); 


    // *** Sélectionner tous les equipes *** //
    await this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect').click(); 
    await this.backofficePage.waitForTimeout(1000);

    const servicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect div.multiselect__content-wrapper > ul.multiselect__content > li.multiselect__element');
    await servicesLocator.nth(0).click();
});


Given("La fiche de l’utilisateur a été modifié", async function() {
    // *** Ajoute 1 services *** //
    await this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const servicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect div.multiselect__content-wrapper > ul.multiselect__content > li.multiselect__element');
    await servicesLocator.nth(2).click();
});


Given("L'utilisateur sélectionne une équipe", async function() {
    // *** Sélectionner 1 equipes *** //
    await this.backofficePage.locator('span:has-text("Choisissez une ou plusieurs équipes")').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const equipesLocator = this.backofficePage.locator('h3').filter({ hasText: 'Voir tous les membres de votre équipe' }).locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li');
    await equipesLocator.nth(2).click();
    await this.backofficePage.mouse.click(10, 10);
});

Given("Une nouvelle fiche membre vide est ouverte", async function() {

    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Sélectionner 1 equipes *** //
    await this.backofficePage.locator('span:has-text("Choisissez une ou plusieurs équipes")').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const equipesLocator = this.backofficePage.locator('h3').filter({ hasText: 'Voir tous les membres de votre équipe' }).locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li');
    await equipesLocator.nth(2).click();
    await this.backofficePage.mouse.click(10, 10);

    // *** Ouvre la fiche *** //
    await this.backofficePage.locator('i[aria-hidden="Ajouter un membre"]').click(); 
});

Given("L'utilisateur remplit les champs du formulaire", async function() {

    // Générer des données
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';
    this.job = "Testeur"

    await this.backofficePage.locator('#email').fill(this.email);
    await this.backofficePage.locator('#firstname').fill(this.firstname);
    await this.backofficePage.locator('#lastname').fill(this.name);
    await this.backofficePage.locator('#job').fill(this.job);

    await this.backofficePage.waitForTimeout(2000); // wait for 1 second before clicking the save button
});

Given("Un nouveau membre vient d’être créé et sa fiche est ouvert", async function() {
    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Sélectionner 1 equipes *** //
    await this.backofficePage.locator('span:has-text("Choisissez une ou plusieurs équipes")').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const equipesLocator = this.backofficePage.locator('h3').filter({ hasText: 'Voir tous les membres de votre équipe' }).locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li');
    await equipesLocator.nth(2).click();
    await this.backofficePage.mouse.click(10, 10);

    // *** Ouvre la fiche *** //
    await this.backofficePage.locator('i[aria-hidden="Ajouter un membre"]').click(); 

    // *** Générer des données *** //  
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';
    this.job = "Testeur"

    await this.backofficePage.locator('#email').fill(this.email);
    await this.backofficePage.locator('#firstname').fill(this.firstname);
    await this.backofficePage.locator('#lastname').fill(this.name);
    await this.backofficePage.locator('#job').fill(this.job); 

    await this.backofficePage.locator('button[title="Enregistrer"]').click();

    // *** Recherche du membre *** //
    // console.log('Waiting for 5 seconds before searching for the member...');
    // await this.backofficePage.waitForTimeout(5000); 
     
    var fullname = this.firstname + ' ' + this.name
    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000);

    // *** Nettoyage de la base *** //
    await this.backofficePage.locator('table tbody tr td').filter({ hasText: fullname }).click();
});






// ----------------------------------------------------------


When("L'utilisateur clique sur \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("Il clique sur \"Mon Équipe - Gestion des équipes\"", async function() {
    await this.backofficePage.locator('#common-members').click(); 
});

When("Il sélectionne plusieurs équipes via la zone \"Choisissez une ou plusieurs équipes\"", async function() {
    await this.backofficePage.locator('span:has-text("Choisissez une ou plusieurs équipes")').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const equipesLocator = this.backofficePage.locator('h3').filter({ hasText: 'Voir tous les membres de votre équipe' }).locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li');
    const count = await equipesLocator.count();
    this.equipes = [];
    const limit = count > 3 ? 3 : count;
    for (let i = 0; i < limit; i++) {
        const item = equipesLocator.nth(i+1);
        await item.click();
        const text = (await item.textContent())?.trim();
        this.equipes.push(text)
    }
    // console.log('this.equipes: ', this.equipes)
});

When("L'utilisateur clique sur la croix d'une équipe affichée", async function() {
    const equipeCloseLocator = this.backofficePage.locator('h3[title="Voir tous les membres de votre équipe"]').locator('xpath=following-sibling::*').getByText(this.equipes[0], { exact: true }).locator('..').locator('i:last-child').first();
    await equipeCloseLocator.click();
});

When("L'utilisateur saisit le nom ou prénom dans la barre de recherche", async function() {
    const { setupBrowser, setupContext, setupPage, name, firstname, email, job } = await setupMember();
    this.setupBrowser = setupBrowser;
    this.setupContext = setupContext;
    this.setupPage = setupPage;
    this.name = name;
    this.firstname = firstname;
    this.fullname = this.firstname + ' ' + this.name;
    this.email = email;
    console.log('fullname: ', this.fullname)

    // *** Naviger vers parametres *** //
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-members').click(); 

    // *** Rechercher la membre *** //
    // console.log('Waiting for 5 seconds before searching for the member...');
    // await this.backofficePage.waitForTimeout(5000); 

    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.name);
    console.log('attente 2 second ... ');
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000); 
});

When("L'utilisateur saisit le nom complet du membre", async function() {
    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.fullname);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000); 
});

When("L'utilisateur saisit l'email du membre", async function() {
    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000); 
});

When("L'utilisateur clique sur le nom dans le tableau des résultats", async function() {
    this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname }).click();
});

When("L'utilisateur clique dans la zone \"Rôle\" et sélectionne un nouveau rôle", async function() {
    const selectorRole = this.backofficePage.locator('label').filter({ hasText: 'Rôle*' }).locator('xpath=following-sibling::*');
    const optionIndex = 1;
    this.expectedRoleText = await selectorRole.locator('option').nth(optionIndex).textContent();
    await selectorRole.selectOption({ index: optionIndex });  
});

When("L'utilisateur clique dans la zone \"Services\" et sélectionne Tous les services", async function() {

    // *** Sélectionner tous les equipes *** //
    await this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect').click(); 
    await this.backofficePage.waitForTimeout(1000);

    const servicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect div.multiselect__content-wrapper > ul.multiselect__content > li.multiselect__element');
    this.servicesCount = await servicesLocator.count();
    await servicesLocator.nth(0).click();
});

When("L'utilisateur clique dans la zone services puis sur \"Déselectionner tout\"", async function() {
    await this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect').click(); 
    await this.backofficePage.waitForTimeout(1000);

    const serviceDeselectionnerTousLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect div.multiselect__content-wrapper > ul.multiselect__content > li.multiselect__element > span.multiselect__option').first();
    await serviceDeselectionnerTousLocator.click();
});

When("L'utilisateur sélectionne des services un à un", async function() {

    // *** Sélectionner 3 services un a un *** //
    await this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect').click(); 
    await this.backofficePage.waitForTimeout(1000);
    const servicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect div.multiselect__content-wrapper > ul.multiselect__content > li.multiselect__element');
    const count = await servicesLocator.count();
    this.services = [];
    const limit = count > 4 ? 4 : count;
    for (let i = 0; i < limit; i++) {
        const item = servicesLocator.nth(2);
        const text = (await item.textContent())?.trim();
        this.services.push(text)
        await item.click();
    }
    console.log('this.services: ', this.services)
});

When("L'utilisateur coche ou décoche les autres paramètres", async function() {
    const receiveReservationAlert = await this.backofficePage.locator('label[for="receiveReservationAlert"]');
    const checkboxMail = await this.backofficePage.locator('label[for="checkboxMail"]');
    const checkboxRedirectEmail = await this.backofficePage.locator('label[for="checkbox_redirect_email"]');
    const enableQueue = await this.backofficePage.locator('label[for="enable-queue"]');
    const enableReservation = await this.backofficePage.locator('label[for="enable-reservation"]');
    //console.log('On va cliquer sur les checkbox')
    await this.backofficePage.waitForTimeout(2000); 
    await receiveReservationAlert.click();
    await this.backofficePage.waitForTimeout(1000); 
    // await checkboxMail.click();
    await checkboxRedirectEmail.click();
    await this.backofficePage.waitForTimeout(1000); 
    await enableQueue.click();
    await this.backofficePage.waitForTimeout(1000); 
    await enableReservation.click();
    // console.log('les click sont fait')
    await this.backofficePage.waitForTimeout(2000); 
    
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
     await this.backofficePage.locator('#delete-member-modal footer button').filter({ hasText: 'Ok' }).click();
     
});

When("Il clique sur \"Ajouter un membre\"", async function() {
    await this.backofficePage.locator('i[aria-hidden="Ajouter un membre"]').click(); 
});

When("L'utilisateur clique sur le bouton \"Enregistrer\"", async function() {
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
});





// ----------------------------------------------------------


Then("La page \"Gérer mes équipes\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Gérer mes équipes' })).toBeVisible();
});

Then("Les différentes équipes sélectionnées s'affichent", async function() {
    for (let i = 0; i < this.equipes.length; i++) {
        const equipeLocator = this.backofficePage.locator('h3[title="Voir tous les membres de votre équipe"]').locator('xpath=following-sibling::*').getByText(this.equipes[i], { exact: true }).first();
        await expect(equipeLocator).toBeVisible();
    }    
});

Then("L’équipe est retirée de l’affichage", async function() {
    await this.backofficePage.mouse.click(10, 10);
    const equipeLocator = this.backofficePage.locator('h3[title="Voir tous les membres de votre équipe"]').locator('xpath=following-sibling::*').getByText(this.equipes[0], { exact: true }).first();
    await expect(equipeLocator).not.toBeVisible();
});

Then("Le membre correspondant s'affiche dans la liste", async function() {
    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: this.fullname })).toBeVisible(); 
    //await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname);
});

Then("La fiche de l’utilisateur s’ouvre", async function() {
    try {
        await expect(this.backofficePage.locator('.card .card-body .card-title').filter({ hasText: 'Membres' })).toBeVisible(); 
        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Le rôle de l’utilisateur est mis à jour visuellement", async function() {
    try {
        const selectorRole = this.backofficePage.locator('label').filter({ hasText: 'Rôle*' }).locator('xpath=following-sibling::*');
        const selectedRoleText = await selectorRole.locator('option:checked').textContent();
        console.log('selectedRoleText: ', selectedRoleText)
        console.log('this.expectedRoleText: ', this.expectedRoleText)
        expect(selectedRoleText?.trim()).toBe(this.expectedRoleText?.trim());
    
        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Tous les services sont attribués à l’utilisateur", async function() {
    try {
        const selectedServicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect__tags .multiselect__tag');
        const selectedServicesCount = await selectedServicesLocator.count();
        console.log('selectedServicesCount: ', selectedServicesCount);
        console.log('this.servicesCount - 1: ', this.servicesCount - 1);
        await expect(selectedServicesCount).toBe(this.servicesCount - 1);
    
        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Aucun service n’est sélectionné pour ce membre", async function() {
    try {
        const selectedServicesLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect__tags .multiselect__tag');
        const selectedServicesCount = await selectedServicesLocator.count();
        await expect(selectedServicesCount).toBe(0);

        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Les services sélectionnés s’ajoutent pour ce membre", async function() {
    try {
        for (let i = 0; i < this.services.length; i++) {
            const serviceLocator = this.backofficePage.locator('label').filter({ hasText: 'Services' }).locator('xpath=following-sibling::*').locator('.multiselect__tags .multiselect__tag ').getByText(this.services[i] ).first();
            await expect(serviceLocator).toBeVisible();
        }
        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("L'état de l'option est mis à jour", async function() {
    try {
        await expect(this.backofficePage.locator('#receiveReservationAlert')).toBeChecked();
        // await expect(this.backofficePage.locator('#checkboxMail')).not.toBeChecked();
        // await expect(this.backofficePage.locator('#checkbox_redirect_email')).toBeChecked();
        await expect(this.backofficePage.locator('#enable-queue')).not.toBeChecked();
        await expect(this.backofficePage.locator('#enable-reservation')).not.toBeChecked();

        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Un message de confirmation de la mise a jours s’affiche", async function() {
    try {
        await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Nous avons pris en compte vos changements')).toBeVisible();
        await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Un message de confirmation de la suppression s’affiche", async function() {
    try {
        await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Membre supprimé')).toBeVisible();
        // await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname);
        this.setupBrowser.close();
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Une fiche vide s’affiche pour l’utilisateur", async function() {
    await expect(this.backofficePage.locator('h4').filter({ hasText: 'Qui souhaitez-vous ajouter à votre équipe ?' })).toBeVisible();
});

Then("Le nouveau membre est créer et apparaît dans la liste des membres", async function() {

    // Apres création du nouveau membre, l'utilisateur est automatiquement rediriger vers "Gerer Equipes"
    // *** Recherche du membre *** //
    // console.log('Waiting for 5 seconds before searching for the member...');
    // await this.backofficePage.waitForTimeout(5000); 

    var fullname = this.firstname + ' ' + this.name
    await this.backofficePage.getByPlaceholder('Taper pour chercher le nom de l’agent : Prénom + Nom').fill(this.email);
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.locator('button[title="Rechercher"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('table tbody tr td').filter({ hasText: fullname })).toBeVisible();

    // *** Nettoyage de la base *** //
    await this.backofficePage.locator('table tbody tr td').filter({ hasText: fullname }).click();
    await this.backofficePage.locator('button').filter({ hasText: 'Supprimer' }).click();
});

Then("Un message de confirmation de la suppression du nouveau membre s’affiche", async function() {
    try {
        await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Membre supprimé')).toBeVisible();
    } catch (error) {
        this.setupBrowser.close();
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});

Then("Les données de test sont supprimées", async function() {
    await cleanupMember(this.setupBrowser, this.setupPage, this.name, this.firstname, this.email);
});
