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

When("L'utilisateur clique sur l'un des deux boutons de signalement", async function () {
  const page = this.backofficePage;
  await page.getByRole('link', { name: 'Signaler un objet' }).click();
});

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = this.backofficePage;
  const el = page.getByRole('link', { name: texte }).or(page.getByRole('button', { name: texte }));
  await el.first().waitFor({ state: 'visible', timeout: 10000 });
  await el.first().click();
});

// --- Formulaire principal (cartable / Sac) — basé sur le recorder ---
When("L'utilisateur remplit le formulaire de signalement principal", async function () {
  const page = this.backofficePage;

  // Catégorie + type
  await page.getByRole('img', { name: 'Sacs & Bagages' }).click();
  await page.locator('#category-picker__item-type__bag').getByRole('img').click();

  // Couleur Gris
  await page.locator('#color-picker-row__color__grey').click();

  // Modèle
  await page.getByPlaceholder('Indiquez le modèle').fill('HP');

  // Photos (noms avec espaces)
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  await page.locator('#main-content input[type="file"]').setInputFiles([
    path.join(fixturesDir, 'cartable 1.jpg'),
    path.join(fixturesDir, 'cartable 2.jpg'),
    path.join(fixturesDir, 'cartable 3.jpg'),
  ]);

  // Identité
  await page.getByPlaceholder('Indiquez le prénom').fill('Fanilo');
  await page.getByPlaceholder('Indiquez le nom').fill('Ramahenintsoa');

 // Champs "présence" optionnels — un seul s'il existe
const cbPresence = page.getByRole('combobox').filter({ hasText: /Veuillez indiquer la présence/i });
if (await cbPresence.count() > 0) {
  await cbPresence.first().click();
  await page.getByRole('option', { name: 'Non', exact: true }).locator('span').first().click();
}

  // Détails
  await page.getByPlaceholder(/Décrire au mieux l[’']objet/).fill('test automatisation');

  // Lieu R1
  await page.locator('.form-group > div > div > .multiselect > .multiselect__select').click();
  await page.getByText('R1', { exact: true }).click();
});

// --- Objet lié — basé sur le recorder ---
When("L'utilisateur ajoute un objet lie dans le formulaire", async function () {
  const page = this.backofficePage;

  const btnLier = page.getByRole('button', { name: /Lier un nouvel objet à cette/i });

  await btnLier.scrollIntoViewIfNeeded();

  // Attendre que le bouton ne soit plus disabled
  await expect(btnLier).toBeEnabled({ timeout: 20000 });

  await btnLier.click();

  // Choisir Carte d'identité
  await page.getByRole('img', { name: "Carte d'identité" }).click();

  // Nationalité France
await page
  .locator('[id="__BVID__491"] > div > div > .multiselect > .multiselect__select')
  .click();

await page
  .getByLabel('Ajouter un nouvel objet lié')
  .locator('span')
  .filter({ hasText: 'France' })
  .first()
  .click();


  // Date de naissance
  await page.getByPlaceholder('Indiquez la date de naissance').fill('2000-08-28');

// === Clic sur Enregistrer ===
const btnEnregistrer = page
  .getByLabel('Ajouter un nouvel objet lié')
  .getByRole('button', { name: /Enregistrer/i })
  .or(page.getByRole('button', { name: /Enregistrer/i }).last());

await btnEnregistrer.scrollIntoViewIfNeeded();

await expect(btnEnregistrer).toBeEnabled({ timeout: 10000 });

await btnEnregistrer.click({ force: true });

});


/*-----------------------------------------THEN-----------------------------------------*/

Then("Le formulaire de signalement avec IA s'ouvre", async function () {
  const page = this.backofficePage;
  await expect(page.getByText(/Ajouter un objet avec l[’']IA/i)).toBeVisible({ timeout: 15000 });
});

Then("Le formulaire de signalement classique s'ouvre", async function () {
  const page = this.backofficePage;
  await expect(page).toHaveURL(/\/items\/add/, { timeout: 15000 });
});

Then("L'objet lié est cree et apparait dans la fiche de l'objet principal", async function () {
  const page = this.backofficePage;

  await expect(
    page.getByText("Carte d'identité", { exact: false }).first()
  ).toBeVisible({ timeout: 15000 });
});