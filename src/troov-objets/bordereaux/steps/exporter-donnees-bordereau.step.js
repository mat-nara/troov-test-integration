require('./affichage-bordereaux.step.js');
require('./selectionner-objets-bordereau.step.js'); 

const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------------------WHEN---------------------------------------------*/

When("L'utilisateur clique sur le bouton d'export {string}", async function (nomBouton) {
    // Fonctionne dynamiquement pour "Exporter Excel" ET "Exporter PDF"
    const exportButton = this.backofficePage
        .getByRole('button', { name: nomBouton })
        .or(this.backofficePage.locator('button.p-button', { hasText: nomBouton }))
        .first();

    await expect(exportButton).toBeVisible({ timeout: 10000 });

    // Interception du téléchargement au moment du clic
    this.downloadPromise = this.backofficePage.waitForEvent('download', { timeout: 15000 });
    await exportButton.click();
});

/*-------------------------------------THEN------------------------------------------*/

Then("Le fichier au format {string} se télécharge correctement", async function (format) {
    // Récupération du fichier téléchargé (Excel ou PDF)
    const download = await this.downloadPromise;
    expect(download).toBeTruthy();

    const fileName = download.suggestedFilename();

    // Vérification dynamique de l'extension du fichier généré
    if (format.toLowerCase() === 'excel') {
        expect(fileName).toMatch(/\.(xlsx|xls|csv)$/i);
    } else if (format.toLowerCase() === 'pdf') {
        expect(fileName).toMatch(/\.pdf$/i);
    }
});