const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*---------------------------------------WHEN---------------------------------------------*/

When("L'utilisateur clique sur le bouton d'export {string}", async function (nomBouton) {
    const page = this.backofficePage;

    // Ciblage du bouton par rôle ou texte (Insensible à la casse)
    const exportButton = page
        .getByRole('button', { name: new RegExp(nomBouton, 'i') })
        .or(page.locator('button.p-button', { hasText: nomBouton }))
        .first();

    await expect(exportButton).toBeVisible({ timeout: 10000 });

    // Interception du téléchargement AVANT le clic
    this.downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await exportButton.click();
});

/*-------------------------------------THEN------------------------------------------*/

Then("Le fichier au format {string} se télécharge correctement", async function (format) {
    // Récupération du fichier téléchargé
    const download = await this.downloadPromise;
    expect(download).toBeTruthy();

    const fileName = download.suggestedFilename();

    // Vérification dynamique de l'extension
    const fmt = format.toLowerCase();
    if (fmt.includes('excel') || fmt === 'xlsx' || fmt === 'xls') {
        expect(fileName).toMatch(/\.(xlsx|xls|csv)$/i);
    } else if (fmt === 'pdf') {
        expect(fileName).toMatch(/\.pdf$/i);
    }
});