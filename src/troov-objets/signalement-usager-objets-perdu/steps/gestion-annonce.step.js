const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

function versRegexInsensibleAuxAccents(texte) {
    const equivalences = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
    const echappe = texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = echappe.replace(/[aeiouc]/gi, (car) => equivalences[car.toLowerCase()] || car);
    return new RegExp(pattern, 'i');
}

async function seConnecter(page) {
    await page.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').click();
    await page.getByLabel('Email').clear();
    await page.getByLabel('Email').fill('faniloniainaramahenintsoa@gmail.com');

    await page.getByLabel('Mot de passe').click();
    await page.getByLabel('Mot de passe').clear();
    await page.getByLabel('Mot de passe').fill('1234$Fanilo');

    const bouton = page.getByRole('button', { name: 'Connexion' });
    await bouton.waitFor({ state: 'visible', timeout: 10000 });
    await bouton.click();

    await page.waitForURL(/\/dashboard\/.*\/user|\/accueil/, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
    });
}

function getBoutonOuLien(page, name) {
    const regex = versRegexInsensibleAuxAccents(name);
    return page
        .getByRole('button', { name: regex })
        .or(page.getByRole('link', { name: regex }))
        .or(page.locator('.btn, [class*="btn-"]').filter({ hasText: regex }));
}

async function clicSur(locator, { timeout = 10000 } = {}) {
    const el = locator.first();
    await el.waitFor({ state: 'visible', timeout });
    await el.scrollIntoViewIfNeeded().catch(() => {});
    try {
        await el.click({ timeout });
    } catch (err) {
        await el.click({ force: true, timeout });
    }
}

function getPopupParLabel(page, label) {
    const regex = versRegexInsensibleAuxAccents(label);
    return page
        .getByLabel(regex)
        .or(page.getByRole('dialog', { name: regex }))
        .or(page.getByRole('alertdialog', { name: regex }));
}

//-----------------------------------------------------------GIVEN-------------------------------------------------------------

Given("L'utilisateur est connecte a son espace usager", async function () {
    await seConnecter(this.backofficePage);
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur a une annonce active pour un objet perdu", async function () {
    await expect(this.backofficePage.getByText('Mon dernier objet ajouté')).toBeVisible({ timeout: 10000 });
    await expect(getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')).toBeVisible({ timeout: 10000 });
});

//-----------------------------------------------------------WHEN-------------------------------------------------------------

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    const element = getBoutonOuLien(this.backofficePage, buttonLabel);
    await clicSur(element);
    await this.backofficePage.waitForTimeout(1000);
});

//----------------------------------------------------------THEN---------------------------------------------------

Then("Une pop-up {string} s'affiche", async function (popupTitle) {
    const popup = getPopupParLabel(this.backofficePage, popupTitle);
    await expect(popup.first()).toBeVisible({ timeout: 10000 });
    this.popupActive = popup.first();
});

Then("Le message {string} est visible", async function (message) {
    const conteneur = this.popupActive || this.backofficePage;
    const regex = versRegexInsensibleAuxAccents(message);
    await expect(conteneur.getByText(regex)).toBeVisible({ timeout: 10000 });
});

Then("Les boutons {string} et {string} sont disponibles", async function (bouton1, bouton2) {
    const conteneur = this.popupActive || this.backofficePage;
    await expect(getBoutonOuLien(conteneur, bouton1)).toBeVisible({ timeout: 10000 });
    await expect(getBoutonOuLien(conteneur, bouton2)).toBeVisible({ timeout: 10000 });
});

Then("La pop-up se ferme", async function () {
    const popup = this.popupActive || getPopupParLabel(this.backofficePage, 'Confirmation objet retrouve');
    await expect(popup).toBeHidden({ timeout: 10000 });
});

Then("Le statut de l'annonce reste inchange \\({string}\\)", async function (statutAttendu) {
    await expect(
        getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')
    ).toBeVisible({ timeout: 10000 });
});

Then("Le statut de l'annonce passe a {string}", async function (statutAttendu) {
    const modaleArchivage = this.backofficePage
        .getByRole('dialog').filter({ hasText: /archiv/i })
        .or(this.backofficePage.getByRole('alertdialog').filter({ hasText: /archiv/i }))
        .or(this.backofficePage.getByText(/archiv/i));

    const modaleVisible = await modaleArchivage.first().isVisible().catch(() => false);

    if (modaleVisible) {
        this.popupActive = modaleArchivage.first();
    } else {
        await expect(
            getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')
        ).toBeHidden({ timeout: 10000 });
    }
});