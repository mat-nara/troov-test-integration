const { Given, When, Then } = require('@cucumber/cucumber');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ========== Configuration A4 ==========
const COULEURS = {
  Noir: 'black',
  Gris: 'grey',
  Bleu: 'blue',
  'Avec motif': 'pattern'   // a adapter si l'ID reel est different (ex: motif, patterned, etc.)
};

const LIGNE_MATCH = {
  marque: 'KIPLING',
  modele: 'sac a dos'
};

// ========== Couleur ==========
function obtenirCouleur(couleur) {
  const identifiant = COULEURS[couleur];
  if (!identifiant) {
    throw new Error(`Couleur "${couleur}" non configuree.`);
  }
  return identifiant;
}

async function ouvrirFicheMatch(page, maxTentatives = 6) {
  // 1. Menu "Mes objets"
  const menu = page
    .locator('a.side-nav-link-ref', { hasText: 'Mes objets' })
    .first();
  await menu.waitFor({ state: 'visible', timeout: 15000 });
  const href = await menu.getAttribute('href');
  await menu.click();

  // 2. Ligne cible
  const lignes = page
    .locator('tr.tui-cursor-pointer')
    .filter({ hasText: LIGNE_MATCH.marque })
    .filter({ hasText: /sac\s*a?\s*dos/i })
    .filter({ has: page.getByRole('img', { name: 'Match potentiel' }) });

  for (let i = 1; i <= maxTentatives; i++) {
    const ligne = lignes.first();
    const visible = await ligne
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (visible) {
      await ligne.locator('td').nth(1).click({ force: true });
      return;
    }

    if (href) {
      const url = new URL(href, BASE_URL);
      url.searchParams.set('end', new Date(Date.now() + 60 * 60 * 1000).toISOString());
      await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    } else {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  throw new Error(
    `Aucune ligne "Match potentiel" (${LIGNE_MATCH.marque} / ${LIGNE_MATCH.modele}) trouvee apres ${maxTentatives} tentatives.`
  );
}

// ========== Adresse (formulaire public uniquement) ==========
async function remplirAdresse(
  page,
  texte = 'Paris',
  optionTexte = 'Paris, France'
) {
  const input = page.locator('[data-cy="address-picker"] input');
  const option = page
    .locator('[data-cy="address-picker"] .autocomplete-results')
    .getByText(optionTexte, { exact: true });

  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.scrollIntoViewIfNeeded();

  for (let tentative = 1; tentative <= 5; tentative++) {
    await input.fill(texte);
    try {
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      return;
    } catch (error) {
      if (tentative < 5) {
        await input.fill('');
        await page.waitForTimeout(500);
      }
    }
  }
  throw new Error(
    `Impossible de selectionner "${optionTexte}" apres 5 tentatives.`
  );
}

async function selectionnerMarque(page, marque, maxTentatives = 4) {
  const selectMarque = page.locator('[data-cy="brand"]');
  await selectMarque.waitFor({ state: 'visible', timeout: 10000 });
  await selectMarque.scrollIntoViewIfNeeded();

  const echapper = t => t.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexContient = new RegExp(echapper(marque), 'i');
  const regexExact = new RegExp(`^\\s*${echapper(marque)}\\s*$`, 'i');

  const affichage = selectMarque.locator('.multiselect__single');
  const input = selectMarque.locator('input.multiselect__input');
  const options = selectMarque.locator('.multiselect__option');

  if ((await affichage.count()) > 0) {
    const texte = (
      (await affichage.first().textContent({ timeout: 2000 }).catch(() => '')) || ''
    ).trim();
    if (regexExact.test(texte)) return;
  }

  for (let i = 1; i <= maxTentatives; i++) {
    try {
      await page
        .locator('[data-cy="brand"]:not(.multiselect--disabled)')
        .waitFor({ state: 'attached', timeout: 8000 });

      const estOuvert = () =>
        selectMarque.evaluate(el => el.classList.contains('multiselect--active'));

      if (!(await estOuvert())) {
        await selectMarque.locator('.multiselect__tags').click({ timeout: 5000 });
        await page.waitForTimeout(300);
      }

      if (!(await estOuvert())) {
        await selectMarque.locator('.multiselect__select').click({ timeout: 5000, force: true });
        await page.waitForTimeout(300);
      }

      if (!(await estOuvert())) {
        throw new Error('Liste des marques non ouverte');
      }

      await input.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(marque, { delay: 80 });

      await options
        .filter({ hasText: regexContient })
        .first()
        .waitFor({ state: 'visible', timeout: 8000 });

      const exacte = options.filter({ hasText: regexExact });
      const option =
        (await exacte.count()) > 0
          ? exacte.first()
          : options.filter({ hasText: regexContient }).first();

      await option.click();

      await affichage
        .filter({ hasText: regexContient })
        .waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch (e) {
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(800);
    }
  }

  throw new Error(
    `Marque "${marque}" : selection impossible apres ${maxTentatives} tentatives`
  );
}

async function remplirChampsObjet(page, data) {
  const marque = data['Marque'];
  if (!marque) {
    throw new Error('La marque est absente des donnees Cucumber.');
  }

  // === 1. Categorie : Sacs & Bagages ===
  const categorie = page.locator('#category-picker__category__bags');
  await categorie.waitFor({ state: 'visible', timeout: 10000 });
  await categorie.click();

  // === 2. Type d'objet : Sac ===
  const typeObjet = page.locator('#category-picker__item-type__bag');
  await typeObjet.waitFor({ state: 'visible', timeout: 10000 });
  await typeObjet.click();

  // === 3. Marque ===
  await selectionnerMarque(page, marque);

  // === 4. Couleur ===
  const couleurId = obtenirCouleur(data['Couleur']);
  const selectCouleurDirect = page.locator(`#color-picker-row__color__${couleurId}`);

  if (!(await selectCouleurDirect.isVisible().catch(() => false))) {
    const boutonAutres = page.locator('#color-picker-row__other');
    await boutonAutres.waitFor({ state: 'visible', timeout: 5000 });
    await boutonAutres.click();
    await page.waitForTimeout(600);
  }

  const selectCouleur = page.locator(`#color-picker-row__color__${couleurId}`);
  await selectCouleur.waitFor({ state: 'visible', timeout: 10000 });
  await selectCouleur.scrollIntoViewIfNeeded();
  await selectCouleur.click();

  // === 5. Modele ===
  const champModele = page.locator('#input_modelitem_types_fields');
  await champModele.waitFor({ state: 'visible', timeout: 10000 });
  await champModele.fill(data['Modele']);

  // === 6. Detail ===
  if (data['Detail']) {
    const possibleSelectors = [
      '#input_description',
      '[data-cy="description"]',
      'textarea[name="description"]',
      '#description',
      'textarea[placeholder*="detail" i]',
      'textarea[placeholder*="description" i]',
      'textarea'
    ];

    let filled = false;
    for (const sel of possibleSelectors) {
      const el = page.locator(sel).first();
      if (await el.count() > 0 && await el.isVisible().catch(() => false)) {
        await el.fill(data['Detail']);
        filled = true;
        break;
      }
    }

    if (!filled) {
      console.warn('Champ Detail non trouve – le test continue sans remplir le detail');
    }
  }
}

// ========== Validation du formulaire ==========
async function validerFormulaireObjet(page) {
  const bouton = page.locator('#btn-add-ad');
  await bouton.waitFor({ state: 'visible', timeout: 10000 });
  await bouton.click();
}

// ============================================= GIVEN ========================================================//
Given(
  'l\'agent {string} est en service et connecte sur le back-office Troov de l\'equipe {string} \\(demo.troov.com\\)',
  async function (agent, equipe) {
    const email = process.env.TROOV_AGENT_USERNAME;
    const password = process.env.TROOV_AGENT_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'TROOV_AGENT_USERNAME et TROOV_AGENT_PASSWORD doivent etre definis dans le .env'
      );
    }

    const page = this.backofficePage;
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.click('button[type="submit"].btn-primary')
    ]);

    await page.waitForURL(url => !url.pathname.includes('/login'), {
      timeout: 30000
    });
  }
);

// ====================================================== WHEN ==========================================//
When(
  'L\'agent cree l\'objet trouve suivant :',
  async function (dataTable) {
    const data = dataTable.rowsHash();
    const page = this.backofficePage;

    await page.click(
      'a.prftch[href*="/dashboard/"][href*="/items/add"]'
    );

    await remplirChampsObjet(page, data);
    await validerFormulaireObjet(page);
  }
);

When(
  'L\'usager declare l\'objet perdu correspondant le jour meme via le formulaire public {string} :',
  async function (formName, dataTable) {
    const data = dataTable.rowsHash();
    const email = process.env.TROOV_PUBLIC_FORM_USERNAME;
    const password = process.env.TROOV_PUBLIC_FORM_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'TROOV_PUBLIC_FORM_USERNAME et TROOV_PUBLIC_FORM_PASSWORD doivent etre definis dans le .env'
      );
    }

    this.usagerPage = await this.context.newPage();
    const page = this.usagerPage;

    // === 1. Connexion usager ===
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded'
    });
    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([
      page.waitForURL(url => !url.pathname.includes('/login'), {
        timeout: 15000
      }),
      page.click('button[type="submit"].btn-primary')
    ]);

    // === 2. Ouvrir le formulaire public ===
    const lien = page.getByRole('link', { name: 'Signaler un objet' }).first();
    const lienVisible = await lien
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (lienVisible) {
      await lien.click();
    } else {
      const dashboardId =
        process.env.TROOV_PUBLIC_DASHBOARD_ID ||
        (page.url().match(/\/dashboard\/([a-f0-9]+)/i) || [])[1];

      if (!dashboardId) {
        throw new Error(
          `Lien "Signaler un objet" introuvable et dashboardId inconnu. URL : ${page.url()}`
        );
      }

      await page.goto(
        `${BASE_URL}/dashboard/${dashboardId}/items/add`,
        { waitUntil: 'domcontentloaded' }
      );
    }

    // === 3. Verifier que le formulaire est pret ===
    try {
      await page
        .locator('[data-cy="address-picker"] input')
        .waitFor({ state: 'visible', timeout: 15000 });
    } catch (error) {
      throw new Error(
        `Champ adresse du formulaire public non affiche. URL : ${page.url()}`
      );
    }

    // === 4. Adresse ===
    await remplirAdresse(page, 'Paris', 'Paris, France');

    // === 5. Categorie, type, marque, couleur, modele + detail ===
    await remplirChampsObjet(page, data);

    // === 6. Validation ===
    await validerFormulaireObjet(page);
  }
);

// ========== Attente ==========
When(
  'L\'utilisateur attend {int} secondes',
  async function (secondes) {
    await this.backofficePage.waitForTimeout(secondes * 1000);
  }
);

// ========== Ouverture fiche match ==========
When(
  'L\'utilisateur ouvre la fiche du match cote back office',
  async function () {
    await ouvrirFicheMatch(this.backofficePage);
  }
);

// ========== Demande analyse Charlie ==========
When(
  'L\'utilisateur demande a Charlie d\'analyser si le badge est grise',
  async function () {
    const page = this.backofficePage;

    // 1. Bouton "Demander a Charlie"
    const bouton = page.getByRole('button', {
      name: /Demander\s+à?\s*Charlie/i
    });

    await bouton.waitFor({ state: 'visible', timeout: 15000 });
    await bouton.scrollIntoViewIfNeeded();
    await bouton.click({ force: true });

    // 2. Attendre le toast de succes (celui de ta capture)
    const messageTermine = page.getByText(
      /Analyse\s+Charlie\s+termin[eé]e\s*:\s*\d+\s*pr[eé]-matchs?\s*analys[eé]s?/i
    );

    await messageTermine.waitFor({
      state: 'visible',
      timeout: 90000
    });

    // On laisse le toast s'afficher un peu, puis on le laisse partir naturellement
    await page.waitForTimeout(1500);

    // Optionnel : si le toast est encore la, on peut le fermer proprement
    try {
      const closeBtn = page.locator('.toast .btn-close, .toast [aria-label="Close"], .toast .close').first();
      if (await closeBtn.isVisible({ timeout: 1000 })) {
        await closeBtn.click({ force: true });
      }
    } catch (e) {
      // pas grave si le toast a deja disparu
    }

    // Petit delai pour que l'interface se stabilise apres l'analyse
    await page.waitForTimeout(1000);
  }
);
// ========== Ouverture section ==========
When(
  'L\'utilisateur ouvre {string}',
  async function (section) {
    const page = this.backofficePage;

    // Cas special : Details de l'analyse IA (tolérant aux accents)
    if (/d[eé]tails?\s+de\s+l['’]?analyse\s+IA/i.test(section)) {
      const bouton = page.getByRole('button', {
        name: /D[eé]tails?\s+de\s+l['’]?analyse\s+IA/i
      });

      await bouton.waitFor({ state: 'visible', timeout: 15000 });
      await bouton.scrollIntoViewIfNeeded();

      // Verifie si le panneau est deja ouvert
      const chevronUp = bouton.locator('i.bx-chevron-up');
      const estDejaOuvert = (await chevronUp.count()) > 0;

      if (!estDejaOuvert) {
        await bouton.click({ force: true });
      }

      // Attendre qu'un element typique du panneau apparaisse
      await page
        .locator('text=/Point cl[eé]|POINT CL[EÉ]|Score|Confiance|Analyse/i')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });

      return;
    }

    // --- Comportement generique ---
    const regex = new RegExp(
      section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );

    const element = page
      .getByRole('button', { name: regex })
      .or(page.getByRole('tab', { name: regex }))
      .or(page.getByRole('link', { name: regex }))
      .or(page.getByText(regex))
      .first();

    await element.waitFor({ state: 'visible', timeout: 15000 });
    await element.scrollIntoViewIfNeeded();
    await element.click({ force: true });
  }
);

//===========================================THEN====================================================//
Then(
  'Un score IA est affiche',
  async function () {
    const page = this.backofficePage;

    // 1. On essaie d'abord le locator précis (celui qui est dans le panneau détails)
    const scoreLocatorPrecis = page.locator(
      'div.tui-absolute.tui-inset-0.tui-flex.tui-items-center.tui-justify-center.tui-text-2xl.tui-font-semibold'
    );

    // 2. Locators de secours (score visible ailleurs sur la fiche)
    const scoreLocatorFallback = page.locator(
      'text=/\\d+\\s*%/'
    ).filter({ hasText: /%/ }).first();

    // 3. On attend l'un des deux
    const scoreElement = await Promise.race([
      scoreLocatorPrecis.waitFor({ state: 'visible', timeout: 8000 }).then(() => scoreLocatorPrecis),
      scoreLocatorFallback.waitFor({ state: 'visible', timeout: 8000 }).then(() => scoreLocatorFallback)
    ]).catch(() => null);

    if (!scoreElement) {
      // Dernier recours : on ouvre les détails nous-mêmes
      const boutonDetails = page.getByRole('button', {
        name: /D[eé]tails?\s+de\s+l['’]?analyse\s+IA/i
      });

      if (await boutonDetails.isVisible().catch(() => false)) {
        await boutonDetails.click({ force: true });
        await scoreLocatorPrecis.waitFor({ state: 'visible', timeout: 10000 });
      } else {
        throw new Error('Aucun score IA trouvé (ni dans le panneau détails, ni ailleurs sur la page)');
      }
    }

    const texte = (await (scoreElement || scoreLocatorPrecis).textContent())?.trim() || '';

    if (!/\d+\s*%/.test(texte)) {
      throw new Error(`Aucun score en pourcentage trouvé. Texte obtenu : "${texte}"`);
    }

    this.scoreIA = texte;

    if (typeof this.attach === 'function') {
      this.attach(`Score IA affiché : ${texte}`);
    }
  }
);