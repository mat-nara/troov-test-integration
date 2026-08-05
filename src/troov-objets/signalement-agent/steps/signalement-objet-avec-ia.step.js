const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');

/*-----------------------------------------WHEN-----------------------------------------*/

When("L'utilisateur clique sur l'icone appareil photo dans la barre du haut", async function () {
  const page = this.backofficePage;

  const boutonCamera = page
    .locator('a:has(i.bxs-camera), button:has(i.bxs-camera), [role="button"]:has(i.bxs-camera), i.bxs-camera')
    .first();

  await boutonCamera.waitFor({ state: 'visible', timeout: 15000 });
  await boutonCamera.click();
});

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = this.backofficePage;
  const el = page.getByRole('link', { name: texte }).or(page.getByRole('button', { name: texte }));
  await el.first().waitFor({ state: 'visible', timeout: 10000 });
  await el.first().click();
});

When("L'utilisateur ajoute 3 photos depuis l'onglet photo", async function () {
  const page = this.backofficePage;

  // this.context conserve la trace des fichiers utilisés dans le scénario en cours
  this.context = this.context || {};

  const picturesDir = path.resolve(__dirname, '../fixtures');
  this.context.photos = [
    path.join(picturesDir, 'cartable 1.jpg'),
    path.join(picturesDir, 'cartable 2.jpg'),
    path.join(picturesDir, 'cartable 3.jpg'),
  ];

  // Clic sur l'icone d'import (en bas à gauche de la pop-in, cf. Image 1)
  // à ne pas confondre avec "Utiliser la caméra"
  const boutonImport = page.locator('button:has(i.bx-upload), [aria-label="Importer une photo"]').first();
  await boutonImport.waitFor({ state: 'visible', timeout: 10000 });
  await boutonImport.click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(this.context.photos);
});

/*-----------------------------------------THEN-----------------------------------------*/

Then("Le formulaire de signalement avec IA s'ouvre", async function () {
  const page = this.backofficePage;
  await expect(page.getByText(/Ajouter un objet avec l[’']IA/i)).toBeVisible({ timeout: 15000 });
});

Then("Le compteur de photos affiche {string}", async function (valeur) {
  const page = this.backofficePage;
  await expect(page.getByText(valeur, { exact: true })).toBeVisible({ timeout: 10000 });
});

Then("Le formulaire de signalement classique s'ouvre", async function () {
  const page = this.backofficePage;
  await expect(page).toHaveURL(/\/items\/add/, { timeout: 15000 });
});

Then("Les 3 photos sont visibles en miniature et le compteur affiche {string}", async function (valeur) {
  const page = this.backofficePage;

  // Les 3 vignettes précises
  await expect(page.getByRole('img', { name: 'Photo 1' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('img', { name: 'Photo 2' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('img', { name: 'Photo 3' })).toBeVisible({ timeout: 15000 });

  // Compteur "3/3"
  await expect(page.getByText(valeur, { exact: true })).toBeVisible({ timeout: 10000 });
});