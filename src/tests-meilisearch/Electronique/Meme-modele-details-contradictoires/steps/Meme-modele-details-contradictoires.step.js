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
  // Ouvre la fiche de match pour le casque audio Sony
  await ouvrirFicheMatch(this.backofficePage, { marque: 'Sony', modele: 'casque audio' });
});

/*--------------------------------THEN----------------------------------------*/

Then('Un score IA est affiche', async function () {
  await verifierScoreIA(this.backofficePage, this);
});