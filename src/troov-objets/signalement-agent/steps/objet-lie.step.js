const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');

/*-----------------------------------------WHEN-----------------------------------------*/

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
  this.context = this.context || {};
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  this.context.photosPrincipal = [
    path.join(fixturesDir, 'cartable 1.jpg'),
    path.join(fixturesDir, 'cartable 2.jpg'),
    path.join(fixturesDir, 'cartable 3.jpg'),
  ];
  await page.locator('#main-content input[type="file"]').setInputFiles(this.context.photosPrincipal);

  // Identité
  await page.getByPlaceholder('Indiquez le prénom').fill('Fanilo');
  await page.getByPlaceholder('Indiquez le nom').fill('Ramahenintsoa');

  // Champ "présence" optionnel — un seul s'il existe
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

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = this.backofficePage;
  const el = page.getByRole('link', { name: texte }).or(page.getByRole('button', { name: texte }));
  await el.first().waitFor({ state: 'visible', timeout: 10000 });
  await el.first().click();
});

// --- Ouverture + remplissage manuel de l'objet lié (Carte d'identité) ---
When("L'utilisateur ajoute un objet lie dans le formulaire", async function () {
  const page = this.backofficePage;

  const btnLier = page.getByRole('button', { name: /Lier un nouvel objet à cette/i });
  await btnLier.scrollIntoViewIfNeeded();
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

  // Clic sur Enregistrer
  const btnEnregistrer = page
    .getByLabel('Ajouter un nouvel objet lié')
    .getByRole('button', { name: /Enregistrer/i })
    .or(page.getByRole('button', { name: /Enregistrer/i }).last());

  await btnEnregistrer.scrollIntoViewIfNeeded();
  await expect(btnEnregistrer).toBeEnabled({ timeout: 10000 });
  await btnEnregistrer.click({ force: true });
});

// --- Ouverture de la pop-in "objet lié" seule, sans remplissage (scénario 1) ---
When("L'utilisateur clique sur le bouton {string} pour lier un objet", async function (texte) {
  const page = this.backofficePage;
  const btnLier = page.getByRole('button', { name: texte });
  await btnLier.scrollIntoViewIfNeeded();
  await expect(btnLier).toBeEnabled({ timeout: 20000 });
  await btnLier.click();
});

// --- Ajout d'une photo dans la pop-in objet lié pour déclencher l'IA ---
When("L'utilisateur ajoute une photo pour faire appel à l'IA", async function () {
  const page = this.backofficePage;
  this.context = this.context || {};
  this.context.photoIA = path.resolve(__dirname, '../fixtures/cin_french_front.jpg');

  await page
    .getByLabel('Ajouter un nouvel objet lié')
    .locator('input[type="file"]')
    .setInputFiles(this.context.photoIA);
});

/*-----------------------------------------THEN-----------------------------------------*/

Then("Une pop-in s'ouvre proposant un formulaire identique au signalement de base", async function () {
  const page = this.backofficePage;
  await expect(page.getByLabel('Ajouter un nouvel objet lié')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('img', { name: "Carte d'identité" })).toBeVisible({ timeout: 10000 });
});

Then("Les champs du formulaire de l'objet lié se remplissent automatiquement", async function () {
  const page = this.backofficePage;
  await expect(
    page.getByLabel('Ajouter un nouvel objet lié').getByPlaceholder('Indiquez la date de naissance')
  ).not.toHaveValue('', { timeout: 15000 });
});

Then("L'objet lié est cree et apparait dans la fiche de l'objet principal", async function () {
  const page = this.backofficePage;
  await expect(
    page.getByText("Carte d'identité", { exact: false }).first()
  ).toBeVisible({ timeout: 15000 });
});