const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');


/*-----------------------------------------GIVEN-----------------------------------------*/
Given("l'utilisateur est sur {string}", async function (url) {
  await this.backofficePage.goto(url, { waitUntil: 'domcontentloaded' });
});


/*-----------------------------------------WHEN-----------------------------------------*/
When("L'utilisateur se connecte avec ces identifiants SSO", async function () {
  const email = 'mairie@troov.com';
  const password = 'Hello(123)';

  await this.backofficePage.locator('input#email').fill(email);
  await this.backofficePage.locator('input#password').fill(password);
  await this.backofficePage.locator('button[type="submit"]:has-text("Connexion")').click();
});


/*-----------------------------------------THEN-----------------------------------------*/
Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
  await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' });
  await expect(this.backofficePage).not.toHaveURL(/\/login/);
});