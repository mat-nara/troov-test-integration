const { Given, When, Then } = require('@cucumber/cucumber');
const {
  remplirChampsDocument,
  validerFormulaire,
  remplirAdresse,
  verifierPasDeCorrespondanceOuOuvrir, 
  demanderAnalyseCharlie,
  ouvrirSection,
  verifierScoreIA
} = require('../../../../core/helper');
require('../../../../core/common.steps');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const LIGNE_MATCH = { marque: 'SOPHIE',  modele: 'carte d identite'};

/*------------------------------------------------WHEN--------------------------------------*/

When('L\'utilisateur ouvre la fiche du match cote back office', async function () {
  await verifierPasDeCorrespondanceOuOuvrir(this.backofficePage, 'Sophie');
});

/*-----------------------------------------THEN---------------------------------------*/

Then('Le statut affiche "Pas de correspondance" pour l\'objet de {string}', async function (prenom) {
  const page = this.backofficePage;
  // Aller sur "Mes objets"
  const menu = page.locator('a.side-nav-link-ref', { hasText: 'Mes objets' }).first();
  await menu.click();
  await page.waitForTimeout(1000);

  // Vérifier l'apparition de "Pas de correspondance"
  const ligne = page.locator('tr.tui-cursor-pointer').filter({ hasText: new RegExp(prenom, 'i') }).first();
  const pasDeMatchIcon = ligne.locator('[aria-label="Pas de correspondance"], .icn-item-no-match');

  if (!(await pasDeMatchIcon.isVisible())) {
    throw new Error(`Erreur : Le statut "Pas de correspondance" n'est pas affiché pour ${prenom}`);
  }
});