const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');

const { expect } = require('@playwright/test');



setDefaultTimeout(60000);



// ------------------------------------------- Given ---------------------------------------



Given("L'utilisateur est sur la page de connexion", async function () {

    await this.backofficePage.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });

    await expect(this.backofficePage).toHaveURL(/\/login/);

});



// ----------------------------------------- When --------------------------------------------------------



When("L'utilisateur saisit un email ou un mot de passe incorrect", async function () {

    await this.backofficePage.getByLabel('Email').fill('utilisateur.inexistant@test.com');

    await this.backofficePage.getByLabel('Mot de passe').fill('MauvaisMotDePasse123!');

});



When("L'utilisateur saisit un email et un mot de passe valides", async function () {

    await this.backofficePage.getByLabel('Email').fill('faniloniainaramahenintsoa@troov.com');

    await this.backofficePage.getByLabel('Mot de passe').fill('Fanilo(123)');

});



When('L\'utilisateur valide le formulaire sur le bouton {string}', async function (buttonLabel) {

    const bouton = this.backofficePage.getByRole('button', { name: buttonLabel });

    await bouton.waitFor({ state: 'visible', timeout: 10000 });

    await bouton.click();

});



// ----------------------------------------- Then --------------------------------------------------------



Then("Un message d'erreur indique {string}", async function (expectedMessage) {

    await expect(this.backofficePage.getByText(expectedMessage, { exact: false }))

        .toBeVisible({ timeout: 10000 });

});



Then("L'utilisateur reste sur la page de connexion", async function () {

    await expect(this.backofficePage).toHaveURL(/\/login/);

});



Then("L'utilisateur est connecte a son espace usager", async function () {

    await this.backofficePage.waitForURL(/\/dashboard\/.*\/user|\/accueil/, {

        timeout: 30000,

        waitUntil: 'domcontentloaded'

    });



    // Titre "Accueil" en priorité, sinon on se contente de voir la sidebar apparaitre

    const titreAccueil = this.backofficePage.getByTitle('Accueil');

    const sidebar = this.backofficePage.locator('.sidebar, [class*="sidebar"], nav');

    await expect(titreAccueil.or(sidebar)).toBeVisible({ timeout: 10000 });

});



Then("L'utilisateur est sur le tableau de bord", async function () {

    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });

    await expect(this.backofficePage.locator('.sidebar, [class*="sidebar"], nav')).toBeVisible({ timeout: 10000 });

});