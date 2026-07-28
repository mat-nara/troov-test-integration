const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

function versRegexInsensibleAuxAccents(texte) {
    const equivalences = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
    const echappe = texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = echappe.replace(/[aeiouc]/gi, (car) => equivalences[car.toLowerCase()] || car);
    return new RegExp(pattern, 'i');
}

// Clic natif Playwright uniquement
async function clicSur(locator) {
    const element = locator.first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.click();
}

async function selectionnerDansDropdown(page, conteneur, labelChamp, valeur) {
    const regexChamp = versRegexInsensibleAuxAccents(labelChamp);
    const regexValeur = versRegexInsensibleAuxAccents(valeur);

    const selectNatif = conteneur.getByLabel(regexChamp);
    const estSelectNatif = await selectNatif.evaluate(el => el.tagName === 'SELECT').catch(() => false);
    if (estSelectNatif) {
        await selectNatif.selectOption({ label: valeur });
        return;
    }

    const combobox = conteneur.getByRole('combobox', { name: regexChamp })
        .or(conteneur.getByLabel(regexChamp));
    await clicSur(combobox);

    const option = page.getByRole('option', { name: regexValeur });
    await option.first().waitFor({ state: 'visible', timeout: 5000 });
    await clicSur(option);
}

async function seConnecterMairie(page) {
    await page.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill('mairie@troov.com');
    await page.getByLabel('Mot de passe').fill('Hello(123)');
    await page.getByRole('button', { name: 'Connexion' }).click();

    await page.waitForURL(/\/dashboard\//, { timeout: 30000, waitUntil: 'domcontentloaded' });
}

function getBoutonOuLien(page, name) {
    const regex = versRegexInsensibleAuxAccents(name);
    return page
        .getByRole('button', { name: regex })
        .or(page.getByRole('link', { name: regex }));
}

//-----------------------------------------------------------GIVEN-------------------------------------------------------------

Given("L'utilisateur mairie est connecte a son espace", async function () {
    await seConnecterMairie(this.backofficePage);
    await expect(
        this.backofficePage.getByRole('link', { name: 'Mes objets', exact: true })
    ).toBeVisible({ timeout: 10000 });
});

//-----------------------------------------------------------WHEN-------------------------------------------------------------

When("L'utilisateur clique sur le lien {string} dans le menu lateral", async function (linkLabel) {
    const lien = this.backofficePage.getByRole('link', { name: linkLabel, exact: true });
    await clicSur(lien);
    await this.backofficePage.waitForLoadState('domcontentloaded').catch(() => {});
});

When("L'utilisateur clique sur la ligne de l'objet {string}", async function (typeObjet) {
    const ligne = this.backofficePage.getByRole('row').filter({ hasText: typeObjet }).first();
    await clicSur(ligne);
});

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    const conteneur = this.popupActive || this.backofficePage;
    const element = getBoutonOuLien(conteneur, buttonLabel);
    await clicSur(element);
});

When("L'utilisateur renseigne le formulaire du proprietaire avec les informations suivantes:", async function (dataTable) {
    const conteneur = this.popupActive || this.backofficePage;
    const lignes = dataTable.hashes();

    for (const { champ, valeur } of lignes) {
        if (versRegexInsensibleAuxAccents('Civilite').test(champ)) {
            await selectionnerDansDropdown(this.backofficePage, conteneur, champ, valeur);
        } else {
            const champLocator = conteneur.getByLabel(versRegexInsensibleAuxAccents(champ));
            await champLocator.fill(valeur);
        }
    }
});

//-----------------------------------------------------------THEN-------------------------------------------------------------

Then("La page {string} s'affiche", async function (pageName) {
    await expect(
        this.backofficePage.getByRole('heading', { name: pageName, exact: true })
    ).toBeVisible({ timeout: 10000 });
});

Then("Les onglets {string}, {string} et {string} sont disponibles", async function (onglet1, onglet2, onglet3) {
    for (const onglet of [onglet1, onglet2, onglet3]) {
        await expect(getBoutonOuLien(this.backofficePage, onglet)).toBeVisible({ timeout: 10000 });
    }
});

Then("Les boutons {string} et {string} sont disponibles", async function (bouton1, bouton2) {
    const conteneur = this.popupActive || this.backofficePage;
    await expect(getBoutonOuLien(conteneur, bouton1)).toBeVisible({ timeout: 10000 });
    await expect(getBoutonOuLien(conteneur, bouton2)).toBeVisible({ timeout: 10000 });
});

Then("Une pop-up {string} s'affiche", async function (popupTitle) {
    const regex = versRegexInsensibleAuxAccents(popupTitle);
    const popup = this.backofficePage
        .getByRole('dialog', { name: regex })
        .or(this.backofficePage.getByRole('alertdialog', { name: regex }));

    await expect(popup.first()).toBeVisible({ timeout: 10000 });
    this.popupActive = popup.first();
});

Then("La pop-up se ferme sans enregistrer", async function () {
    const regex = versRegexInsensibleAuxAccents('Informations sur le proprietaire de l\'objet');
    const popup = this.backofficePage
        .getByRole('dialog', { name: regex })
        .or(this.backofficePage.getByRole('alertdialog', { name: regex }));

    await expect(popup.first()).toBeHidden({ timeout: 10000 });
    this.popupActive = null;
});