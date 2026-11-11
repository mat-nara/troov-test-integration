const { Given, When, Then } = require('@cucumber/cucumber');
const { remplirChampsObjet,validerFormulaire,remplirAdresse, ouvrirFicheMatch,demanderAnalyseCharlie,ouvrirSection,verifierScoreIA
} = require('../../../../core/helper'); 
require('../../../../core/common.steps');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const LIGNE_MATCH = {
  marque: 'EASTPAK',
  modele: 'sac a dos'
};


/*------------------------------------------WHEN-------------------------------------------*/

When('L\'utilisateur ouvre la fiche du match cote back office', async function () {
  await ouvrirFicheMatch(this.backofficePage, LIGNE_MATCH);
});
/*--------------------------------------------THEN------------------------------------------------*/

Then('Un score IA est affiche', async function () {
  await verifierScoreIA(this.backofficePage, this);
});