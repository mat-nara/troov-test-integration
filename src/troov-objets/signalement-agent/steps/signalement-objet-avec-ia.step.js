const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/*-----------------------------------------HELPER-----------------------------------------*/
function getPage(world) {
  const page = world.page || world.backofficePage;
  if (!page) {
    throw new Error(
      'Aucun page Playwright disponible (this.page / this.backofficePage). Vérifiez les hooks.'
    );
  }
  return page;
}

/*-----------------------------------------GIVEN / BACKGROUND-----------------------------------------*/

Given("l'utilisateur est sur {string}", async function (url) {
  const page = getPage(this);

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

/*-----------------------------------------WHEN-----------------------------------------*/

When("L'utilisateur se connecte avec ces identifiants SSO", async function () {
  const page = getPage(this);

  await page.getByLabel('Email').fill('Mairie@troov.com');
  await page.getByLabel('Mot de passe').fill('Hello(123)');
  await page.getByRole('button', { name: 'Connexion' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
});

When("L'utilisateur clique sur l'icone appareil photo dans la barre du haut", async function () {
  const page = getPage(this);

  const boutonCamera = page
    .locator(
      'a:has(i.bxs-camera), button:has(i.bxs-camera), [role="button"]:has(i.bxs-camera), i.bxs-camera'
    )
    .first();

  await boutonCamera.waitFor({ state: 'visible', timeout: 15000 });
  await boutonCamera.click();
});

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = getPage(this);

  // Cas "Signaler un objet"
  if (/signaler un objet/i.test(texte)) {
    const link = page.locator('a.alert-item-btn', {
      hasText: /Signaler un objet/i
    });
    await expect(link).toBeVisible({ timeout: 10000 });
    await Promise.all([
      page.waitForURL(/\/items\/add/, { timeout: 15000 }),
      link.click()
    ]);
    return;
  }

  // Générique bouton ou lien
  const el = page
    .getByRole('button', { name: new RegExp(texte, 'i') })
    .or(page.getByRole('link', { name: new RegExp(texte, 'i') }));

  await expect(el.first()).toBeVisible({ timeout: 10000 });
  await el.first().click();
});

When("L'utilisateur ajoute 3 photos depuis l'onglet photo", async function () {
  const page = getPage(this);

  this.context = this.context || {};
  const picturesDir = path.resolve(__dirname, '../fixtures');

  this.context.photos = [
    path.join(picturesDir, 'cartable 1.jpg'),
    path.join(picturesDir, 'cartable 2.jpg'),
    path.join(picturesDir, 'cartable 3.jpg'),
  ];

  for (const photo of this.context.photos) {
    if (!fs.existsSync(photo)) {
      throw new Error(`Fichier introuvable : ${photo}`);
    }
  }

  const boutonImport = page
    .locator(
      'button:has(i.bx-upload), [aria-label*="Importer"], button:has-text("Importer")'
    )
    .first();

  const fileInput = page.locator('input[type="file"]').first();

  if (await boutonImport.isVisible().catch(() => false)) {
    await boutonImport.click();
  }

  await expect(fileInput).toBeAttached({ timeout: 10000 });
  await fileInput.setInputFiles(this.context.photos);
});

/*-----------------------------------------THEN-----------------------------------------*/


Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
  const page = getPage(this);
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});

Then("Le formulaire de signalement avec IA s'ouvre", async function () {
  const page = getPage(this);

  await expect(
    page.getByText(/Ajouter un objet avec l[’']IA/i)
  ).toBeVisible({ timeout: 15000 });
});

Then("Le compteur de photos affiche {string}", async function (valeur) {
  const page = getPage(this);

  await expect(
    page.getByText(valeur, { exact: true })
  ).toBeVisible({ timeout: 10000 });
});

Then("Le formulaire de signalement classique s'ouvre", async function () {
  const page = getPage(this);

  await expect(page).toHaveURL(/\/items\/add/, { timeout: 15000 });
});

Then(
  "Les 3 photos sont visibles en miniature et le compteur affiche {string}",
  async function (valeur) {
    const page = getPage(this);

    const miniatures = page.locator(
      'img[alt*="Photo"], .picture-input-root img, .thumbnail img, [class*="preview"] img'
    );

    await expect(miniatures).toHaveCount(3, { timeout: 15000 });

    for (let i = 0; i < 3; i++) {
      await expect(miniatures.nth(i)).toBeVisible({ timeout: 5000 });
    }

    await expect(
      page.getByText(valeur, { exact: true })
    ).toBeVisible({ timeout: 10000 });
  }
);