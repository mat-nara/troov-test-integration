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
    if (nomOption === "Statistiques d'objets trouvés" || nomOption === "Statistiques d'objet trouvés") {
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

When("L'utilisateur clique sur le champ de plage de dates", async function () {
    const dateInput = this.backofficePage.locator('input[placeholder="Cliquez ici pour choisir la date"]');
    await expect(dateInput).toBeVisible({ timeout: 10000 });
    await dateInput.click();
});

/*-----------------------------------------THEN -------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

Then("Le titre des statistiques s'affiche", async function () {
    const titre = this.backofficePage.locator('span[aria-current="location"]').filter({ hasText: "Statistiques d'objet trouvés" });
    await expect(titre).toBeVisible({ timeout: 10000 });
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

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    if (nomBouton === "Rechercher") {
        await expect(
            this.backofficePage.locator('button.btn-primary').filter({ hasText: 'Rechercher' })
        ).toBeVisible({ timeout: 10000 });
    } else {
        await expect(
            this.backofficePage.getByRole('button', { name: nomBouton }).first()
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le lien {string} s'affiche en haut à droite", async function (texteLien) {
    await expect(
        this.backofficePage.locator('span[aria-current="location"]').filter({ hasText: texteLien })
    ).toBeVisible({ timeout: 10000 });
});

Then("Les 4 blocs de statistiques s'affichent :", async function (dataTable) {
    const blocs = dataTable.raw().flat();

    for (const bloc of blocs) {
        await expect(
            this.backofficePage.locator('h3.card-title, h4.card-title').filter({ hasText: bloc })
        ).toBeVisible({ timeout: 10000 });
    }
});

Then("Le calendrier s'ouvre", async function () {
    const calendar = this.backofficePage.locator('.flatpickr-calendar, .flatpickr-days, .flatpickr-months').first();
    await expect(calendar).toBeVisible({ timeout: 10000 });
});

Then("La navigation par mois et année est visible", async function () {
    await expect(
        this.backofficePage.locator('.flatpickr-prev-month, .flatpickr-next-month, [class*="arrow"]').first()
    ).toBeVisible({ timeout: 10000 });
});

Then("Les menus déroulants mois et année s'affichent", async function () {
    await expect(
        this.backofficePage.locator('.flatpickr-current-month, .flatpickr-monthDropdown-months, .numInputWrapper').first()
    ).toBeVisible({ timeout: 10000 });
});

Then("Les jours de la semaine s'affichent de {string} à {string}", async function (jourDebut, jourFin) {
    await expect(
        this.backofficePage.locator('.flatpickr-weekday').filter({ hasText: jourDebut })
    ).toBeVisible({ timeout: 10000 });

    await expect(
        this.backofficePage.locator('.flatpickr-weekday').filter({ hasText: jourFin })
    ).toBeVisible({ timeout: 10000 });
});

Then("Une date peut être sélectionnée et mise en surbrillance", async function () {
    const selectedDate = this.backofficePage.locator('.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange').first();
    await expect(selectedDate).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche pour valider", async function (nomBouton) {
    await expect(
        this.backofficePage.locator('button, .flatpickr-confirm').filter({ hasText: /Ok/i })
    ).toBeVisible({ timeout: 10000 });
});