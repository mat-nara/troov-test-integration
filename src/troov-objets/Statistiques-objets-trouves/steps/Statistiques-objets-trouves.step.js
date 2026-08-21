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
    
    const menuStatistiques = page.locator('a.side-nav-link-ref.has-dropdown').filter({ hasText: menu }).first();
    await expect(menuStatistiques).toBeVisible({ timeout: 10000 });
    await menuStatistiques.click();
});

When("L'utilisateur clique sur {string}", async function (nomOption) {
    const page = this.backofficePage;
    
    if (nomOption.includes("Statistiques")) {
        const subLinkStats = page.locator('a.side-nav-link-ref[href*="/stats"]').first();
        await expect(subLinkStats).toBeVisible({ timeout: 10000 });
        
        await Promise.all([
            page.waitForURL(url => url.pathname.endsWith('/stats'), { timeout: 15000 }),
            subLinkStats.click()
        ]);
        await page.waitForLoadState('domcontentloaded');
    } else {
        const optionLink = page.locator(`a:has-text("${nomOption}")`).first();
        await expect(optionLink).toBeVisible({ timeout: 10000 });
        await optionLink.click();
    }
});

When("L'utilisateur clique sur le champ de plage de dates", async function () {
    const page = this.backofficePage;
    const inputDate = page.locator('input.flatpickr-input[aria-label="Cliquez ici pour choisir la date"], input.flatpickr-input[placeholder="Cliquez ici pour choisir la date"]').first();
    await expect(inputDate).toBeVisible({ timeout: 10000 });
    await inputDate.click();
});

/*----------------------------  THEN -------------------------------------*/

Then("Le titre {string} s'affiche avec la date et l'heure", async function (titre) {
    const page = this.backofficePage;
    const titleElement = page.locator('span[title^="Vos statistiques"]').first();
    await expect(titleElement).toBeVisible({ timeout: 10000 });
});

Then("Le filtre partenaire s'affiche", async function () {
    const page = this.backofficePage;
    const meFiltrePartenaire = page.locator('.multiselect__tag').first();
    await expect(meFiltrePartenaire).toBeVisible({ timeout: 10000 });
});

Then("Le champ de plage de dates s'affiche", async function () {
    const page = this.backofficePage;
    const inputPlageDate = page.locator('input.flatpickr-input[aria-label="Cliquez ici pour choisir la date"]').first();
    await expect(inputPlageDate).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    const page = this.backofficePage;
    const bouton = page.getByRole('button', { name: nomBouton }).first();
    await expect(bouton).toBeVisible({ timeout: 10000 });
});

Then("Le lien {string} s'affiche en haut à droite", async function (nomLien) {
    const page = this.backofficePage;
    const breadcrumbLien = page.locator('span[aria-current="location"]').filter({ hasText: /Statistiques d'objet/i }).first();
    await expect(breadcrumbLien).toBeVisible({ timeout: 10000 });
});

Then("Les 4 blocs de statistiques s'affichent :", async function (dataTable) {
    const page = this.backofficePage;
    const blocs = dataTable.raw().flat();

    for (const titreBloc of blocs) {
        const blocHeader = page.locator('.card-title, h3.card-title, h4.card-title').filter({ hasText: titreBloc.trim() }).first();
        await expect(blocHeader).toBeVisible({ timeout: 10000 });
    }
});

Then("Le graphique {string} affiche des barres vertes et son total", async function (titreGraph) {
    const page = this.backofficePage;
    const cardPerdus = page.locator('.card').filter({ hasText: titreGraph }).first();
    
    await expect(cardPerdus).toBeVisible({ timeout: 10000 });
    await expect(cardPerdus.locator('svg.ct-chart-bar')).toBeVisible({ timeout: 10000 });
    await expect(cardPerdus.locator('span:has-text("Total:")')).toBeVisible({ timeout: 10000 });
});

Then("Le graphique {string} affiche des barres oranges et son total", async function (titreGraph) {
    const page = this.backofficePage;
    const cardTrouves = page.locator('.card').filter({ hasText: titreGraph }).first();
    
    await expect(cardTrouves).toBeVisible({ timeout: 10000 });
    await expect(cardTrouves.locator('svg.ct-chart-bar')).toBeVisible({ timeout: 10000 });
    await expect(cardTrouves.locator('span:has-text("Total:")')).toBeVisible({ timeout: 10000 });
});

Then("Le bloc {string} affiche le classement avec icônes", async function (titreBloc) {
    const page = this.backofficePage;
    const cardTop3 = page.locator('.card').filter({ hasText: titreBloc }).first();
    await expect(cardTop3).toBeVisible({ timeout: 10000 });
});

Then("Le graphique {string} affiche des barres bleues et son total", async function (titreGraph) {
    const page = this.backofficePage;
    const cardRendus = page.locator('.card').filter({ hasText: titreGraph }).first();
    await expect(cardRendus).toBeVisible({ timeout: 10000 });
});

Then("Le calendrier s'ouvre", async function () {
    const page = this.backofficePage;
    const calendar = page.locator('.flatpickr-calendar.open').first();
    await expect(calendar).toBeVisible({ timeout: 10000 });
});

Then("La navigation par mois et année avec flèches gauche et droite est visible", async function () {
    const page = this.backofficePage;
    const arrowLeft = page.locator('.flatpickr-calendar.open .flatpickr-prev-month, .flatpickr-calendar.open svg').nth(0);
    const arrowRight = page.locator('.flatpickr-calendar.open .flatpickr-next-month, .flatpickr-calendar.open svg').nth(1);
    
    await expect(arrowLeft).toBeVisible({ timeout: 10000 });
    await expect(arrowRight).toBeVisible({ timeout: 10000 });
});

Then("Les menus déroulants du mois et de l'année s'affichent", async function () {
    const page = this.backofficePage;
    const monthSelect = page.locator('.flatpickr-calendar.open select.flatpickr-monthDropdown-months, .flatpickr-calendar.open select[aria-label="Month"]').first();
    const yearInput = page.locator('.flatpickr-calendar.open input.cur-year, .flatpickr-calendar.open input[aria-label="Year"]').first();
    
    await expect(monthSelect).toBeVisible({ timeout: 10000 });
    await expect(yearInput).toBeVisible({ timeout: 10000 });
});

Then("Les jours de la semaine s'affichent de {string} à {string}", async function (startDay, endDay) {
    const page = this.backofficePage;
    const days = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    
    for (const day of days) {
        const dayLocator = page.locator('.flatpickr-calendar.open .flatpickr-weekdays, .flatpickr-calendar.open').getByText(day, { exact: day !== 'jeu' && day !== 'sam' && day !== 'dim' }).first();
        await expect(dayLocator).toBeVisible({ timeout: 5000 });
    }
});

Then("La date sélectionnée est mise en surbrillance turquoise", async function () {
    const page = this.backofficePage;
    const selectedDay = page.locator('.flatpickr-calendar.open .flatpickr-day.selected').first();
    await expect(selectedDay).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche pour valider", async function (nomBouton) {
    const page = this.backofficePage;
    const btnOk = page.locator('.flatpickr-calendar.open').getByText('Ok').first();
    await expect(btnOk).toBeVisible({ timeout: 10000 });
});