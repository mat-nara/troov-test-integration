const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60 * 1000);

/*-----------------------------GIVEN-------------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url);
});


/*---------------------------------------WHEN---------------------------------------------*/

When("L'utilisateur se connecte avec ces identifiants SSO", async function () {
    await this.backofficePage.locator('input#email').fill('mairie@troov.com');
    await this.backofficePage.locator('input#password').fill('Hello(123)');
    await this.backofficePage.locator('button[type="submit"].btn-primary').click();
});

When("L'utilisateur clique sur le menu {string} dans la sidebar", async function (menu) {
    await this.backofficePage.locator(`span:has-text("${menu}")`).click();
});

When("L'utilisateur clique sur le filtre {string}", async function (filtre) {
    const regexFiltre = new RegExp(filtre, 'i');

    // 1. Localise le composant Select/Dropdown PrimeVue associé au texte du filtre
    const selectComponent = this.backofficePage
        .locator('.p-select, .p-dropdown, .p-multiselect')
        .filter({ hasText: regexFiltre })
        .first();

    if (await selectComponent.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Clic sur l'icône SVG à l'intérieur (comme identifié dans votre enregistrement)
        await selectComponent.locator('svg, .p-select-dropdown, .p-dropdown-trigger').first().click();
    } else {
        // Fallback si le libellé "TYPE" est un label parent/voisin
        const label = this.backofficePage.getByText(regexFiltre).first();
        const container = label.locator('xpath=ancestor::*[contains(@class, "field") or contains(@class, "flex") or self::div][1]');
        await container.locator('svg').first().click();
    }
});

When("L'utilisateur clique sur le filtre de période", async function () {
    // 1. Ciblage principal basé sur l'enregistrement ('Choose Date')
    const datePickerTrigger = this.backofficePage.getByLabel(/Choose Date|Sélectionner une date/i);

    if (await datePickerTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
        await datePickerTrigger.click();
    } else {
        // Fallback : recherche le champ de date par input ou icône de calendrier PrimeVue
        await this.backofficePage
            .locator('.p-datepicker input, .p-calendar input, button[aria-label*="Date"], .p-datepicker-trigger')
            .first()
            .click();
    }
});



/*-------------------------------------THEN------------------------------------------*/
Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/.*login/);
    await expect(this.backofficePage.locator('span:has-text("Bordereaux")')).toBeVisible();
});

Then("La page Bordereaux s'affiche correctement avec :", async function () {
    await expect(this.backofficePage.getByText("Bordereaux", { exact: true })).toBeVisible();
});

Then("Le titre {string} est visible", async function (titre) {
    await expect(this.backofficePage.getByText(titre, { exact: true })).toBeVisible();
});


Then("La liste des bordereaux affiche les colonnes : Nom, Type, Statut, Contact, Objets, Date", async function () {
    await expect(this.backofficePage.getByText("Nom", { exact: true }).first()).toBeVisible();
    await expect(this.backofficePage.getByText("Type", { exact: true }).first()).toBeVisible();
    await expect(this.backofficePage.getByText("Statut", { exact: true }).first()).toBeVisible();
    await expect(this.backofficePage.getByText("Contact", { exact: true }).first()).toBeVisible();
    await expect(this.backofficePage.getByText("Objets", { exact: true }).first()).toBeVisible();
    await expect(this.backofficePage.getByText("Date", { exact: true }).first()).toBeVisible();
});

Then("Les boutons {string} et {string} sont visibles en haut à droite", async function (btn1, btn2) {
    await expect(this.backofficePage.getByText(btn1, { exact: false })).toBeVisible();
    await expect(this.backofficePage.getByText(btn2, { exact: false })).toBeVisible();
});

Then("Les options de type s'affichent", async function () {
    // Vérification basée sur les options réelles identifiées dans votre enregistrement
    const optionType = this.backofficePage
        .getByLabel(/Transfert|Introuvable|Archivage/i)
        .or(this.backofficePage.getByText(/Réception|Modification|Destruction|Restitution/i))
        .first();

    await expect(optionType).toBeVisible({ timeout: 5000 });
});

Then("Les options de contact s'affichent", async function () {
    // Vérification pour le filtre Contact basé sur vos options (ex: HOPITAL LAVERAN)
    const overlayOrOption = this.backofficePage
        .locator('.p-select-overlay, .p-dropdown-panel, [role="listbox"]')
        .or(this.backofficePage.getByText(/HOPITAL|Enseignes/i))
        .first();

    await expect(overlayOrOption).toBeVisible({ timeout: 5000 });
});

Then("Le calendrier de sélection de période s'affiche", async function () {
    // Vérifie l'apparition du panneau/popover calendrier PrimeVue
    const calendarPanel = this.backofficePage.locator(
        '.p-datepicker, .p-datepicker-panel, .p-calendar-panel'
    ).first();

    await expect(calendarPanel).toBeVisible({ timeout: 5000 });
});