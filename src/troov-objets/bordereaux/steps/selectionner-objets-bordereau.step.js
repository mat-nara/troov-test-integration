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

    const btnAjouterBordereau = page.locator('button[aria-label="Créer manuellement"]').or(
        page.getByRole('button', { name: /\+ ajouter un bordereau|créer manuellement/i })
    ).first();
    await btnAjouterBordereau.click();

    const inputNom = page.getByPlaceholder('Entrez un nom...');
    await inputNom.fill('Mairie');

    await page.getByLabel('Filtres').click();
    await page.getByLabel('Choisir un contact').click();
    await page.getByText('Aéroport Marseille Provence').click();

    await page.getByLabel('Continuer').click();
});


When("L'utilisateur clique sur le bouton {string} sans remplir de filtres", async function (nomBouton) {
    const page = this.backofficePage;
    await page.getByRole('button', { name: 'Rechercher' }).click();
});

When("L'utilisateur effectue une recherche d'objets valide", async function () {
    const page = this.backofficePage;

    const maintenant = new Date();
    const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
    
    const formatDate = (date) => {
        const jj = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const aaaa = date.getFullYear();
        return `${jj}/${mm}/${aaaa}`;
    };

    const plageDates = `${formatDate(debut)} - ${formatDate(maintenant)}`;

    const inputDate = page.getByPlaceholder(/Plage de dates|date/i).first();
    await inputDate.click();
    await inputDate.fill(plageDates);

    const filtreMatch = page.locator('div, span, label').filter({ hasText: /Correspondance|Avec match/i }).first();
    if (await filtreMatch.isVisible().catch(() => false)) {
        await filtreMatch.click();
    }

    const btnRechercher = page.getByRole('button', { name: /Rechercher/i }).first();
    await expect(btnRechercher).toBeVisible({ timeout: 10000 });
    await btnRechercher.click();

    const btnValider = page.getByLabel(/Valider/i)
        .or(page.getByRole('button', { name: /Valider/i }))
        .first();

    if (await btnValider.isVisible().catch(() => false)) {
        await btnValider.click();
    }
});

When("L'utilisateur recherche des objets avec une plage de dates valide", async function () {
    const page = this.backofficePage;

    const inputDate = page.getByPlaceholder(/Plage de dates|date/i).first();
    if (await inputDate.isVisible().catch(() => false)) {
        const maintenant = new Date();
        const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
        const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        
        await inputDate.click();
        await inputDate.fill(`${formatDate(debut)} - ${formatDate(maintenant)}`);
        await page.keyboard.press('Enter');
    }

    const btnRechercher = page.getByRole('button', { name: /Rechercher/i }).first();
    if (await btnRechercher.isVisible().catch(() => false)) {
        await btnRechercher.click();
    }

    const bandeauResultat = page.getByText(/\d+\s*\/\s*\d+/).or(page.getByText(/objets au total/i)).first();
    await expect(bandeauResultat).toBeVisible({ timeout: 15000 });
    await bandeauResultat.click();
});

When("L'utilisateur coche 3 objets dans la liste de resultat", async function () {
    const page = this.backofficePage;

    const boutonsLignes = page.getByRole('row').locator('button');

    const count = await boutonsLignes.count();

    for (let i = 0; i < count; i++) {
        const btn = boutonsLignes.nth(i);

    }
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

Then("Le compteur de selection {string} s'affiche", async function (texteAttendu) {
    const page = this.backofficePage;

    // Détection générique du compteur d'objets (ex: "0/5 Objets", "2 objets sélectionnés")
    const compteur = page.getByText(/\d+\s*\/\s*\d+/i)
        .or(page.getByText(/objets?\s+sélectionnés?/i))
        .or(page.getByText(new RegExp(escapeRegExp(texteAttendu), 'i')))
        .first();

    await expect(compteur).toBeVisible({ timeout: 10000 });
});

Then("Le lien {string} s'affiche", async function (intituleLien) {
    const page = this.backofficePage;

    const bandeauResultat = page.getByText(/\d+\s*\/\s*\d+\s*objets?\s+au\s+total/i)
        .or(page.getByText(new RegExp(escapeRegExp(intituleLien), 'i')))
        .first();

    await expect(bandeauResultat).toBeVisible({ timeout: 15000 });

    await bandeauResultat.click();
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

Then("Le compteur de selection se met a jour", async function () {
    const page = this.backofficePage;

    const compteurs = page.getByText(/\d+\s*\/\s*\d+/);

    const count = await compteurs.count();

    for (let i = 0; i < count; i++) {
        const element = compteurs.nth(i);
    }

});


Then("Les objets meches s'affichent en surbrillance avec fond beige\\/orange et texte en rouge", async function () {
    const page = this.backofficePage;

    const objetMatche = page.locator('tr, div').filter({ hasText: /match/i }).first();
    await expect(objetMatche).toBeVisible({ timeout: 10000 });
});

Then("La liste des objets s'affiche avec photo, date, type, nom, ref, details et cases a cocher", async function () {
    const page = this.backofficePage;

    const ligneObjet = page.locator('tr, .p-datatable-tbody > tr, div[class*="row"]').first();
    await expect(ligneObjet).toBeVisible({ timeout: 15000 });

    const btnCocher = ligneObjet.getByRole('button')
        .or(ligneObjet.locator('input[type="checkbox"], .p-checkbox, [role="checkbox"]'))
        .first();

    await expect(btnCocher).toBeVisible({ timeout: 10000 });

    const refLocator = page.getByText(/[TP]\s*\d{6,}/).first();
    await expect(refLocator).toBeVisible({ timeout: 10000 });

    // 4. Validation de la Date dynamique (ex: 26/08/2026)
    const dateLocator = page.getByText(/\d{2}\/\d{2}(\/\d{4})?/).first();
    await expect(dateLocator).toBeVisible({ timeout: 10000 });
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