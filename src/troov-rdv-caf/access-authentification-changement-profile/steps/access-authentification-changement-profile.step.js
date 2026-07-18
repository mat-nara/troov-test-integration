const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');



setDefaultTimeout(60 * 1000);



Given("L'utilisateur est sur la page de connexion", async function() {
    await this.backofficePage.goto(config.troovCafUserBackofficeURL);
});

Given("L'utilisateur n'est pas connecté", async function() {
    await this.backofficePage.goto(config.troovCafUserBackofficeURL);
});

Given("L'utilisateur est connecté avec le compte admin", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});

Given("Il restaure le paramètre du compte principal précédent", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Modifier votre compte principal"]').click();
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });

    await this.backofficePage.locator(`h5[title="${this.oldPrincipal}"]`).locator('..').locator('xpath=following-sibling::*').locator('input[type="radio"]').click();
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    await this.backofficePage.waitForTimeout(2000); // wait for 1 second to ensure the change is applied
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("Il saisit un email valide", async function() {
    await this.backofficePage.locator('#email').fill(config.troovCafUserBackofficeUsername);
});

When("Il saisit un mot de passe valide", async function() {
    await this.backofficePage.locator('#password').fill(config.troovCafUserBackofficePassword);
});

When("Il clique sur le bouton \"Se connecter\"", async function() {
    await this.backofficePage.locator('button:text("Connexion")').click();
});

When("Il saisit un mot de passe invalide", async function() {
    await this.backofficePage.locator('#password').fill(config.troovCafUserBackofficePassword.slice(2));
});

When("Il saisit un email invalide", async function() {
    await this.backofficePage.locator('#email').fill(config.troovCafUserBackofficeUsername.slice(2));
});

When("Il tente d'accéder à la page \"Calendrier\"", async function() {
    await this.backofficePage.goto("https://dev.caf.troovrdv.com/fr/dashboard/68790829ad61863627c6eb41/reservations/calendar");
});

When("Il clique sur Profil puis sur le bouton \"Déconnexion\"", async function() {
    await this.backofficePage.locator('img.header-profile-user').click(); 
    await this.backofficePage.locator('button[title="Déconnexion"]').click(); 
});

When("Il va dans \"Paramètres\" puis \"Mon compte\" puis \"Modifier mon compte principal\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Modifier votre compte principal"]').click();
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
});

When("L'utilisateur change le compte principal en {string} puis clique sur {string}", async function(compte, button) {
    await this.backofficePage.locator(`h5[title="${compte}"]`).locator('..').locator('xpath=following-sibling::*').locator('input[type="radio"]').click();
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    this.newComptePrincipal = compte;
});

When("Il se déconnecte", async function() {
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Déconnexion"]').click();
});

When("Il se reconnecte avec le compte admin", async function() {
    await this.backofficePage.goto(config.troovCafUserBackofficeURL);
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});

When("Il clique sur le profil puis \"Changer de compte\" dans le menu de droite", async function() {
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Changer de compte"]').click();
    await this.backofficePage.waitForTimeout(3000); 
});

When("Il clique \"CNAF Formation\" puis \"455 Caf\" puis \"455 Caf site physique\"", async function() {

    const liFormationLocator = this.backofficePage.locator('li[aria-label="CNAF Formation"]');
    if (await liFormationLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    const li455CafLocator = this.backofficePage.locator('li[aria-label="455 Caf"]');
    if (await li455CafLocator.getAttribute('aria-expanded') === 'false') {
        await this.backofficePage.locator('li[aria-label="455 Caf"] > div.p-tree-node-content > button.p-tree-node-toggle-button').click();
    }

    await this.backofficePage.locator('li[aria-label="455 Caf Site physique"] > div.p-tree-node-content > span.p-tree-node-label').click();

    currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
    await this.backofficePage.waitForTimeout(3000);
});

When("Il se reconnecte avec un compte \"Utilisateur acceuil\"", async function() {
    await this.backofficePage.goto(config.troovCafUserBackofficeURL);
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
    await this.loginPageAlt.login(config.usernameProfileUtilisateurAcceuil, config.passwordProfileUtilisateurAcceuil);

    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});
 




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




Then("Il est redirigé vers la page d'accueil", async function() {
    await expect(this.backofficePage.locator('#sidebar-menu #nav-calendar-desk  i[title="Calendrier"]').first() ).toBeVisible();
}); 

Then("Un message d'erreur \"Mot de passe ou nom d'utilisateur incorrect\" est affiché", async function() {
    await expect(this.backofficePage.locator('.alert').filter({ hasText: "Erreur de connexion : Mot de passe ou nom d'utilisateur incorrect" }) ).toBeVisible();
}); 

Then("Il reste sur la page de connexion", async function() {
    let currentURL = await this.backofficePage.url();
    expect(currentURL).toContain("login");
}); 

Then("Il est redirigé vers la page de connexion", async function() {
    let currentURL = await this.backofficePage.url();
    expect(currentURL).toContain("login");
}); 

Then("Il est deconnecté et redirigé vers la page de connexion", async function() {

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('login')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('login');
}); 

Then("La page \"Sélection du compte principal\" est ouverte", async function() {
    await expect(this.backofficePage.locator('h4').filter({ hasText: 'Sélectionnez votre compte principal' }) ).toBeVisible();
}); 

Then("Une notification de mise à jour du compte principal effectuée avec succès est affichée", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Nous avons pris en compte vos changements')).toBeVisible();
}); 

Then("Le compte connecté est celui sélectionné dans le compte principal actuel", async function() {
    const compteSelectionnee = await this.backofficePage.locator('table.project-list-table tbody tr.table-primary h5').textContent();
    const compteConnectee = await this.backofficePage.locator('.nav-account-name').textContent();
    expect(compteSelectionnee.trim()).toBe(compteConnectee.trim());
    this.oldPrincipal = compteSelectionnee;
}); 

Then("Le nouveau paramétrage du compte principal est pris en compte et il est connecté à ce dernier", async function() {
    const compteConnectee = await this.backofficePage.locator('.nav-account-name').textContent();
    expect(this.newComptePrincipal.trim()).toBe(compteConnectee.trim());
}); 

Then("La liste des comptes existants s'affiche", async function() {
    await expect(this.backofficePage.locator('troov-ce-teams-navigation-tree .p-tree ul li[aria-label="CNAF Formation"]')).toBeVisible();
}); 

Then("Le compte \"455 Caf site physique\" est sélectionner avec tous les données associé", async function() {
    const compteConnectee = await this.backofficePage.locator('.nav-account-name').textContent();
    expect(("455 Caf site physique").toLowerCase()).toBe(compteConnectee.trim().toLowerCase());
}); 

Then("Le compte \"Utilisateur acceuil\" est sélectionné avec les accès associé et avec le calendrier de \"CNAF Formation\" par defaut", async function() {
    // Vérification que le compte "Utilisateur acceuil" est sélectionné et CNAF Formation
    const compteConnectee = await this.backofficePage.locator('.nav-account-name').textContent();
    expect("CNAF Formation").toBe(compteConnectee.trim());

    // Le boutton "Paramètres" n'est pas visible dans le menu de gauche
    expect(await this.backofficePage.locator('i[title="Paramètres"]').count() ).not.toBeGreaterThan(0);
}); 
