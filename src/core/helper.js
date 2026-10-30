const config = require('../../config/env.js')
const { expect } = require('@playwright/test');



// 13 digits
function generateRandomNIR() { 
    // Sexe : 1, 2, 3, 4, 7 ou 8
    const sexe = String([1, 2, 3, 4, 7, 8][Math.floor(Math.random() * 6)]);

    // Année : 00 – 99
    const annee = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    // Mois:
    // - 01 à 12 // - 20 à 39 // - 40 à 42 // - 50 à 99
    function randomMois() {
        const ranges = [[1, 12],[20, 39],[40, 42],[50, 99]];
        const r = ranges[Math.floor(Math.random() * ranges.length)];
        const value = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];
        return String(value).padStart(2, '0');
    }
    const mois = randomMois();

    // Département : 2A, 2B, 2a, 2b, 00–99, ou 970–989 (fixé a 2 chiffre)
    function randomDepartement() {
        const corsica = ["2A", "2B", "2a", "2b"];
        const mode = Math.floor(Math.random() * 3);
        if (mode === 0) {
            return corsica[Math.floor(Math.random() * corsica.length)];
        } else if (mode === 1) {
            return String(Math.floor(Math.random() * 100)).padStart(2, '0');
         } else {
        //     return "9" + (7 + Math.floor(Math.random() * 2)) + String(Math.floor(Math.random() * 10));
            return String(Math.floor(Math.random() * 100)).padStart(2, '0');
        }
    }
    const departement = randomDepartement();

    const commune = String(Math.floor(Math.random() * 1000)).padStart(3, '0');


    // Ordre : 001 – 999
    const ordre = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

    // Construction finale du NIR
    return `${sexe}${annee}${mois}${departement}${commune}${ordre}`;
}

// 10 digits with 0 as first character
function generateRandomPhone() {
    // Choose the prefix
    const prefixes = [
        "01", "02", "03", "04", "05", // geographic numbers
        "06", "07",                   // mobile numbers
        "08",                         // special service numbers
        "09"                          // VoIP / non-geographic numbers
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    // Generate the remaining 8 digits
    const rest = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    
    return `${prefix}${rest}`;
}

async function connexionAlfa(world) {

    await world.backofficePage.goto(config.troovPublicUserBackofficeURL);
    await world.backofficePage.waitForTimeout(2000);

    await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
    await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
    await world.backofficePage.locator('button[type="submit"]').first().click();

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    // wait for backoffice loaded
    await world.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await world.backofficePage.url();
    while (!currentURL.includes('calendar')) {

        await world.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await world.backofficePage.url();
    }
    expect(await world.backofficePage.url()).toContain('calendar');
}



/*-------------------------------------------fonction pour la creation de l'objet---------------------------------------------*/

const COULEURS = {Noir: 'black',Gris: 'grey',Bleu: 'blue',Rouge: 'red','Avec motif': 'pattern'};

//fonction pour choisir la couleur

function obtenirCouleur(couleur) {
  const id = COULEURS[couleur];
  if (!id) throw new Error(`Couleur "${couleur}" non configuree.`);
  return id;
}


//fonction pour selectionner la marque de l'objet

async function selectionnerMarque(page, marque, maxTentatives = 4) {
  const select = page.locator('[data-cy="brand"]');
  await select.waitFor({ state: 'visible', timeout: 10000 });

  const echapper = t => t.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexContient = new RegExp(echapper(marque), 'i');
  const regexExact = new RegExp(`^\\s*${echapper(marque)}\\s*$`, 'i');

  const affichage = select.locator('.multiselect__single');
  const input = select.locator('input.multiselect__input');
  const options = select.locator('.multiselect__option');

  if ((await affichage.count()) > 0) {
    const texte = ((await affichage.first().textContent({ timeout: 2000 }).catch(() => '')) || '').trim();
    if (regexExact.test(texte)) return;
  }

  for (let i = 1; i <= maxTentatives; i++) {
    try {
      await page.locator('[data-cy="brand"]:not(.multiselect--disabled)').waitFor({ state: 'attached', timeout: 8000 });

      const estOuvert = () => select.evaluate(el => el.classList.contains('multiselect--active'));

      if (!(await estOuvert())) {
        await select.locator('.multiselect__tags').click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(300);
      }
      if (!(await estOuvert())) {
        await select.locator('.multiselect__select').click({ timeout: 5000, force: true });
        await page.waitForTimeout(300);
      }
      if (!(await estOuvert())) throw new Error('Liste des marques non ouverte');

      await input.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(marque, { delay: 80 });

      await options.filter({ hasText: regexContient }).first().waitFor({ state: 'visible', timeout: 8000 });

      const exacte = options.filter({ hasText: regexExact });
      const option = (await exacte.count()) > 0 ? exacte.first() : options.filter({ hasText: regexContient }).first();
      await option.click();

      await affichage.filter({ hasText: regexContient }).waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch {
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(800);
    }
  }
  throw new Error(`Marque "${marque}" : selection impossible apres ${maxTentatives} tentatives`);
}


//fonction pour selectionner l'etat

async function selectionnerEtat(page, etat) {
  if (!etat || !etat.trim()) return;

  const mapping = {
    'Neuf sans etiquette': 'form.new_no_tag_state',
    'Neuf avec etiquette': 'form.new_tag_state',
    'Satisfaisant': 'form.normal_state',
    'Abime': null // on utilisera le texte
  };

  const dataCy = mapping[etat];
  const select = page.locator('[data-cy="usury"]');

  await select.waitFor({ state: 'visible', timeout: 10000 });
  await select.locator('.multiselect__tags').click();
  await page.waitForTimeout(400);

  if (dataCy) {
    // Cas avec data-cy
    await page.locator(`[data-cy="${dataCy}"]`).click();
  } else {
    // Cas Abime (par texte)
    await page.locator('.multiselect__option')
      .filter({ hasText: /Ab[iî]m[eé]/i })
      .first()
      .click();
  }

  await page.waitForTimeout(300);
}


//fonction pour remplissage de l'adresse

async function remplirAdresse(page, texte = 'Paris', optionTexte = 'Paris, France') {
  const input = page.locator('[data-cy="address-picker"] input');
  const option = page.locator('[data-cy="address-picker"] .autocomplete-results')
    .getByText(optionTexte, { exact: true });

  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.scrollIntoViewIfNeeded();

  for (let i = 1; i <= 5; i++) {
    await input.fill(texte);
    try {
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      return;
    } catch {
      if (i < 5) {
        await input.fill('');
        await page.waitForTimeout(500);
      }
    }
  }
  throw new Error(`Impossible de selectionner "${optionTexte}" apres 5 tentatives.`);
}


//fonction pour remplissage de l'objet

async function remplirChampsObjet(page, data) {
  const marque = data['Marque'];
  if (!marque) throw new Error('La marque est absente des donnees Cucumber.');

  // Categorie
  await page.locator('#category-picker__category__bags').click();
  // Type
  await page.locator('#category-picker__item-type__bag').click();
  // Marque
  await selectionnerMarque(page, marque);

  // Couleur
  const couleurId = obtenirCouleur(data['Couleur']);
  let couleurEl = page.locator(`#color-picker-row__color__${couleurId}`);

  if (!(await couleurEl.isVisible().catch(() => false))) {
    await page.locator('#color-picker-row__other').click();
    await page.waitForTimeout(600);
    couleurEl = page.locator(`#color-picker-row__color__${couleurId}`);
  }
  await couleurEl.waitFor({ state: 'visible', timeout: 10000 });
  await couleurEl.click();

  // Modele
  await page.locator('#input_modelitem_types_fields').fill(data['Modele'] || '');

  // Etat
  if (data['Etat']) await selectionnerEtat(page, data['Etat']);

  // Detail
  if (data['Detail']?.trim()) {
    const selectors = [
      '#input_description',
      '[data-cy="description"]',
      'textarea[name="description"]',
      '#description',
      'textarea'
    ];
    for (const sel of selectors) {
      const el = page.locator(sel).first();
      if (await el.count() && await el.isVisible().catch(() => false)) {
        await el.fill(data['Detail']);
        return;
      }
    }
    console.warn('Champ Detail non trouve');
  }
}


//ouverture du formulaire

async function validerFormulaire(page) {
  await page.locator('#btn-add-ad').click();
}


//fonction pour ouvrir la fiche du match


async function ouvrirFicheMatch(page, ligneMatch, maxTentatives = 6) {
  const menu = page.locator('a.side-nav-link-ref', { hasText: 'Mes objets' }).first();
  await menu.waitFor({ state: 'visible', timeout: 15000 });
  const href = await menu.getAttribute('href');
  await menu.click();

  const regexModele = new RegExp(ligneMatch.modele.replace(/\s+/g, '\\s*'), 'i');

  const lignes = page
    .locator('tr.tui-cursor-pointer')
    .filter({ hasText: ligneMatch.marque })
    .filter({ hasText: regexModele })
    .filter({ has: page.getByRole('img', { name: 'Match potentiel' }) });

  for (let i = 1; i <= maxTentatives; i++) {
    const ligne = lignes.first();
    const visible = await ligne.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (visible) {
      await ligne.locator('td').nth(1).click({ force: true });
      return;
    }

    if (href) {
      const url = new URL(href, page.url());
      url.searchParams.set('end', new Date(Date.now() + 60 * 60 * 1000).toISOString());
      await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    } else {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  throw new Error(
    `Aucune ligne "Match potentiel" (${ligneMatch.marque} / ${ligneMatch.modele}) trouvee apres ${maxTentatives} tentatives.`
  );
}


//fonction pour l'analyse du Charlie

/*async function demanderAnalyseCharlie(page) {
  // Cible le bouton de plusieurs facons pour etre robuste
  const bouton = page
    .locator('button')
    .filter({ hasText: /Demander.*Charlie/i })
    .first();

  await bouton.waitFor({ state: 'visible', timeout: 20000 });
  await bouton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Clique force (evite les problemes d'overlay / animation)
  await bouton.click({ force: true });

  // Attendre le toast de fin d'analyse
  await page
    .getByText(/Analyse\s+Charlie\s+termin/i)
    .waitFor({ state: 'visible', timeout: 90000 });

  await page.waitForTimeout(1500);

  // Fermer le toast s'il est encore la
  const closeBtn = page.locator('.toast .btn-close, .toast [aria-label="Close"], .toast .close').first();
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeBtn.click({ force: true }).catch(() => {});
  }

  await page.waitForTimeout(1000);
}*/

async function demanderAnalyseCharlie(page) {
  const bouton = page.locator('button').filter({ hasText: /Demander.*Charlie/i }).first();
  await bouton.waitFor({ state: 'visible', timeout: 20000 });
  await bouton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await bouton.click({ force: true });

  await page.getByText(/Analyse\s+Charlie\s+termin/i)
    .waitFor({ state: 'visible', timeout: 90000 });

  await page.waitForTimeout(1500);

  const closeBtn = page.locator('.toast .btn-close, .toast [aria-label="Close"], .toast .close').first();
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeBtn.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(1000);
}

//fonction pour ouvrir le details apres l'analyse

async function ouvrirSection(page, section) {
  if (/d[eé]tails?\s+de\s+l['’]?analyse\s+IA/i.test(section)) {
    const bouton = page.getByRole('button', { name: /D[eé]tails?\s+de\s+l['’]?analyse\s+IA/i });
    await bouton.waitFor({ state: 'visible', timeout: 15000 });

    const dejaOuvert = (await bouton.locator('i.bx-chevron-up').count()) > 0;
    if (!dejaOuvert) await bouton.click({ force: true });

    await page.locator('text=/Point cl[eé]|POINT CL[EÉ]|Score|Confiance|Analyse/i')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
    return;
  }

  const regex = new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const el = page.getByRole('button', { name: regex })
    .or(page.getByRole('tab', { name: regex }))
    .or(page.getByRole('link', { name: regex }))
    .or(page.getByText(regex))
    .first();

  await el.waitFor({ state: 'visible', timeout: 15000 });
  await el.click({ force: true });
}


//fonction pour la verification Score IA

async function verifierScoreIA(page, world) {
  const precis = page.locator(
    'div.tui-absolute.tui-inset-0.tui-flex.tui-items-center.tui-justify-center.tui-text-2xl.tui-font-semibold'
  );
  const fallback = page.locator('text=/\\d+\\s*%/').filter({ hasText: /%/ }).first();

  let scoreEl = await Promise.race([
    precis.waitFor({ state: 'visible', timeout: 8000 }).then(() => precis),
    fallback.waitFor({ state: 'visible', timeout: 8000 }).then(() => fallback)
  ]).catch(() => null);

  if (!scoreEl) {
    const btn = page.getByRole('button', { name: /D[eé]tails?\s+de\s+l['’]?analyse\s+IA/i });
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await precis.waitFor({ state: 'visible', timeout: 10000 });
      scoreEl = precis;
    } else {
      throw new Error('Aucun score IA trouve');
    }
  }

  const texte = (await scoreEl.textContent())?.trim() || '';
  if (!/\d+\s*%/.test(texte)) {
    throw new Error(`Aucun score en pourcentage trouve. Texte : "${texte}"`);
  }

  world.scoreIA = texte;
  if (typeof world.attach === 'function') {
    world.attach(`Score IA affiche : ${texte}`);
  }
}

module.exports = {
  generateRandomNIR, generateRandomPhone, connexionAlfa, obtenirCouleur, selectionnerMarque, selectionnerEtat, remplirAdresse, remplirChampsObjet, validerFormulaire, ouvrirFicheMatch, demanderAnalyseCharlie, ouvrirSection, verifierScoreIA
};
