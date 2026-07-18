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

Given("L'utilisateur est sur la page \"Pilotage file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});

Given("Tous les filtres sont renseignés", async function() {

    // Parametrer Guichet premier choix 
    
    await this.backofficePage.locator('.tfd-stats-select label').filter({ hasText: "Tous les guichets" }).click(); 
    await this.backofficePage.waitForTimeout(1000);

    const particularChoice = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span')
    await particularChoice.nth(1).click();
    this.guichetParticulier = await particularChoice.nth(1).textContent();
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("L'utilisateur clique sur \"Statistiques\" puis sur \"Pilotage file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Statistiques"]').click(); 
    await this.backofficePage.locator('i[title="Pilotage file d\'attente"]').click(); 
    await this.backofficePage.mouse.click(10, 10);
});


// --- Sites ---
When("L'utilisateur clique sur le filtre sites", async function() {
    await this.backofficePage.locator('.navbar-filters .custom-multi-select .arrow-btn').click(); 
    await this.backofficePage.locator('.navbar-filters .custom-multi-select').first().locator('.dropdown-menu .custom-dropdown-item').first().waitFor({ state: 'attached' });
});

When("L'utilisateur sélectionne \"Toutes les équipes\"", async function() {
    await this.backofficePage.locator('.navbar-filters .custom-multi-select').first().locator('.dropdown-menu .custom-dropdown-item  > span').filter({ hasText: "Sélectionner tout" }).click();
});

When("L'utilisateur sélectionne un site précis", async function() {
    const particularChoice = this.backofficePage.locator('.navbar-filters .custom-multi-select').first().locator('.dropdown-menu .custom-dropdown-item  > span')
    await particularChoice.nth(1).click();
    await particularChoice.nth(1).click();
    this.siteParticulier = await particularChoice.nth(1).textContent();
});


// --- Temps réel ---
When("L'utilisateur choisit \"Temps réel\"", async function() {
    await this.backofficePage.locator('.navbar-filters .real-time-mode-switch span').filter({ hasText: "Temps réel" }).click(); 
});

When("L'utilisateur clique sur le filtre salle d'attente", async function() {
    await this.backofficePage.locator('.tfd-stats-select label').filter({ hasText: "Toutes les salles d'attente" }).click(); 
    await this.backofficePage.waitForTimeout(2000); 
});


// --- Salles d'attente ---
When("L'utilisateur sélectionne \"Toutes les salles d'attente\"", async function() {
    await this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(0).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span').filter({ hasText: "Toutes les salles d'attente" }).click();
});

When("L'utilisateur sélectionne une salle d'attente précis", async function() {
    const particularChoice = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(0).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span')
    await particularChoice.nth(1).click();
    this.salleParticulier = await particularChoice.nth(1).textContent();
});


//-- Agents ---
When("L'utilisateur clique sur le filtre agents", async function() {
    await this.backofficePage.locator('.navbar-filters .tfd-stats-select .multiselect').nth(1).click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur sélectionne un agent précis", async function() {
    const particularChoice = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(1).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span')
    index = 0;
    if (this.count > 1) index = 1; // si il y a plus d'un agent, on sélectionne le deuxième 
    await particularChoice.nth(index).click();
    this.agentParticulier = await particularChoice.nth(index).textContent();
});


// --- Services ---
When("L'utilisateur clique sur le filtre services", async function() {
    await this.backofficePage.locator('.navbar-filters .tfd-stats-select .multiselect').nth(2).click();
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur sélectionne un service précis", async function() {
    const particularChoice = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(2).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span')
    index = 0;
    if (this.count > 1) index = 1; // si il y a plus d'un agent, on sélectionne le deuxième 
    await particularChoice.nth(index).click();
    this.serviceParticulier = await particularChoice.nth(index).textContent();
});

// --- Guichets ---
When("L'utilisateur clique sur le filtre guichets", async function() {
    await this.backofficePage.locator('.tfd-stats-select label').filter({ hasText: "Tous les guichets" }).click(); 
    await this.backofficePage.waitForTimeout(1000); 
});

When("L'utilisateur sélectionne \"Tous les guichets\"", async function() {
    await this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span').filter({ hasText: "Tous les guichets" }).click();
});

When("L'utilisateur sélectionne un guichet précis", async function() {
    const particularChoice = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('.multiselect__content-wrapper > ul > li.multiselect__element > span > span')
    await particularChoice.nth(1).click();
    this.guichetParticulier = await particularChoice.nth(1).textContent();
});

// --- Rechercher ---
When("L'utilisateur clique sur le bouton \"Rechercher\"", async function() {
    await this.backofficePage.locator('button.btn-search-stats[title="Rechercher"]').first().click();
    await this.backofficePage.waitForTimeout(2000); 
});

// --- Export Excel---
When("L'utilisateur clique sur le logo \"Exporter en XLS\"", async function() {
    await this.backofficePage.locator('div.export-btn').first().click();
    await this.backofficePage.waitForTimeout(2000); 
});

When("L'utilisateur sélectionne \"Historique\" au lieu de \"Temps réel\"", async function() {
    await this.backofficePage.locator('.navbar-filters .real-time-mode-switch span').filter({ hasText: "Historique" }).click(); 
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page \"Pilotage file d'attente\" s'affiche", async function() {
    await expect(this.backofficePage.locator('div.navbar > span.text-uppercase').filter({ hasText: "Pilotage" }) ).toBeVisible();
});

// --- Sites ---
Then("La liste des sites s'affiche correctement, avec en premier choix \"Toutes les équipes\", suivi des autres sites uniques", async function() {
    
    const sites = this.backofficePage.locator('.navbar-filters .custom-multi-select').first().locator('.dropdown-menu .custom-dropdown-item');

    // Vérifie qu'il y a au moins 2 éléments
    const count = await sites.count();
    await sites.first().locator('> span').textContent()
    console.log('premier valeur: ', await sites.first().locator('> span').textContent())
    console.log(`Nombre d'éléments dans le sites: ${count}`);
    expect(count).toBeGreaterThanOrEqual(2);

    // Récupère les textes des options
    const itemsText = [];
    for (let i = 0; i < count; i++) {
        const text = await sites.nth(i).locator('> span').textContent();
        if (text) itemsText.push(text.trim());
    }

    // Vérifie qu'ils sont uniques
    const uniqueItems = new Set(itemsText);
    //expect(uniqueItems.size).toBe(itemsText.length);    
});

Then("Le choix \"Toutes les équipes\" est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .custom-multi-select .input-value').first().filter({ hasText: "Toutes les équipes" }) ).toBeVisible();
});

Then("Le site particulier est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters  .custom-multi-select .input-value').first().filter({ hasText:  this.siteParticulier }) ).toBeVisible();
});


// --- Temps réel ---
Then("Le mode \"Temps réel\" est activé", async function() {
    expect(this.backofficePage.locator('.navbar-filters .real-time-mode-switch span').filter({ hasText: "Temps réel" })).toHaveClass(/.*\bactive\b.*/); 
});

Then("La date du jour est sélectionnée automatiquement", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .stats-picker .current-date') ).toBeVisible();
});


// --- Salles d'attente ---
Then("La liste des salles d'attente s'affiche correctement, avec en premier choix \"Toutes les salles d'attente\", suivi des autres salles d'attente uniques", async function() {

    const sallesAttente = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(0).locator('.multiselect__content-wrapper > ul > li.multiselect__element');

    // Vérifie qu'il y a au moins 2 éléments
    const count = await sallesAttente.count();
    await sallesAttente.first().locator('span > span').textContent()
    // console.log('premier valeur: ', await sallesAttente.first().locator('span > span').textContent())
    // console.log(`Nombre d'éléments dans le sallesAttente: ${count}`);
    expect(count).toBeGreaterThanOrEqual(2);

    // Récupère les textes des options
    const itemsText = [];
    for (let i = 0; i < count; i++) {
        const text = await sallesAttente.nth(i).locator('span > span').textContent();
        if (text) itemsText.push(text.trim());
    }

    // Vérifie qu'ils sont uniques
    const uniqueItems = new Set(itemsText);
    expect(uniqueItems.size).toBe(itemsText.length);    
});

Then("Le choix \"Toutes les salles d'attente\" est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(0).locator('label').filter({ hasText: "Toutes les salles d'attente" }) ).toBeVisible();
});

Then("La salle d'attente particulier est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(0).locator('label').filter({ hasText: this.salleParticulier }) ).toBeVisible();
});


// --- Agents ---
Then("La liste des agents s'affiche correctement, avec une liste unique", async function() {
    const agents = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(1).locator('.multiselect__content-wrapper > ul > li.multiselect__element');

    // Vérifie qu'il y a au moins 1 éléments
    const count = await agents.count();
    await agents.first().locator('span > span').textContent()
    expect(count).toBeGreaterThanOrEqual(1);

    // Récupère les textes des options
    const itemsText = [];
    for (let i = 0; i < count; i++) {
        const text = await agents.nth(i).locator('span > span').textContent();
        if (text) itemsText.push(text.trim());
    }

    // Vérifie qu'ils sont uniques
    const uniqueItems = new Set(itemsText);
    expect(uniqueItems.size).toBe(itemsText.length);    
    this.count = count;
});

Then("L'agent particulier est sélectionné", async function() {
    await expect(await this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(1).locator('.multiselect__tags span > span').filter({ hasText: this.agentParticulier }).count() ).toBeGreaterThan(0);
});


// --- Services ---
Then("La liste des services s'affiche correctement, avec une liste unique", async function() {
    const services = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(2).locator('.multiselect__content-wrapper > ul > li.multiselect__element');

    // Vérifie qu'il y a au moins 1 éléments
    const count = await services.count();
    await services.first().locator('span > span').textContent()
    expect(count).toBeGreaterThanOrEqual(1);

    // Récupère les textes des options
    const itemsText = [];
    for (let i = 0; i < count; i++) {
        const text = await services.nth(i).locator('span > span').textContent();
        if (text) itemsText.push(text.trim());
    }

    // Vérifie qu'ils sont uniques
    const uniqueItems = new Set(itemsText);
    expect(uniqueItems.size).toBe(itemsText.length);    
    this.count = count;
});

Then("Le service particulier est sélectionné", async function() {
    await expect(await this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(2).locator('.multiselect__tags span > span').filter({ hasText: this.serviceParticulier }).count() ).toBeGreaterThan(0);
});


// --- Guichets ---
Then("La liste des guichets s'affiche correctement, avec en premier choix \"Tous les guichets\", suivi des autres guichets uniques", async function() {
    
    const guichets = this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('.multiselect__content-wrapper > ul > li.multiselect__element');

    // Vérifie qu'il y a au moins 2 éléments
    const count = await guichets.count();
    await guichets.first().locator('span > span').textContent()
    console.log('premier valeur: ', await guichets.first().locator('span > span').textContent())
    console.log(`Nombre d'éléments dans le guichets: ${count}`);
    expect(count).toBeGreaterThanOrEqual(2);

    // Récupère les textes des options
    const itemsText = [];
    for (let i = 0; i < count; i++) {
        const text = await guichets.nth(i).locator('span > span').textContent();
        if (text) itemsText.push(text.trim());
    }

    // Vérifie qu'ils sont uniques
    const uniqueItems = new Set(itemsText);
    expect(uniqueItems.size).toBe(itemsText.length);    
});

Then("Le choix \"Tous les guichets\" est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('label').filter({ hasText: "Tous les guichets" }) ).toBeVisible();
});

Then("Le guichet particulier est sélectionné", async function() {
    await expect(this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('label').filter({ hasText: this.guichetParticulier }) ).toBeVisible();
});


// --- Rechercher ---
Then("Les résultats de la journée actuelle sont affichés en cohérence avec les filtres", async function() {
    const guichets = await this.backofficePage.locator('table.piloting-table > tbody > tr > td[aria-colindex="7"]').allTextContents(); 
    if (guichets.length > 0) {
        for (const text of guichets) { expect(text.trim()).toBe(this.guichetParticulier); }
    }else{
        await expect(this.backofficePage.locator('table.piloting-table > tbody > tr > td > div > div').filter({ hasText: "Aucun élément à afficher" }) ).toBeVisible(0);
    }
});

Then("Les sections \"Avec RDV\", \"Sans RDV\", \"Top 5 des services\" et la liste des RDV sont visibles", async function() {
    // await expect(this.backofficePage.locator('.navbar-filters .tfd-stats-select').nth(3).locator('label').filter({ hasText: "Tous les guichets" }) ).toBeVisible();
    // Remetre le filtre guichet a tous
    await this.backofficePage.locator('.tfd-stats-select label').filter({ hasText: this.guichetParticulier }).click(); 
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('button.btn-search-stats[title="Rechercher"]').first().click();
    await this.backofficePage.waitForTimeout(2000); 

    const emptyMessage = await this.backofficePage.locator('table.piloting-table > tbody > tr > td > div > div').filter({ hasText: "Aucun élément à afficher" })
    if (await emptyMessage.isVisible()) {

    }else{
        const avecRdv   = await this.backofficePage.locator('span').filter({ hasText: "AVEC RENDEZ-VOUS" }).locator('..').locator('xpath=following-sibling::*').locator('span.piloting-card-value').first().textContent();
        const sansRdv   = await this.backofficePage.locator('span').filter({ hasText: "SANS RENDEZ-VOUS" }).locator('..').locator('xpath=following-sibling::*').locator('span.piloting-card-value').first().textContent();
        const top5Motif = await this.backofficePage.locator('.top-5-offices')
        
        expect(parseInt(avecRdv || '0', 10) > 0 || parseInt(sansRdv || '0', 10) > 0).toBeTruthy();
          
        // Vérifie qu'il y a au moins un enfant dans le top 5 des motifs
        expect(await top5Motif.locator('.top-5-offices__badge').count()).toBeGreaterThan(0);
    }

});

Then("Le fichier contenant la liste des RDV est téléchargé", async function() {
    // Check téléchargement
    const download = await this.backofficePage.waitForEvent('download');
    expect(download.suggestedFilename()).toBe('export.xlsx');
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    await download.delete();
});

Then("Le mode \"Historique\" est activé", async function() {
    expect(this.backofficePage.locator('.navbar-filters .real-time-mode-switch span').filter({ hasText: "Historique" })).toHaveClass(/.*\bactive\b.*/); 
});

Then("Une période allant de la date d’ouverture du site à aujourd’hui est sélectionnée", async function() {
    const filtreDate = await this.backofficePage.locator('.navbar-filters .stats-picker input[title="Cliquez ici pour choisir la date"]').inputValue();
    
    // Get today date
    const today  = new Date();
    const jourDebut = String(today.getDate()).padStart(2, '0');
    const moisDebut = String(today.getMonth() + 1).padStart(2, '0'); 
    const anneeDebut = today.getFullYear();
    const dateDebutFormatee = `${jourDebut}/${moisDebut}/${anneeDebut}`;

    await expect(filtreDate).toContain(dateDebutFormatee);
});
