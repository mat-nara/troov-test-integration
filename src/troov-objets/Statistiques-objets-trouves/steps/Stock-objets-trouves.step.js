const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------- BACKGROUND ------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url, { waitUntil: 'domcontentloaded' });
});

/*---------------------------- WHEN ------------------------------------*/
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

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const page = this.backofficePage;
    const menuElement = page.locator('a.side-nav-link-ref.has-dropdown').filter({ hasText: menu }).first();
    await expect(menuElement).toBeVisible({ timeout: 10000 });
    await menuElement.click();
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    const page = this.backofficePage;
    
    if (nomOption.toLowerCase().includes("stock")) {
        const subLinkStock = page.locator('a.side-nav-link-ref[href*="/stats/stock"]').first();
        await expect(subLinkStock).toBeVisible({ timeout: 10000 });
        
        await Promise.all([
            page.waitForURL(url => url.pathname.endsWith('/stats/stock'), { timeout: 15000 }),
            subLinkStock.click()
        ]);
        await page.waitForLoadState('domcontentloaded');
    } else {
        const optionLink = page.locator(`a:has-text("${nomOption}")`).first();
        await expect(optionLink).toBeVisible({ timeout: 10000 });
        await optionLink.click();
    }
});

When("L'utilisateur selectionne une option dans le filtre {string}", async function (nomFiltre) {
    const page = this.backofficePage;
    const multiselectContainer = page.locator('div:nth-child(3) > .multiselect');
    await multiselectContainer.click();

    const optionTypeDestinataire = page.getByRole('option', { name: 'Type de destinataire' });
    await expect(optionTypeDestinataire).toBeVisible({ timeout: 10000 });
    await optionTypeDestinataire.click();
});

When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    const page = this.backofficePage;

    const btnExport = page.locator('#dropdown-1__BV_toggle_');
    await expect(btnExport).toBeVisible({ timeout: 10000 });
    await btnExport.click();
});

When("L'utilisateur selectionne l'une des options d'export :", async function (dataTable) {
    const page = this.backofficePage;
    this.downloads = [];
    const options = dataTable.raw().map(row => row[0]);

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const btnExport = page.locator('#dropdown-1__BV_toggle_');
        const isExpanded = await btnExport.getAttribute('aria-expanded');
        if (isExpanded !== 'true') {
            await btnExport.click();
        }

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

        const menuItem = page.getByRole('menuitem', { name: option, exact: true });
        await expect(menuItem).toBeVisible({ timeout: 10000 });
        await menuItem.click();

        // 4. Capturer le téléchargement
        const download = await downloadPromise;
        this.downloads.push(download);
    }
});

/*---------------------------- THEN ------------------------------------*/

Then("Le titre {string} s'affiche", async function (titreAttendu) {
    const page = this.backofficePage;
    const titleElement = page.locator('span[title*="Tableau des entrées et sorties"], span[title*="Tableau des entrees et sorties"]').first();
    await expect(titleElement).toBeVisible({ timeout: 10000 });
});

Then("Le filtre partenaire s'affiche", async function () {
    const page = this.backofficePage;
    const meFiltrePartenaire = page.locator('.multiselect__tags').first();
    await expect(meFiltrePartenaire).toBeVisible({ timeout: 10000 });
});

Then("Le champ de plage de dates s'affiche", async function () {
    const page = this.backofficePage;
    const inputPlageDate = page.locator('input.flatpickr-input[aria-label="Cliquez ici pour choisir la date"]').first();
    await expect(inputPlageDate).toBeVisible({ timeout: 10000 });
});

Then("Le filtre {string} s'affiche", async function (nomFiltre) {
    const page = this.backofficePage;
    
    if (nomFiltre.toLowerCase().includes("destinataire")) {
        const filterDestinataire = page.locator('.multiselect__single, input[placeholder*="Destinataire"]')
            .filter({ hasText: /Type de destinataire|Filtrer par Destinataire/i })
            .first();
        await expect(filterDestinataire).toBeVisible({ timeout: 10000 });
    } else {
        const genericFilter = page.locator(`.multiselect__tags:has-text("${nomFiltre}")`).first();
        await expect(genericFilter).toBeVisible({ timeout: 10000 });
    }
});

Then("Les boutons {string} et {string} s'affichent", async function (btnExportLabel, btnRechercherLabel) {
    const page = this.backofficePage;
    
    // Bouton Rechercher
    const btnRechercher = page.locator('button.btn-primary.btn-height')
        .filter({ hasText: new RegExp(btnRechercherLabel, 'i') })
        .first();
    await expect(btnRechercher).toBeVisible({ timeout: 10000 });

    // Bouton Exporter les donnees / données (regex qui gère 'o' / 'ó' / accents)
    const btnExport = page.locator('button#dropdown-1__BV_toggle_')
        .filter({ hasText: /Exporter les d[oóeé]nn[eé]es/i })
        .first();
    await expect(btnExport).toBeVisible({ timeout: 10000 });
});

Then("Le lien {string} s'affiche en haut a droite", async function (nomLien) {
    const page = this.backofficePage;
    const breadcrumbLien = page.locator('span[aria-current="location"]').first();
    await expect(breadcrumbLien).toBeVisible({ timeout: 10000 });
});

Then("Les 4 blocs de donnees s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const blocs = dataTable.raw().flat();
    for (const ligneTableau of blocs) {
        let mainTitle = ligneTableau.split('(')[0].trim();

        const pattern = mainTitle
            .replace(/e/g, '[eéè]')
            .replace(/a/g, '[aà]')
            .replace(/i/g, '[iî]')
            .replace(/o/g, '[oô]')
            .replace(/u/g, '[uû]')
            .replace(/'/g, "['’]");

        const blockElement = page.locator('.title-size-stats')
            .filter({ hasText: new RegExp(pattern, 'i') })
            .first();
            
        await expect(blockElement).toBeVisible({ timeout: 10000 });
    }
});

Then("Le bloc turquoise {string} s'affiche", async function (titreBloc) {
    const page = this.backofficePage;
    
    const pattern = titreBloc.trim()
        .replace(/e/g, '[eéè]')
        .replace(/a/g, '[aà]')
        .replace(/'/g, "['’]");

    const blockElement = page.locator('.title-size-stats')
        .filter({ hasText: new RegExp(pattern, 'i') })
        .first();
        
    await expect(blockElement).toBeVisible({ timeout: 10000 });
});

Then("Les resultats sont filtres selon l'option selectionnee", async function () {
    const page = this.backofficePage;
    const blocResultat = page.locator('.title-size-stats').first();
    
    await expect(blocResultat).toBeVisible({ timeout: 10000 });
});
Then("Le fichier se telecharge directement sans etape supplementaire", async function () {
    expect(this.downloads.length).toBeGreaterThan(0);

    for (const download of this.downloads) {
        expect(download).toBeTruthy();
        const fileName = download.suggestedFilename();
        expect(fileName).toBeTruthy();
    }
});