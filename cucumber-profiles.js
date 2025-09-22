// cucumber-profiles.js
const path = require("path");

// Partie commune pour tous les profils
const commonRequire = [
  "src/test/**/support/*.js",
  "src/test/**/pages/*.js"
];

const commonFormatOptions = { snippetInterface: "async-await" };
const commonFormatBase = ["summary", "progress-bar"];
const reportsDir = "./reports";

/**
 * Génère automatiquement un nom de rapport à partir du fichier feature
 * Ex: "selection-sans-rdv-enregistrement.feature" → "report-selection-sans-rdv-enregistrement.html"
 */
function getReportName(featurePath) {
  const baseName = path.basename(featurePath, ".feature");
  return `report-${baseName}.html`;
}

/**
 * Crée un profil Cucumber
 * @param {string} featurePath Chemin du fichier .feature
 * @param {string} stepPath Chemin du fichier de steps
 */
function createProfile(featurePath, stepPath) {
  return {
    paths: [featurePath],
    require: [...commonRequire, stepPath],
    formatOptions: commonFormatOptions,
    format: [`html:${path.join(reportsDir, getReportName(featurePath))}`, ...commonFormatBase]
  };
}

// Liste de tous les tests à inclure
const testList = [	

	/********************************************************************************************************/
	/*  								SIGNALEMENT D'ARRIVER 												*/
	/********************************************************************************************************/
	// Signalement sans RDV VitApp
	{
		profileName: "signalement-usager-sans-rdv-enregistrement",
		feature: "src/test/signalement-usager/features/selection-sans-rdv-enregistrement.feature",
		step: "src/test/signalement-usager/steps/selection-sans-rdv-enregistrement.step.js"
	},
	{
		profileName: "signalement-usager-sans-rdv-motif",
		feature: "src/test/signalement-usager/features/selection-sans-rdv-motif.feature",
		step: "src/test/signalement-usager/steps/selection-sans-rdv-motif.step.js"
	},
	{
		profileName: "signalement-usager-sans-rdv-confirmation",
		feature: "src/test/signalement-usager/features/selection-sans-rdv-confirmation.feature",
		step: "src/test/signalement-usager/steps/selection-sans-rdv-confirmation.step.js"
	},
	{
		profileName: "signalement-usager-sans-rdv-backoffice",
		feature: "src/test/signalement-usager/features/selection-sans-rdv-affichage-rdv-dans-dashboard.feature",
		step: "src/test/signalement-usager/steps/selection-sans-rdv-affichage-rdv-dans-dashboard.step.js"
	},
	// Signalement avec RDV VitApp
	{
		profileName: "signalement-usager-avec-rdv-recherche",
		feature: "src/test/signalement-usager/features/selection-avec-rdv-recherche.feature",
		step: "src/test/signalement-usager/steps/selection-avec-rdv-recherche.step.js"
	},
	{
		profileName: "signalement-usager-avec-rdv-confirmation",
		feature: "src/test/signalement-usager/features/selection-avec-rdv-confirmation.feature",
		step: "src/test/signalement-usager/steps/selection-avec-rdv-confirmation.step.js"
	},
	{
		profileName: "signalement-usager-avec-rdv-backoffice",
		feature: "src/test/signalement-usager/features/selection-avec-rdv-affichage-rdv-dans-dashboard.feature",
		step: "src/test/signalement-usager/steps/selection-avec-rdv-affichage-rdv-dans-dashboard.step.js"
	},
	// Signalement via PC-NEW-PCLS
	{
		profileName: "signalement-usager-via-PC-NEW-PCLS",
		feature: "src/test/signalement-arriver-via-PC-NEW-PCLS/features/signalement-arriver-via-PC-NEW-PCLS.feature",
		step: "src/test/signalement-arriver-via-PC-NEW-PCLS/steps/signalement-arriver-via-PC-NEW-PCLS.step.js"
	},

	/********************************************************************************************************/
	/*  								GESTION DE RENDEZ-VOUS 												*/
	/********************************************************************************************************/
	// Prise de RDV via parcours CAF fr
	{
		profileName: "prise-rdv-caf-fr-motif",
		feature: "src/test/prise-rdv-caf-fr/features/motif.feature",
		step: "src/test/prise-rdv-caf-fr/steps/motif.step.js"
	},
	{
		profileName: "prise-rdv-caf-fr-creneau",
		feature: "src/test/prise-rdv-caf-fr/features/creneau.feature",
		step: "src/test/prise-rdv-caf-fr/steps/creneau.step.js"
	},
	{
		profileName: "prise-rdv-caf-fr-contact",
		feature: "src/test/prise-rdv-caf-fr/features/contact.feature",
		step: "src/test/prise-rdv-caf-fr/steps/contact.step.js"
	},
	{
		profileName: "prise-rdv-caf-fr-confirmation",
		feature: "src/test/prise-rdv-caf-fr/features/confirmation.feature",
		step: "src/test/prise-rdv-caf-fr/steps/confirmation.step.js"
	},
	{
		profileName: "prise-rdv-caf-fr-navigation",
		feature: "src/test/prise-rdv-caf-fr/features/navigation.feature",
		step: "src/test/prise-rdv-caf-fr/steps/navigation.step.js"
	},
	// Prise de RDV via parcours Troov
	{
		profileName: "prise-rdv-agent-via-troov-rdv",
		feature: "src/test/gestion-rdv/features/prise-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv/steps/prise-rdv-agent-via-troov-rdv.step.js"
	},
	// Mofidication de RDV Troov
	{
		profileName: "prise-rdv-agent-via-troov-rdv",
		feature: "src/test/gestion-rdv/features/modification-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv/steps/modification-rdv-agent-via-troov-rdv.step.js"
	},
	// Annulation de RDV Troov
	{
		profileName: "prise-rdv-agent-via-troov-rdv",
		feature: "src/test/gestion-rdv/features/annulation-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv/steps/annulation-rdv-agent-via-troov-rdv.step.js"
	},
	// Gestion de masse de rendez-vous: Deplacement
	{
		profileName: "gestion-de-masse-deplacement-rdv",
		feature: "src/test/deplacement-rdv-masse/features/deplacement-rdv-masse.feature",
		step: "src/test/deplacement-rdv-masse/steps/deplacement-rdv-masse.step.js"
	},
	// Deplacement de RDV via calendrier
	{
		profileName: "deplacement-rdv-via-calendrier",
		feature: "src/test/deplacement-rdv-via-calendrier/features/deplacement-rdv-via-calendrier.feature",
		step: "src/test/deplacement-rdv-via-calendrier/steps/deplacement-rdv-via-calendrier.step.js"
	},
	// Gestion de masse de rendez-vous: Annulation
	{
		profileName: "gestion-de-masse-rdv-annulation",
		feature: "src/test/gestion-de-masse-rdv-annulation/features/gestion-de-masse-rdv-annulation.feature",
		step: "src/test/gestion-de-masse-rdv-annulation/steps/gestion-de-masse-rdv-annulation.step.js"
	},
	// Prise de rendez-vous entretient d'urgence
	{
		profileName: "prise-RDV-entretient-urgence",
		feature: "src/test/prise-RDV-entretient-urgence/features/prise-RDV-entretient-urgence.feature",
		step: "src/test/prise-RDV-entretient-urgence/steps/prise-RDV-entretient-urgence.step.js"
	},

];


// Générer dynamiquement les profils
const profiles = {};
for (const test of testList) {
  profiles[test.profileName] = createProfile(test.feature, test.step);
}

// Exporter les profils
module.exports = profiles;
