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

Given("L'utilisateur est sur la page \"Mes paramètres - Gestion des Services\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
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

When("L'utilisateur clique sur \"Gérer les jours de fermeture de votre lieu\"", async function() {
    await this.backofficePage.locator('a').filter({ hasText: 'Gérer les jours de fermeture de votre lieu' }).click(); 
});

When("Il clique sur \"Ajouter un jour de fermeture\"", async function() {
    this.oldJourFermetureNbr = await this.backofficePage.locator('#closed_days > div > fieldset').count();
    await this.backofficePage.locator('button[title="Ajouter un jour de fermeture"]').click();
});

When("L'utilisateur clique dans la zone Bleue du nouveau jour de fermeture créer", async function() {
    await this.backofficePage.locator('#closed_days > div input').last().click();    
});

When("Il sélectionne une date du pour le jour de fermeture sur le calendrier qui apparait", async function() {
    const jour = this.backofficePage.locator('.vc-popover-content-wrapper .vc-day .vc-highlights').locator('..').locator('xpath=following-sibling::*').locator('span').first();
    await jour.waitFor({ state: 'visible' });
    await this.backofficePage.waitForTimeout(500);
    await jour.click();
    await this.backofficePage.waitForTimeout(1000);
});

When("Il cliquer sur \"Ajouter une plage de fermeture\"", async function() {
    // await this.backofficePage.locator('button').filter({ hasText: "Ajouter une plage de fermeture" }).click();

    await this.backofficePage.evaluate(() => {
        document.querySelector('button[title="Ajouter une plage de fermeture"]')?.click();
    });
//    const btn = this.backofficePage.locator('button[title="Ajouter une plage de fermeture"]');
//
//    await btn.waitFor({ state: 'visible' });
//    await btn.scrollIntoViewIfNeeded();
//    await this.backofficePage.waitForTimeout(200); // petit délai anti-transition
//
//    try {
//    await btn.click();
//    } catch (e) {
//    // En cas d'échec, on tente en JS direct
//    await this.backofficePage.evaluate(() => {
//        document.querySelector('button[title="Ajouter une plage de fermeture"]')?.click();
//    });
//    }
});

When("Il séléctionne deux dates dans le calendrier", async function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois en 2 chiffres
    const formattedBegin = `id-${year}-${month}-01`;
    const formattedEnd = `id-${year}-${month}-03`;

    await this.backofficePage.locator('#modal-closed-range .vc-weeks .' + formattedBegin + ' span').click();
    await this.backofficePage.locator('#modal-closed-range .vc-weeks .' + formattedEnd + ' span').click();
});

When("Il clique sur \"Ajouter\"", async function() {
    await this.backofficePage.locator('#modal-closed-range .modal-footer button span').filter({ hasText: "Ajouter" }).click();    
});

When("L'utilisateur clique sur \"Sauvegarder les changements\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(2000);
});









// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------



Then("La page \"Mes paramètres\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("Le parametre \"Activer la réservation pour les familles\" est visible et modifiable", async function() {
    await expect(this.backofficePage.locator('label').filter({ hasText: 'Activer la réservation pour les familles' })).toBeEnabled();
});

Then("Les 3 champ associée au parametre \"Activer la réservation pour les familles\" sont visible et modifiable", async function() {
    await expect(this.backofficePage.locator('input#input-max-number-of-slots-by-office')).toBeEnabled();
    await expect(this.backofficePage.locator('input#input-max-number-of-offices-by-session')).toBeEnabled();
    await expect(this.backofficePage.locator('input#input-max-number-of-user-by-session')).toBeEnabled();
});

Then("La page \"Jours de fermeture\" s'affiche", async function() {
    await expect(this.backofficePage.locator('label').filter({ hasText: 'Jours de fermeture' })).toBeVisible();
});

Then("Une nouvelle jour de fermeture apparait et la date du jour est préselectionné", async function() {

    expect(await this.backofficePage.locator('#closed_days > div > fieldset').count()).toBeGreaterThan(this.oldJourFermetureNbr);

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const year = today.getFullYear();   
    const formattedDate = `${day}/${month}/${year}`;
    const dateInput = await this.backofficePage.locator('#closed_days > div input').last().inputValue();   
    console.log("Date préselectionnée :", dateInput);
    console.log("Date formatée :", formattedDate); 
    expect(dateInput).toBe(formattedDate);
});

Then("La date du jour de fermeture est sélectionnée", async function() {
    const nextday = new Date();
    nextday.setDate(nextday.getDate() + 1);

    const day = String(nextday.getDate()).padStart(2, '0');
    const month = String(nextday.getMonth() + 1).padStart(2, '0'); 
    const year = nextday.getFullYear();   
    const formattedDate = `${day}/${month}/${year}`;
    const dateInput = await this.backofficePage.locator('#closed_days > div input').last().inputValue();    
    expect(dateInput).toBe(formattedDate);
    this.uniqueDateFermeture = formattedDate;
});

Then("Une icone de suppression est affichée et cliquable à côté de la zone du jour de fermeture", async function() {
    await expect(this.backofficePage.locator('#closed_days > div > fieldset:last-child i.bx-trash')).toBeVisible();    
});

Then("Le boutton \"Supprimer tous les jours fériés\" est visible et cliquable", async function() {
    await expect(this.backofficePage.locator('button[title="Supprimer tous les jours fériés"]')).toBeVisible();
});

Then("Un calendrier s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-closed-range header span').filter({ hasText: "Ajouter une plage de fermeture" }) ).toBeVisible();
});

Then("Chaque jours dans la plage de fermeture est affiché en tant que jour de fermeture", async function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois en 2 chiffres
    const date_1 = `id-${year}-${month}-01`;
    const date_2 = `id-${year}-${month}-02`;
    const date_3 = `id-${year}-${month}-03`;

    const dateInput_1 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[2]').locator('input').first().inputValue();   
    const dateInput_2 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[1]').locator('input').first().inputValue();   
    const dateInput_3 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('input').first().inputValue();   

    const iso_date_1 = `01/${month}/${year}`;
    const iso_date_2 = `02/${month}/${year}`;
    const iso_date_3 = `03/${month}/${year}`;

    // console.log("chaque Date selectionnée :", dateInput_1);
    // console.log("chaque Date formatée :", iso_date_1); 
    // await this.backofficePage.waitForTimeout(10000); // Attendre que le jour soit sélectionné

    expect(dateInput_1).toBe(iso_date_1);
    expect(dateInput_2).toBe(iso_date_2);
    expect(dateInput_3).toBe(iso_date_3);
});

Then("La date de fermeture est bien enregitrée", async function() {

    //const dateInputLocator_0 = this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[3]').locator('input').first(); 
    //const dateInputLocator_1 = this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[2]').locator('input').first();    
    //const dateInputLocator_2 = this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[1]').locator('input').first();    
    //const dateInputLocator_3 = this.backofficePage.locator('#closed_days > div fieldset').last().locator('input').first();    

    //const dateInput_0 = await dateInputLocator_0.inputValue(); 
    //const dateInput_1 = await dateInputLocator_1.inputValue();   
    //const dateInput_2 = await dateInputLocator_2.inputValue();   
    //const dateInput_3 = await dateInputLocator_3.inputValue();   

//    const today = new Date();
//    const year = today.getFullYear();
//    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois en 2 chiffres
//
//    const iso_date_1 = `01/${month}/${year}`;
//    const iso_date_2 = `02/${month}/${year}`;
//    const iso_date_3 = `03/${month}/${year}`;

    // const locatorInput_0 = await this.backofficePage.locator('#closed_days > div fieldset').locator('input').evaluateHandle((inputs, value) => {
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, this.uniqueDateFermeture);
    // const locatorInput_1 = await this.backofficePage.locator('#closed_days > div fieldset').locator('input').evaluateHandle((inputs, value) => {
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_1);
    // const locatorInput_2 = await this.backofficePage.locator('#closed_days > div fieldset').locator('input').evaluateHandle((inputs, value) => {
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_2);
    // const locatorInput_3 = await this.backofficePage.locator('#closed_days > div fieldset').locator('input').evaluateHandle((inputs, value) => {
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_3);

    // const locatorInput_0 = await this.backofficePage.evaluateHandle((value) => {
    //     const inputs = document.querySelectorAll('#closed_days > div fieldset input');
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, this.uniqueDateFermeture);
    // const locatorInput_1 = await this.backofficePage.evaluateHandle((value) => {
    //     const inputs = document.querySelectorAll('#closed_days > div fieldset input');
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_1);
    // const locatorInput_2 = await this.backofficePage.evaluateHandle((value) => {
    //     const inputs = document.querySelectorAll('#closed_days > div fieldset input');
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_2);
    // const locatorInput_3 = await this.backofficePage.evaluateHandle((value) => {
    //     const inputs = document.querySelectorAll('#closed_days > div fieldset input');
    //     return Array.from(inputs).find((el) => el.value === value);
    // }, iso_date_3);

////    async function getLocatorByInputValue(page, selector, value) {
////        // 1. Find the element with matching input.value inside the selector scope
////        const handle = await page.evaluateHandle(
////          ([sel, val]) => {
////            const inputs = document.querySelectorAll(sel);
////            return Array.from(inputs).find(input => input.value === val) || null;
////          },
////          [selector, value]
////        );
////      
////        // 2. Get ElementHandle from JSHandle
////        const element = handle.asElement();
////        if (!element) return null;
////      
////        // 3. Create a locator from the element handle
////        return page.locator('xpath=.', { has: element });
////      }
////
////      const locatorInput_0 = await getLocatorByInputValue(this.backofficePage, '#closed_days > div fieldset input', this.uniqueDateFermeture);
////      const locatorInput_1 = await getLocatorByInputValue(this.backofficePage, '#closed_days > div fieldset input', iso_date_1);
////      const locatorInput_2 = await getLocatorByInputValue(this.backofficePage, '#closed_days > div fieldset input', iso_date_2);
////      const locatorInput_3 = await getLocatorByInputValue(this.backofficePage, '#closed_days > div fieldset input', iso_date_3);

    // async function findInputLocatorByValue(inputsLocator, value) {
    //     const count = await inputsLocator.count();
    //     console.log('before loop')
    //     for (let i = 0; i < count; i++) {
    //         console.log('before loop i:', i)
    //       const val = await inputsLocator.nth(i).inputValue();
    //       console.log('val: ', val, ' value:', value)
    //       if (val === value) return inputsLocator.nth(i);
    //     }
    //     return null;
    // }

//    const inputs = this.backofficePage.locator('#closed_days > div fieldset input');
//    const locatorInput_0 = await findInputLocatorByValue(inputs, this.uniqueDateFermeture);
//    const locatorInput_1 = await findInputLocatorByValue(inputs, iso_date_1);
//    const locatorInput_2 = await findInputLocatorByValue(inputs, iso_date_2);
//    const locatorInput_3 = await findInputLocatorByValue(inputs, iso_date_3);
//
//    Array.from(document.querySelectorAll('input')).find(el => el.value === "03/07/2025");



//    const inputs = this.backofficePage.locator('#closed_days > div fieldset input');
//    const count = await inputs.count();
//    
//    let locatorInput_0 = null;
//    let locatorInput_1 = null;
//    let locatorInput_2 = null;
//    let locatorInput_3 = null;
//
//    for (let i = 0; i < count; i++) {
//        const val = await inputs.nth(i).inputValue();
//        console.log('current val: ', val)
//        if (val === this.uniqueDateFermeture) {
//            locatorInput_0 = inputs.nth(i);
//            console.log('unique : ', this.uniqueDateFermeture)
//        }
//        if (val === iso_date_1) {
//            locatorInput_1 = inputs.nth(i);
//            console.log('date 1 : ', iso_date_1)
//        }
//        if (val === iso_date_2) {
//            locatorInput_2 = inputs.nth(i);
//            console.log('date 2 : ', iso_date_2)
//        }
//        if (val === iso_date_3) {
//            locatorInput_3 = inputs.nth(i);
//            console.log('date 3 : ', iso_date_)
//        }
//    }

//    const dateInput_0 = await locatorInput_0.inputValue(); 
//    const dateInput_1 = await locatorInput_1.inputValue();   
//    const dateInput_2 = await locatorInput_2.inputValue();   
//    const dateInput_3 = await locatorInput_3.inputValue();   
//
//    expect(dateInput_0).toBe(this.uniqueDateFermeture);
//    expect(dateInput_1).toBe(iso_date_1);
//    expect(dateInput_2).toBe(iso_date_2);
//    expect(dateInput_3).toBe(iso_date_3);
//
//    // Nettoyer la base de donnée
//    //await this.backofficePage.locator('#closed_days > div > fieldset:last-child i.bx-trash').click();
//    await locatorInput_0.locator('../../../..').locator('i.bx-trash').click();
//    await this.backofficePage.waitForTimeout(1000);
//    await locatorInput_1.locator('../../../..').locator('i.bx-trash').click();
//    await this.backofficePage.waitForTimeout(1000);
//    await locatorInput_2.locator('../../../..').locator('i.bx-trash').click();
//    await this.backofficePage.waitForTimeout(1000);
//    await locatorInput_3.locator('../../../..').locator('i.bx-trash').click();
//    await this.backofficePage.waitForTimeout(1000);
//    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
//    await this.backofficePage.waitForTimeout(2000);
});










