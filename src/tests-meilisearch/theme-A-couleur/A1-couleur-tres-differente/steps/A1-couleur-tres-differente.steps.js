
const { Given, When, Then } = require('@cucumber/cucumber');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const COULEURS = {Noir: 'black', Gris: 'grey'};

const LIGNE_MATCH = {marque: 'LACOSTE',modele: 'sac à main'};


// ========== Couleur ==========
function obtenirCouleur(couleur) {
  const identifiant = COULEURS[couleur];

  if (!identifiant) {
    throw new Error(`Couleur "${couleur}" non configurée.`);
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

  // 2. Ligne cible (plus robuste)
  const lignes = page
    .locator('tr.tui-cursor-pointer')
    .filter({ hasText: LIGNE_MATCH.marque })
    .filter({ hasText: /sac\s*à?\s*main/i })   
    .filter({ has: page.getByRole('img', { name: 'Match potentiel' }) });

  for (let i = 1; i <= maxTentatives; i++) {

    const ligne = lignes.first();

    const visible = await ligne
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (visible) {
      // Clic sur la cellule "Sac" (2ème <td>) – évite la checkbox et le badge
      await ligne.locator('td').nth(1).click({ force: true });
      return;
    }

    // Repousse la date de fin pour faire apparaître les objets récents
    if (href) {
      const url = new URL(href, BASE_URL);
      url.searchParams.set('end', new Date(Date.now() + 60 * 60 * 1000).toISOString());
      await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    } else {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  throw new Error(
    `Aucune ligne "Match potentiel" (LACOSTE / sac à main) trouvée après ${maxTentatives} tentatives.`
  );
}

// ========== Adresse (formulaire public uniquement) ==========
async function remplirAdresse(
  page,
  texte = 'Paris',
  optionTexte = 'Paris, France'
) {
  const input = page.locator(
    '[data-cy="address-picker"] input'
  );

  const option = page
    .locator('[data-cy="address-picker"] .autocomplete-results')
    .getByText(optionTexte, { exact: true });

  await input.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await input.scrollIntoViewIfNeeded();

  for (let tentative = 1; tentative <= 5; tentative++) {
    await input.fill(texte);

    try {
      await option.waitFor({
        state: 'visible',
        timeout: 3000
      });

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
    `Impossible de sélectionner "${optionTexte}" après 5 tentatives.`
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
      // 1. Attendre que le composant soit utilisable (pas désactivé)
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

      // 3. Saisie
      await input.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(marque, { delay: 80 });

      // 4. Option exacte de préférence
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

      // 5. Vérifier l'affichage
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
    `Marque "${marque}" : sélection impossible après ${maxTentatives} tentatives (voir debug-marque.png)`
  );
}

async function remplirChampsObjet(page, data) {
  const couleur = obtenirCouleur(data['Couleur']);
  const marque = data['Marque'];

  if (!marque) {
    throw new Error('La marque est absente des données Cucumber.');
  }

  // === 1. Catégorie : Sacs & Bagages ===
  const categorie = page.locator('#category-picker__category__bags');

  await categorie.waitFor({state: 'visible',timeout: 10000});

  await categorie.click();


  // === 2. Type d'objet : Sac ===
  const typeObjet = page.locator('#category-picker__item-type__bag');

  await typeObjet.waitFor({state: 'visible',timeout: 10000});

  await typeObjet.click();

  // === 3. Marque : Vue Multiselect ===
  await selectionnerMarque(page, marque);

  // === 4. Couleur ===
  const selectCouleur = page.locator(`#color-picker-row__color__${couleur}`);

  await selectCouleur.waitFor({state: 'visible',timeout: 10000});

  await selectCouleur.click();

  // === 5. Modèle ===
  const champModele = page.locator('#input_modelitem_types_fields');

  await champModele.waitFor({state: 'visible',timeout: 10000});

  await champModele.fill(data['Modele']);

}

// ========== Validation du formulaire ==========
async function validerFormulaireObjet(page) {
  const bouton = page.locator('#btn-add-ad');

  await bouton.waitFor({ state: 'visible',timeout: 10000});

  await bouton.click();

}

// ============================================= GIVEN ========================================================//
Given(
  'l\'agent {string} est en service et connecte sur le back-office Troov de l\'equipe {string} \\(demo.troov.com\\)',
  async function (agent, equipe) {
    const email = process.env.TROOV_AGENT_USERNAME;
    const password = process.env.TROOV_AGENT_PASSWORD;

    if (!email || !password) {
      throw new Error('TROOV_AGENT_USERNAME et TROOV_AGENT_PASSWORD doivent être définis dans le .env');
    }

    const page = this.backofficePage;

    // Plus tolérant : on n’attend plus "load" (trop strict)
    await page.goto(`${BASE_URL}/login`, {waitUntil: 'domcontentloaded',timeout: 60000});

    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([page.waitForLoadState('domcontentloaded'),page.click('button[type="submit"].btn-primary')]);

    // On attend d’être sorti de /login
    await page.waitForURL(url => !url.pathname.includes('/login'),{ timeout: 30000 });
  }
);

// ====================================================== WHEN ==========================================//
When(
  'L\'agent cree l\'objet trouve suivant :',
  async function (dataTable) {
    const data = dataTable.rowsHash();
    const page = this.backofficePage;

    await page.click('a.prftch[href*="/dashboard/"][href*="/items/add"]');

    // Le back-office ne possède pas de champ adresse.
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
      throw new Error('TROOV_PUBLIC_FORM_USERNAME et TROOV_PUBLIC_FORM_PASSWORD doivent être définis dans le .env');
    }

    this.usagerPage = await this.context.newPage();

    const page = this.usagerPage;

    // === 1. Connexion usager ===
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded'
    });

    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([page.waitForURL(url => !url.pathname.includes('/login'),{ timeout: 15000 }),
      page.click('button[type="submit"].btn-primary')
    ]);


    // === 2. Ouvrir le formulaire public ===
    const lien = page .getByRole('link', { name: 'Signaler un objet' })
      .first();

    const lienVisible = await lien
      .waitFor({state: 'visible',timeout: 15000})
      .then(() => true)
      .catch(() => false);

    if (lienVisible) {
      await lien.click();
    } else {
      const dashboardId = process.env.TROOV_PUBLIC_DASHBOARD_ID || (page.url().match(/\/dashboard\/([a-f0-9]+)/i) || [])[1];

      if (!dashboardId) {
        throw new Error( `Lien "Signaler un objet" introuvable et dashboardId inconnu. URL : ${page.url()}`);
      }

      await page.goto(`${BASE_URL}/dashboard/${dashboardId}/items/add`,{ waitUntil: 'domcontentloaded' });
    }

    // === 3. Vérifier que le formulaire est prêt ===
    try {
      await page
        .locator('[data-cy="address-picker"] input')
        .waitFor({state: 'visible', timeout: 15000
        });
    } catch (error) {
      throw new Error(
        `Champ adresse du formulaire public non affiché. URL : ${page.url()}`
      );
    }

    // === 4. Adresse en premier (public uniquement) ===
    await remplirAdresse(page, 'Paris', 'Paris, France');

    // === 5. Catégorie, type, marque, couleur et modèle ===
    await remplirChampsObjet(page, data);

    // === 6. Validation finale ===
    await validerFormulaireObjet(page);
  }
);



// ========== Attente ==========
When(
  'L\'utilisateur attends {int} secondes',
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

    // 1. Bouton "Demander à Charlie"
    const bouton = page.getByRole('button', {
      name: /Demander à Charlie/i
    });
    await bouton.waitFor({ state: 'visible', timeout: 15000 });
    await bouton.click();

    // 2. Attendre le message de succès (version réelle de l'appli)
    //    Exemple : "Analyse Charlie terminée : 11 pré-matchs analysés"
    const messageTermine = page.getByText(
      /Analyse Charlie terminée\s*:\s*\d+\s*pré-matchs?\s*analysés?/i
    );

    await messageTermine.waitFor({ state: 'visible',timeout: 90000});

    // Petit délai de stabilisation
    await page.waitForTimeout(800);

    // 3. Cliquer sur le message (pour fermer le toast ou ouvrir les détails)
    await messageTermine.click({ force: true });
  }
);

// ========== Ouverture section ==========
When(
  'L\'utilisateur ouvre {string}',
  async function (section) {
    const page = this.backofficePage;

    // Cas spécial : Détails de l'analyse IA
    if (/détails?\s+de\s+l['’]?analyse\s+IA/i.test(section)) {
      const bouton = page.getByRole('button', {
        name: /Détails de l['’]?analyse IA/i
      });

      // Attendre que le bouton soit visible
      await bouton.waitFor({ state: 'visible', timeout: 15000 });
      await bouton.scrollIntoViewIfNeeded();

      // Vérifier si le panneau est déjà ouvert (chevron-up = ouvert)
      const chevronUp = bouton.locator('i.bx-chevron-up');
      const estDejaOuvert = await chevronUp.count() > 0;

      if (!estDejaOuvert) {
        // Le panneau est fermé → on clique pour l'ouvrir
        await bouton.click({ force: true });
      }

      // Attendre que le contenu du panneau soit visible
      await page.locator('text=/Point clé|POINT CLÉ/i')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });

      return;
    }

    // --- Comportement générique pour les autres sections ---
    const regex = new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const element = page.getByRole('button', { name: regex })
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
  'L\'utilisateur releve le score algo, le score Charlie et le statut REJECTED',
  async function () {
    const page = this.backofficePage;

    const scoreAlgo = await page
      .locator('[class*="algo"], [data-cy*="algo"], .score-algo, text=/Score algo/i')
      .first()
      .textContent({ timeout: 8000 })
      .catch(() => 'N/A');

    const scoreCharlie = await page
      .locator('[class*="charlie"], [data-cy*="charlie"], .score-charlie, text=/Score Charlie/i')
      .first()
      .textContent({ timeout: 8000 })
      .catch(() => 'N/A');

    // --- Statut ---
    const statutLocator = page.locator(
      'text=/REJECTED|Rejeté|Pas de match|Match rejeté/i'
    ).first();

    const rejectedVisible = await statutLocator
      .isVisible()
      .catch(() => false);

    const statutTexte = rejectedVisible
      ? (await statutLocator.textContent().catch(() => 'REJECTED'))
      : 'Non trouvé';

    // Attacher les valeurs dans le rapport Cucumber
    if (typeof this.attach === 'function') {
      this.attach(
        `Score Algo     : ${(scoreAlgo || '').trim()}\n` +
        `Score Charlie  : ${(scoreCharlie || '').trim()}\n` +
        `Statut         : ${statutTexte}`
      );
    }

    if (!rejectedVisible) {
      throw new Error(
        `Statut REJECTED / "Pas de match" non trouvé.\n` +
        `Score Algo: ${scoreAlgo} | Score Charlie: ${scoreCharlie}`
      );
    }
  }
);

Then(
  'Un score IA est affiche',
  async function () {
    const page = this.backofficePage;

    const scoreLocator = page.locator(
      'div.tui-absolute.tui-inset-0.tui-flex.tui-items-center.tui-justify-center.tui-text-2xl.tui-font-semibold'
    );

    await scoreLocator.waitFor({ state: 'visible', timeout: 12000 });

    const texte = (await scoreLocator.textContent())?.trim() || '';

    // Vérifie qu'on a bien un pourcentage
    if (!/\d+\s*%/.test(texte)) {
      throw new Error(`Aucun score en pourcentage trouvé. Texte obtenu : "${texte}"`);
    }

    // On garde le score dans le World + dans le rapport
    this.scoreIA = texte;
if (typeof this.attach === 'function') {
      this.attach(`Score IA affiché : ${texte}`);
    }
  }
);