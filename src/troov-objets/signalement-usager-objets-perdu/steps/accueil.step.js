const { Given, When, Then, Before, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);


// HELPER : Connexion complète (login -> dashboard)
// -----------------------------------------------------------------------
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


// HELPER : trouver un élément qui peut être soit un <button>, soit un <a>
// -----------------------------------------------------------------------
function getBoutonOuLien(page, name) {
    return page.getByRole('button', { name }).or(page.getByRole('link', { name }));
}


// (essaie plusieurs stratégies : texte, role alert/dialog, conteneur parent)
// -----------------------------------------------------------------------
function getPopupCompteNonVerifie(page) {
    return page
        .getByText('Compte non vérifié', { exact: false })
        .or(page.getByRole('alert').filter({ hasText: /compte non v[ée]rifi[ée]/i }))
        .or(page.getByRole('dialog').filter({ hasText: /compte non v[ée]rifi[ée]/i }))
        .or(page.locator('*').filter({ hasText: /^Compte non vérifié$/ }));
}

// HELPER : attendre qu'un élément soit stable (visible + non animé) avant clic
// -----------------------------------------------------------------------
async function clicSur(locator, { timeout = 10000, force = false } = {}) {
    const el = locator.first();
    await el.waitFor({ state: 'visible', timeout });
    await el.scrollIntoViewIfNeeded().catch(() => {});
    try {
        await el.click({ timeout, trial: false });
    } catch (err) {
        await el.click({ force: true, timeout });
    }
}


// BEFORE : se connecte automatiquement avant chaque scénario
// -----------------------------------------------------------------------
Before(async function () {
    await seConnecter(this.backofficePage);
});


//----------------------------------------------GIVEN----------------------------------------------------------------------

Given("L'utilisateur est connecte a son espace usager", async function () {
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur a declare au moins un objet perdu", async function () {
    await expect(this.backofficePage.getByText('Mon dernier objet ajouté')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur est sur la page {string}", async function (pageName) {
    if (pageName === 'Accueil') {
        await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
    } else if (pageName === 'Mes objets') {
        // Si on n'y est pas déjà, on y navigue directement
        if (!/\/items/.test(this.backofficePage.url())) {
            const lien = this.backofficePage.getByRole('link', { name: 'Mes objets', exact: true });
            await clicSur(lien);
            await this.backofficePage.waitForURL(/\/items/, { timeout: 15000 }).catch(() => {});
        }
    } else {
        // Fallback générique : on vérifie juste la présence d'un titre correspondant
        await expect(
            this.backofficePage.getByRole('heading', { name: pageName, exact: false })
                .or(this.backofficePage.getByTitle(pageName))
        ).toBeVisible({ timeout: 10000 });
    }
});


//-----------------------------------------------WHEN-----------------------------------------------------------------------

When("L'utilisateur accede a la page {string}", async function (pageName) {
    const lien = this.backofficePage.getByRole('link', { name: pageName, exact: true });
    await clicSur(lien);
    await this.backofficePage.waitForLoadState('domcontentloaded').catch(() => {});
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    const element = getBoutonOuLien(this.backofficePage, buttonLabel);

    if (buttonLabel === "Renvoyer l'email de confirmation") {
        // On écoute la réponse réseau en parallèle du clic
        const [response] = await Promise.all([
            this.backofficePage.waitForResponse(
                resp => /resend|confirm|email/i.test(resp.url()) && resp.request().method() === 'POST',
                { timeout: 10000 }
            ),
            clicSur(element),
        ]);
        this.derniereReponseAPI = response;
    } else {
        await clicSur(element);
    }

    await this.backofficePage.waitForTimeout(500);
});

When("L'utilisateur clique sur le lien {string} dans le menu lateral", async function (linkLabel) {
    const lien = this.backofficePage.getByRole('link', { name: linkLabel, exact: true });
    await clicSur(lien);
    await this.backofficePage.waitForTimeout(1000);
});

When("L'utilisateur clique sur le popup {string}", async function (popupLabel) {
    let popup;
    if (popupLabel.toLowerCase().includes('compte non verifi') || popupLabel.toLowerCase().includes('compte non vérifi')) {
        popup = getPopupCompteNonVerifie(this.backofficePage);
    } else {
        popup = this.backofficePage.getByText(popupLabel, { exact: false });
    }

    await popup.first().waitFor({ state: 'visible', timeout: 10000 });
    // Le popup sert souvent juste de conteneur informatif : on le "touche"
    // sans bloquer si le clic ne déclenche aucune navigation.
    await clicSur(popup);
    await this.backofficePage.waitForTimeout(500);
});



//---------------------------------------------------THEN-----------------------------------------------------------------------

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
    // Le clic ouvre probablement une modale/panneau plutôt qu'une nouvelle page.
    const formulaireVisible = this.backofficePage.locator('form')
        .or(this.backofficePage.getByRole('dialog'))
        .or(this.backofficePage.getByRole('heading', { name: /signaler|déclaration/i }));

    await expect(formulaireVisible.first()).toBeVisible({ timeout: 10000 });
    // Retour à l'état initial : clic sur "Accueil"
    const lienAccueil = this.backofficePage.getByRole('link', { name: 'Accueil', exact: true });
    await clicSur(lienAccueil);
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Then("L'utilisateur est redirige vers la page listant tous ses objets declares", async function () {
    await this.backofficePage.waitForURL(/\/items/, { timeout: 15000 });
});

Then("L'utilisateur est de retour sur la page d'accueil", async function () {
    await this.backofficePage.waitForURL(/\/dashboard\/.*\/user|\/accueil/, { timeout: 15000 }).catch(() => {});
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Then("Le popup {string} disparait", async function (popupLabel) {
    let popup;
    if (/compte non v[ée]rifi[ée]/i.test(popupLabel)) {
        popup = getPopupCompteNonVerifie(this.backofficePage);
    } else {
        popup = this.backofficePage.getByText(popupLabel, { exact: false });
    }

    try {
        await expect(popup.first()).toBeHidden({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-disparition-popup-${Date.now()}.png`;
        throw err;
    }
});