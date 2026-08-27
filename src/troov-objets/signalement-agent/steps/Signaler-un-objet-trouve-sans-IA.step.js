const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/*-----------------------------------------GIVEN--------------------------------------*/

Given('l\'utilisateur est sur {string}', async function (url) {
  await this.page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });
});

Given('L agent est sur la page d accueil', async function () {
  await expect(this.page).toHaveURL(/\/dashboard/);
});

Given('L agent est sur la page de signalement', async function () {
  if (!this.page.url().includes('/items/add')) {

    const btn = this.page.locator(
      'a.alert-item-btn',
      { hasText: 'Signaler un objet' }
    );

    if (await btn.isVisible()) {
      await btn.click();
    } else {
      await this.page.goto(
        'http://localhost:3000/dashboard/5ece3fb6b472c40472cb73cd/items/add'
      );
    }
  }

  await expect(this.page).toHaveURL(/\/items\/add/);
});

Given('L agent ouvre le formulaire de signalement', async function () {
  if (!this.page.url().includes('/items/add')) {

    const btn = this.page.locator(
      'a.alert-item-btn',
      { hasText: 'Signaler un objet' }
    );

    if (await btn.isVisible()) {
      await btn.click();
    } else {
      await this.page.goto(
        'http://localhost:3000/dashboard/5ece3fb6b472c40472cb73cd/items/add'
      );
    }
  }

  await expect(this.page).toHaveURL(/\/items\/add/);
});

Given('L agent est sur le formulaire de signalement', async function () {
  if (!this.page.url().includes('/items/add')) {

    const btn = this.page.locator(
      'a.alert-item-btn',
      { hasText: 'Signaler un objet' }
    );

    if (await btn.isVisible()) {
      await btn.click();
    } else {
      await this.page.goto(
        'http://localhost:3000/dashboard/5ece3fb6b472c40472cb73cd/items/add'
      );
    }
  }

  await expect(this.page).toHaveURL(/\/items\/add/);
});


Given('L agent a valide le formulaire de signalement', async function () {
  // 1. Accéder au formulaire
  if (!this.page.url().includes('/items/add')) {
    const link = this.page.locator('a.alert-item-btn', {
      hasText: /Signaler un objet/i
    });
    await expect(link).toBeVisible({ timeout: 10000 });
    await Promise.all([
      this.page.waitForURL(/\/items\/add/, { timeout: 15000 }),
      link.click()
    ]);
  }
  await expect(this.page).toHaveURL(/\/items\/add/, { timeout: 10000 });

  // 2. Catégorie Sacs & Bagages
  await this.page
    .getByRole('img', { name: 'Sacs & Bagages' })
    .click();

  // 3. Type de sac
  await this.page
    .locator('#category-picker__item-type__bag')
    .getByRole('img')
    .click();

  // 4. Marque 1Voice  ← CORRIGÉ
  const marqueSelect = this.page
    .getByRole('combobox')
    .filter({ hasText: /Indiquez la marque/i })
    .or(
      this.page.locator('.multiselect, [class*="multiselect"]')
        .filter({ hasText: /Indiquez la marque/i })
    )
    .first();

  await expect(marqueSelect).toBeVisible({ timeout: 10000 });
  await marqueSelect.click();
  await this.page.waitForTimeout(300);

  await this.page
    .getByRole('option', { name: '1Voice' })
    .or(this.page.getByText('1Voice', { exact: true }))
    .first()
    .click();
  // 5. Importer les photos
  const imagePaths = [
    'cartable 1.jpg',
    'cartable 2.jpg',
    'cartable 3.jpg'
  ].map(fileName =>
    path.resolve(__dirname, '../fixtures', fileName)
  );

  for (const imagePath of imagePaths) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Fichier introuvable : ${imagePath}`);
    }
  }

  await this.page
    .getByText('Importer des images', { exact: true })
    .click();

  // 6. Couleur noire
  await this.page
    .locator('#color-picker-row__color__black')
    .click();

  // 7. Modèle
  await this.page
    .getByPlaceholder('Indiquez le modèle')
    .fill('HP');

  // 8. Prénom
  await this.page
    .getByPlaceholder('Indiquez le prénom')
    .fill('Mairie');

  // 9. Nom
  await this.page
    .getByPlaceholder('Indiquez le nom')
    .fill('Troov');

  // 10. Présence  ← CORRIGÉ (même problème d’ID)
  const presenceSelect = this.page
    .getByRole('combobox')
    .filter({ hasText: /Veuillez indiquer la présence/i })
    .or(
      this.page.locator('.multiselect, [class*="multiselect"]')
        .filter({ hasText: /Veuillez indiquer la présence/i })
    )
    .first();

  await expect(presenceSelect).toBeVisible({ timeout: 10000 });
  await presenceSelect.click();

  // 11. Description
  await this.page
    .getByPlaceholder('Décrire au mieux l’objet et')
    .fill('Sacs trouvé');

  // 12. Vérifier le bouton
  const addButton = this.page.getByRole('button', {
    name: 'Ajouter mon annonce'
  });
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await expect(addButton).toBeEnabled();
});


/*--------------------------------------WHEN------------------------------------*/

When('L\'utilisateur se connecte avec ces identifiants SSO', async function () {

  await this.page
    .getByLabel('Email')
    .fill('Mairie@troov.com');

  await this.page
    .getByLabel('Mot de passe')
    .fill('Hello(123)');

  await this.page
    .getByRole('button', {
      name: 'Connexion'
    })
    .click();

  await this.page.waitForURL(
    /\/dashboard/
  );
});


When('L agent clique sur le bouton {string}', async function (buttonName) {
  // Cas spécifique "Signaler un objet"
  if (/signaler un objet/i.test(buttonName)) {
    const link = this.page.locator('a.alert-item-btn', {
      hasText: /Signaler un objet/i
    });

    await expect(link).toBeVisible({ timeout: 10000 });
    await expect(link).toBeEnabled();

    // Attendre la navigation en même temps que le clic
    await Promise.all([
      this.page.waitForURL(/\/items\/add/, { timeout: 15000 }),
      link.click()
    ]);
    return;
  }

  // --- reste du code générique pour les autres boutons ---
  const button = this.page.getByRole('button', {
    name: new RegExp(buttonName, 'i')
  });

  if (await button.count() > 0) {
    await expect(button).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled();
    await button.click();
    return;
  }

  const link = this.page.getByRole('link', {
    name: new RegExp(buttonName, 'i')
  });
  await expect(link).toBeVisible({ timeout: 10000 });
  await link.click();
});


When('L agent clique sur un objet dans la barre de signalement express', async function () {

  const expressObject = this.page
    .locator('.ranking-type')
    .first();

  await expressObject.waitFor({
    state: 'visible'
  });

  await expressObject.click();
});


When('L agent remplit les champs obligatoires du formulaire', async function () {

  const categoryBtn = this.page
    .locator(
      '.type-img-category, .ranking-type'
    )
    .first();

  if (await categoryBtn.isVisible()) {
    await categoryBtn.click();
  }

  const brandInput = this.page
    .getByPlaceholder(
      'Indiquez la marque'
    )
    .or(
      this.page.locator(
        'input[placeholder*="marque"]'
      )
    )
    .first();

  if (await brandInput.isVisible()) {
    await brandInput.fill('1Voice');
  }
});

When('L agent remplit les champs optionnels du formulaire', async function () {

  const modelInput = this.page
    .getByPlaceholder('HP')
    .or(
      this.page.locator(
        'input[placeholder*="HP"]'
      )
    )
    .first();

  if (await modelInput.isVisible()) {
    await modelInput.fill('HP ProBook');
  }

  const firstNameInput = this.page
    .getByPlaceholder('Faniloniaina')
    .or(
      this.page.locator(
        'input[placeholder*="Faniloniaina"]'
      )
    )
    .first();

  if (await firstNameInput.isVisible()) {
    await firstNameInput.fill(
      'Faniloniaina'
    );
  }

  const lastNameInput = this.page
    .getByPlaceholder('Ramahenintsoa')
    .or(
      this.page.locator(
        'input[placeholder*="Ramahenintsoa"]'
      )
    )
    .first();

  if (await lastNameInput.isVisible()) {
    await lastNameInput.fill(
      'Ramahenintsoa'
    );
  }

  const detailInput = this.page
    .getByPlaceholder('sdddfd')
    .or(
      this.page.locator(
        'textarea, input[placeholder*="sdddfd"]'
      )
    )
    .first();

  if (await detailInput.isVisible()) {
    await detailInput.fill(
      'Objet trouvé à la réception.'
    );
  }
});

When('L agent selectionne et importe une photo depuis l ordinateur', async function () {

  const fileNames = [
    'cartable 1.jpg',
    'cartable 2.jpg',
    'cartable 3.jpg'
  ];

  const imagePaths = fileNames.map(
    fileName =>
      path.resolve(
        __dirname,
        '../fixtures',
        fileName
      )
  );

  for (const imagePath of imagePaths) {

    if (!fs.existsSync(imagePath)) {
      throw new Error(
        `Fichier introuvable : ${imagePath}`
      );
    }
  }

  const importImages = this.page.getByText(
    'Importer des images',
    {
      exact: true
    }
  );

  await expect(importImages).toBeVisible({
    timeout: 10000
  });

  await importImages.click();

  // Chercher le input file
  const fileInput = this.page.locator(
    'input[type="file"]'
  );

  await expect(fileInput).toBeAttached({
    timeout: 10000
  });

  await fileInput.setInputFiles(
    imagePaths
  );

  console.log(
    '✓ Photos importées avec succès'
  );
});


/*----------------------------------THEN------------------------------*/

Then('L\'utilisateur arrive sur sa page d\'accueil agent', async function () {

  await expect(this.page).toHaveURL(
    /\/dashboard/
  );
});


Then('La page de signalement s affiche', async function () {
  await expect(this.page).toHaveURL(/\/items\/add/, {
    timeout: 15000
  });
});

Then('La page de signalement correspondante s affiche', async function () {

  await expect(this.page).toHaveURL(
    /\/items\/add/
  );
});


Then('Tous les champs requis sont valides', async function () {

  const invalidFields = this.page.locator(
    ':invalid, .is-invalid, .error-message'
  );

  await expect(invalidFields).toHaveCount(0);
});


Then(
  'Les champs "trouve", "date" et "partenaires" sont pre-remplis automatiquement',
  async function () {

    const dateInput = this.page
      .locator('input.form-control')
      .first();

    await expect(dateInput).not.toHaveValue('');

    const partnerHeader = this.page
      .locator(
        'text=/MAIRIE DE MARSEILLE/i'
      )
      .first();

    await expect(
      partnerHeader
    ).toBeVisible();

    const categoryOrTitle = this.page
      .locator(
        'text=Quand ?'
      )
      .first();

    await expect(
      categoryOrTitle
    ).toBeVisible();
  }
);


Then(
  'Les champs pre-remplis restent modifiables',
  async function () {

    const dateInput = this.page
      .locator(
        '.vc-popover-content-wrapper input, input.form-control'
      )
      .locator('visible=true')
      .first();

    await expect(
      dateInput
    ).toBeEnabled();

    await expect(
      dateInput
    ).not.toHaveAttribute(
      'readonly',
      ''
    );

    await dateInput.click({
      force: true
    });

    await dateInput.fill(
      '01/08/2026 10:00'
    );

    await expect(
      dateInput
    ).toHaveValue(
      '01/08/2026 10:00'
    );
  }
);


Then(
  'La photo est chargee avec succes dans le formulaire',
  async function () {

    const photoPreview = this.page
      .locator(
        '.picture-input-root img'
      )
      .first();

    await expect(
      photoPreview
    ).toBeVisible({
      timeout: 10000
    });
  }
);


Then(
  'L annonce est ajoutee avec succes',
  async function () {

    const successMessage = this.page.getByText(
      /Bravo, votre objet a bien ét/i
    );

    await expect(
      successMessage
    ).toBeVisible({
      timeout: 15000
    });
  }
);


Then(
  'L agent est redirige vers la page de l objet',
  async function () {

    await this.page.waitForURL(
      /\/items\//,
      {
        timeout: 15000
      }
    );

    console.log(
      'URL après création :',
      this.page.url()
    );
  }
);