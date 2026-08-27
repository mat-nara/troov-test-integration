const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------- GIVEN ----------------------*/

Given("L'utilisateur est sur la page de connexion de Troov", async function () {
    const page = this.backofficePage || this.page;
    await page.goto('http://localhost:3000/login');
});


/*---------------------------- WHEN ----------------------*/
When("L'utilisateur saisit ses identifiants et valide la connexion", async function () {
    const page = this.backofficePage || this.page;

    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('Mairie@troov.com');

    await page.getByLabel('Mot de passe').click();
    await page.getByLabel('Mot de passe').fill('Hello(123)');

    await page.getByRole('button', { name: 'Connexion' }).click();
});


When("L'utilisateur est connecte avec un compte agent valide", async function () {
    const page = this.backofficePage || this.page;
    if (page.url().includes('/login')) {
        await page.getByLabel('Email').fill('Mairie@troov.com');
        await page.getByLabel('Mot de passe').fill('Hello(123)');
        await page.getByRole('button', { name: 'Connexion' }).click();
        await page.waitForURL(url => url.pathname.includes('/dashboard/'), { timeout: 15000 });
    }
});


/*----------------------------THEN ----------------------*/

Then("La page de connexion s'affiche correctement", async function () {
    const page = this.backofficePage || this.page;

    await page.waitForURL(url => url.pathname.includes('/dashboard/'), { timeout: 15000 });
    await expect(page).not.toHaveURL(/\/login/);
});
Then("La page s'affiche correctement", async function () {
    const page = this.backofficePage || this.page;
    await expect(page).not.toHaveURL(/\/login/);
    const mainContent = page.locator('main, #app, .dashboard-container').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
});