const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Augmenter le timeout global
setDefaultTimeout(60000);

Before(async function () {
    await this.backofficePage.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
});

//-------------------------------------------------GIVEN--------------------------------------------------
// L'utilisateur est sur la page de connexion
// --------------------------------------------------------------------------
Given("L'utilisateur est sur la page de connexion", async function () {
    await expect(this.backofficePage).toHaveURL(/\/login/);
});


//------------------------------------------------WHEN---------------------------------------------
// Saisie d'identifiants incorrects
// -----------------------------------------------------------------
When("L'utilisateur saisit un email ou un mot de passe incorrect", async function () {
    
    // Email incorrect
    await this.backofficePage.getByLabel('Email').click();
    await this.backofficePage.getByLabel('Email').clear();
    await this.backofficePage.getByLabel('Email').fill('utilisateur.inexistant@test.com');
    
    // Mot de passe incorrect
    await this.backofficePage.getByLabel('Mot de passe').click();
    await this.backofficePage.getByLabel('Mot de passe').clear();
    await this.backofficePage.getByLabel('Mot de passe').fill('MauvaisMotDePasse123!');
});


// Saisie d'identifiants valides
// -------------------------------------------------------------------------
When("L'utilisateur saisit un email et un mot de passe valides", async function () {

    // Email valide
    await this.backofficePage.getByLabel('Email').click();
    await this.backofficePage.getByLabel('Email').clear();
    await this.backofficePage.getByLabel('Email').fill('faniloniainaramahenintsoa@gmail.com');
    
    // Mot de passe valide
    await this.backofficePage.getByLabel('Mot de passe').click();
    await this.backofficePage.getByLabel('Mot de passe').clear();
    await this.backofficePage.getByLabel('Mot de passe').fill('1234$Fanilo');
});

-
// Validation du formulaire
// ---------------------------------------------------------------------
When('L\'utilisateur valide le formulaire sur le bouton {string}', async function (buttonLabel) {
    
    const bouton = this.backofficePage.getByRole('button', { name: buttonLabel });
    await bouton.waitFor({ state: 'visible', timeout: 10000 });
    await bouton.click();

    
    // Attendre un peu pour la redirection
    await this.backofficePage.waitForTimeout(2000);
});




   //    ---------------------------------------------------------THEN--------------------------------------

// Message d'erreur
// ------------------------------------------------------------------
Then("Un message d'erreur indique {string}", async function (expectedMessage) {
    
    // Attendre que le message d'erreur apparaisse
    const message = this.backofficePage.getByText(expectedMessage, { exact: false });
    await expect(message).toBeVisible({ timeout: 10000 });

});


//L'utilisateur reste sur la page de connexion
// ------------------------------------------------------------
Then("L'utilisateur reste sur la page de connexion", async function () {
    await expect(this.backofficePage).toHaveURL(/\/login/);
});


//L'utilisateur est connecté à son espace usager
// -------------------------------------------------------------
Then("L'utilisateur est connecte a son espace usager", async function () {
    
    // Attendre la redirection vers le dashboard
    await this.backofficePage.waitForURL(/\/dashboard\/.*\/user|\/accueil/, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
    });
    
    
    // Vérifier que la page est bien chargée avec le titre "Accueil"
    try {
        // Vérifier par le titre
        await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ 
            timeout: 10000 
        });
    } catch (error) {
        // Alternative: vérifier la présence de la sidebar
        await expect(this.backofficePage.locator('.sidebar, [class*="sidebar"], nav')).toBeVisible({
            timeout: 10000
        });
    }
    
    // Vérifier que l'URL est bien sur le dashboard
    const currentUrl = await this.backofficePage.url();
    expect(currentUrl).toMatch(/\/dashboard\/.*\/user|\/accueil/);
});


//  Vérification du dashboard
// --------------------------------------------------------------------
Then("L'utilisateur est sur le tableau de bord", async function () {
    // Vérifier la présence du titre "Accueil"
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({
        timeout: 10000
    });
    
    // Vérifier la présence de la sidebar
    await expect(this.backofficePage.locator('.sidebar, [class*="sidebar"], nav')).toBeVisible({
        timeout: 10000
    });
});

