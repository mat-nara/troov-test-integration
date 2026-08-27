const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/*-----------------------------------------HELPER-----------------------------------------*/
function getPage(world) {
  const page = world.page || world.backofficePage;
  if (!page) {
    throw new Error(
      'Aucun page Playwright disponible (this.page / this.backofficePage). Verifiez les hooks.'
    );
  }
  return page;
}

/*-----------------------------------------GIVEN -----------------------------------------*/

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

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = getPage(this);

  // 1. Signaler un objet
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

if (/lier un nouvel objet/i.test(texte)) {
  const btnLier = page.getByRole('button', {
    name: /Lier un nouvel objet à?a? cette/i
  });
  await btnLier.scrollIntoViewIfNeeded();
  await expect(btnLier).toBeEnabled({ timeout: 20000 });
  await btnLier.click();
  return;
}

  const el = page
    .getByRole('button', { name: new RegExp(texte, 'i') })
    .or(page.getByRole('link', { name: new RegExp(texte, 'i') }));
  await expect(el.first()).toBeVisible({ timeout: 10000 });
  await el.first().click();
});

When("L'utilisateur remplit le formulaire de signalement principal", async function () {
  const page = getPage(this);

  await page.getByRole('img', { name: 'Sacs & Bagages' }).click();
  await page.locator('#category-picker__item-type__bag').getByRole('img').click();

  const marqueSelect = page
    .getByRole('combobox')
    .filter({ hasText: /Indiquez la marque/i })
    .or(
      page.locator('.multiselect, [class*="multiselect"]')
        .filter({ hasText: /Indiquez la marque/i })
    )
    .first();

  await expect(marqueSelect).toBeVisible({ timeout: 10000 });
  await marqueSelect.click();
  await page.waitForTimeout(300);

  await page
    .getByRole('option', { name: '1Voice' })
    .or(page.getByText('1Voice', { exact: true }))
    .first()
    .click();

  await page.locator('#color-picker-row__color__grey').click();

  await page.getByPlaceholder('Indiquez le modèle').fill('HP');

  this.context = this.context || {};
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  this.context.photosPrincipal = [
    path.join(fixturesDir, 'cartable 1.jpg'),
    path.join(fixturesDir, 'cartable 2.jpg'),
    path.join(fixturesDir, 'cartable 3.jpg'),
  ];

  for (const photo of this.context.photosPrincipal) {
    if (!fs.existsSync(photo)) {
      throw new Error(`Fichier introuvable : ${photo}`);
    }
  }

  const fileInput = page
    .locator('#main-content input[type="file"], input[type="file"]')
    .first();
  await expect(fileInput).toBeAttached({ timeout: 10000 });
  await fileInput.setInputFiles(this.context.photosPrincipal);

  await page.getByPlaceholder('Indiquez le prénom').fill('Fanilo');
  await page.getByPlaceholder('Indiquez le nom').fill('Ramahenintsoa');

  const cbPresence = page
    .getByRole('combobox')
    .filter({ hasText: /Veuillez indiquer la pr[eé]sence/i });

  if (await cbPresence.count() > 0) {
    await cbPresence.first().click();
    await page
      .getByRole('option', { name: 'Non', exact: true })
      .locator('span')
      .first()
      .click();
  }

  await page
    .getByPlaceholder(/D[eé]crire au mieux l[’']objet/)
    .fill('test automatisation');
  const lieuSelect = page
    .locator('.form-group .multiselect .multiselect__select')
    .first();

  if (await lieuSelect.isVisible().catch(() => false)) {
    await lieuSelect.click();
    await page.waitForTimeout(300);

    const optionR1 = page
      .locator('.multiselect__content .option__title, .multiselect__option')
      .filter({ hasText: /^R1$/ })
      .first();

    if (await optionR1.isVisible().catch(() => false)) {
      await optionR1.click();
    } else if (await optionR1.count() > 0) {
      // Element present dans le DOM mais cache → force
      await optionR1.click({ force: true });
    }
  }
});

When("L'utilisateur ajoute un objet lie dans le formulaire", async function () {
  const page = getPage(this);

  // 1. Ouvrir la pop-in
  await page.getByRole('button', { name: /Lier un nouvel objet à cette/i }).click();
  await expect(
    page.getByRole('heading', { name: /Ajouter un nouvel objet li[eé]/i })
  ).toBeVisible({ timeout: 10000 });

  const popin = page.getByRole('dialog', {
    name: /Ajouter un nouvel objet li[eé]/i
  });

  await page.getByRole('img', { name: "Carte d'identité" }).click();

  await popin.locator('.multiselect .multiselect__select').first().click();
  await page.waitForTimeout(300);
  await popin.locator('span').filter({ hasText: 'France' }).first().click();

  await page.getByPlaceholder('Indiquez la date de naissance').fill('2000-08-28');

  this.context = this.context || {};
  this.context.photoIA = path.resolve(__dirname, '../fixtures/cin_french_front.jpg');
  if (!fs.existsSync(this.context.photoIA)) {
    throw new Error(`Fichier introuvable : ${this.context.photoIA}`);
  }
  const fileInput = popin.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached({ timeout: 10000 });
  await fileInput.setInputFiles(this.context.photoIA);

  await page.getByRole('textbox', { name: 'Indiquez le nom' }).fill('Mairie');
  await page.getByRole('textbox', { name: 'Indiquez le prénom' }).fill('Mairie');
  const adresseInput = page.getByRole('textbox', { name: /Indiquez votre adresse/i });
  if (await adresseInput.isVisible().catch(() => false)) {
    await adresseInput.fill('test');
    await page.waitForTimeout(800);

    const suggestion = page.locator('.autocomplete-item, [data-type="place"]').first();
    if (await suggestion.isVisible().catch(() => false)) {
      await suggestion.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(300);
  }

  const btnAfficherPlus = page.getByRole('button', { name: /Afficher plus/i });
  if (await btnAfficherPlus.isVisible().catch(() => false)) {
    await btnAfficherPlus.click();
    await page.waitForTimeout(300);
  }

  const lieuSelect = popin.locator('.multiselect .multiselect__select').last();
  if (await lieuSelect.isVisible().catch(() => false)) {
    await lieuSelect.click();
    await page.waitForTimeout(300);
    const optionR1 = popin
      .locator('.option__title, .multiselect__option')
      .filter({ hasText: /^R1$/ })
      .first();
    if (await optionR1.count() > 0) {
      await optionR1.click({ force: true });
    }
  }

  const desc = page.getByRole('textbox', {
    name: /D[eé]crire au mieux l[’']objet/i
  });
  if (await desc.isVisible().catch(() => false)) {
    await desc.fill('test');
  }

  if (page.isClosed()) {
    throw new Error('La page s\'est fermee avant le clic sur Enregistrer');
  }

  const btnEnregistrer = page.getByRole('button', { name: 'Enregistrer' });
  await expect(btnEnregistrer).toBeVisible({ timeout: 10000 });
  await expect(btnEnregistrer).toBeEnabled();
  await btnEnregistrer.click();

  // 12. Succes
  await expect(
    page.getByText(/Objet li[eé] cr[eé][eé]? avec succ[eè]s/i)
  ).toBeVisible({ timeout: 15000 });
});
When("L'utilisateur ajoute une photo pour faire appel a l'IA", async function () {
  const page = getPage(this);

  this.context = this.context || {};
  this.context.photoIA = path.resolve(
    __dirname,
    '../fixtures/cin_french_front.jpg'
  );

  if (!fs.existsSync(this.context.photoIA)) {
    throw new Error(`Fichier introuvable : ${this.context.photoIA}`);
  }

  const fileInput = page
    .getByLabel(/Ajouter un nouvel objet li[eé]/i)
    .locator('input[type="file"]')
    .or(page.locator('input[type="file"]').last());

  await expect(fileInput.first()).toBeAttached({ timeout: 10000 });
  await fileInput.first().setInputFiles(this.context.photoIA);
});

/*-----------------------------------------THEN-----------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
  const page = getPage(this);
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});


Then(
  "Une pop-in s'ouvre proposant un formulaire identique au signalement de base",
  async function () {
    const page = getPage(this);
    await expect(
      page.getByRole('heading', { name: /Ajouter un nouvel objet li[eé]/i })
    ).toBeVisible({ timeout: 10000 });

    // Formulaire identique au signalement de base (categories visibles)
    await expect(
      page.getByRole('img', { name: /Carte d['']identit[eé]/i })
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  "Les champs du formulaire de l'objet lie se remplissent automatiquement",
  async function () {
    const page = getPage(this);

    await expect(
      page.getByPlaceholder(/Indiquez la date de naissance/i)
    ).not.toHaveValue('', { timeout: 15000 });
  }
);

Then(
  "L'objet lie est cree",
  async function () {
    const page = getPage(this);

    const succes = page.getByText(
      /Objet li[eé] cr[eé][eé]? avec succ[eè]s/i
    );

    await expect(succes).toBeVisible({
      timeout: 15000
    });
  }
);