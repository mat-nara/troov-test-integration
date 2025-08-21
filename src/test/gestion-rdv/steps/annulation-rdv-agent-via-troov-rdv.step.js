const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(120 * 1000);

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
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });
});

Given("L'utilisateur clique sur \"Calendrier\"", async function() {
    //await this.backofficePage.locator('i[title="Calendrier"]').click();
    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
});

Given("La fiche du rendez-vous est ouverte depuis l’agenda", async function() {
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);
});

Given("L'utilisateur ouvre le carnet d'adresse", async function() {
    await this.backofficePage.locator('i[title="Carnet d\'adresses"]').click();
});

Given("La fiche du rendez-vous est ouverte depuis le carnet d’adresse", async function() {

    //***************************** Rechercher le rendez-vous  ***************************/
    await this.backofficePage.getByPlaceholder('Email').first().fill(this.email); // Test passe
    // await this.backofficePage.getByPlaceholder('Prénom').first().fill(this.firstname);
    // await this.backofficePage.getByPlaceholder('Nom').first().fill(this.name);
    
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Rechercher' });
    await selectorButtonCreerUser.click();

    //***************************** Selectionne le rendez-vous  ***************************/
    var invertedFullname =  this.firstname + ' ' + this.name.toUpperCase();
    console.log('invertedFullname: ', invertedFullname)
    const resultLocator = this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: invertedFullname });
    await resultLocator.click();
});

Given("Le rendez-vous a été annulé", async function() {

    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    //***********************   Clique sur annuler, puis Annuler ce/ces rendez-vous *************************/
    const annulerBtnLocator = this.backofficePage.locator('#reservation-edit-modal button:has-text("Annuler ce/ces rendez-vous")');
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    this.deletionDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    this.deletionTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
});

Given("L'utilisateur l’a retrouvé dans \"RDV annulés\"", async function() {

    //*********************  rafraichir la page ************************/
    await this.backofficePage.locator('i[title="Mon équipe"]').click();
    await this.backofficePage.waitForTimeout(3000);
    await this.backofficePage.locator('i[title="Calendrier"]').click();

    //*********************  modification du filtre et sélectionne "RDV annulés" ************************/
    const boutonFiltre = this.backofficePage.locator('#page-topbar button span').first(); 
    const texteBouton = await boutonFiltre.textContent();   

    if (texteBouton?.trim().toLowerCase() === 'rdv maintenus') {
        await boutonFiltre.click(); // on clique pour passer à "RDV maintenus"
    } else if (texteBouton?.trim().toLowerCase() === 'rdv annulés') {
        console.log('Le filtre est déjà sur "rdv annulés", aucune action nécessaire');
    }

    //*********************  Vérification si elle est dans les rendez-vous annulé ************************/
    await this.backofficePage.waitForTimeout(2000);
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).not.toBeVisible();
});





// ----------------------------------------------------------

When("Il sélectionne le rendez-vous", async function() {
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur clique sur le bouton \"Annuler\" puis sur \"Annuler ce rendez-vous\"", async function() {
    const annulerBtnLocator = this.backofficePage.locator('#reservation-edit-modal button:has-text("Annuler ce/ces rendez-vous")');
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();
});

When("Il renseigne les informations de l'usager et recherche un rendez-vous", async function() {
    await this.backofficePage.getByPlaceholder('Email').first().fill(this.email); // Test passe
    // await this.backofficePage.getByPlaceholder('Prénom').first().fill(this.firstname);
    // await this.backofficePage.getByPlaceholder('Nom').first().fill(this.name);
    
    const selectorButtonCreerUser = this.backofficePage.locator('button > span').filter({ hasText: 'Rechercher' });
    await selectorButtonCreerUser.click();
});

When("Il clique sur le rendez-vous à annuler", async function() {
    var invertedFullname =  this.firstname + ' ' + this.name.toUpperCase();
    console.log('invertedFullname: ', invertedFullname)
    const resultLocator = this.backofficePage.locator('table#address-book > tbody > tr > td').filter({ hasText: invertedFullname });
    await resultLocator.click();
});

When("L'utilisateur revient sur l’agenda via le menu \"Calendrier\"", async function() {
    await this.backofficePage.locator('i[title="Calendrier"]').click();
});

When("Le filtre des rendez-vous est réglé sur \"RDV maintenus\"", async function() {
    const boutonFiltre = this.backofficePage.locator('#page-topbar button span').first(); 
    const texteBouton = await boutonFiltre.textContent();   

    if (texteBouton?.trim().toLowerCase() === 'rdv annulés') {
        await boutonFiltre.click(); // on clique pour passer à "RDV maintenus"
    } else if (texteBouton?.trim().toLowerCase() === 'rdv maintenus') {
        console.log('Le filtre est déjà sur "RDV maintenus", aucune action nécessaire');
    }
});

When("L'utilisateur modifie le filtre et sélectionne \"RDV annulés\"", async function() {
    const boutonFiltre = this.backofficePage.locator('#page-topbar button span').first(); 
    const texteBouton = await boutonFiltre.textContent();   

    if (texteBouton?.trim().toLowerCase() === 'rdv maintenus') {
        await boutonFiltre.click(); // on clique pour passer à "RDV maintenus"
    } else if (texteBouton?.trim().toLowerCase() === 'rdv annulés') {
        console.log('Le filtre est déjà sur "rdv annulés", aucune action nécessaire');
    }
});

When("Il ouvre la fiche du RDV et clique sur \"Historique\"", async function() {

    //***********************   Selectionne le rendez-vous *************************/
    await this.backofficePage.waitForTimeout(1000);
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    console.log('clique sur fullname: ', fullname)
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    /***********************  Clique  Historique *************************/
    await this.backofficePage.locator('span:has-text("Historique")').waitFor({ state: 'visible' });
    await this.backofficePage.locator('span:has-text("Historique")').locator('xpath=..').click();

    //***********************  Clique  Rendez-vous pris *************************/
    await this.backofficePage.locator('a:has-text("Rendez-vous pris")').click();
});



// ----------------------------------------------------------

Then("La fiche du rendez-vous s’ouvre correctement", async function() {
    await this.backofficePage.waitForTimeout(1000);
    const headerLocator = this.backofficePage.getByText('Rendez-vous '+ this.name + ' ' + this.firstname);
    await expect(headerLocator).toBeVisible();
}); 

Then("Le rendez-vous doit disparaître de l'agenda", async function() {
    await this.backofficePage.waitForTimeout(2000);
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).not.toBeVisible();
}); 

Then("Le rendez-vous annulé s'affiche dans la liste", async function() {
    await this.backofficePage.waitForTimeout(2000);
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await expect(appointmentLocator).not.toBeVisible();
}); 

Then("Les informations affichées doivent correspondre à la prise initiale puis à l'annulation du rendez-vous", async function() {

    //***********************   Vérification des informations sur la prise du rendez-vous  *************************/
    const  appointmentDetailLocator = this.backofficePage.locator('#edit-reservation___BV_modal_body_ .tab-content .active ul > li').nth(0);
    const appointmentDetail = await appointmentDetailLocator.textContent();

    //console.log(appointmentDetail)
    const cleanedText = appointmentDetail.replace(/\s+/g, ' ').trim();

    // Regex pour extraire chaque information
    const regex = /Pris le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+?) \(([^)]+)\) - Date de réservation : le (\d{2}\/\d{2}\/\d{4}) de (\d{2}:\d{2}) à (\d{2}:\d{2}) - (.*?) - (\d+) minutes - Mode : (.+)/;

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

        //console.log(`Appointment Date: ${appointmentDate}`);
        //console.log(`Appointment Time: ${appointmentTime}`);
        //console.log(`User Name: ${userName}`);
        //console.log(`User Role: ${userRole}`);  // Rôle dynamique
        //console.log(`Reservation Date: ${reservationDate}`);
        //console.log(`Reservation Start Time: ${reservationStartTime}`);
        //console.log(`Reservation End Time: ${reservationEndTime}`);
        //console.log(`Waiting Reason: ${waitingReason}`);
        //console.log(`Duration: ${duration} minutes`);
        //console.log(`Mode: ${mode}`);

        //console.log('this.appointmentDate: ', this.appointmentDate)
        //console.log('this.appointmentTime: ', this.appointmentTime)
        //console.log('this.userName: ', this.userName.trim().toLowerCase())
        //console.log('this.reservationDate: ', this.reservationDate)
        //console.log('this.reservationStartTime: ', this.reservationStartTime)
        //console.log('this.waitingReason: ', this.waitingReason.trim())
        //console.log('this.mode: ', this.mode)

        expect(this.appointmentDate).toBe(appointmentDate);
        expect(this.appointmentTime).toBe(appointmentTime);
        expect(this.userName.trim().toLowerCase()).toBe(userName.toLowerCase());
        expect(this.reservationDate).toBe(reservationDate);
        expect(this.reservationStartTime).toBe(reservationStartTime);
        expect(this.waitingReason.trim()).toBe(waitingReason);
        expect(this.mode).toBe(mode);
    
    } else {
        console.log('No match found.');
        expect(false).toBe(true);
    }


    //***********************   Vérification des informations sur la suppression du rendez-vous  *************************/

    console.log('Vérification des informations sur la modification du rendez-vous');

    const deletionDetailLocator = this.backofficePage.locator('#edit-reservation___BV_modal_body_ .tab-content .active ul > li').nth(1); // Adapter l'index si nécessaire
    const deletionDetail = await deletionDetailLocator.textContent();

    const cleanedDeletionText = deletionDetail.replace(/\s+/g, ' ').trim();

    // Regex pour extraire les infos de suppression
    const deletionRegex = /Supprimé le (\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2}) par ([\w\s]+)/;

    const deletionMatch = cleanedDeletionText.match(deletionRegex);

    if (deletionMatch) {
        const deletionDate = deletionMatch[1];  // ex: 09/04/2025
        const deletionTime = deletionMatch[2];  // ex: 10:14
        const deletedBy = deletionMatch[3];     // ex: Admin Troov

        // console.log('deletionDate', deletionDate)
        // console.log('deletionTime', deletionTime)
        // console.log('this.deletionDate', this.deletionDate)
        // console.log('this.deletionTime', this.deletionTime)

        // Comparaison avec les valeurs attendues (tu peux adapter les `this.xxx`)
        expect(this.deletionDate).toBe(deletionDate);
        expect(this.deletionTime).toBe(deletionTime);
        expect(this.userName.trim().toLowerCase()).toBe(deletedBy.trim().toLowerCase());

    } else {
        console.log('No deletion match found.');
        expect(false).toBe(true);
    }

}); 

