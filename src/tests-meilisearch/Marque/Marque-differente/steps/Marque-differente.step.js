const { Given, When, Then } = require('@cucumber/cucumber');
const {
  remplirChampsObjet,
  validerFormulaire,
  remplirAdresse,
  verifierPasDeCorrespondanceOuOuvrir,
  demanderAnalyseCharlie,
  ouvrirSection
} = require('../../../../core/helper');
require('../../../../core/common.steps');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/*--------------------------------THEN----------------------------------------*/

Then('Le statut affiche "Pas de correspondance" pour l\'objet de {string}', async function (marque) {
  const page = this.backofficePage;
  const menu = page.locator('a.side-nav-link-ref', { hasText: 'Mes objets' }).first();
  await menu.click();
  await page.waitForTimeout(1000);

  const ligne = page.locator('tr.tui-cursor-pointer').filter({ hasText: new RegExp(marque, 'i') }).first();
  const pasDeMatchIcon = ligne.locator('[aria-label="Pas de correspondance"], .icn-item-no-match');

  if (!(await pasDeMatchIcon.isVisible())) {
    throw new Error(`Erreur : Le statut "Pas de correspondance" n'est pas affiché pour la marque ${marque}`);
  }
});

When('L\'utilisateur ouvre la fiche du match cote back office', async function () {
  await verifierPasDeCorrespondanceOuOuvrir(this.backofficePage, 'Longchamp'); 
});