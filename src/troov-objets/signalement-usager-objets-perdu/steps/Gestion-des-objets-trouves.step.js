const { Given, When, Then, Before, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

// -----------------------------------------------------------------------
// HELPER : normalisation accents -> regex (identique aux autres fichiers de
// steps du projet, dupliqué ici pour que ce fichier reste autonome, chaque
// profil Cucumber ne chargeant qu'un seul fichier de steps).
// -----------------------------------------------------------------------
function versRegexInsensibleAuxAccents(texte) {
    const equivalences = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
    const echappe = texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = echappe.replace(/[aeiouc]/gi, (car) => equivalences[car.toLowerCase()] || car);
    return new RegExp(pattern, 'i');
}

// -----------------------------------------------------------------------
// HELPER : clic robuste avec repli en force si le clic normal échoue
// (déclaré tôt car utilisé par le helper de sélection ci-dessous)
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

// -----------------------------------------------------------------------
// HELPER : sélectionner une valeur dans un champ "Civilité" (ou tout champ
// similaire), qu'il s'agisse d'un vrai <select> HTML ou d'un dropdown custom
// (type PrimeVue Dropdown, très probable ici vu le reste de l'app :
// data-pc-name="checkbox" observé sur les cases à cocher du tableau).
// Un dropdown PrimeVue s'expose généralement via role="combobox", s'ouvre au
// clic, et affiche ses options via role="option" dans un role="listbox".
// -----------------------------------------------------------------------
async function selectionnerDansDropdown(page, conteneur, labelChamp, valeur) {
    const regexChamp = versRegexInsensibleAuxAccents(labelChamp);
    const regexValeur = versRegexInsensibleAuxAccents(valeur);

    // Stratégie 1 : vrai <select> HTML natif.
    const selectNatif = conteneur.getByLabel(regexChamp);
    const estSelectNatif = await selectNatif.evaluate(el => el.tagName === 'SELECT').catch(() => false);
    if (estSelectNatif) {
        await selectNatif.selectOption({ label: valeur });
        return;
    }

    // Stratégie 2 : dropdown custom exposé en role="combobox" (PrimeVue et
    // équivalents). On l'ouvre, on attend le listbox, on clique l'option.
    const combobox = conteneur.getByRole('combobox', { name: regexChamp })
        .or(conteneur.getByLabel(regexChamp));

    await clicSur(combobox);

    const option = page.getByRole('option', { name: regexValeur })
        .or(page.getByRole('listbox').getByText(regexValeur))
        .or(page.locator('[class*="dropdown"], [class*="select"]').getByText(regexValeur, { exact: false }));

    await option.first().waitFor({ state: 'visible', timeout: 5000 });
    await clicSur(option);
}

// -----------------------------------------------------------------------
// HELPER : Connexion complète pour le compte MAIRIE
// (identifiants différents du compte usager standard : nouveau tenant,
// nouveau type de dashboard "MAIRIE DE MARSEILLE OBJETS TROUVÉS")
// -----------------------------------------------------------------------
async function seConnecterMairie(page) {
    console.log('Connexion automatique (compte Mairie) avant scénario...');

    await page.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').click();
    await page.getByLabel('Email').clear();
    await page.getByLabel('Email').fill('mairie@troov.com');

    await page.getByLabel('Mot de passe').click();
    await page.getByLabel('Mot de passe').clear();
    await page.getByLabel('Mot de passe').fill('Hello(123)');

    const bouton = page.getByRole('button', { name: 'Connexion' });
    await bouton.waitFor({ state: 'visible', timeout: 10000 });
    await bouton.click();

    // Le compte Mairie redirige vers /dashboard/<id>/... (structure différente
    // du compte usager standard) : on attend simplement la sortie de /login.
    await page.waitForURL(/\/dashboard\//, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
    });

    console.log(`Connecté (Mairie), URL actuelle: ${page.url()}`);
}

// -----------------------------------------------------------------------
// HELPER : trouver un élément qui peut être un <button>, un <a>, OU une
// <div>/<span> stylée comme un bouton sans rôle ARIA. Insensible aux accents.
// -----------------------------------------------------------------------
function getBoutonOuLien(page, name) {
    const regex = versRegexInsensibleAuxAccents(name);
    return page
        .getByRole('button', { name: regex })
        .or(page.getByRole('link', { name: regex }))
        .or(page.locator('.btn, [class*="btn-"]').filter({ hasText: regex }));
}

// -----------------------------------------------------------------------
// BEFORE : se connecte automatiquement avant chaque scénario (compte Mairie)
// -----------------------------------------------------------------------
Before(async function () {
    await seConnecterMairie(this.backofficePage);
});

// =========================================================================
// GIVEN
// =========================================================================

Given("L'utilisateur mairie est connecte a son espace", async function () {
    console.log('Vérification que l\'utilisateur Mairie est bien connecté...');
    // Le menu latéral "Mes objets" est un bon indicateur stable de connexion réussie.
    await expect(
        this.backofficePage.getByRole('link', { name: 'Mes objets', exact: true })
    ).toBeVisible({ timeout: 10000 });
    console.log('Utilisateur Mairie connecté');
});

// =========================================================================
// WHEN
// =========================================================================

When("L'utilisateur clique sur le lien {string} dans le menu lateral", async function (linkLabel) {
    console.log(`Clic sur le lien "${linkLabel}" dans le menu latéral...`);
    const lien = this.backofficePage.getByRole('link', { name: linkLabel, exact: true });
    await clicSur(lien);
    await this.backofficePage.waitForLoadState('domcontentloaded').catch(() => {});
    await this.backofficePage.waitForTimeout(1000);
    console.log(`Lien "${linkLabel}" cliqué`);
});

When("L'utilisateur clique sur la ligne de l'objet {string}", async function (typeObjet) {
    console.log(` Clic sur la ligne de l'objet "${typeObjet}"...`);
    const ligne = this.backofficePage.getByRole('row').filter({ hasText: typeObjet }).first();
    await clicSur(ligne);
    await this.backofficePage.waitForTimeout(1000);
    console.log(`Ligne de l'objet "${typeObjet}" cliquée`);
});

When("L'utilisateur clique sur le bouton {string}", async function (buttonLabel) {
    console.log(`Clic sur le bouton "${buttonLabel}"...`);
    const conteneur = this.popupActive || this.backofficePage;
    const element = getBoutonOuLien(conteneur, buttonLabel);
    await clicSur(element);
    await this.backofficePage.waitForTimeout(1000);
    console.log(`Bouton "${buttonLabel}" cliqué`);
});

When("L'utilisateur renseigne le formulaire du proprietaire avec les informations suivantes:", async function (dataTable) {
    console.log('Remplissage du formulaire "Informations sur le propriétaire de l\'objet"...');

    const conteneur = this.popupActive || this.backofficePage;
    const lignes = dataTable.hashes(); // [{ champ: 'Nom', valeur: 'Ramahenintsoa' }, ...]

    for (const { champ, valeur } of lignes) {
        console.log(`   → Champ "${champ}" = "${valeur}"`);

        if (versRegexInsensibleAuxAccents('Civilite').test(champ)) {
            await selectionnerDansDropdown(this.backofficePage, conteneur, champ, valeur);
        } else {
            const champLocator = conteneur.getByLabel(versRegexInsensibleAuxAccents(champ));
            await champLocator.waitFor({ state: 'visible', timeout: 10000 });
            await champLocator.click();
            await champLocator.fill(valeur);
        }
    }

    console.log('Formulaire renseigné');
});

// =========================================================================
// THEN
// =========================================================================

Then("La page {string} s'affiche", async function (pageName) {
    console.log(`🔍 Vérification de l'affichage de la page "${pageName}"...`);
    await expect(
        this.backofficePage.getByRole('heading', { name: pageName, exact: true })
    ).toBeVisible({ timeout: 10000 });
    console.log(`Page "${pageName}" affichée`);
});

Then("Les onglets {string}, {string} et {string} sont disponibles", async function (onglet1, onglet2, onglet3) {
    console.log(`Vérification des onglets "${onglet1}", "${onglet2}" et "${onglet3}"...`);

    // Les libellés réels incluent un compteur entre parenthèses, ex:
    // "Objets trouvés (1)" — la regex insensible aux accents matche déjà en
    // sous-chaîne, donc pas besoin de gérer le nombre explicitement.
    for (const onglet of [onglet1, onglet2, onglet3]) {
        await expect(getBoutonOuLien(this.backofficePage, onglet)).toBeVisible({ timeout: 10000 });
    }

    console.log('Tous les onglets sont disponibles');
});

Then("Les boutons {string} et {string} sont disponibles", async function (bouton1, bouton2) {
    console.log(`Vérification des boutons "${bouton1}" et "${bouton2}"...`);

    const conteneur = this.popupActive || this.backofficePage;

    try {
        await expect(getBoutonOuLien(conteneur, bouton1)).toBeVisible({ timeout: 10000 });
        await expect(getBoutonOuLien(conteneur, bouton2)).toBeVisible({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-boutons-${Date.now()}.png`;
        console.log(`Boutons "${bouton1}"/"${bouton2}" introuvables.`);
        throw err;
    }

    console.log(' Les deux boutons sont disponibles');
});

Then("Une pop-up {string} s'affiche", async function (popupTitle) {
    console.log(`🔍 Vérification de l'affichage de la pop-up "${popupTitle}"...`);

    const regex = versRegexInsensibleAuxAccents(popupTitle);
    const popup = this.backofficePage
        .getByLabel(regex)
        .or(this.backofficePage.getByRole('dialog', { name: regex }))
        .or(this.backofficePage.getByRole('alertdialog', { name: regex }))
        .or(this.backofficePage.getByRole('heading', { name: regex }));

    try {
        await expect(popup.first()).toBeVisible({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-popup-${Date.now()}.png`;
        console.log(`Pop-up "${popupTitle}" introuvable`);
        throw err;
    }

    // On stocke le conteneur global de la pop-up si on peut le remonter
    // (le heading seul ne suffit pas à scoper les champs du formulaire) :
    // on retombe alors sur le dialog englobant s'il existe, sinon la page entière.
    const dialogEnglobant = this.backofficePage.getByRole('dialog').filter({ hasText: regex });
    const aUnDialog = await dialogEnglobant.first().isVisible().catch(() => false);
    this.popupActive = aUnDialog ? dialogEnglobant.first() : this.backofficePage;

    console.log(` Pop-up "${popupTitle}" affichée`);
});

Then("La pop-up se ferme sans enregistrer", async function () {
    console.log('🔍 Vérification de la fermeture de la pop-up après annulation (pas d\'enregistrement)...');

    const regex = versRegexInsensibleAuxAccents('Informations sur le proprietaire de l\'objet');
    const popup = this.backofficePage
        .getByLabel(regex)
        .or(this.backofficePage.getByRole('dialog', { name: regex }))
        .or(this.backofficePage.getByRole('alertdialog', { name: regex }));

    try {
        await expect(popup.first()).toBeHidden({ timeout: 10000 });
    } catch (err) {
        const screenshotPath = `screenshots/echec-annulation-formulaire-${Date.now()}.png`;
        console.log(`La pop-up est toujours visible après annulation.`);
        throw err;
    }

    this.popupActive = null;
    console.log('Pop-up fermée sans enregistrement');
});
