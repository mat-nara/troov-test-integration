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
    if (menu === "Statistiques") {
        const menuItem = this.backofficePage.locator('a.side-nav-link-ref.has-dropdown').filter({ hasText: 'Statistiques' }).first();
        await expect(menuItem).toBeVisible({ timeout: 10000 });
        await menuItem.click();
    } else {
        const menuItem = this.backofficePage.locator(`span:has-text("${menu}"), a:has-text("${menu}")`).first();
        await expect(menuItem).toBeVisible({ timeout: 10000 });
        await menuItem.click();
    }
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    if (nomOption === "Stock d'objets trouvés") {
        // Lien précis d'après le HTML
        const stockLink = this.backofficePage.locator('a.side-nav-link-ref[href*="/stats/stock"]').filter({ hasText: "Stock d'objets trouvés" }).first();
        await expect(stockLink).toBeVisible({ timeout: 10000 });
        await stockLink.click();
    } else if (nomOption === "Statistiques d'objets trouvés" || nomOption === "Statistiques d'objet trouvés") {
        const statsLink = this.backofficePage.locator('a.side-nav-link-ref[href*="/stats"]').filter({ hasText: "Statistiques d'objet trouvés" }).first();
        await expect(statsLink).toBeVisible({ timeout: 10000 });
        await statsLink.click();
    } else {
        const optionLink = this.backofficePage.locator(`a:has-text("${nomOption}")`).first();
        await expect(optionLink).toBeVisible({ timeout: 10000 });
        await optionLink.click();
    }
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

When("L'utilisateur clique sur le filtre {string}", async function (nomFiltre) {
    if (nomFiltre === "Type de destinataire") {
        // Clic précis d'après ton exemple
        await this.backofficePage.locator('div:nth-child(3) > .multiselect > .multiselect__select').click();
    } else {
        const filtre = this.backofficePage.getByText(nomFiltre, { exact: false }).first();
        await expect(filtre).toBeVisible({ timeout: 10000 });
        await filtre.click();
    }
});


When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    if (nomBouton === "Exporter les données") {
        const boutonExport = this.backofficePage.locator('#dropdown-1__BV_toggle_, button').filter({ 
            hasText: /Exporter les données/i 
        }).first();
        await expect(boutonExport).toBeVisible({ timeout: 10000 });
        await boutonExport.click();
    } else if (nomBouton === "Rechercher") {
        await this.backofficePage.locator('button.btn-primary').filter({ hasText: 'Rechercher' }).click();
    } else {
        const bouton = this.backofficePage.getByRole('button', { name: nomBouton }).first();
        await expect(bouton).toBeVisible({ timeout: 10000 });
        await bouton.click();
    }
});

When("L'utilisateur clique sur l'option d'export {string}", async function (option) {
    const optionExport = this.backofficePage.getByRole('menuitem', { name: option }).first();
    await expect(optionExport).toBeVisible({ timeout: 10000 });
    
    const downloadPromise = this.backofficePage.waitForEvent('download', { timeout: 15000 });
    await optionExport.click();
    this.download = await downloadPromise;
});

/*-----------------------------------------THEN -------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

Then("Le titre {string} s'affiche", async function (titre) {
    const titreElement = this.backofficePage.locator('span[title*="Tableau des entrées"], h1').filter({ 
        hasText: /Tableau des entrées et sorties du stock/i 
    }).first();
    
    await expect(titreElement).toBeVisible({ timeout: 10000 });
});

Then("Le filtre partenaire s'affiche", async function () {
    await expect(
        this.backofficePage.locator('.multiselect').filter({ hasText: /équipe|Mairie/i }).first()
    ).toBeVisible({ timeout: 10000 });
});

Then("Le champ de plage de dates s'affiche", async function () {
    await expect(
        this.backofficePage.locator('input[placeholder="Cliquez ici pour choisir la date"]')
    ).toBeVisible({ timeout: 10000 });
});

Then("Le filtre {string} s'affiche", async function (nomFiltre) {
    if (nomFiltre === "Type de destinataire") {
        await expect(
            this.backofficePage.locator('.multiselect').filter({ hasText: /Type de destinataire|Destinataire/i }).first()
        ).toBeVisible({ timeout: 10000 });
    } else {
        await expect(
            this.backofficePage.getByText(nomFiltre, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Les boutons {string} et {string} s'affichent", async function (btn1, btn2) {
    // Bouton Exporter les données
    await expect(
        this.backofficePage.locator('button').filter({ hasText: /Exporter les données/i })
    ).toBeVisible({ timeout: 10000 });

    // Bouton Rechercher
    await expect(
        this.backofficePage.locator('button.btn-primary').filter({ hasText: 'Rechercher' })
    ).toBeVisible({ timeout: 10000 });
});

Then("Le lien {string} s'affiche en haut à droite", async function (texteLien) {
    await expect(
        this.backofficePage.locator('span[aria-current="location"]').filter({ hasText: texteLien })
    ).toBeVisible({ timeout: 10000 });
});

Then("Les 4 blocs de données s'affichent :", async function (dataTable) {
    const blocs = dataTable.raw().flat();

    for (const bloc of blocs) {
        const regex = new RegExp(bloc.replace(/'/g, "[’']"), "i");
        
        await expect(
            this.backofficePage.locator('.title-size-stats').filter({ hasText: regex })
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le bloc {string} s'affiche", async function (nomBloc) {
    const regex = new RegExp(nomBloc.replace(/'/g, "[’']"), "i");
    
    await expect(
        this.backofficePage.locator('.title-size-stats').filter({ hasText: regex })
    ).toBeVisible({ timeout: 10000 });
});

Then("Les options du filtre type de destinataire s'affichent", async function () {
    // On utilise .first() pour éviter le strict mode
    await expect(
        this.backofficePage.getByRole('option', { name: 'Destinataire', exact: true }).first()
    ).toBeVisible({ timeout: 10000 });

    await expect(
        this.backofficePage.getByRole('option', { name: 'Type de destinataire', exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
});

Then("L'utilisateur peut sélectionner une option et filtrer les résultats", async function () {
    await this.backofficePage.getByRole('option', { name: 'Type de destinataire', exact: true }).first().click();

    const boutonRechercher = this.backofficePage.locator('button.btn-primary').filter({ hasText: 'Rechercher' });
    await expect(boutonRechercher).toBeVisible({ timeout: 10000 });
    await boutonRechercher.click();

    await this.backofficePage.waitForLoadState('domcontentloaded');
});

Then("Le menu {string} reste visible", async function (nomMenu) {
    await expect(
        this.backofficePage.locator('a.side-nav-link-ref, span').filter({ hasText: nomMenu }).first()
    ).toBeVisible({ timeout: 10000 });
});

Then("Les options d'export s'affichent :", async function (dataTable) {
    const options = dataTable.raw().flat();

    for (const option of options) {
        await expect(
            this.backofficePage.getByRole('menuitem', { name: option }).first()
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le fichier se télécharge directement", async function () {
    expect(this.download).toBeDefined();
    const fileName = this.download.suggestedFilename();
    console.log('Fichier téléchargé :', fileName);
    
    expect(fileName).toBeTruthy();
});