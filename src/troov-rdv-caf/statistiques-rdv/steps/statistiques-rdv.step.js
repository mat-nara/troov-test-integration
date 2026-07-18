const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const exp = require('constants');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');


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

Given("L'utilisateur est sur la page \"Statistiques RDV\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Statistiques RDV"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("L'utilisateur clique sur \"Statistiques\" puis sur \"Statistiques RDV\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Statistiques RDV"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});

When("Il sélectionne un site ou lieu en haut de la page", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const siteLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').first();
    await siteLocator.locator('div.arrow-btn').click();
    // await this.backofficePage.waitForTimeout(1000);

    // Sélectionne le 2nd item (non Sélectionner tout) de la liste de site
    siteLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(1).click();
});

When("L'utilisateur clique sur le filtre type de service puis sur \"Sélectionner tout\"", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const typeServiceLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').nth(1);
    await typeServiceLocator.locator('div.arrow-btn').click();
    await this.backofficePage.waitForTimeout(1000);

    // Sélectionne "Sélectionner tout" de la liste
    typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(0).click();
    await this.backofficePage.waitForTimeout(1000);
    typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(0).click();
    await this.backofficePage.waitForTimeout(1000);
    
});

When("Il clique sur la croix de certain service", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const typeServiceLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').nth(1);

    // Sélectionne le 2nd item (non Sélectionner tout) de la liste de type de service
    typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(1).click();
});

When("L'utilisateur clique sur \"Historiques\" et sélectionne une date de début et une date de fin", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();
    await historyLocator.locator('i.bx-calendar').click();

    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();
    const defaultDebut = rangeValue.split(' - ')[0];

    const mois      = parseInt(defaultDebut.split('/')[1]) - 1; // 0 = janvier
    const annee     = parseInt(defaultDebut.split('/')[2]);
    this.dateDebut  = new Date(annee, mois, 1);
    this.dateFin    = new Date(annee, mois, 3);

    const options   = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateDebutFormatee = this.dateDebut.toLocaleDateString('fr-FR', options);
    const dateFinFormatee   = this.dateFin.toLocaleDateString('fr-FR', options);
    console.log(dateDebutFormatee); // Ex: "jeudi 1 mai 2025"
    console.log(dateFinFormatee); // Ex: "samedi 3 mai 2025"
    await historyLocator.locator(`div.vc-popover-content-wrapper span[aria-label="${dateDebutFormatee}"]`).click();
    await historyLocator.locator(`div.vc-popover-content-wrapper span[aria-label="${dateFinFormatee}"]`).click();
});

When("L'utilisateur clique sur \"Historiques\" et sélectionne une seule date", async function() {

    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();
    await historyLocator.locator('i.bx-calendar').click();

    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();
    const defaultDebut = rangeValue.split(' - ')[0];

    // Date de début et fin
    // 
    // const mois      = aujourdHui.getMonth(); // 0 = janvier
    // const annee     = aujourdHui.getFullYear();

    const mois      = parseInt(defaultDebut.split('/')[1]) - 1; // 0 = janvier
    const annee     = parseInt(defaultDebut.split('/')[2]);
    this.dateDebut  = new Date(annee, mois, 1);
    this.dateFin    = new Date(annee, mois, 3);

    const options   = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateDebutFormatee = this.dateDebut.toLocaleDateString('fr-FR', options);
    const dateFinFormatee   = this.dateFin.toLocaleDateString('fr-FR', options);
    console.log(dateDebutFormatee); // Ex: "jeudi 1 mai 2025"
    console.log(dateFinFormatee); // Ex: "samedi 3 mai 2025"
    await historyLocator.locator(`div.vc-popover-content-wrapper span[aria-label="${dateDebutFormatee}"]`).click();
    await historyLocator.locator(`div.vc-popover-content-wrapper span[aria-label="${dateDebutFormatee}"]`).click();
});

// When("Tous les filtres sont paramétrés", async function() {
// 
// });

When("L'utilisateur clique sur le bouton \"Exporter en XLS\"", async function() {
    //this.downloadPromise = this.backofficePage.waitForEvent('download');
    await this.backofficePage.locator('img[src="/app/img/export-excel.045fad8.svg"]').click();
    // await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur clique sur le bouton \"Exporter en PDF\"", async function() {
    
    await this.backofficePage.locator('img[src="/app/img/export-pdf.49989a3.svg"]').click();
    
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page des statistiques RDV s'affiche", async function() {
    await expect(this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" }) ).toBeVisible();
});

Then("La séléction du site est bien effectuée", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const siteLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').first();

    await expect(siteLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(1) ).toHaveClass(/.*\bselected\b.*/);
    await expect(siteLocator.locator('div.input-value')).toHaveText('Sélection multiple (2)');
});

Then("Tous les types de RDV sont sélectionnés", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const typeServiceLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').nth(1);

    await expect(typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(0) ).toHaveClass(/.*\bselected\b.*/);
    await expect(typeServiceLocator.locator('div.input-value')).toHaveText('Tous les services');
});

Then("Le service choisi est bien désélectionné", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const typeServiceLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-select').nth(1);

    await expect(typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(0) ).not.toHaveClass(/.*\bselected\b.*/);
    await expect(typeServiceLocator.locator('.dropdown-menu .custom-dropdown-item ').nth(1) ).not.toHaveClass(/.*\bselected\b.*/);
    await expect(typeServiceLocator.locator('div.input-value')).toHaveText(/^\s*Sélection multiple \(\d+\)\s*$/);
});

Then("La période choisie est bien sélectionnée", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();

    // Reconstruire la date de début au format "JJ/MM/AAAA"
    const jourDebut = String(this.dateDebut.getDate()).padStart(2, '0');
    const moisDebut = String(this.dateDebut.getMonth() + 1).padStart(2, '0'); 
    const anneeDebut = this.dateDebut.getFullYear();
    const dateDebutFormatee = `${jourDebut}/${moisDebut}/${anneeDebut}`;

    //
    const jourFin = String(this.dateFin.getDate()).padStart(2, '0');
    const moisFin = String(this.dateFin.getMonth() + 1).padStart(2, '0'); 
    const anneeFin = this.dateFin.getFullYear();
    const dateFinFormatee = `${jourFin}/${moisFin}/${anneeFin}`;

    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();
    const rangeclicked = dateDebutFormatee + " - " + dateFinFormatee;

    expect(rangeValue).toBe(rangeclicked);
});

Then("Seule la date choisie est sélectionnée", async function() {
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();

    // Reconstruire la date de début au format "JJ/MM/AAAA"
    const jourDebut = String(this.dateDebut.getDate()).padStart(2, '0');
    const moisDebut = String(this.dateDebut.getMonth() + 1).padStart(2, '0'); 
    const anneeDebut = this.dateDebut.getFullYear();
    const dateDebutFormatee = `${jourDebut}/${moisDebut}/${anneeDebut}`;

    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();
    const rangeclicked = dateDebutFormatee;

    expect(rangeValue).toBe(rangeclicked);
});

// Then("L'utilisateur clique sur \"Rechercher\"", async function() {
// 
// });

Then("Un fichier Excel est téléchargé contenant les données des RDV", async function() {

    
    // Range de dates
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();
    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();

    // Formater la date
    //const input = "22/04/2025 - 22/05/2025";
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin","juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    // Séparer les deux dates
    const [debut, fin] = rangeValue.split(" - ");

    // Fonction pour transformer une date
    function formatDate(dateStr) {
        const [jour, moisNum, annee] = dateStr.split('/');
        const nomMois = mois[parseInt(moisNum, 10) - 1];
        return `${parseInt(jour)} ${nomMois} ${annee}`;
    }

    const waitedFilename = `${formatDate(debut)} - ${formatDate(fin)}.xlsx`;

    // Check téléchargement
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe(waitedFilename);
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();

/*
    // Capture le téléchargement
    //    const [download] = await Promise.all([
    //        this.backofficePage.waitForEvent('download'),
    //        this.backofficePage.locator('img[src="/app/img/export-excel.045fad8.svg"]').click(),
    //    ]);



    

    // 2. Action qui déclenche le téléchargement
    //await this.backofficePage.click('button#export-pdf'); // Remplace par ton sélecteur

    // 3. Récupération de l'objet 'Download'
    const download = await this.downloadPromise;

    // Chemin de sauvegarde
    const suggestedFilename = download.suggestedFilename();
    const filePath = path.join(os.tmpdir(), suggestedFilename);
    await download.saveAs(filePath);

    // Vérifie que le fichier existe
    expect(fs.existsSync(filePath)).toBe(true);

    // Lire le fichier avec xlsx
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la feuille en JSON
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // tableau brut

    // Lire la première ligne (entêtes)
    const headerRow = rows[0].map(cell => String(cell).trim());

    // Vérifier que les entêtes sont bien présents
    const expectedHeaders = [
        "Nom équipe",
        "Service",
        "Guichet",
        "Prise sur la plateforme le",
        "Prise sur la plateforme à"
    ];

    for (const expectedHeader of expectedHeaders) {
        expect(headerRow).toContain(expectedHeader);
    }
    
*/
});

Then("Un fichier PDF est téléchargé contenant les données des RDV", async function() {
    // Range de dates
    const statistiqueLocator =  this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Statistiques" });
    const historyLocator = statistiqueLocator.locator('xpath=following-sibling::*').locator('> div.stats-picker').first();
    const rangeValue = await historyLocator.locator('input[aria-label="Cliquez ici pour choisir la date"]').inputValue();

    // Formater la date
    //const input = "22/04/2025 - 22/05/2025";
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin","juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    // Séparer les deux dates
    const [debut, fin] = rangeValue.split(" - ");

    // Fonction pour transformer une date
    function formatDate(dateStr) {
        const [jour, moisNum, annee] = dateStr.split('/');
        const nomMois = mois[parseInt(moisNum, 10) - 1];
        return `${parseInt(jour)} ${nomMois} ${annee}`;
    }

    const waitedFilename = `${formatDate(debut)} - ${formatDate(fin)}.pdf`;

    // Check téléchargement
    const download = await this.backofficePage.waitForEvent('download');
    expect(download.suggestedFilename()).toBe(waitedFilename);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    await download.delete();
});
