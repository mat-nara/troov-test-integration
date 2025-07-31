const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR, pl  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const exp = require('constants');



setDefaultTimeout(120 * 1000);



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



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("L'utilisateur navigue vers \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("L'utilisateur clique sur \"Mes calendriers - Gestion des Services\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

When("Il clique sur le calendrier avec étoile d'un guichet en particulier", async function() {
    await this.backofficePage.locator('table > tbody > tr > td').filter({ hasText: "Guichet 1" }).locator('..').locator('td:last-child i.bx-calendar-star ').click(); 
});

When("Il sélectionne une date", async function() {
    await this.backofficePage.locator('.vc-day .vc-highlights').locator('..').locator('xpath=preceding-sibling::*').first().click(); 
});

When("Il clique sur le bouton \"Ajouter une plage horaire exceptionnelle\"", async function() {
    await this.backofficePage.waitForTimeout(3000);
    this.nbrPlageExceptionnel = await this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default').count();
    console.log('Nombre de plages horaires exceptionnelles avant l\'ajout : ' + this.nbrPlageExceptionnel);
    await this.backofficePage.locator('span').filter({ hasText: 'Ajouter une plage horaire exceptionnelle' }).click();
    await this.backofficePage.waitForTimeout(2000);
});

When("Il clique sur l'icone \"plus\" puis sélectionne un services", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('.blue-plus').click();
    this.backofficePage.waitForTimeout(1000);
    console.log('Cliquing du premier element de la liste des services ....');
    await plageLocator.locator('.multiselect-options .options:first-child .rounded-circle ').click();
    //this.backofficePage.waitForTimeout(1000);
    this.selectedServiceName = await plageLocator.locator('.multiselect-options .options:first-child .office-label').textContent();
});

When("Il choisit une plage horaire", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('.custom-days-opening-input').first().fill("12:00");
    await plageLocator.locator('.custom-days-opening-input').nth(1).fill("13:30");
});

When("Il clique sur l'icone \"cocher\" pour valider la plage horaire", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('button[title="Sauvegarder la nouvelle plage horaire"]').click();
});

When("Il clique sur l'icone \"Horloge\"", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('.bx-time').click();
});

When("Il sélectionne une récurence, Mardi et Mercredi, puis sélectionne une période concerné", async function() {
    await this.backofficePage.locator('#recurrence-modal .days-selector .rounded-full').nth(1).click();
    await this.backofficePage.locator('#recurrence-modal .days-selector .rounded-full').nth(2).click();

    //*************  Sélection de la date de début de récurrence ****************/
    const debutRecurence = this.backofficePage.locator('span').filter({ hasText: 'Début de la récurrence :' }).locator('..')
                                              .locator('input[aria-label="Cliquez ici pour choisir la date"]').nth(0);
    await debutRecurence.click();
    // await this.backofficePage.locator('.vc-day .vc-highlights').locator('..').locator('xpath=preceding-sibling::*').nth(0).click();
    

    // Selection de plage de date
    const date = new Date();
    const month = date.toLocaleDateString('fr-FR', { month: 'long' });
    const year = date.getFullYear(); 
    const monthIndex = date.getMonth();
    const weekdayMap = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

    // Fonction pour formater le label comme aria-label attend
    function getAriaLabel(jour) {
        const testDate = new Date(year, date.getMonth(), jour); // même mois
        const weekday = weekdayMap[testDate.getDay()];
        const day = jour;
        return `${weekday} ${day} ${month} ${year}`;
    }

    // Fonction pour format DD/MM/YYYY
    function formatDateFR(jour) {
        const day = String(jour).padStart(2, '0');
        const monthNum = String(monthIndex + 1).padStart(2, '0');
        return `${day}/${monthNum}/${year}`;
    }

    // Génère les deux labels
    const labelJour1 = getAriaLabel(1);
    const labelJour3 = getAriaLabel(3);
    this.dateDebutReccurence = formatDateFR(1);
    this.dateFinReccurence = formatDateFR(3);

    await this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${labelJour1}"]`).first().click();


    //*************  Sélection de la date de fin de récurrence ****************/
    const finRecurence = this.backofficePage.locator('span').filter({ hasText: ' Fin de la récurrence :' }).locator('..')
                                            .locator('input[aria-label="Cliquez ici pour choisir la date"]').nth(0);
    await finRecurence.click();
    await this.backofficePage.locator(`.vc-popover-content-wrapper span[aria-label="${labelJour3}"]`).first().click();

});

When("Il clique sur le bouton \"Valider\"", async function() {
    await this.backofficePage.locator('button[title="Enregistrer"]').filter({ hasText: 'Valider' }).click(); 
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

Then("La date est bien sélectionnée", async function() {
    // await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("Une nouvelle ligne avec une étoile s'affiche", async function() {
    this.nbrPlageExceptionnelNow = await this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default').count();
    console.log("Nombre  avant l'ajout : " + this.nbrPlageExceptionnel);
    console.log("Nombre  après l'ajout : " + this.nbrPlageExceptionnelNow);
    expect(this.nbrPlageExceptionnelNow).toBe(this.nbrPlageExceptionnel + 1);

    //this.backofficePage.waitForTimeout(5000);
});

Then("Le service est bien sélectionné et la couleur du service choisi s'affiche", async function() {
    // const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    
    // const tag = plageLocator.locator('.tags .rounded-circle').first();
    // await expect(tag).toHaveAttribute('title', this.selectedServiceName.trim());


    //await expect(plageLocator.locator(`.tags .rounded-circle[title="${this.selectedServiceName}"]`) ).toBeVisible();

    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
      
    const expectedTitle = this.selectedServiceName.trim();
    const tags = await plageLocator.locator('.tags .rounded-circle').all();
      
    let matchFound = false;
      
    for (const tag of tags) {
        const title = (await tag.getAttribute('title'))?.trim();
        if (title === expectedTitle) {
          matchFound = true;
          break;
        }
    }
      
      expect(matchFound).toBe(true);
});

Then("La plage horaire est bien", async function() {
    // await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("La plage horaire exceptionnelle est bien enregistrée", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await expect(plageLocator.locator('.custom-delete-button  .bxs-trash') ).toBeVisible();
});

Then("Une fenetre \"Ajouter une récurrence\" s'affiche", async function() {
    await expect(this.backofficePage.locator('#recurrence-modal span').filter({ hasText: 'Ajouter une récurrence' })).toBeVisible();
});

Then("La récurrence est bien enregistrée", async function() {
    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('.bx-time').click();

    // Vérifier les jours sélectionnés
    await expect(this.backofficePage.locator('#recurrence-modal .days-selector .rounded-full').nth(1) ).toHaveClass(/bg-primary/);
    await expect(this.backofficePage.locator('#recurrence-modal .days-selector .rounded-full').nth(2) ).toHaveClass(/bg-primary/);

    const debutRecurence = this.backofficePage.locator('span').filter({ hasText: 'Début de la récurrence :' }).locator('..')
                                              .locator('input[aria-label="Cliquez ici pour choisir la date"]').nth(0);

    const finRecurence = this.backofficePage.locator('span').filter({ hasText: ' Fin de la récurrence :' }).locator('..')
                                            .locator('input[aria-label="Cliquez ici pour choisir la date"]').nth(0);

    await expect(debutRecurence).toHaveValue(this.dateDebutReccurence);
    await expect(finRecurence).toHaveValue(this.dateFinReccurence);
});

Then("La nouvelle plage horaire exceptionnelle est nettoyée", async function() {
    await this.backofficePage.locator('button[title="Annuler"]').filter({ hasText: 'Annuler' }).click(); 

    const plageLocator = this.backofficePage.locator('.setting-card-default .grid-wrapper div:last-child .grid-row-default:last-child');
    await plageLocator.locator('.custom-delete-button  .bxs-trash').click();
    await this.backofficePage.locator('#custom-days-closing-modal footer button').filter({ hasText: 'OK' }).click(); 
});



 


