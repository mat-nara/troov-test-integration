const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(60 * 1000);

Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
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





When("Il clique sur le menu \"RDV Multi-lieux\"", async function() {
    await this.backofficePage.locator('img[title="RDV multi-lieux"]').click();
});

When("Il sélectionne \"CNAF Formation\" puis \"455 Caf\" puis \"455 caf site\" pour le lieux", async function() {
    await this.backofficePage.locator('.p-treeselect').nth(0).locator('.p-treeselect-label').click();

    const liFormationLocator = this.backofficePage.locator('.p-treeselect-tree-container .p-tree-root ul li[aria-label="CNAF Formation"]');
    if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    const li455CafLocator = this.backofficePage.locator('.p-treeselect-tree-container .p-tree-root ul li[aria-label="455 Caf"]');
    if (await li455CafLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="455 Caf"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    await this.backofficePage.locator('li[aria-label="455 CAF Site Téléphonique"]').click();
    await this.backofficePage.locator('li[aria-label="455 Caf site visioconférence"]').click();
    await this.backofficePage.locator('li[aria-label="455 Caf Site physique"]').click();
});

When("Il sélectionne le motif {string} puis le sous motif {string}", async function(motif, sousMotif) {

    await this.backofficePage.locator('.p-treeselect').nth(1).locator('.p-treeselect-label').click();

    const liEnfantLocator = this.backofficePage.locator(`.p-treeselect-tree-container .p-tree-root ul li[aria-label="${motif}"]`);
    if (await liEnfantLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator(`li[aria-label="${motif}"] > div.p-tree-node-content > button.p-tree-node-toggle-button`).click();
    }

    await this.backofficePage.locator(`li[aria-label="${sousMotif}"]`).click();
});

When("Il sélectionne le mode {string}", async function(mode) {
    await this.backofficePage.locator('.p-multiselect').nth(0).locator('.p-multiselect-label').click();
    
    switch (mode) {
        case "Sélectionner tout":
            await this.backofficePage.locator(`li[aria-label="Rendez-vous téléphonique"]`).click();
            await this.backofficePage.locator(`li[aria-label="Rendez-vous en visioconférence"]`).click();
            await this.backofficePage.locator(`li[aria-label="Rendez-vous sur site"]`).click();
            break
        default:
            await this.backofficePage.locator(`li[aria-label="${mode}"]`).click();
    }
});

When("Il clique sur \"Rechercher\"", async function() {
    await this.backofficePage.locator('button[aria-label="Rechercher"]').click();
});


When("Il sélectionne \"CNAF Formation\" puis \"455 Caf\" puis \"Profil Interface nationale\" pour le lieux", async function() {
    await this.backofficePage.locator('.p-treeselect').nth(0).locator('.p-treeselect-label').click();

    const liFormationLocator = this.backofficePage.locator('.p-treeselect-tree-container .p-tree-root ul li[aria-label="CNAF Formation"]');
    if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    const li455CafLocator = this.backofficePage.locator('.p-treeselect-tree-container .p-tree-root ul li[aria-label="455 Caf"]');
    if (await li455CafLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="455 Caf"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    await this.backofficePage.locator('li[aria-label="Profil Interface nationale"]').click();
});

When("Il sélectionne un créneau", async function() {
    await this.backofficePage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span').nth(0).click();
    await this.backofficePage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel').nth(0).locator('button[aria-label="Sélectionner"]').click();
});

When("Il clique sur \"Créer un utilisateur\", puis complète les informations, puis confirme", async function() {

    // Create new user
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    //this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    this.NIR = generateRandomNIR();
    this.phone = generateRandomPhone();

    await this.backofficePage.getByPlaceholder('Ajouter un Nom').fill(this.name);
    await this.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(this.firstname);
    await this.backofficePage.getByPlaceholder('Ajouter un Email').fill(this.email);
    await this.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(this.NIR);
    await this.backofficePage.getByPlaceholder('Numéro de téléphone').fill(this.phone);
    
    await this.backofficePage.locator('button[title="Confirmer"]').click()
});

When("Il choisi le mode de prise de rendez-vous", async function() {
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
});

When("Il clique sur \"Bloquer ce créneau\" puis \"Ajouter\"", async function() {
    
    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await this.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = this.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();
});

When("Il clique sur \"OK\" sur la confirmation", async function() {
    await this.backofficePage.locator('footer > button').filter({ hasText: 'OK' }).nth(0).click();
});

When("Il change de compte \"455 Caf site visioconférence\"", async function() {
    
    // change account to 455 caf physique
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Changer de compte"]').click();
    await this.backofficePage.waitForTimeout(3000); 
    
    const liFormationLocator = this.backofficePage.locator('li[aria-label="CNAF Formation"]');
    if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    const li455CafLocator = this.backofficePage.locator('li[aria-label="455 Caf"]');
    if (await li455CafLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="455 Caf"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    const liPhysiqueLocator = this.backofficePage.locator('li[aria-label="455 Caf Site physique"]');
    if (await liPhysiqueLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="455 Caf Site physique"] > div.p-tree-node-content > span.p-tree-node-label').click();
    }

    currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});


 







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




Then("La page \"RDV Multi-lieux\" s'affichée", async function() {
    await expect(this.backofficePage.locator('troov-ce-multi-site')).toBeVisible();
}); 

Then("Seuls les créneaux correspondant au lieu \"455 caf\" et qui est \"sur site physique\" doivent s'afficher", async function() {

    // Attendre le chargement
    await this.backofficePage.locator('.p-progressspinner').first().waitFor({ state: 'visible' });
    await this.backofficePage.locator('.p-progressspinner').first().waitFor({ state: 'detached' });
    await this.backofficePage.waitForTimeout(2000);

    const baseLocator = this.backofficePage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span');
    
    // Filtrer les éléments 
    const visioLocator = baseLocator.filter({ hasText: "En visioconférence" }); 
    const physiqueLocator = baseLocator.filter({ hasText: "455 Caf Site physique" }); 
    
    // Vérifier le nombre d'occurrences
    const visioCount = await visioLocator.count();
    const physiqueCount = await physiqueLocator.count();

    expect(visioCount).toBe(0);
    expect(physiqueCount).toBeGreaterThan(0);
}); 

Then("Aucun créneaux n'est afficher et un message \"Aucun créneau n’est disponible pour le mode de rendez-vous sélectionné, veuillez modifier vos critères\" s'affiche", async function() {
    
    // Attendre le chargement
    await this.backofficePage.locator('.p-progressspinner').first().waitFor({ state: 'visible' });
    await this.backofficePage.locator('.p-progressspinner').first().waitFor({ state: 'detached' });
    await this.backofficePage.waitForTimeout(2000);

    expect(await this.backofficePage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span').count() ).toBe(0);
    await expect(this.backofficePage.locator('.p-message-text').filter({ hasText: "Aucun créneau n’est disponible pour le mode de rendez-vous sélectionné, veuillez modifier vos critères" }) ).toBeVisible();
}); 

Then("Une fenêtre \"Ajouter un RDV\" s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-reservation-internal header span').filter({ hasText: "Ajouter un RDV" })).toBeVisible();
}); 

Then("Une popup de confirmation s'affiche", async function() {
    await expect(this.backofficePage.locator('h5.modal-title')).filter({ hasText: "Confirmation" }).toBeVisible();
}); 

Then("Le rendez-vous s'affiche bien dans le calendrier au bon endroit", async function() {
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).toBeVisible();
}); 