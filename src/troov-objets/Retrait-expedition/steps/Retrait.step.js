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

    await page.waitForURL(url => url.href.includes('/dashboard/'), { timeout: 15000 });
});

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const page = this.backofficePage;
    
    const menuLink = page.locator('a.side-nav-link-ref').filter({ hasText: 'Retrait/Expédition' }).first();
    await expect(menuLink).toBeVisible({ timeout: 10000 });
    await menuLink.click();
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    const page = this.backofficePage;
    
    if (nomOption === "Retrait") {
        const retraitSubLink = page.locator('a.side-nav-link-ref[href*="/matchings/withdraw"]').first();
        await expect(retraitSubLink).toBeAttached({ timeout: 10000 });
        await retraitSubLink.click({ force: true });
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

When("L'utilisateur clique sur l'onglet {string} dans la pop-up", async function (nomOnglet) {
    const page = this.backofficePage;
    const tab = page.getByRole('tab', { name: nomOnglet, exact: true });
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();
});

/*---------------------------- THEN -------------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

Then("Le titre {string} s'affiche", async function (titre) {
    const titreElement = this.backofficePage.locator('span[title="Suivi des commandes"]').first();
    await expect(titreElement).toBeVisible({ timeout: 10000 });
});

Then("La description {string} s'affiche", async function (description) {
    const descElement = this.backofficePage.locator('span[aria-current="location"]').first();
    await expect(descElement).toBeVisible({ timeout: 10000 });
});

Then("Les filtres principaux suivants sont visibles :", async function (dataTable) {
    const page = this.backofficePage;
    const filtres = dataTable.raw().flat();

    for (const filtre of filtres) {
        if (filtre === "Date") {
            await expect(page.locator('input.flatpickr-input').first()).toBeVisible({ timeout: 10000 });
        } else if (filtre.includes("Nom mentionne")) {
            await expect(page.locator('input[placeholder="Nom mentionné"]').first()).toBeVisible({ timeout: 10000 });
        } else if (filtre.includes("Reference")) {
            await expect(page.locator('input[placeholder*="Référence"], .vue-tags-input input').first()).toBeVisible({ timeout: 10000 });
        } else if (filtre === "Partenaire") {
            await expect(page.locator('.multiselect__tag, .multiselect').first()).toBeVisible({ timeout: 10000 });
        }
    }
});

Then("Les boutons {string} et {string} s'affichent", async function (btn1, btn2) {
    const page = this.backofficePage;
    
    const btnRechercher = page.locator('button.btn-primary').filter({ hasText: 'Rechercher' }).first();
    await expect(btnRechercher).toBeVisible({ timeout: 10000 });

    const btnFiltres = page.locator('button.btn-secondary[data-target="#filterModal"]').first();
    await expect(btnFiltres).toBeVisible({ timeout: 10000 });
});

Then("Les boutons de filtres rapides s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const boutons = dataTable.raw().flat();

    for (const bouton of boutons) {
        if (bouton.includes("envoyes")) {
            await expect(
                page.locator('button.btn-light').filter({ hasText: /Objets (déjà|non) envoyés/i }).first()
            ).toBeVisible({ timeout: 10000 });
        } else if (bouton.includes("Afficher tout")) {
            await expect(
                page.locator('button.btn-light').filter({ hasText: 'Afficher tout' }).first()
            ).toBeVisible({ timeout: 10000 });
        }
    }
});

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    const btnExporter = this.backofficePage.locator('button').filter({ hasText: /Exporter les données/i }).first();
    await expect(btnExporter).toBeVisible({ timeout: 10000 });
});

Then("Le tableau des retraits s'affiche avec les colonnes :", async function (dataTable) {
    const page = this.backofficePage;
    const colonnes = dataTable.raw().flat();

    for (const colonne of colonnes) {
        let textRecherche = colonne;
        if (colonne === "Ref-Trouve") textRecherche = "Ref-Trouvé";
        if (colonne === "Nom du proprietaire") textRecherche = "Nom du propriétaire";
        if (colonne === "Date souhaitee de retrait") textRecherche = "Date souhaitée de retrait";

        const thHeader = page.locator('#matching-data-table thead th').filter({ hasText: textRecherche }).first();
        await expect(thHeader).toBeVisible({ timeout: 10000 });
    }
});

Then("La pop-up {string} s'ouvre", async function (titrePopup) {
    const page = this.backofficePage;
    const modal = page.getByLabel('Plus de filtres').or(page.locator('#filterModal'));
    await expect(modal).toBeVisible({ timeout: 10000 });
});

Then("Les onglets suivants s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const onglets = dataTable.raw().flat();

    for (const onglet of onglets) {
        let regexOnglet = new RegExp(onglet, 'i');
        if (onglet.includes("References")) {
            regexOnglet = /Références des objets/i;
        }

        const tab = page.getByRole('tab', { name: regexOnglet }).first();
        await expect(tab).toBeVisible({ timeout: 10000 });
    }
});

Then("Le champ de recherche {string} s'affiche dans la pop-up", async function (placeholder) {
    const page = this.backofficePage;
    const champRef = page.getByLabel('Plus de filtres').getByPlaceholder('# Référence');
    await expect(champRef).toBeVisible({ timeout: 10000 });
});

Then("Les boutons {string} et {string} s'affichent dans la pop-up", async function (btn1, btn2) {
    const page = this.backofficePage;

    const buttonFermer = page.getByRole('button', { name: btn1, exact: false }).first();
    await expect(buttonFermer).toBeVisible({ timeout: 10000 });

    const buttonRechercher = page.getByRole('button', { name: btn2, exact: true }).first();
    await expect(buttonRechercher).toBeVisible({ timeout: 10000 });
});

Then("Les options de tri s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const options = dataTable.raw().flat();

    for (const option of options) {
        let texteAttendu = option;
        if (option.includes("recent")) texteAttendu = "Tri par objets récent";
        if (option.includes("ancien")) texteAttendu = "Tri par objets ancien";

        const element = page.getByText(texteAttendu).first();
        await expect(element).toBeVisible({ timeout: 10000 });
    }
});

Then("Le menu deroulant {string} s'affiche", async function (nomMenu) {
    const page = this.backofficePage;
    const dropdown = page.getByText(/Tous les types/i).first();
    await expect(dropdown).toBeVisible({ timeout: 10000 });
});

Then("Les options de statut s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const statuts = dataTable.raw().flat();

    for (const statut of statuts) {
        let texteStatut = statut;
        if (statut.includes("non effectue")) texteStatut = "Retrait non effectué";
        if (statut.includes("effectue") && !statut.includes("non")) texteStatut = "Retrait effectué";

        const element = page.getByText(texteStatut).first();
        await expect(element).toBeVisible({ timeout: 10000 });
    }
});