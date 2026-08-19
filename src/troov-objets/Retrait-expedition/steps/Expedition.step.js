const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*----------------------------GIVEN------------------------------------------*/
Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url, { waitUntil: 'domcontentloaded' });
});

/*-----------------------------------WHEN-----------------------------------*/
When("L'utilisateur se connecte avec les identifiants SSO", async function () {
    await this.backofficePage.locator('input#email').fill('mairie@troov.com');
    await this.backofficePage.locator('input#password').fill('Hello(123)');
    await this.backofficePage.locator('button[type="submit"].btn-primary').click();
});

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const menuItem = this.backofficePage.locator(`span:has-text("${menu}"), a:has-text("${menu}")`).first();
    await expect(menuItem).toBeVisible({ timeout: 10000 });
    await menuItem.click();
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    if (nomOption === "Expédition") {
        // Lien précis d'après le HTML
        const expeditionLink = this.backofficePage.locator('a.side-nav-link-ref[href*="/matchings/delivery"]').first();
        await expect(expeditionLink).toBeVisible({ timeout: 10000 });
        await expeditionLink.click();
    } else if (nomOption === "Retrait") {
        const retraitLink = this.backofficePage.locator('a.side-nav-link-ref[href*="/matchings/withdraw"]').first();
        await expect(retraitLink).toBeVisible({ timeout: 10000 });
        await retraitLink.click();
    } else {
        const optionLink = this.backofficePage.locator(`a:has-text("${nomOption}")`).first();
        await expect(optionLink).toBeVisible({ timeout: 10000 });
        await optionLink.click();
    }
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    if (nomBouton === "Filtres") {
        const boutonFiltres = this.backofficePage.locator('button.btn-secondary[data-toggle="modal"][data-target="#filterModal"]');
        await expect(boutonFiltres).toBeVisible({ timeout: 10000 });
        await boutonFiltres.click();
    } else {
        const bouton = this.backofficePage.getByRole('button', { name: nomBouton }).first();
        await expect(bouton).toBeVisible({ timeout: 10000 });
        await bouton.click();
    }
});

/*-----------------------------------------THEN -------------------------------------*/
Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

Then("Le titre {string} s'affiche", async function (titre) {
    const titreElement = this.backofficePage.getByRole('heading', { name: titre }).first();
    await expect(titreElement).toBeVisible({ timeout: 10000 });
});

Then("La description {string} s'affiche", async function (description) {
    const desc = this.backofficePage.locator(`span[aria-current="location"]`, { hasText: description }).first();
    await expect(desc).toBeVisible({ timeout: 10000 });
});

Then("Les filtres principaux suivants sont visibles :", async function (dataTable) {
    const filtres = dataTable.raw().flat();

    for (const filtre of filtres) {
        if (filtre === "Nom mentionné") {
            await expect(
                this.backofficePage.locator('input[placeholder="Nom mentionné"]').first()
            ).toBeVisible({ timeout: 10000 });
        } else if (filtre === "# Référence") {
            await expect(
                this.backofficePage.locator('.vue-tags-input input[placeholder="# Référence"]').first()
            ).toBeVisible({ timeout: 10000 });
        }
    }
});

Then("Les boutons {string} et {string} s'affichent", async function (btn1, btn2) {
    await expect(
        this.backofficePage.locator('button.btn-primary:not([data-dismiss="modal"])').filter({ hasText: 'Rechercher' })
    ).toBeVisible({ timeout: 10000 });

    await expect(
        this.backofficePage.locator('button.btn-secondary[data-toggle="modal"]').filter({ hasText: 'Filtres' })
    ).toBeVisible({ timeout: 10000 });
});

Then("Les boutons de filtres rapides s'affichent :", async function (dataTable) {
    const boutons = dataTable.raw().flat();

    for (const bouton of boutons) {
        await expect(
            this.backofficePage.locator('button.btn-light.btn-sm').filter({ hasText: bouton })
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    await expect(
        this.backofficePage.locator('#dataExport').getByText(/Exporter les données/i)
    ).toBeVisible({ timeout: 10000 });
});

Then("Le tableau des expéditions s'affiche avec les colonnes :", async function (dataTable) {
    const colonnes = dataTable.raw().flat();

    for (const colonne of colonnes) {
        await expect(
            this.backofficePage.locator('#matching-data-table thead th').filter({ hasText: colonne })
        ).toBeVisible({ timeout: 10000 });
    }
});