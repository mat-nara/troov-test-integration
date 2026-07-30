// cucumber-profiles.js
const path = require("path");

// Partie commune pour tous les profils
// const commonRequire = [
//   "src/test/**/support/*.js",
//   "src/test/**/pages/*.js"
// ];

const commonRequire = [
	"src/core/world.js",
	"src/core/hooks.js",
	"src/core/helper.js",
  	"src/core/pages/*.js"
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
	// Signalement via file d'attente troov
	{
		profileName: "fil-d-attente-signalement",
		feature: "src/test/fil-d-attente-signalement/features/fil-d-attente-signalement.feature",
		step: "src/test/fil-d-attente-signalement/steps/fil-d-attente-signalement.step.js"
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
		profileName: "prise-rdv-agent-via-troov-rdv-creation",
		feature: "src/test/gestion-rdv/features/prise-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv/steps/prise-rdv-agent-via-troov-rdv.step.js"
	},
	// Mofidication de RDV Troov
	{
		profileName: "prise-rdv-agent-via-troov-rdv-modification",
		feature: "src/test/gestion-rdv/features/modification-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv/steps/modification-rdv-agent-via-troov-rdv.step.js"
	},
	// Annulation de RDV Troov
	{
		profileName: "prise-rdv-agent-via-troov-rdv-annulation",
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
	// Rdv multi-lieux
	{
		profileName: "rdv-multi-lieux",
		feature: "src/test/rdv-multi-lieux/features/rdv-multi-lieux.feature",
		step: "src/test/rdv-multi-lieux/steps/rdv-multi-lieux.step.js"
	},


	/********************************************************************************************************/
	/*  								GESTION DE LIEU 													*/
	/********************************************************************************************************/
	{
		profileName: "gestion-lieu",
		feature: "src/test/gestion-lieu/features/gestion-lieu.feature",
		step: "src/test/gestion-lieu/steps/gestion-lieu.step.js"
	},
	/********************************************************************************************************/
	/*  								GESTION DES EQUIPES 												*/
	/********************************************************************************************************/
	{
		profileName: "gestion-equipe",
		feature: "src/test/gestion-equipe/features/gestion-membre-equipe.feature",
		step: "src/test/gestion-equipe/steps/gestion-membre-equipe.step.js"
	},
	/********************************************************************************************************/
	/*  								GESTION DES SERVICES 												*/
	/********************************************************************************************************/
	// Gestion des services: Motif 
	{
		profileName: "gestion-service-motif",
		feature: "src/test/gestion-service/features/gestion-service.feature",
		step: "src/test/gestion-service/steps/gestion-service.step.js"
	},
	// Gestion des services: Guichets 
	{
		profileName: "gestion-service-guichets",
		feature: "src/test/gestion-guichets/features/gestion-guichets.feature",
		step: "src/test/gestion-guichets/steps/gestion-guichets.step.js"
	},
	// Gestion des services: Autres options 
	{
		profileName: "gestion-service-autres-options",
		feature: "src/test/gestion-service-autres-options/features/gestion-service-autres-options.feature",
		step: "src/test/gestion-service-autres-options/steps/gestion-service-autres-options.step.js"
	},
	// Gestion des services: Plage exceptionnelle 
	{
		profileName: "gestion-service-plage-exceptionnel",
		feature: "src/test/plage-exceptionnel/features/plage-exceptionnel.feature",
		step: "src/test/plage-exceptionnel/steps/plage-exceptionnel.step.js"
	},
	// Gestion des services: Cas approche popup guichets 
	{
		profileName: "gestion-service-cas-approche-popup-guichets",
		feature: "src/test/cas-approche-popup-guichets/features/cas-approche-popup-guichets.feature",
		step: "src/test/cas-approche-popup-guichets/steps/cas-approche-popup-guichets.step.js"
	},
	/********************************************************************************************************/
	/*  								GESTION DE LA FILE D'ATTENTE 										*/
	/********************************************************************************************************/
	// Gestion de la file d'attente 
	{
		profileName: "gestion-file-d-attente",
		feature: "src/test/gestion-file-d-attente/features/gestion-file-d-attente.feature",
		step: "src/test/gestion-file-d-attente/steps/gestion-file-d-attente.step.js"
	},
	/********************************************************************************************************/
	/*  								STATISTIQUES 														*/
	/********************************************************************************************************/
	// Console de pilotage différé: Statistiques RDV 
	{
		profileName: "statistiques-rdv",
		feature: "src/test/statistiques-rdv/features/statistiques-rdv.feature",
		step: "src/test/statistiques-rdv/steps/statistiques-rdv.step.js"
	},
	// Console de pilotage différé: Pilotage file d'attente
	{
		profileName: "statistique-file-d-attente",
		feature: "src/test/statistique-file-d-attente/features/statistique-file-d-attente.feature",
		step: "src/test/statistique-file-d-attente/steps/statistique-file-d-attente.step.js"
	},
	// Console de pilotage différé: Statistiques individuelles 
	{
		profileName: "statistique-individuel-utilisateur-acceuil",
		feature: "src/test/statistique-individuel-utilisateur-acceuil/features/statistique-individuel-utilisateur-acceuil.feature",
		step: "src/test/statistique-individuel-utilisateur-acceuil/steps/statistique-individuel-utilisateur-acceuil.step.js"
	},
	/********************************************************************************************************/
	/*  								ACCESS 														*/
	/********************************************************************************************************/
	// Vérification des accès: Profile Interface National  
	{
		profileName: "access-profil-interface-national",
		feature: "src/test/access-profil-interface-national/features/access-profil-interface-national.feature",
		step: "src/test/access-profil-interface-national/steps/access-profil-interface-national.step.js"
	},
	// Vérification des accès: Profile Administrateur
	{
		profileName: "access-profil-administrateur",
		feature: "src/test/access-profil-administrateur/features/access-profil-administrateur.feature",
		step: "src/test/access-profil-administrateur/steps/access-profil-administrateur.step.js"
	},
	// Vérification des accès: Profil Superviseur  
	{
		profileName: "access-profil-superviseur",
		feature: "src/test/access-profil-superviseur/features/access-profil-superviseur.feature",
		step: "src/test/access-profil-superviseur/steps/access-profil-superviseur.step.js"
	},
	// Vérification des accès: Profil utilisateur acceuil  
	{
		profileName: "access-profil-utilisateur-acceuil",
		feature: "src/test/access-profil-utilisateur-acceuil/features/access-profil-utilisateur-acceuil.feature",
		step: "src/test/access-profil-utilisateur-acceuil/steps/access-profil-utilisateur-acceuil.step.js"
	},
	/********************************************************************************************************/
	/*  								ENTRETIENT PHYSIQUE 												*/
	/********************************************************************************************************/
	// Debuter un entretient  
	{
		profileName: "debuter-entretient",
		feature: "src/test/debuter-entretient/features/debuter-entretient.feature",
		step: "src/test/debuter-entretient/steps/debuter-entretient.step.js"
	},
	/********************************************************************************************************/
	/*  								CALENDRIER 															*/
	/********************************************************************************************************/
	// Téléchargement des exports du calendrier  
	{
		profileName: "calendrier-total-download",
		feature: "src/test/calendrier-total-download/features/calendrier-total-download.feature",
		step: "src/test/calendrier-total-download/steps/calendrier-total-download.step.js"
	},
	// Filtre fenetre total  
	{
		profileName: "calendrier-total-filtre",
		feature: "src/test/calendrier-total-filtre/features/calendrier-total-filtre.feature",
		step: "src/test/calendrier-total-filtre/steps/calendrier-total-filtre.step.js"
	},
	// Autres filtres du calendrier  
	{
		profileName: "calendrier-autres-filtres",
		feature: "src/test/calendrier-autres-filtres/features/calendrier-autres-filtres.feature",
		step: "src/test/calendrier-autres-filtres/steps/calendrier-autres-filtres.step.js"
	},
	/********************************************************************************************************/
	/*  						ACCESS/AUTHENTIFICATION/CHANGEMENT DE PROFILE 								*/
	/********************************************************************************************************/
	// Access - Authentification - Changement de profile
	{
		profileName: "access-authentification-changement-profile",
		feature: "src/test/access-authentification-changement-profile/features/access-authentification-changement-profile.feature",
		step: "src/test/access-authentification-changement-profile/steps/access-authentification-changement-profile.step.js"
	},
	/********************************************************************************************************/
	/*  						PRISE DE RDV PUBLIC 								*/
	/********************************************************************************************************/
	// Access - Authentification - Changement de profile
	{
		profileName: "prise-rdv-public",
		feature: "src/test/prise-rdv-public/features/prise-rdv-public.feature",
		step: "src/test/prise-rdv-public/steps/prise-rdv-public.step.js"
	},

	/***************************************** Serveur Alfa ***********************************************/
	/********************************************************************************************************/
	/*  								GESTION DE RENDEZ-VOUS 												*/
	/********************************************************************************************************/
	// Prise de RDV via parcours Troov Alfa
	{
		profileName: "prise-rdv-agent-via-troov-rdv-creation-alfa",
		feature: "src/test/gestion-rdv-alfa/features/prise-rdv-agent-via-troov-rdv.feature",
		step: "src/test/gestion-rdv-alfa/steps/prise-rdv-agent-via-troov-rdv.step.js"
	},
	// Deplacement de RDV en masse via parcours Troov Alfa
	{
		profileName: "deplacement-rdv-masse-alfa",
		feature: "src/test/deplacement-rdv-masse-alfa/features/deplacement-rdv-masse.feature",
		step: "src/test/deplacement-rdv-masse-alfa/steps/deplacement-rdv-masse.step.js"
	},

	/********************************************************************************************************/
	/*  								GESTION DE LIEU 													*/
	/********************************************************************************************************/
	{
		profileName: "gestion-lieu-alfa",
		feature: "src/test/gestion-lieu-alfa/features/gestion-lieu.feature",
		step: "src/test/gestion-lieu-alfa/steps/gestion-lieu.step.js"
	},
//	/********************************************************************************************************/
//	/*  								GESTION DES EQUIPES 												*/
//	/********************************************************************************************************/
//	{
//		profileName: "gestion-equipe",
//		feature: "src/test/gestion-equipe/features/gestion-membre-equipe.feature",
//		step: "src/test/gestion-equipe/steps/gestion-membre-equipe.step.js"
//	},
//	/********************************************************************************************************/
//	/*  								GESTION DES SERVICES 												*/
//	/********************************************************************************************************/
//	// Gestion des services: Motif 
//	{
//		profileName: "gestion-service-motif",
//		feature: "src/test/gestion-service/features/gestion-service.feature",
//		step: "src/test/gestion-service/steps/gestion-service.step.js"
//	},
//	// Gestion des services: Guichets 
//	{
//		profileName: "gestion-service-guichets",
//		feature: "src/test/gestion-guichets/features/gestion-guichets.feature",
//		step: "src/test/gestion-guichets/steps/gestion-guichets.step.js"
//	},
//	// Gestion des services: Autres options 
//	{
//		profileName: "gestion-service-autres-options",
//		feature: "src/test/gestion-service-autres-options/features/gestion-service-autres-options.feature",
//		step: "src/test/gestion-service-autres-options/steps/gestion-service-autres-options.step.js"
//	},
//	// Gestion des services: Plage exceptionnelle 
//	{
//		profileName: "gestion-service-plage-exceptionnel",
//		feature: "src/test/plage-exceptionnel/features/plage-exceptionnel.feature",
//		step: "src/test/plage-exceptionnel/steps/plage-exceptionnel.step.js"
//	},
//	// Gestion des services: Cas approche popup guichets 
//	{
//		profileName: "gestion-service-cas-approche-popup-guichets",
//		feature: "src/test/cas-approche-popup-guichets/features/cas-approche-popup-guichets.feature",
//		step: "src/test/cas-approche-popup-guichets/steps/cas-approche-popup-guichets.step.js"
//	},




	/***********************************************************************************************************************************************************************************************************/
	/********************************************************************************************************/
	/*  						TROOV OBJET 								*/
	/********************************************************************************************************/
	// Signalement usager objet trouvé
	{
		profileName: "troov-objets-signalement-usager-objets-perdu",
		feature: "src/troov-objets/signalement-usager-objets-perdu/features/signalement-usager-objets-perdu.feature",
		step: "src/troov-objets/signalement-usager-objets-perdu/steps/signalement-usager-objets-perdu.step.js"
	},




	/********************************************************************************************************/
	/*  						signalement agent 								*/
	/********************************************************************************************************/
	// Signalement usager objet trouvé
	{
		profileName: "signalement-agent-connexion-agent",
		feature: "src/troov-objets/signalement-agent/features/connexion-agent.feature",
		step: "src/troov-objets/signalement-agent/steps/connexion-agent.step.js"
	},
	// Signalement agent 
   {
        profileName: "signalement-agent",
        feature: "src/troov-objets/signalement-agent/features/signalement-agent.feature",
        step: "src/troov-objets/signalement-agent/steps/*.step.js"
    },
];


// Générer dynamiquement les profils
const profiles = {};
for (const test of testList) {
  profiles[test.profileName] = createProfile(test.feature, test.step);
}

// Exporter les profils
module.exports = profiles;
