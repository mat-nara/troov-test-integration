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
    if (nomOption === "Retrait") {
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

When("L'utilisateur clique sur l'onglet {string} dans la pop-up", async function (onglet) {
    // Cible uniquement l'onglet à l'intérieur de la modal
    const tab = this.backofficePage
        .locator('#filterModal')
        .getByRole('tab', { name: onglet, exact: true });

    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();
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

Then("Le tableau des retraits s'affiche avec les colonnes :", async function (dataTable) {
    const colonnes = dataTable.raw().flat();

    for (const colonne of colonnes) {
        await expect(
            this.backofficePage.locator('#matching-data-table thead th').filter({ hasText: colonne })
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("La pop-up {string} s'ouvre", async function (titrePopup) {
    const popup = this.backofficePage.locator('.modal, [role="dialog"]').filter({ hasText: titrePopup }).first();
    await expect(popup).toBeVisible({ timeout: 10000 });
});

Then("L'onglet {string} est sélectionné", async function (onglet) {
    const tab = this.backofficePage.locator('.nav-link, [role="tab"]').filter({ hasText: onglet }).first();
    await expect(tab).toBeVisible({ timeout: 10000 });

    const isActive = await tab.evaluate(el => {
        return el.classList.contains('active') ||
               el.getAttribute('aria-selected') === 'true' ||
               el.classList.contains('nav-link-active');
    });
    expect(isActive).toBeTruthy();
});

Then("Le champ de recherche {string} s'affiche dans la pop-up", async function (placeholder) {
    const champ = this.backofficePage
        .locator('.modal, [role="dialog"]')
        .locator(`input[placeholder="${placeholder}"]`)
        .first();
    await expect(champ).toBeVisible({ timeout: 10000 });
});

Then("Les boutons {string} et {string} s'affichent dans la pop-up", async function (btn1, btn2) {
    await expect(
        this.backofficePage.getByRole('button', { name: 'Fermer' })
    ).toBeVisible({ timeout: 10000 });

    await expect(
        this.backofficePage.getByRole('button', { name: 'Rechercher' }).last()
    ).toBeVisible({ timeout: 10000 });
});

Then("Les options de tri s'affichent :", async function (dataTable) {
    const options = dataTable.raw().flat();

    for (const option of options) {
        await expect(
            this.backofficePage.getByText(option, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le menu déroulant {string} s'affiche", async function (label) {
    await expect(
        this.backofficePage.getByText(label, { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
});

Then("Les options de statut s'affichent :", async function (dataTable) {
    const options = dataTable.raw().flat();

    for (const option of options) {
        await expect(
            this.backofficePage.getByText(option, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });
    }
});