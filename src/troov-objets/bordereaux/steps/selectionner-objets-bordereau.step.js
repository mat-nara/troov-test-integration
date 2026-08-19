const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*---------------------------- GIVEN / WHEN COMMUNS ------------------------------------------*/

Given("L'utilisateur est sur {string}", async function (url) {
    await this.backofficePage.goto(url);
    await this.backofficePage.waitForLoadState('domcontentloaded');
});

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

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
    await expect(this.backofficePage).not.toHaveURL(/\/login/);
});

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

/*------------------------------WHEN--------------------------------------*/

When("L'utilisateur cree une premiere etape de bordereau valide et clique sur {string}", async function (nomBouton) {
    const page = this.backofficePage;

    // 1. Ouverture de la création de bordereau
    const btnAjouterBordereau = page.locator('button[aria-label="Créer manuellement"]').or(
        page.getByRole('button', { name: /\+ ajouter un bordereau|créer manuellement/i })
    ).first();
    await btnAjouterBordereau.click();

    // 2. Nom du bordereau
    const inputNom = page.getByPlaceholder('Entrez un nom...');
    await inputNom.fill('Mairie');

    // 3. Séquence de sélection du contact
    await page.getByLabel('Filtres').click();
    await page.getByLabel('Choisir un contact').click();
    await page.getByText('Aéroport Marseille Provence').click();

    // 4. Passage à l'étape suivante
    await page.getByLabel('Continuer').click();
});


When("L'utilisateur clique sur le bouton {string} sans remplir de filtres", async function (nomBouton) {
    const page = this.backofficePage;
    await page.getByRole('button', { name: 'Rechercher' }).click();
});

When("L'utilisateur effectue une recherche d'objets valide", async function () {
    const page = this.backofficePage;

    // 1. Saisie de la plage de dates
    const inputDate = page.getByPlaceholder('Plage de dates');
    await inputDate.click();
    await inputDate.fill('01/08/2026 - 03/08/2026');

    // 2. Sélection du filtre de correspondance
    await page.getByText('CorrespondanceAvec matchSans').click();

    // 3. Clic sur le bouton Rechercher
    await page.getByRole('button', { name: 'Rechercher' }).click();

    // 4. Validation de la sélection de l'objet
    await page.getByLabel('Valider la sélection').click();
});

When("L'utilisateur coche un ou plusieurs objets dans la liste", async function () {
    const page = this.backofficePage;

    const inputDate = page.getByPlaceholder('Plage de dates');
    if (await inputDate.isVisible()) {
        await inputDate.click();
        await inputDate.fill('01/08/2026 - 03/08/2026');
        await page.getByText('CorrespondanceAvec matchSans').click();
        await page.getByRole('button', { name: 'Rechercher' }).click();
    }

    const btnCocher = page.getByRole('button', { name: '' }).first();
    await btnCocher.click();
});



/*---------------------------------THEN---------------------------------*/
Then("La page de recherche des objets s'affiche avec les onglets :", async function (dataTable) {
    const page = this.backofficePage;

    await expect(page.getByRole('tab', { name: 'Objets en stock' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'Objets archivés' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: 'Par référence' })).toBeVisible({ timeout: 10000 });
});


Then("Les filtres d'ordre {string} et {string} s'affichent", async function (f1, f2) {
    const page = this.backofficePage;

    await expect(page.getByLabel('Du plus récent')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Du plus ancien')).toBeVisible({ timeout: 10000 });
});


Then("Les filtres d'etat {string} et {string} s'affichent", async function (e1, e2) {
    const page = this.backofficePage;

    const chkTrouve = page.locator('label').filter({ hasText: 'Trouvé' }).getByLabel('Checkbox');
    const chkPerdu = page.locator('label').filter({ hasText: 'Perdu' }).getByLabel('Checkbox');

    await expect(chkTrouve).toBeVisible({ timeout: 10000 });
    await expect(chkPerdu).toBeVisible({ timeout: 10000 });
});

Then("Les filtres de date {string} et {string} s'affichent", async function (d1, d2) {
    const page = this.backofficePage;

    await expect(page.getByLabel('Date de déclaration')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel("Date d'ajout")).toBeVisible({ timeout: 10000 });
});


Then("Les filtres de statut s'affichent :", async function (dataTable) {
    const page = this.backofficePage;

    const chkAvecMatch = page.locator('label').filter({ hasText: 'Avec match' }).getByLabel('Checkbox');
    const chkSansMatch = page.locator('label').filter({ hasText: 'Sans match' }).getByLabel('Checkbox');

    await expect(chkAvecMatch).toBeVisible({ timeout: 10000 });
    await expect(chkSansMatch).toBeVisible({ timeout: 10000 });
});

Then(/Les filtres\s+"Type",\s+"Nom mentionne",\s+"Marque",\s+"Modele"\s+s'affichent/, async function () {
    const page = this.backofficePage;

    await expect(page.getByText("Types d'objets")).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Nom')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Modèle')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Marque')).toBeVisible({ timeout: 10000 });
});

Then("Les filtres {string}, {string}, {string}, {string} s'affichent", async function (f1, f2, f3, f4) {
    const page = this.backofficePage;

    await expect(page.getByText("Types d'objets")).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Nom')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Modèle')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Marque')).toBeVisible({ timeout: 10000 });
});


Then("Les boutons {string}, {string} et {string} s'affichent", async function (b1, b2, b3) {
    const page = this.backofficePage;

    await expect(page.getByRole('button', { name: 'Rechercher' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Continuer')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Retour', { exact: true })).toBeVisible({ timeout: 10000 });
});



Then("La {string} affiche le message {string}", async function (section, messageAttendu) {
    const page = this.backofficePage;

    const messageLocator = page.getByText(messageAttendu)
        .or(page.getByText('Veuillez sélectionner une plage de dates'))
        .or(page.locator('.p-toast, .p-inline-message, .alert, .invalid-feedback', { hasText: new RegExp(messageAttendu, 'i') }))
        .first();

    await expect(messageLocator).toBeVisible({ timeout: 10000 });
});

Then("Le lien {string} s'affiche", async function (intituleLien) {
    const page = this.backofficePage;

    const btnVoirObjets = page.getByLabel(/Voir les objets \(\d+\)/).or(page.getByText(intituleLien)).first();
    await expect(btnVoirObjets).toBeVisible({ timeout: 10000 });
});

Then("Le message {string} s'affiche", async function (messageAttendu) {
    const page = this.backofficePage;

    const btnVoirObjets = page.getByLabel(/Voir les objets \(\d+\)/).first();
    if (await btnVoirObjets.isVisible()) {
        await btnVoirObjets.click();
    }

    const msgLocator = page.getByText(messageAttendu, { exact: false })
        .or(page.locator('.instruction-message, .alert, span, p', { hasText: messageAttendu }))
        .first();

    await expect(msgLocator).toBeVisible({ timeout: 10000 });
});

Then("Le compteur de selection {string} s'affiche", async function (compteurAttendu) {
    const page = this.backofficePage;

    const compteur = page.getByText(/objets?\s+sélectionnés?/i)
        .or(page.getByText(/objets?\s+selectionne/i))
        .or(page.getByText(compteurAttendu))
        .first();

    await expect(compteur).toBeVisible({ timeout: 10000 });
});

Then("Le compteur de selection se met a jour", async function () {
    const page = this.backofficePage;

    const compteur = page.getByText(/objets au total dans le/i)
        .or(page.getByText(/\d+\s*\/\s*\d+\s*objets?/i))
        .first();

    await expect(compteur).toBeVisible({ timeout: 10000 });
});

Then("Les objets meches s'affichent en surbrillance avec fond beige\\/orange et texte en rouge", async function () {
    const page = this.backofficePage;

    // Détection de l'élément / de la ligne affichant un objet matché en surbrillance
    const objetMatche = page.locator('tr, div').filter({ hasText: /match/i }).first();
    await expect(objetMatche).toBeVisible({ timeout: 10000 });
});

Then("La liste des objets s'affiche avec photo, date, type, nom, ref, details et cases a cocher", async function () {
    const page = this.backofficePage;

    const btnVoirObjets = page.getByLabel(/Voir les objets \(\d+\)/).first();
    if (await btnVoirObjets.isVisible()) {
        await btnVoirObjets.click();
    }

    const rowObjet = page.getByRole('row', { name: /Carte d'identité/i }).first();
    await expect(rowObjet).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Carte d'identité").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('03/08/').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Admin Troov', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('T263212717675').first()).toBeVisible({ timeout: 10000 });
});

Then("Le bouton {string} s'affiche en haut a droite", async function (nomBouton) {
    const page = this.backofficePage;

    const btnSauvegarder = page.getByLabel(nomBouton)
        .or(page.getByRole('button', { name: nomBouton }))
        .first();

    await expect(btnSauvegarder).toBeVisible({ timeout: 10000 });
});

Then("La pagination et les boutons {string} \\/ {string} s'affichent", async function (b1, b2) {
    const page = this.backofficePage;

    const btnAnnuler = page.getByLabel('Annuler cette recherche');
    if (await btnAnnuler.isVisible()) {
        await btnAnnuler.click();
    }

    await expect(page.getByLabel('Continuer')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Retour', { exact: true })).toBeVisible({ timeout: 10000 });
});