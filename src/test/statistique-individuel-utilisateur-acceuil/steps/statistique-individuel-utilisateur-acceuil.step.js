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

Given("L'utilisateur est sur la page \"Statistiques RDV\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Statistiques RDV"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques RDV\"", async function() {
    // await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    // await this.backofficePage.locator('i[title="Statistiques RDV"]').click(); 
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});

When("L'utilisateur clique sur l'icone de téléchargement excel", async function() {
    await this.backofficePage.locator('.export-btn').first().click(); 
});

When("L'utilisateur clique sur \"Historiques\"", async function() {
    await this.backofficePage.locator('span').filter({ hasText: "Historique" }).click(); 
});

When("L'utilisateur sélectionne une plage de période", async function() {
    function convertAriaLabelToDate(ariaLabel) {
        const moisMap = {
          janvier: '01',
          février: '02',
          mars: '03',
          avril: '04',
          mai: '05',
          juin: '06',
          juillet: '07',
          août: '08',
          septembre: '09',
          octobre: '10',
          novembre: '11',
          décembre: '12'
        };
      
        const regex = /^([a-zéû]+)\s+(\d{1,2}),\s*(\d{4})$/i;
        const match = ariaLabel?.match(regex);
        if (!match) throw new Error(`aria-label invalide : ${ariaLabel}`);
      
        const mois = match[1].toLowerCase();
        const jour = match[2].padStart(2, '0');
        const annee = match[3];
        const moisNum = moisMap[mois];
      
        return `${jour}/${moisNum}/${annee}`;
    }

    const dayOneLocator = this.backofficePage.locator('.flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)', { hasText: /^1$/ }).first();
    const dayFiveLocator = this.backofficePage.locator('.flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)', { hasText: /^5$/ }).first();
        
    await this.backofficePage.getByPlaceholder('Cliquez ici pour choisir la date').click();
    await dayOneLocator.click();
    await dayFiveLocator.click();

    const ariaLabel1 = await dayOneLocator.getAttribute('aria-label');
    const ariaLabel2 = await dayFiveLocator.getAttribute('aria-label');
    this.dateDebut = convertAriaLabelToDate(ariaLabel1);
    this.dateFin = convertAriaLabelToDate(ariaLabel2);
     
    await this.backofficePage.locator('.flatpickr-confirm').filter({ hasText: "Ok" }).click();
});

When("L'utilisateur clique sur \"Rechercher\"", async function() {
    await this.backofficePage.locator('.btn-search-stats').click(); 
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




Then("La page des statistiques RDV s'affiche", async function() {
    // await expect(this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" }) ).toBeVisible();
    await expect(this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Pilotage" }) ).toBeVisible();
});

Then("Le fichier Excel des statistiques RDV est téléchargé", async function() {
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("export.xlsx");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le filter Historiques est bien sélectionnée", async function() {
    await expect(this.backofficePage.locator('span').filter({ hasText: "Historique" }) ).toBeVisible();
});

Then("La plage de période est bien sélectionnée", async function() {
    const valeurFinale = `${this.dateDebut} au ${this.dateFin}`;
    await expect(this.backofficePage.getByPlaceholder('Cliquez ici pour choisir la date')).toHaveValue(valeurFinale);
});

Then("Le filtre est appliqué et les statistiques RDV sont affichées", async function() {
    await expect(this.backofficePage.locator('.spinner-border') ).toBeVisible();
});



