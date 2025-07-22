const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');




function formatDateRange(dateRange) {
    const months = [
      '', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    return dateRange.split(' - ').map(dateStr => {
      const [day, month, year] = dateStr.split('/');
      return `${parseInt(day)} ${months[parseInt(month)]} ${year}`;
    }).join(' - ');
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

Given("L'utilisateur est sur la page calendrier", async function() {
    // await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

Given("Tout les services sont sélectionné", async function() {
    // await this.backofficePage.locator('i[title="Paramètres"]').click(); 

    // .multiselect .multiselect__tags      "77 services sélectionnés"
    // .multiselect .multiselect__content-wrapper ul > li  count - 3

    //const tagLocator = this.backofficePage.locator('.multiselect .multiselect__tags span').filter({ hasText: new RegExp(/^(\d+)\s+ services sélectionnés$/) });
    const tagLocator = this.backofficePage.locator('.multiselect .multiselect__tags ').getByText("services sélectionnés");
    
    // 2. Get innerText
    const selectedText = await tagLocator.innerText();
    console.log("selectedText: -*********************************", selectedText)
    
    // 3. Extract number
    const match = selectedText.match(/^(\d+)\s+services/);
    if (!match) throw new Error('Impossible d’extraire le nombre');
    const selectedCount = parseInt(match[1], 10);
    
    // 4. Count li items and subtract 3
    const liCount = await tagLocator.locator('../..').locator('ul > li').count();
    const effectiveCount = liCount - 3;
    console.log('selectedCount: ', selectedCount)
    console.log('effectiveCount: ', effectiveCount)
    
    // 5. Compare
    expect(selectedCount).toBe(effectiveCount);
  
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




When("L'utilisateur clique sur Calendrier", async function() {
    // await this.backofficePage.locator('i[title="Calendrier"]').click(); 
});

When("L'utilisateur clique sur \"Total\"", async function() {
    await this.backofficePage.getByText('Total :').click(); 
});

When("L'utilisateur clique sur \"Exporter les données\", puis PDF", async function() {
    await this.backofficePage.locator('#dropdown-export button').filter({ hasText: "Exporter les données" }).click(); 
    await this.backofficePage.locator('#dropdown-export ul li a').filter({ hasText: "PDF" }).click(); 
});

When("L'utilisateur clique directement sur le logo PDF", async function() {
    await this.backofficePage.locator('button span.pdf').click(); 
});

When("L'utilisateur clique sur \"Exporter les données\", puis Excel", async function() {
    await this.backofficePage.locator('#dropdown-export button').filter({ hasText: "Exporter les données" }).click(); 
    await this.backofficePage.locator('#dropdown-export ul li a').filter({ hasText: "Excel" }).click(); 
});

When("L'utilisateur clique directement sur le logo Excel", async function() {
    await this.backofficePage.locator('button span.excel').click(); 
});

When("L'utilisateur clique sur \"Exporter les données\", puis CSV", async function() {
    await this.backofficePage.locator('#dropdown-export button').filter({ hasText: "Exporter les données" }).click(); 
    await this.backofficePage.locator('#dropdown-export ul li a').filter({ hasText: "C.S.V" }).click(); 
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------



Then("La fenetre Total s'affiche", async function() {
    await expect(this.backofficePage.locator('#current-view-address-book')).toBeVisible();
});

Then("Le fichier d'export des rdv PDF est télécharger", async function() {

    const dateRange = await this.backofficePage.locator('#current-view-address-book .modal-title').textContent();
    //let filename = formatDateRange(dateRange) + ".pdf";
    let filename = dateRange + ".pdf";

    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe(filename);
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le fichier d'export des rdv Excel est télécharger", async function() {

    const dateRange = await this.backofficePage.locator('#current-view-address-book .modal-title').textContent();
    // let filename = formatDateRange(dateRange) + ".xlsx";
    let filename = dateRange + ".xlsx";

    // Check download excel
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe(filename);
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le fichier d'export des rdv CSV est télécharger", async function() {
    const dateRange = await this.backofficePage.locator('#current-view-address-book .modal-title').textContent();
    // let filename = formatDateRange(dateRange) + ".csv";
    let filename = dateRange + ".csv";

    // Check download excel
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe(filename);
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});



