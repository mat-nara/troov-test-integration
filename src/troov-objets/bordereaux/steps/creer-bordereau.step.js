const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60 * 1000);

/*------------------------------------------ GIVEN ---------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url);
});

/*--------------------------------------WHEN--------------------------------------------*/

When("L'utilisateur se connecte avec ces identifiants SSO", async function () {
    await this.backofficePage.locator('input#email').fill('mairie@troov.com');
    await this.backofficePage.locator('input#password').fill('Hello(123)');
    await this.backofficePage.locator('button[type="submit"].btn-primary').click();
});

When("L'utilisateur clique sur le menu {string} dans la sidebar", async function (menu) {
    await this.backofficePage.locator(`span:has-text("${menu}")`).click();
});

When("L'utilisateur clique sur le bouton {string}", async function (bouton) {
    await this.backofficePage.getByRole('button', { name: bouton }).click();
});

When("L'utilisateur clique sur {string}", async function (texte) {
    await this.backofficePage.getByText(texte, { exact: true }).click();
});

When("L'utilisateur renseigne le nom du bordereau {string}", async function (nom) {
    await this.backofficePage.locator('input#tx-name').fill(nom);
});

When("L'utilisateur sélectionne le type de bordereau {string}", async function (type) {
    await this.backofficePage.locator(`button:has-text("${type}")`).click();
});

When("L'utilisateur choisit {string}", async function (option) {
    await this.backofficePage.getByRole('button', { name: option }).click();
});

When("L'utilisateur renseigne le nouveau contact avec les informations suivantes :", async function (dataTable) {
    const data = dataTable.rowsHash();

    // Les 4 premiers champs texte (Nom, Adresse, Ville, Code postal)
    const inputs = this.backofficePage.locator('input[type="text"].tui-block.tui-h-11');

    await inputs.nth(0).fill(data['Nom']);
    await inputs.nth(1).fill(data['Adresse']);
    await inputs.nth(2).fill(data['Ville']);
    await inputs.nth(3).fill(data['Code postal']);

    // Champ Pays
    await this.backofficePage.locator('label:has-text("Pays") + input, label:has-text("Pays") ~ input').fill(data['Pays']);

    // Type d'entité (select)
    await this.backofficePage.locator('span[name="entity_type"], [aria-label="Sélectionner..."]').click();
    await this.backofficePage.getByText(data["Type d'entité"], { exact: true }).click();
});

When("L'utilisateur renseigne le message {string}", async function (message) {
    await this.backofficePage.locator('textarea#tx-message').fill(message);
});

When("L'utilisateur clique sur l'onglet {string}", async function (onglet) {
    await this.backofficePage.getByRole('tab', { name: onglet }).click();
});

When("L'utilisateur sélectionne la plage de dates du {string} au {string}", async function (dateDebut, dateFin) {
    const datepickerInput = this.backofficePage.locator('input#create-search-dpk');

    // 1. Clique sur l'input pour ouvrir le datepicker
    await datepickerInput.click();

    // 2. Vide le champ puis tape la plage de dates
    await datepickerInput.fill('');
    await datepickerInput.fill(`${dateDebut} - ${dateFin}`);

    // 3. Appuie sur Entrée pour valider
    await datepickerInput.press('Enter');
});

When("L'utilisateur sélectionne un objet", async function () {
    // Clique sur le bouton "Exclure" du premier objet (ou le checkbox selon ton UI)
    await this.backofficePage.locator('button[title="Exclure"]').first().click();
});


/*--------------------------------------------THEN-------------------------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/.*login/);
    await expect(this.backofficePage.locator('span:has-text("Bordereaux")')).toBeVisible();
});

Then("Un formulaire en 3 étapes s'affiche avec :", async function () {
    await expect(this.backofficePage.locator('div.tui-text-center', { hasText: 'Informations' })).toBeVisible();
    await expect(this.backofficePage.getByText('Sélection des objets', { exact: true })).toBeVisible();
    await expect(this.backofficePage.getByText('Confirmation', { exact: true })).toBeVisible();
});

Then("Les étapes {string}, {string} et {string} sont visibles", async function (e1, e2, e3) {
    await expect(this.backofficePage.locator('div.tui-text-center', { hasText: e1 })).toBeVisible();
    await expect(this.backofficePage.getByText(e2, { exact: true })).toBeVisible();
    await expect(this.backofficePage.getByText(e3, { exact: true })).toBeVisible();
});

Then("Le champ {string} est visible", async function (champ) {
    if (champ === "Nom du bordereau") {
        await expect(this.backofficePage.locator('input#tx-name')).toBeVisible();
    } else if (champ === "Message") {
        await expect(this.backofficePage.locator('textarea#tx-message')).toBeVisible();
    } else {
        await expect(this.backofficePage.getByText(champ, { exact: true })).toBeVisible();
    }
});

Then("Les types de bordereau {string}, {string}, {string}, {string}, {string} et {string} sont visibles", async function (t1, t2, t3, t4, t5, t6) {
    for (const type of [t1, t2, t3, t4, t5, t6]) {
        await expect(this.backofficePage.getByText(type, { exact: true })).toBeVisible();
    }
});

Then("Le champ {string} avec le placeholder {string} est visible", async function (champ, placeholder) {
    await expect(this.backofficePage.getByText(champ, { exact: true })).toBeVisible();
    await expect(this.backofficePage.getByText(placeholder)).toBeVisible();
});

Then("Les boutons {string} et {string} sont visibles", async function (btn1, btn2) {
    await expect(this.backofficePage.getByRole('button', { name: btn1 })).toBeVisible();
    await expect(this.backofficePage.getByRole('button', { name: btn2 })).toBeVisible();
});

Then("Le bouton {string} est visible en bas à droite", async function (bouton) {
    await expect(this.backofficePage.getByRole('button', { name: bouton })).toBeVisible();
});

Then("Les options de contact s'affichent", async function () {
    await expect(this.backofficePage.getByRole('button', { name: 'Contact externe' })).toBeVisible();
    await expect(this.backofficePage.getByRole('button', { name: 'Contact Troov' })).toBeVisible();
});

Then("L'étape {string} s'affiche", async function (etape) {
    await expect(this.backofficePage.getByText(etape, { exact: true })).toBeVisible();
});

Then("Le bordereau est créé avec succès", async function () {
    await expect(
        this.backofficePage.locator('button:has-text("Mes bordereaux")')
    ).toBeVisible({ timeout: 10000 });
});