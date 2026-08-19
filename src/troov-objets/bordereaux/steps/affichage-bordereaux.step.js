const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*----------------------------GIVEN------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

/*-----------------------------------WHEN-----------------------------------*/

When(
    "L'utilisateur se connecte avec les identifiants SSO {string} et {string}",
    async function (email, password) {
        const page = this.backofficePage;

        await page.locator('input#email, input[type="email"]').fill(email);
        await page.locator('input#password, input[type="password"]').fill(password);
        await page.locator('button[type="submit"].btn-primary, button:has-text("Connexion")').click();

        await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });
    }
);

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const page = this.backofficePage;
    let menuItem;

    if (menu === "Bordereaux") {
        // Ciblage précis basé sur la balise <a href=".../transmissions">
        menuItem = page.locator('a[href*="/transmissions"]').or(
            page.locator('a.side-nav-link-ref', { hasText: 'Bordereaux' })
        ).first();
    } else {
        menuItem = page.locator('a.side-nav-link-ref, .sidebar-menu a').filter({ hasText: menu }).first();
    }

    await expect(menuItem).toBeVisible({ timeout: 10000 });
    await menuItem.click();
});

/*-----------------------------------------THEN -------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

Then("La page des bordereaux s'affiche correctement", async function () {
    const table = this.backofficePage.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
});

Then("Les filtres {string}, {string}, {string} s'affichent", async function (filtre1, filtre2, filtre3) {
    const page = this.backofficePage;

    // Filtre Période
    const datePicker = page.locator('#tx-filter-dpk, input[name="tx-datepicker"]');
    await expect(datePicker).toBeVisible({ timeout: 10000 });

    // Filtre Statut
    const typeFilter = page.locator('[name="tx-filter-type"], [aria-label="Type"]').first();
    await expect(typeFilter).toBeVisible({ timeout: 10000 });

    // Filtre Destinataire
    const contactFilter = page.locator('[name="tx-filter-contact"], [aria-label="Contact"]').first();
    await expect(contactFilter).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche en haut a droite", async function (nomBouton) {
    const button = this.backofficePage.locator('button[aria-label="Créer manuellement"]').or(
        this.backofficePage.getByRole('button', { name: /créer manuellement|\+ ajouter un bordereau/i })
    ).first();

    await expect(button).toBeVisible({ timeout: 10000 });
});

Then("La liste des bordereaux s'affiche avec les colonnes :", async function (dataTable) {
    const page = this.backofficePage;
    const colonnesRecherchees = dataTable.raw().flat();

    const mappingColonnes = {
        "Nom": "Nom",
        "Statut": "Statut",
        "Destinataire": "Contact",
        "Objets": "Objets",
        "Date de declaration": "Date"
    };

    for (const nomCol of colonnesRecherchees) {
        const nomAttenduHTML = mappingColonnes[nomCol] || nomCol;
        const headerCell = page.locator('th').filter({ hasText: nomAttenduHTML }).first();
        await expect(headerCell).toBeVisible({ timeout: 10000 });
    }
});