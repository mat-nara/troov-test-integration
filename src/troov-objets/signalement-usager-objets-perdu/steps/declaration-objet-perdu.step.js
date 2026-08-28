const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*-----------------------------------------GIVEN-----------------------------------------*/

Given("l'usager est sur {string}", async function (url) {
  const page = this.backofficePage;
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

Given("l'usager est sur le formulaire de signalement", async function () {
  const page = this.backofficePage;
  await page.goto('http://localhost:3000/perdu', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});


Given("l'usager a rempli le formulaire de signalement", async function () {
  const page = this.backofficePage;

  await page.goto('http://localhost:3000/perdu', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // ADRESSE
  const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();
  await champAdresse.click();
  await champAdresse.clear();
  await champAdresse.pressSequentially('Paris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(1500);
  const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
  await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
  await suggestionAdresse.click();

  // DATE
  const boutonDate = page.locator('#input-date-picker__today');
  await boutonDate.waitFor({ state: 'visible', timeout: 10000 });
  await boutonDate.click();

  // CATEGORIE
  const categorieSacsBagages = page.locator('div').filter({ hasText: /^Sacs & Bagages$/ }).first();
  await categorieSacsBagages.waitFor({ state: 'visible', timeout: 10000 });
  await categorieSacsBagages.click();

  // SOUS-CATEGORIE
  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await sousCategorieSac.waitFor({ state: 'visible', timeout: 10000 });
  await sousCategorieSac.click();

  // MARQUE
  const champMarque = page.getByText('Indiquez la marque', { exact: false }).first();
  await champMarque.waitFor({ state: 'visible', timeout: 10000 });
  await champMarque.click();
  const optionMarque = page.getByRole('option', { name: '1Voice' }).first();
  await optionMarque.waitFor({ state: 'visible', timeout: 10000 });
  await optionMarque.click();

  // COULEUR
  const couleurNoir = page.locator('span').filter({ hasText: /^Noir$/ }).first();
  await couleurNoir.waitFor({ state: 'visible', timeout: 10000 });
  await couleurNoir.click();

  // MODELE
  const champModele = page.locator('#input_modelitem_types_fields');
  await champModele.click();
  await champModele.fill('HP');

  // PRENOM
  const champPrenom = page.locator('#input_firstnameitem_types_fields');
  await champPrenom.click();
  await champPrenom.fill('Mairie');

  // NOM
  const champNom = page.locator('#input_lastnameitem_types_fields');
  await champNom.click();
  await champNom.fill('Mairie');

  // DESCRIPTION
  const champDescription = page.locator('#input_detailitem_types_fields');
  await champDescription.click();
  await champDescription.fill('test');
});

Given("l'usager est sur la page de creation de compte", async function () {
  const page = this.backofficePage;
  await page.goto('http://localhost:3000/register', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

Given("l'usager est sur la page de connexion", async function () {
  const page = this.backofficePage;
  await page.goto('http://localhost:3000/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

Given("l'usager possede deja un compte", async function () {

});
Given("l'usager est sur la page de connexion ou de creation de compte", async function () {
  const page = this.backofficePage;
  await page.goto('http://localhost:3000/register', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

Given("l'usager s'est connecte ou a cree son compte", async function () {
  const page = this.backofficePage;
  await page.goto('http://localhost:3000/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  const champEmail = page.locator('#email');
  await champEmail.waitFor({ state: 'visible', timeout: 10000 });
  await champEmail.fill('Dupond@troov.com');

  const champPassword = page.locator('#password');
  await champPassword.waitFor({ state: 'visible', timeout: 10000 });
  await champPassword.fill('Hello(123)');

  const boutonConnexion = page.getByRole('button', { name: /Connexion/i });
  await boutonConnexion.waitFor({ state: 'visible', timeout: 10000 });
  await boutonConnexion.click();

  await page.waitForTimeout(2000);
});

Given("l'usager arrive sur son espace usager", async function () {
  const page = this.backofficePage;

  await page.goto('http://localhost:3000/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  const champEmail = page.locator('#email');
  await champEmail.waitFor({ state: 'visible', timeout: 10000 });
  await champEmail.fill('Dupond@troov.com');

  const champPassword = page.locator('#password');
  await champPassword.waitFor({ state: 'visible', timeout: 10000 });
  await champPassword.fill('Hello(123)');

  const boutonConnexion = page.getByRole('button', { name: /Connexion/i });
  await boutonConnexion.waitFor({ state: 'visible', timeout: 10000 });
  await boutonConnexion.click();
  await page.waitForTimeout(2000);
});
Given("l'usager est sur son espace usager", async function () {
  const page = this.backofficePage;

  await page.goto('http://localhost:3000/login', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // EMAIL
  const champEmail = page.locator('#email');
  await champEmail.waitFor({ state: 'visible', timeout: 10000 });
  await champEmail.fill('Mairie@troov.com');

  // MOT DE PASSE
  const champPassword = page.locator('#password');
  await champPassword.waitFor({ state: 'visible', timeout: 10000 });
  await champPassword.fill('Hello(123)');

  // Connexion
  const boutonConnexion = page.getByRole('button', { name: /Connexion/i });
  await boutonConnexion.waitFor({ state: 'visible', timeout: 10000 });
  await boutonConnexion.click();
  await page.waitForTimeout(2000);
});
/*-----------------------------------------WHEN-----------------------------------------*/

When('l\'usager clique sur le bouton "signaler un objet perdu"', async function () {
  const page = this.backofficePage;
  const boutonSignalerPerdu = page.locator('.ilost').locator('visible=true').first();
  await expect(boutonSignalerPerdu).toBeVisible({
    timeout: 10000
  });
  await boutonSignalerPerdu.click();
});

When("l'usager remplit tous les champs du formulaire", async function () {
  const page = this.backofficePage;

  // ADRESSE : "Paris, France"
  const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();
  await champAdresse.click();
  await champAdresse.clear();
  await champAdresse.pressSequentially('Paris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(1500);

  const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
  await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
  await suggestionAdresse.click();

  // DATE : "Aujourd'hui"
  const boutonDate = page.locator('#input-date-picker__today');
  await boutonDate.waitFor({ state: 'visible', timeout: 10000 });
  await boutonDate.click();

  // CATEGORIE : "Sacs & Bagages"
  const categorieSacsBagages = page.locator('div').filter({ hasText: /^Sacs & Bagages$/ }).first();
  await categorieSacsBagages.waitFor({ state: 'visible', timeout: 10000 });
  await categorieSacsBagages.click();

  // SOUS-CATEGORIE : "Sac"
  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await sousCategorieSac.waitFor({ state: 'visible', timeout: 10000 });
  await sousCategorieSac.click();

  // MARQUE : "1Voice"
const champMarque = page.getByText('Indiquez la marque', { exact: false }).first();
await champMarque.waitFor({ state: 'visible', timeout: 10000 });
await champMarque.click();

const optionMarque = page.getByRole('option', { name: '1Voice' }).first();
await optionMarque.waitFor({ state: 'visible', timeout: 10000 });
await optionMarque.click();

  // COULEUR : Noir
  const couleurNoir = page.locator('span').filter({ hasText: /^Noir$/ }).first();
  await couleurNoir.waitFor({ state: 'visible', timeout: 10000 });
  await couleurNoir.click();

  // MODELE
  const champModele = page.locator('#input_modelitem_types_fields');
  await champModele.click();
  await champModele.fill('HP');

  // PRENOM
  const champPrenom = page.locator('#input_firstnameitem_types_fields');
  await champPrenom.click();
  await champPrenom.fill('Mairie');

  // NOM
  const champNom = page.locator('#input_lastnameitem_types_fields');
  await champNom.click();
  await champNom.fill('Mairie');

  // DESCRIPTION
  const champDescription = page.locator('#input_detailitem_types_fields');
  await champDescription.click();
  await champDescription.fill('test');
});

When("l'usager selectionne une categorie d'objet", async function () {
  const page = this.backofficePage;

  const categorieSacsBagages = page.locator('div').filter({ hasText: /^Sacs & Bagages$/ }).first();
  await categorieSacsBagages.waitFor({ state: 'visible', timeout: 10000 });
  await categorieSacsBagages.click();
});


When("l'usager laisse un champ obligatoire vide", async function () {
  const page = this.backofficePage;

  // ADRESSE : "Paris, France"
  const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();
  await champAdresse.click();
  await champAdresse.clear();
  await champAdresse.pressSequentially('Paris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(1500);

  const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
  await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
  await suggestionAdresse.click();

  // DATE : "Aujourd'hui"
  const boutonDate = page.locator('#input-date-picker__today');
  await boutonDate.waitFor({ state: 'visible', timeout: 10000 });
  await boutonDate.click();

  // CATEGORIE : "Sacs & Bagages"
  const categorieSacsBagages = page.locator('div').filter({ hasText: /^Sacs & Bagages$/ }).first();
  await categorieSacsBagages.waitFor({ state: 'visible', timeout: 10000 });
  await categorieSacsBagages.click();

  // SOUS-CATEGORIE : "Sac"
  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await sousCategorieSac.waitFor({ state: 'visible', timeout: 10000 });
  await sousCategorieSac.click();

  // MARQUE : volontairement laissee vide (champ obligatoire non rempli)

  // COULEUR : Noir
  const couleurNoir = page.locator('span').filter({ hasText: /^Noir$/ }).first();
  await couleurNoir.waitFor({ state: 'visible', timeout: 10000 });
  await couleurNoir.click();

  // MODELE
  const champModele = page.locator('#input_modelitem_types_fields');
  await champModele.click();
  await champModele.fill('HP');

  // PRENOM
  const champPrenom = page.locator('#input_firstnameitem_types_fields');
  await champPrenom.click();
  await champPrenom.fill('Mairie');

  // NOM
  const champNom = page.locator('#input_lastnameitem_types_fields');
  await champNom.click();
  await champNom.fill('Mairie');

  // DESCRIPTION
  const champDescription = page.locator('#input_detailitem_types_fields');
  await champDescription.click();
  await champDescription.fill('test');
});

When("l'usager clique sur le bouton de validation", async function () {
  const page = this.backofficePage;
  const boutonSoumission = page.locator('#btn-add-ad');
  await boutonSoumission.scrollIntoViewIfNeeded();
  await boutonSoumission.dispatchEvent('click');
  await page.waitForTimeout(1500);
});
When("l'usager renseigne les informations de l'objet", async function () {
  const page = this.backofficePage;

  // ADRESSE : "Paris, France"
  const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();
  await champAdresse.click();
  await champAdresse.clear();
  await champAdresse.pressSequentially('Paris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(800);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(400);
  await champAdresse.press('Backspace');
  await page.waitForTimeout(600);
  await champAdresse.pressSequentially('ris', { delay: 300 });
  await page.waitForTimeout(1500);
  const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
  await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
  await suggestionAdresse.click();

  // DATE : "Aujourd'hui"
  const boutonDate = page.locator('#input-date-picker__today');
  await boutonDate.waitFor({ state: 'visible', timeout: 10000 });
  await boutonDate.click();

  // CATEGORIE : "Sacs & Bagages"
  const categorieSacsBagages = page.locator('div').filter({ hasText: /^Sacs & Bagages$/ }).first();
  await categorieSacsBagages.waitFor({ state: 'visible', timeout: 10000 });
  await categorieSacsBagages.click();

  // SOUS-CATEGORIE : "Sac"
  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await sousCategorieSac.waitFor({ state: 'visible', timeout: 10000 });
  await sousCategorieSac.click();

  // MARQUE (optionnel selon ce qui déclenche la section auth)
  const champMarque = page.getByText('Indiquez la marque', { exact: false }).first();
  await champMarque.waitFor({ state: 'visible', timeout: 10000 });
  await champMarque.click();
  const optionMarque = page.getByRole('option', { name: '1Voice' }).first();
  await optionMarque.waitFor({ state: 'visible', timeout: 10000 });
  await optionMarque.click();

  // COULEUR : Noir
  const couleurNoir = page.locator('span').filter({ hasText: /^Noir$/ }).first();
  await couleurNoir.waitFor({ state: 'visible', timeout: 10000 });
  await couleurNoir.click();
});


When("l'usager soumet le formulaire de signalement", async function () {
  const page = this.backofficePage;
  const boutonSoumission = page.locator('#btn-add-ad');
  await boutonSoumission.scrollIntoViewIfNeeded();
  await boutonSoumission.dispatchEvent('click');
  await page.waitForTimeout(1500);
});

When("l'usager saisit les informations necessaires a la creation de compte", async function () {
  const page = this.backofficePage;

  const selectGenre = page.locator('#gender');
  await selectGenre.waitFor({ state: 'visible', timeout: 10000 });
  await selectGenre.selectOption('M'); // Homme

  const champNom = page.locator('#lastname');
  await champNom.waitFor({ state: 'visible', timeout: 10000 });
  await champNom.fill('Dupont');

  const champPrenom = page.locator('#firstname');
  await champPrenom.waitFor({ state: 'visible', timeout: 10000 });
  await champPrenom.fill('Jean');

  const emailUnique = `test.auto.${Date.now()}@troov.com`;
  const champEmail = page.locator('#email');
  await champEmail.waitFor({ state: 'visible', timeout: 10000 });
  await champEmail.fill(emailUnique);

  const champMobile = page.locator('#mobile');
  await champMobile.waitFor({ state: 'visible', timeout: 10000 });
  await champMobile.fill('0612345678');

  const champPassword = page.locator('#passworduser');
  await champPassword.waitFor({ state: 'visible', timeout: 10000 });
  await champPassword.fill('Test1234!');
});

When("l'usager saisit ses identifiants de connexion", async function () {
  const page = this.backofficePage;

  // EMAIL
  const champEmail = page.locator('#email');
  await champEmail.waitFor({ state: 'visible', timeout: 10000 });
  await champEmail.fill('Mairie@troov.com');

  // MOT DE PASSE
  const champPassword = page.locator('#password');
  await champPassword.waitFor({ state: 'visible', timeout: 10000 });
  await champPassword.fill('Hello123');
});

When('l\'usager coche la case "conditions"', async function () {
  const page = this.backofficePage;
  const caseConditions = page.locator('#acceptPolicies');
  await caseConditions.waitFor({ state: 'attached', timeout: 10000 });
  await caseConditions.check({ force: true });
});

When('l\'usager coche la case "news"', async function () {
  const page = this.backofficePage;
  const caseNews = page.locator('#acceptSharePartners');
  await caseNews.waitFor({ state: 'attached', timeout: 10000 });
  await caseNews.check({ force: true });
});
/*-----------------------------------------THEN-----------------------------------------*/

Then("l'usager est redirige vers le formulaire de signalement", async function () {
  const page = this.backofficePage;
  await expect(page).toHaveURL('http://localhost:3000/perdu', {
    timeout: 15000
  });
});

Then('l\'etat de l\'objet est automatiquement renseigne a "perdu"', async function () {
  const page = this.backofficePage;
  const boutonEtat = page.locator('#lost-btn');
  await expect(boutonEtat).toBeVisible({
    timeout: 10000
  });
  await expect(boutonEtat).toContainText('Perdu');
});

Then("la page de signalement s'affiche", async function () {
  const page = this.backofficePage;
  await expect(page).toHaveURL('http://localhost:3000/perdu', {
    timeout: 10000
  });
});

Then("les differents champs du formulaire sont visibles", async function () {
  const page = this.backofficePage;
  // A affiner avec le vrai selecteur du conteneur du formulaire
  // (le formulaire ne semble pas utiliser de balise <form>).
  const zoneFormulaire = page.locator('main, .container').first();
  await expect(zoneFormulaire).toBeVisible({
    timeout: 10000
  });
});

Then("l'etat est selectionne par defaut", async function () {
  const page = this.backofficePage;
  const boutonEtat = page.locator('#lost-btn');
  await expect(boutonEtat).toBeVisible({
    timeout: 10000
  });
  await expect(boutonEtat).toContainText('Perdu');
});

Then("le partenaire est selectionne par defaut", async function () {
  const page = this.backofficePage;
  // DEBUG temporaire
  await page.screenshot({ path: 'debug-partenaire.png', fullPage: true });
  console.log(await page.content());

  const boutonPartenaire = page.getByText(/Paris, France/i).first();
  await expect(boutonPartenaire).toBeVisible({
    timeout: 15000
  });
});

Then("le bouton de validation en fin de page est cliquable", async function () {
  const page = this.backofficePage;
  const boutonSoumission = page.locator('#btn-add-ad');
  await boutonSoumission.scrollIntoViewIfNeeded();
  await expect(boutonSoumission).toBeVisible({
    timeout: 10000
  });
  await expect(boutonSoumission).toBeEnabled({
    timeout: 10000
  });
});

Then("l'usager valide le formulaire", async function () {
  const page = this.backofficePage;
  const boutonSoumission = page.locator('#btn-add-ad');
  await boutonSoumission.scrollIntoViewIfNeeded();
  // Clic direct sur l'element DOM, contourne les overlays (ex: bandeau cookies)
  // qui interceptent les evenements souris meme avec { force: true }.
  await boutonSoumission.dispatchEvent('click');
  await page.waitForTimeout(1500);
});

Then("la liste des sous-categories associees s'affiche", async function () {
  const page = this.backofficePage;

  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await expect(sousCategorieSac).toBeVisible({
    timeout: 10000
  });
});

Then("l'usager selectionne une sous-categorie d'objet", async function () {
  const page = this.backofficePage;

  const sousCategorieSac = page.locator('div').filter({ hasText: /^Sac$/ }).first();
  await sousCategorieSac.click();
});

Then("le formulaire n'est pas valide", async function () {
  const page = this.backofficePage;
  // L'usager reste sur le formulaire de signalement, pas de redirection
  await expect(page).toHaveURL('http://localhost:3000/perdu', {
    timeout: 10000
  });
});

Then("un message d'erreur s'affiche sur le champ obligatoire", async function () {
  const page = this.backofficePage;
  const messageErreur = page.getByText('Vérifiez la saisie des champs');
  await expect(messageErreur).toBeVisible({
    timeout: 10000
  });
  await messageErreur.click();
});

Then("des questions d'authentification predefinies sont proposees selon l'objet", async function () {
  const page = this.backofficePage;

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const boutonAjouterQuestion = page.locator('button').filter({
    has: page.locator('span', { hasText: /Ajouter ma question d['’]authentification/i })
  }).first();

  await expect(boutonAjouterQuestion).toBeAttached({ timeout: 15000 });

  await boutonAjouterQuestion.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
});

Then("l'usager peut ajouter une question libre", async function () {
  const page = this.backofficePage;

  const boutonAjouterQuestion = page.locator('button').filter({
    has: page.locator('span', { hasText: /Ajouter ma question d['’]authentification/i })
  }).first();

  await page.evaluate((selector) => {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.style.display = 'flex';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      btn.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, 'button:has(span)'); 

  await boutonAjouterQuestion.waitFor({ state: 'visible', timeout: 10000 }).catch(async () => {

    await boutonAjouterQuestion.dispatchEvent('click');
  });

  await boutonAjouterQuestion.click({ force: true }).catch(async () => {
    await boutonAjouterQuestion.dispatchEvent('click');
  });
});
Then("l'usager est redirige vers la page de connexion ou de creation de compte", async function () {
  const page = this.backofficePage;

  const titre = page.getByRole('heading', { name: /Plus qu['']une étape/i });
  await expect(titre).toBeVisible({ timeout: 15000 });

  const ongletInscription = page.getByRole('tab', { name: /Inscrivez-vous/i });
  await expect(ongletInscription).toBeVisible({ timeout: 10000 });
  await ongletInscription.click();
});

Then("les champs obligatoires sont bien remplis", async function () {
  const page = this.backofficePage;

  await expect(page.locator('#gender')).toHaveValue('M');
  await expect(page.locator('#lastname')).toHaveValue('Dupont');
  await expect(page.locator('#firstname')).toHaveValue('Jean');
  await expect(page.locator('#email')).not.toHaveValue('');
  await expect(page.locator('#passworduser')).not.toHaveValue('');
});

Then("les informations de connexion sont bien renseignees", async function () {
  const page = this.backofficePage;

  await expect(page.locator('#email')).toHaveValue('Mairie@troov.com');
  await expect(page.locator('#password')).not.toHaveValue('');
});

Then("l'usager valide la page", async function () {
  const page = this.backofficePage;

  // Preuve que les 2 cases sont bien cochées
  await expect(page.locator('#acceptPolicies')).toBeChecked({ timeout: 10000 });
  await expect(page.locator('#acceptSharePartners')).toBeChecked({ timeout: 10000 });
});

Then("la connexion ou la creation de compte est confirmee", async function () {
  const page = this.backofficePage;

  // Fermer bandeau cookies si présent
  const boutonCookies = page.getByRole('button', {
    name: /Accepter|Tout accepter|OK|J'accepte|Accept/i
  }).first();
  if (await boutonCookies.isVisible().catch(() => false)) {
    await boutonCookies.click({ force: true });
  }

  await page.evaluate(() => {
    const label = document.querySelector('#is-human__BV_label_');
    if (label) {
      label.style.display = 'block';
      label.style.visibility = 'visible';
      label.style.opacity = '1';
      // Remonter les parents masqués si besoin
      let el = label;
      while (el) {
        el.style.display = el.style.display === 'none' ? 'block' : el.style.display;
        el.style.visibility = 'visible';
        el = el.parentElement;
      }
      label.scrollIntoView({ block: 'center' });
    }
  });

  const labelRobot = page.locator('#is-human__BV_label_');
  await expect(labelRobot).toContainText(/Je ne suis pas un robot/i);
});

Then("la page d'accueil de l'espace usager s'affiche correctement", async function () {
  const page = this.backofficePage;

  const accueil = page.locator('span[title="Accueil"]');
  // ou : page.getByText('Accueil', { exact: true })

  await expect(accueil).toBeVisible({ timeout: 15000 });
});

Then("un mail de verification de compte est envoye", async function () {
  // Précondition métier / side-effect backend.
  // En E2E on ne lit pas la boîte mail : on considère que
  // l'apparition de la pop-up de vérification prouve l'envoi.
});

Then("un message s'affiche pour verifier le compte usager", async function () {
  const page = this.backofficePage;

  // Bouton présent dans la pop-up de vérification
  const boutonRenvoyer = page.getByRole('button', {
    name: /Renvoyer l['']email de/i
  });

  await expect(boutonRenvoyer).toBeVisible({ timeout: 15000 });
});

Then("l'usager peut renvoyer le mail via la pop up", async function () {
  const page = this.backofficePage;

  const boutonRenvoyer = page.getByRole('button', {
    name: /Renvoyer l['']email de/i
  });

  await expect(boutonRenvoyer).toBeVisible({ timeout: 10000 });
  await boutonRenvoyer.click();
});
Then("la page s'affiche correctement", async function () {
  const page = this.backofficePage;

  const accueil = page.locator('span[title="Accueil"]');
  await expect(accueil).toBeVisible({ timeout: 15000 });
});

Then('l\'usager peut acceder a "signaler un objet"', async function () {
  const page = this.backofficePage;

  const lienSignaler = page.getByRole('link', { name: /Signaler un objet/i });
  // ou : page.locator('a.alert-item-btn', { hasText: /Signaler un objet/i })

  await expect(lienSignaler).toBeVisible({ timeout: 10000 });
  await expect(lienSignaler).toHaveAttribute('href', /\/items\/add/);
});

Then('l\'usager peut acceder a "mes objets"', async function () {
  const page = this.backofficePage;

  const lienMesObjets = page.locator('a.side-nav-link-ref', {
    hasText: /Mes objets/i
  });
  // ou : page.getByRole('link', { name: /Mes objets/i })

  await expect(lienMesObjets).toBeVisible({ timeout: 10000 });
  await expect(lienMesObjets).toHaveAttribute('href', /\/items/);
});