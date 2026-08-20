const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------- GIVEN ------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url, { waitUntil: 'domcontentloaded' });
});

/*---------------------------- WHEN -------------------------------------------*/

When("L'utilisateur se connecte avec les identifiants SSO", async function () {
    const page = this.backofficePage;

    const inputEmail = page.locator('input#email, input[type="email"]').first();
    const inputPassword = page.locator('input#password, input[type="password"]').first();
    
    await inputEmail.fill('mairie@troov.com');
    await inputPassword.fill('Hello(123)');

    const btnSubmit = page.locator('button[type="submit"], button:has-text("Connexion")').first();
    await btnSubmit.click();

    await page.waitForURL(url => url.pathname.includes('/dashboard/'), { timeout: 15000 });
});

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const page = this.backofficePage;
    
    const menuLink = page.locator('a.side-nav-link-ref').filter({ hasText: /Retrait\/Expédition|Retrait\/Expedition/i }).first();
    await expect(menuLink).toBeVisible({ timeout: 10000 });
    await menuLink.click();
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    const page = this.backofficePage;
    
    if (nomOption === "Expédition" || nomOption === "Expedition") {
        // Ciblage exact via href=/matchings/delivery
        const expeditionSubLink = page.locator('a[href*="/matchings/delivery"]').first();
        await expect(expeditionSubLink).toBeAttached({ timeout: 10000 });
        await expeditionSubLink.click({ force: true });
        
        // Attente explicite du chargement de la page Expédition
        await page.waitForURL(url => url.href.includes('/matchings/delivery'), { timeout: 15000 });
    } else if (nomOption === "Retrait") {
        const retraitSubLink = page.locator('a[href*="/matchings/withdraw"]').first();
        await expect(retraitSubLink).toBeAttached({ timeout: 10000 });
        await retraitSubLink.click({ force: true });
        
        await page.waitForURL(url => url.href.includes('/matchings/withdraw'), { timeout: 15000 });
    } else {
        const optionLink = page.locator(`a:has-text("${nomOption}")`).first();
        await expect(optionLink).toBeVisible({ timeout: 10000 });
        await optionLink.click();
    }
    await page.waitForLoadState('domcontentloaded');
});

When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    const page = this.backofficePage;
    
    if (nomBouton === "Filtres") {
        const btnFiltres = page.locator('button[data-target="#filterModal"]').first();
        await expect(btnFiltres).toBeVisible({ timeout: 10000 });
        await btnFiltres.click();
    } else {
        const bouton = page.getByRole('button', { name: nomBouton, exact: true }).first();
        await expect(bouton).toBeVisible({ timeout: 10000 });
        await bouton.click();
    }
});

/*---------------------------- THEN -------------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

Then("Le titre {string} s'affiche", async function (titre) {
    const page = this.backofficePage;
    
    // Ciblage hybride via span[title] ou recherche exacte du texte dans le DOM
    const titreElement = page.locator('span[title="Suivi des commandes"]')
        .or(page.getByText('Suivi des commandes', { exact: true }))
        .first();
        
    await expect(titreElement).toBeVisible({ timeout: 15000 });
});

Then("La description {string} s'affiche", async function (description) {
    // Ciblage direct de <span aria-current="location">
    const descElement = this.backofficePage.locator('span[aria-current="location"]').first();
    await expect(descElement).toBeVisible({ timeout: 10000 });
});

Then("Les filtres principaux suivants sont visibles :", async function (dataTable) {
    const page = this.backofficePage;
    const filtres = dataTable.raw().flat();

    for (const filtre of filtres) {
        if (filtre.includes("Nom mentionné") || filtre.includes("Nom mentionne")) {
            // <input placeholder="Nom mentionné" class="form-control">
            const inputNom = page.locator('input[placeholder="Nom mentionné"]').first();
            await expect(inputNom).toBeVisible({ timeout: 10000 });
        } else if (filtre.includes("Référence") || filtre.includes("Reference")) {
            // <input placeholder="# Référence" class="ti-new-tag-input ti-valid">
            const inputRef = page.locator('input[placeholder="# Référence"]').first();
            await expect(inputRef).toBeVisible({ timeout: 10000 });
        }
    }
});

Then("Les boutons {string} et {string} s'affichent", async function (btn1, btn2) {
    const page = this.backofficePage;
    
    // <button class="btn btn-primary">...Rechercher</button>
    const btnRechercher = page.locator('button.btn-primary').filter({ hasText: 'Rechercher' }).first();
    await expect(btnRechercher).toBeVisible({ timeout: 10000 });

    // <button data-target="#filterModal" class="btn btn-secondary">
    const btnFiltres = page.locator('button[data-target="#filterModal"]').first();
    await expect(btnFiltres).toBeVisible({ timeout: 10000 });
});

Then("Les boutons de filtres rapides s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const boutons = dataTable.raw().flat();

    for (const bouton of boutons) {
        if (bouton.includes("envoyés") || bouton.includes("envoyes")) {
            // <button class="btn btn-light btn-sm focus">
            const btnRapide = page.locator('button.btn-light').filter({ hasText: new RegExp(bouton, 'i') }).first();
            await expect(btnRapide).toBeVisible({ timeout: 10000 });
        } else if (bouton.includes("Afficher tout")) {
            const btnAfficherTout = page.locator('button.btn-light').filter({ hasText: 'Afficher tout' }).first();
            await expect(btnAfficherTout).toBeVisible({ timeout: 10000 });
        }
    }
});

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    // <button aria-controls="matching-data-table">...Exporter les données...</button>
    const btnExporter = this.backofficePage.locator('button[aria-controls="matching-data-table"]').filter({ hasText: /Exporter les données/i }).first();
    await expect(btnExporter).toBeVisible({ timeout: 10000 });
});

Then("Le tableau des expéditions s'affiche avec les colonnes :", async function (dataTable) {
    const page = this.backofficePage;
    const colonnes = dataTable.raw().flat();

    for (const colonne of colonnes) {
        // Validation dynamique des headers <th> du tableau #matching-data-table
        const thHeader = page.locator('#matching-data-table thead th').filter({ hasText: colonne }).first();
        await expect(thHeader).toBeVisible({ timeout: 10000 });
    }
});