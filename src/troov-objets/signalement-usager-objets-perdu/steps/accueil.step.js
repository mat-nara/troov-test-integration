const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

async function seConnecter(page) {
    await page.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill('faniloniainaramahenintsoa@gmail.com');
    await page.getByLabel('Mot de passe').fill('1234$Fanilo');

    const bouton = page.getByRole('button', { name: 'Connexion' });
    await bouton.waitFor({ state: 'visible', timeout: 10000 });
    await bouton.click();

    await page.waitForURL(/\/dashboard\/.*\/user|\/accueil/, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
    });
}

// Un lien du menu lateral peut être rendu comme <button> ou <a> selon l'écran
function getBoutonOuLien(page, name) {
    return page.getByRole('button', { name }).or(page.getByRole('link', { name }));
}

function getPopupCompteNonVerifie(page) {
    return page.getByText('Compte non vérifié', { exact: false });
}

async function clicSur(locator, { timeout = 10000 } = {}) {
    const el = locator.first();
    await el.waitFor({ state: 'visible', timeout });
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await el.click({ timeout });
}

// ------------------------------------------- Given ---------------------------------------

Given("L'utilisateur est connecte a son espace usager", async function () {
    await seConnecter(this.backofficePage);
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur a declare au moins un objet perdu", async function () {
    await expect(this.backofficePage.getByText('Mon dernier objet ajouté')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur est sur la page {string}", async function (pageName) {
    if (pageName === 'Accueil') {
        await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
        return;
    }

    if (pageName === 'Mes objets') {
        if (!/\/items/.test(this.backofficePage.url())) {
            await clicSur(this.backofficePage.getByRole('link', { name: 'Mes objets', exact: true }));
            await this.backofficePage.waitForURL(/\/items/, { timeout: 15000 });
        }
        return;
    }

    // Cas générique : on vérifie juste qu'un titre correspondant s'affiche
    await expect(
        this.backofficePage.getByRole('heading', { name: pageName, exact: false })
            .or(this.backofficePage.getByTitle(pageName))
    ).toBeVisible({ timeout: 10000 });
});

// ----------------------------------------- When --------------------------------------------------------

When("L'utilisateur accede a la page {string}", async function (pageName) {
    await clicSur(this.backofficePage.getByRole('link', { name: pageName, exact: true }));
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    const element = getBoutonOuLien(this.backofficePage, buttonLabel);

    if (buttonLabel === "Renvoyer l'email de confirmation") {
        // On attend la requête de renvoi en parallèle du clic
        await Promise.all([
            this.backofficePage.waitForResponse(
                resp => /resend|confirm|email/i.test(resp.url()) && resp.request().method() === 'POST',
                { timeout: 10000 }
            ),
            clicSur(element),
        ]);
    } else {
        await clicSur(element);
    }
});

When("L'utilisateur clique sur le lien {string} dans le menu lateral", async function (linkLabel) {
    await clicSur(this.backofficePage.getByRole('link', { name: linkLabel, exact: true }));
});

When("L'utilisateur clique sur le popup {string}", async function (popupLabel) {
    const popup = /compte non v[ée]rifi[ée]/i.test(popupLabel)
        ? getPopupCompteNonVerifie(this.backofficePage)
        : this.backofficePage.getByText(popupLabel, { exact: false });

    await clicSur(popup);
});

// ----------------------------------------- Then --------------------------------------------------------

Then("La page d'accueil s'affiche correctement", async function () {
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Then("Le menu lateral affiche les liens {string}, {string} et {string}", async function (lien1, lien2, lien3) {
    for (const lien of [lien1, lien2, lien3]) {
        await expect(this.backofficePage.getByRole('link', { name: lien, exact: true })).toBeVisible({ timeout: 10000 });
    }
});

Then("Le titre {string} est visible", async function (titre) {
    await expect(this.backofficePage.getByText(titre, { exact: false })).toBeVisible({ timeout: 10000 });
});

Then("Le bloc {string} s'affiche", async function (blocLabel) {
    await expect(this.backofficePage.getByText(blocLabel, { exact: false })).toBeVisible({ timeout: 10000 });
});

Then("La reference de l'objet est visible \\(ex: {string}\\)", async function (exempleRef) {
    await expect(this.backofficePage.getByText(/Ref\.\s*P\d+/)).toBeVisible({ timeout: 10000 });
});

Then("La categorie, la date et le lieu de l'objet sont affiches", async function () {
    await expect(this.backofficePage.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeVisible({ timeout: 10000 });
    await expect(this.backofficePage.getByText(/Plusieurs lieux|lieu/i)).toBeVisible({ timeout: 10000 });
});

Then("Le nom du declarant est affiche", async function () {
    await expect(this.backofficePage.getByText('Faniloniaina Ramahenintsoa')).toBeVisible({ timeout: 10000 });
});

Then("Les boutons {string} et {string} sont disponibles", async function (bouton1, bouton2) {
    await expect(getBoutonOuLien(this.backofficePage, bouton1)).toBeVisible({ timeout: 10000 });
    await expect(getBoutonOuLien(this.backofficePage, bouton2)).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} est visible en haut de la page", async function (buttonLabel) {
    await expect(getBoutonOuLien(this.backofficePage, buttonLabel)).toBeVisible({ timeout: 10000 });
});

Then("L'utilisateur est redirige vers le formulaire de declaration d'objet perdu ou trouve", async function () {
    // Le clic ouvre une modale plutôt qu'une nouvelle page
    const formulaire = this.backofficePage.locator('form')
        .or(this.backofficePage.getByRole('dialog'))
        .or(this.backofficePage.getByRole('heading', { name: /signaler|déclaration/i }));

    await expect(formulaire.first()).toBeVisible({ timeout: 10000 });

    // Retour à l'état initial
    await clicSur(this.backofficePage.getByRole('link', { name: 'Accueil', exact: true }));
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Then("L'utilisateur est redirige vers la page listant tous ses objets declares", async function () {
    await this.backofficePage.waitForURL(/\/items/, { timeout: 15000 });
});

Then("L'utilisateur est de retour sur la page d'accueil", async function () {
    await this.backofficePage.waitForURL(/\/dashboard\/.*\/user|\/accueil/, { timeout: 15000 });
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Then("Le popup {string} disparait", async function (popupLabel) {
    const popup = /compte non v[ée]rifi[ée]/i.test(popupLabel)
        ? getPopupCompteNonVerifie(this.backofficePage)
        : this.backofficePage.getByText(popupLabel, { exact: false });

    await expect(popup.first()).toBeHidden({ timeout: 10000 });
});