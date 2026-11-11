const { Given, When, Then } = require('@cucumber/cucumber');
const {
  remplirChampsObjet,
  validerFormulaire,
  remplirAdresse,
  ouvrirFicheMatch,
  demanderAnalyseCharlie,
  ouvrirSection,
  verifierScoreIA
} = require('../../../../core/helper');
require('../../../../core/common.steps');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/*--------------------------------WHEN----------------------------------------*/

When('L\'utilisateur ouvre la fiche du match cote back office', async function () {
  // Ouvre la fiche de match pour l'iPad Air Apple
  await ouvrirFicheMatch(this.backofficePage, { marque: 'Apple', modele: 'iPad Air' });
});

/*--------------------------------THEN----------------------------------------*/

Then('Un score IA est affiche', async function () {
  await verifierScoreIA(this.backofficePage, this);
});