const { Given, When, Then, Before, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

async function seConnecter(page) {
    console.log('🔄 Connexion automatique avant scénario...');

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

    console.log(`✅ Connecté, URL actuelle: ${page.url()}`);
}

function getBoutonOuLien(page, name) {
    const regex = versRegexInsensibleAuxAccents(name);
    return page
        .getByRole('button', { name: regex })
        .or(page.getByRole('link', { name: regex }))
        // Repli : élément non sémantique stylé comme un bouton (classe .btn),
        // dont le texte visible correspond exactement (après trim) au libellé.
        .or(page.locator('.btn, [class*="btn-"]').filter({ hasText: regex }));
}


// H clic robuste avec repli en force si le clic normal échoue
// -----------------------------------------------------------------------
async function clicSur(locator, { timeout = 10000 } = {}) {
    const el = locator.first();
    await el.waitFor({ state: 'visible', timeout });
    await el.scrollIntoViewIfNeeded().catch(() => {});
    try {
        await el.click({ timeout });
    } catch (err) {
        console.log(`⚠️ Clic normal échoué (${err.message}), tentative en force...`);
        await el.click({ force: true, timeout });
    }
}

function versRegexInsensibleAuxAccents(texte) {
    const equivalences = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
    const echappe = texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = echappe.replace(/[aeiouc]/gi, (car) => equivalences[car.toLowerCase()] || car);
    return new RegExp(pattern, 'i');
}

function getPopupParLabel(page, label) {
    const regex = versRegexInsensibleAuxAccents(label);
    return page
        .getByLabel(regex)
        .or(page.getByRole('dialog', { name: regex }))
        .or(page.getByRole('alertdialog', { name: regex }));
}


// ----------------------------------------------------BEFORE----------------------------------------------- 

Before(async function () {
    await seConnecter(this.backofficePage);
});


//----------------------------------------------------GIVEN---------------------------------------------------

Given("L'utilisateur est connecte a son espace usager", async function () {
    await expect(this.backofficePage.getByTitle('Accueil')).toBeVisible({ timeout: 10000 });
});

Given("L'utilisateur a une annonce active pour un objet perdu", async function () {
    // Le bloc "Mon dernier objet ajouté" doit être visible...
    await expect(this.backofficePage.getByText('Mon dernier objet ajouté')).toBeVisible({ timeout: 10000 });

    try {
        await expect(
            getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')
        ).toBeVisible({ timeout: 10000 });
    } catch (err) {

        const screenshotPath = `screenshots/echec-annonce-active-${Date.now()}.png`;
        await this.backofficePage.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

        const blocObjet = this.backofficePage.locator('*')
            .filter({ hasText: 'Mon dernier objet ajouté' })
            .first();
        const texteBloc = await blocObjet.innerText().catch(() => '(impossible de lire le bloc)');

        throw err;
    }
});

// =========================================================================
// WHEN
// =========================================================================

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    const element = getBoutonOuLien(this.backofficePage, buttonLabel);
    await clicSur(element);
    await this.backofficePage.waitForTimeout(1000);
});

// =========================================================================
// THEN
// =========================================================================

Then("Une pop-up {string} s'affiche", async function (popupTitle) {
    const popup = getPopupParLabel(this.backofficePage, popupTitle);

    try {
        await expect(popup.first()).toBeVisible({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-popup-${Date.now()}.png`;
        throw err;
    }

    this.popupActive = popup.first();

});

Then("Le message {string} est visible", async function (message) {
    const conteneur = this.popupActive || this.backofficePage;
    const regex = versRegexInsensibleAuxAccents(message);
    await expect(conteneur.getByText(regex)).toBeVisible({ timeout: 10000 });
});

Then("Les boutons {string} et {string} sont disponibles", async function (bouton1, bouton2) {
    // Scope automatiquement la recherche à la pop-up active si elle existe,
    // sinon retombe sur toute la page.
    const conteneur = this.popupActive || this.backofficePage;
    await expect(getBoutonOuLien(conteneur, bouton1)).toBeVisible({ timeout: 10000 });
    await expect(getBoutonOuLien(conteneur, bouton2)).toBeVisible({ timeout: 10000 });
});

Then("La pop-up se ferme", async function () {
    // On réutilise la référence stockée par le step "Une pop-up ... s'affiche".
    // Si elle n'existe pas (scénario qui ne serait pas passé par ce step),
    // on retombe sur une recherche générique par le label connu.
    const popup = this.popupActive || getPopupParLabel(this.backofficePage, 'Confirmation objet retrouve');

    try {
        await expect(popup).toBeHidden({ timeout: 10000 });
    } catch (err) {
        await this.backofficePage.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        throw err;
    }
});

Then("Le statut de l'annonce reste inchange \\({string}\\)", async function (statutAttendu) {
    // Preuve indirecte mais fiable : si l'annonce est toujours au statut
    // "Perdu", le bouton "Objet retrouve ?" doit être réapparu/rester visible
    // sur le bloc "Mon dernier objet ajouté" (il aurait disparu si le statut
    // avait changé vers "Trouvé"/"Restitué").
    try {
        await expect(
            getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')
        ).toBeVisible({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-statut-inchange-${Date.now()}.png`;
        throw err;
    }
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
        // Repli : preuve indirecte via la disparition du bouton "Objet retrouve ?"
        try {
            await expect(
                getBoutonOuLien(this.backofficePage, 'Objet retrouve ?')
            ).toBeHidden({ timeout: 10000 });
        } catch (err) {
            const screenshotPath = `screenshots/echec-statut-trouve-${Date.now()}.png`;
            throw err;
        }
    }
});
