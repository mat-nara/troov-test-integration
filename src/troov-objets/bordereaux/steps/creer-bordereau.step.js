const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Utilitaire pour échapper les caractères spéciaux regex (+, *, ?, etc.)
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*---------------------------- GIVEN ------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

/*---------------------------- WHEN -------------------------------------------*/

When(
    "L'utilisateur se connecte avec les identifiants SSO {string} et {string}",
    async function (email, password) {
        const page = this.backofficePage;
        await page.locator('input#email, input[type="email"]').fill(email);
        await page.locator('input#password, input[type="password"]').fill(password);
        await page.locator('button[type="submit"].btn-primary, button:has-text("Connexion")').click();
        await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });
    }
);

When("L'utilisateur ouvre le menu {string} dans la sidebar", async function (menu) {
    const page = this.backofficePage;
    let menuItem;

    if (menu === "Bordereaux") {
        menuItem = page.locator('a[href*="/transmissions"]').or(
            page.locator('a.side-nav-link-ref', { hasText: 'Bordereaux' })
        ).first();
    } else {
        menuItem = page.locator('a.side-nav-link-ref, .sidebar-menu a').filter({ hasText: menu }).first();
    }

    await expect(menuItem).toBeVisible({ timeout: 10000 });
    await menuItem.click();
});

When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    const page = this.backofficePage;

    const button = page.locator('button[aria-label="Créer manuellement"]').or(
        page.getByRole('button', { name: new RegExp(escapeRegExp(nomBouton), 'i') })
    ).or(
        page.locator('button', { hasText: nomBouton })
    ).first();

    await expect(button).toBeVisible({ timeout: 10000 });
    await button.click();
});

When("L'utilisateur selectionne l'onglet {string}", async function (nomOnglet) {
    const page = this.backofficePage;

    // 1. Clic sur "Ajouter un contact"
    const addContactBtn = page.getByLabel('Ajouter un contact')
        .or(page.getByRole('button', { name: /ajouter un contact/i }))
        .or(page.getByText('Ajouter un contact'))
        .first();

    await expect(addContactBtn).toBeVisible({ timeout: 10000 });
    await addContactBtn.click();

    // 2. Sélection de l'onglet spécifique
    if (nomOnglet.toLowerCase().includes("troov")) {
        const btnTroov = page.getByRole('button', { name: /contact troov|a un compte troov/i }).first();
        await expect(btnTroov).toBeVisible({ timeout: 5000 });
        await btnTroov.click();
    }
});

/*---------------------------- THEN -------------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

Then("Le formulaire en 3 etapes s'affiche avec les indicateurs :", async function (dataTable) {
    const page = this.backofficePage;

    const stepInformations = page.locator('div').filter({ hasText: /^Informations$/ }).or(page.getByText('Créer un bordereau')).first();
    const stepObjets = page.locator('div').filter({ hasText: /^Sélection des objets$/ }).or(page.getByText('Sélectionner un objet')).first();
    const stepConfirmation = page.locator('div').filter({ hasText: /^Confirmation$/ }).or(page.getByText('Exporter les données')).first();

    await expect(stepInformations).toBeVisible({ timeout: 10000 });
    await expect(stepObjets).toBeVisible({ timeout: 10000 });
    await expect(stepConfirmation).toBeVisible({ timeout: 10000 });
});

Then(/^Les champs "([^"]*)",\s+"([^"]*)" s'affichent$/, async function (champNom, champType) {
    const page = this.backofficePage;

    const nomInput = page.locator('input[placeholder*="Nom" i], input[name*="name" i]')
        .or(page.getByRole('textbox', { name: /nom/i }))
        .first();
    await expect(nomInput).toBeVisible({ timeout: 10000 });

    const typeLabel = page.getByText(/type/i).first();
    await expect(typeLabel).toBeVisible({ timeout: 10000 });
});

Then("Les options de receveur {string} et {string} s'affichent", async function (opt1, opt2) {
    const page = this.backofficePage;

    const addContactBtn = page.getByLabel('Ajouter un contact').or(page.getByText('Ajouter un contact')).first();
    await expect(addContactBtn).toBeVisible({ timeout: 10000 });

    if (await addContactBtn.isVisible()) {
        await addContactBtn.click();
    }

    const contactTroov = page.getByRole('button', { name: /contact troov|a un compte troov/i }).first();
    const contactExterne = page.getByRole('button', { name: /contact externe|a un nouveau contact/i })
        .or(page.locator('div, span').filter({ hasText: /nouveau contact|externe/i }))
        .first();

    await expect(contactTroov).toBeVisible({ timeout: 10000 });
    await expect(contactExterne).toBeVisible({ timeout: 10000 });
});

Then("Les champs {string}, {string}, {string}, {string}, {string} et {string} s'affichent", async function (c1, c2, c3, c4, c5, c6) {
    const page = this.backofficePage;

    const nomInput = page.locator('div').filter({ hasText: /^Nom$/ }).getByRole('textbox').first();
    const adresseInput = page.locator('div').filter({ hasText: /^Adresse$/ }).getByRole('textbox').first();
    const cpInput = page.locator('div').filter({ hasText: /^Code postal$/ }).getByRole('textbox').first();
    const paysInput = page.locator('div').filter({ hasText: /^Pays$/ }).getByRole('textbox').first();
    const typeEntite = page.getByLabel('Sélectionner...').or(page.getByText(/type d'entité/i)).first();

    await expect(nomInput).toBeVisible({ timeout: 10000 });
    await expect(adresseInput).toBeVisible({ timeout: 10000 });
    await expect(cpInput).toBeVisible({ timeout: 10000 });
    await expect(paysInput).toBeVisible({ timeout: 10000 });
    await expect(typeEntite).toBeVisible({ timeout: 10000 });
});

Then("Les toggles {string} et {string} s'affichent", async function (toggle1, toggle2) {
    const page = this.backofficePage;

    const t1 = page.getByLabel('Destinataire (transmissions)').or(page.getByLabel('Receveur (bordereaux)')).first();
    const t2 = page.getByLabel('Inventeur').or(page.getByLabel('Service déposant')).first();

    await expect(t1).toBeVisible({ timeout: 10000 });
    await expect(t2).toBeVisible({ timeout: 10000 });
});

Then("Le champ {string} s'affiche", async function (nomChamp) {
    const page = this.backofficePage;

    if (nomChamp.toLowerCase().includes("email")) {
        const emailInput = page.locator('input[type="email"]')
            .or(page.getByRole('textbox', { name: /email/i }))
            .first();
        await expect(emailInput).toBeVisible({ timeout: 10000 });
    } else if (nomChamp.toLowerCase().includes("message")) {
        const messageInput = page.getByPlaceholder(/ajouter un message/i)
            .or(page.locator('textarea'))
            .first();
        await expect(messageInput).toBeVisible({ timeout: 10000 });
    } else {
        const genericInput = page.getByRole('textbox', { name: new RegExp(escapeRegExp(nomChamp), 'i') }).first();
        await expect(genericInput).toBeVisible({ timeout: 10000 });
    }
});

Then("Le bouton {string}, le champ {string} et le bouton {string} s'affichent", async function (btnAjouter, champMsg, btnSuivant) {
    const page = this.backofficePage;

    const ajouterBtn = page.getByLabel('Ajouter').or(page.locator('button, div').filter({ hasText: /^Ajouter$/ })).first();
    const messageInput = page.getByPlaceholder(/ajouter un message/i).or(page.locator('textarea')).first();
    const suivantBtn = page.getByLabel('Continuer').or(page.getByRole('button', { name: /continuer|suivant/i })).first();

    await expect(ajouterBtn).toBeVisible({ timeout: 10000 });
    await expect(messageInput).toBeVisible({ timeout: 10000 });
    await expect(suivantBtn).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche", async function (nomBouton) {
    const page = this.backofficePage;

    const button = page.getByRole('button', { name: new RegExp(escapeRegExp(nomBouton), 'i') })
        .or(page.locator('button', { hasText: nomBouton }))
        .first();

    await expect(button).toBeVisible({ timeout: 10000 });
});