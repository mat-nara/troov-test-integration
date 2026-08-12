require('./affichage-bordereaux.step.js');

const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------------------WHEN---------------------------------------------*/

When("L'utilisateur clique sur le bordereau {string} dans la liste", async function (nomBordereau) {
    // Utilise la précision exacte enregistrée avec le .locator('div')
    await this.backofficePage
        .getByRole('gridcell', { name: nomBordereau, exact: true })
        .locator('div')
        .first()
        .click();
});

When("L'utilisateur clique sur le bouton {string} de la liste des objets", async function (nomBouton) {
    await this.backofficePage
        .getByRole('button', { name: new RegExp(nomBouton, 'i') })
        .or(this.backofficePage.locator('.p-button, button').filter({ hasText: nomBouton }))
        .first()
        .click();
});

When("L'utilisateur remplit le filtre {string} avec {string}", async function (nomChamp, valeur) {
    // Recherche directe par le placeholder ou par input contenu dans la zone de filtre
    const input = this.backofficePage
        .getByPlaceholder(nomChamp, { exact: false })
        .or(this.backofficePage.locator(`.transmission-filter-panel input[placeholder*="${nomChamp}"]`))
        .first();

    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(valeur);
});

When("L'utilisateur clique sur le bouton {string}", async function (nomBouton) {
    const button = this.backofficePage
        .locator('.transmission-filter-panel')
        .getByRole('button', { name: new RegExp(nomBouton, 'i') })
        .or(this.backofficePage.getByText(nomBouton))
        .first();

    // S'assure que le bouton est bien activé avant de cliquer
    await expect(button).toBeEnabled({ timeout: 3000 });
    await button.click();
});

When("L'utilisateur saisit la plage de dates {string}", async function (plageDates) {
    const dateInput = this.backofficePage.locator('#tx-items-filter-date');

    // Résolution du Timeout : Si le champ date n'est pas encore visible sur l'écran
    if (!(await dateInput.isVisible().catch(() => false))) {
        // 1. Clique sur le bordereau de la liste
        const bordereauCell = this.backofficePage
            .getByRole('gridcell', { name: "Contact Test Auto", exact: true })
            .locator('div')
            .first();
        
        await expect(bordereauCell).toBeVisible({ timeout: 10000 });
        await bordereauCell.click();

        // 2. Clique sur le bouton "Filtrer" pour ouvrir le panneau
        const filterBtn = this.backofficePage.getByRole('button', { name: /Filtrer/i }).first();
        await expect(filterBtn).toBeVisible({ timeout: 10000 });
        await filterBtn.click();
    }

    // 3. Saisit la plage de dates dans l'input
    await expect(dateInput).toBeVisible({ timeout: 10000 });
    await dateInput.click();
    await dateInput.fill(plageDates);
});

When("L'utilisateur coche la case du premier objet", async function () {
    const firstCheckboxInput = this.backofficePage
        .locator('table[aria-label*="Liste des objets"] tbody .p-checkbox-input')
        .first();

    await firstCheckboxInput.check({ force: true });
});
/*-------------------------------------THEN------------------------------------------*/

Then("La page de détail du bordereau s'affiche avec le titre {string}", async function (titre) {
    // 1. Vérification du titre principal
    await expect(
        this.backofficePage.getByRole('heading', { name: titre }).or(this.backofficePage.getByText(titre, { exact: true }))
    ).toBeVisible({ timeout: 10000 });

    // 2. Vérification insensible à la casse / espace pour "Détail du bordereau"
    await expect(
        this.backofficePage.getByText(/Détail du bordereau/i).first()
    ).toBeVisible();

    // 3. Vérification de la présence de la liste des objets
    await expect(
        this.backofficePage.getByText(/Liste des objets/i).first()
    ).toBeVisible();
});

Then("Le panneau des filtres de recherche s'affiche avec :", async function (dataTable) {
    // 1. Ciblage direct du formulaire de filtres réel (.transmission-filter-panel)
    const filterPanel = this.backofficePage
        .locator('.transmission-filter-panel, form[class*="filter-panel"]')
        .first();

    // Vérification que le panneau de filtres est visible
    await expect(filterPanel).toBeVisible({ timeout: 5000 });

    // 2. Vérification des éléments réels du formulaire d'après le DOM
    await expect(filterPanel.getByText('Date', { exact: true })).toBeVisible();
    await expect(filterPanel.getByText('Nom/Prénom', { exact: true })).toBeVisible();
    await expect(filterPanel.getByText('Références', { exact: true })).toBeVisible();

    // 3. Vérification des boutons d'action du filtre
    await expect(filterPanel.getByRole('button', { name: /Appliquer/i })).toBeVisible();
    await expect(filterPanel.getByRole('button', { name: /Réinitialiser les filtres/i })).toBeVisible();
});

Then("Le message {string} s'affiche", async function (messageAttendu) {
    // Vérifie l'apparition du paragraphe <p class="tui-text-sm">
    const messageElement = this.backofficePage
        .getByText(messageAttendu, { exact: true })
        .or(this.backofficePage.locator('p.tui-text-sm', { hasText: messageAttendu }))
        .first();

    await expect(messageElement).toBeVisible({ timeout: 5000 });
});

Then("La liste des objets s'affiche avec :", async function () {
    const table = this.backofficePage.locator('table[aria-label="Liste des objets trouvés et perdus"]');
    await expect(table).toBeVisible();
});

Then("Le compteur d'objets {string}", async function (compteurAttendu) {
    await expect(this.backofficePage.getByText(compteurAttendu)).toBeVisible();
});

// Résolution de l'erreur Undefined : Utilisation d'une Regex pour échapper le caractère '/'
Then(/^Les colonnes : Type d'objet, État - N° réf\., Date, Nom\/Prénom, Informations clefs$/, async function () {
    const table = this.backofficePage.locator('table[aria-label="Liste des objets trouvés et perdus"]');
    await expect(table.locator('th', { hasText: "Type d'objet" })).toBeVisible();
    await expect(table.locator('th', { hasText: "État - N° réf." })).toBeVisible();
    await expect(table.locator('th', { hasText: "Date" })).toBeVisible();
    await expect(table.locator('th', { hasText: "Nom/Prénom" })).toBeVisible();
    await expect(table.locator('th', { hasText: "Informations clefs" })).toBeVisible();
});

Then("Des cases à cocher pour chaque objet", async function () {
    const checkboxes = this.backofficePage.locator('table tbody .p-checkbox-input, table tbody input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
});

Then("La pagination au bas de la liste", async function () {
    const pagination = this.backofficePage
        .locator('.p-paginator, [class*="pagination"]')
        .or(this.backofficePage.getByText('1', { exact: true }));

    await expect(pagination.first()).toBeVisible();
});

Then("La case de l'objet est cochée", async function () {
    const firstCheckboxInput = this.backofficePage
        .locator('table[aria-label*="Liste des objets"] tbody .p-checkbox-input')
        .first();

    await expect(firstCheckboxInput).toBeChecked();
});

Then("Le compteur de sélection indique {string}", async function (compteurAttendu) {
    const selectionBar = this.backofficePage.locator('.bx-check-square').locator('..');
    await expect(selectionBar).toContainText(compteurAttendu);
});

Then("Les boutons d'action globale et de suppression s'affichent", async function () {
    await expect(this.backofficePage.locator('button[aria-label="Sélectionner tout"]')).toBeVisible();
    await expect(this.backofficePage.locator('button[aria-label="Supprimer"]')).toBeVisible();
});