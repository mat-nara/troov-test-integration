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
    await this.backofficePage.getByText(filtre, { exact: true }).click();
});

When("L'utilisateur clique sur le filtre de période", async function () {
    await this.backofficePage.locator('input[placeholder*="date"], .p-datepicker input, [class*="datepicker"]').first().click();
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
    await expect(this.backofficePage.getByRole('button', { name: btn1 })).toBeVisible();
    await expect(this.backofficePage.getByRole('button', { name: btn2 })).toBeVisible();
});