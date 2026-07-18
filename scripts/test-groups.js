// test-groups.js
module.exports = {
  "signalement-arrivee": [
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-enregistrement --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-motif --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-confirmation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-backoffice --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-recherche --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-confirmation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-backoffice --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-via-PC-NEW-PCLS --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile fil-d-attente-signalement --format progress",
  ], 
  "rendez-vous": [
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-caf-fr-motif --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-caf-fr-creneau --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-caf-fr-contact --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-caf-fr-confirmation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-caf-fr-navigation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-agent-via-troov-rdv-creation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-agent-via-troov-rdv-modification --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-agent-via-troov-rdv-annulation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-de-masse-deplacement-rdv --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile deplacement-rdv-via-calendrier --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-de-masse-rdv-annulation --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile prise-RDV-entretient-urgence --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile rdv-multi-lieux --format progress",
  ],
  "gestion-lieu": [
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-lieu --format progress",
  ],
  "gestion-equipe": [
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-equipe --format progress",
  ],
  "gestion-service": [
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-service-motif --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-service-guichets --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-service-autres-options --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-service-plage-exceptionnel --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-service-cas-approche-popup-guichets --format progress",
  ],
  "gestion-file-d-attente": [
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-file-d-attente --format progress",
  ],
  "statistiques": [
    "npx cucumber-js --config cucumber-profiles.js --profile statistiques-rdv --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile statistique-file-d-attente --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile statistique-individuel-utilisateur-acceuil --format progress",
  ],
  "access": [
    "npx cucumber-js --config cucumber-profiles.js --profile access-profil-interface-national --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile access-profil-administrateur --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile access-profil-superviseur --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile access-profil-utilisateur-acceuil --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile access-authentification-changement-profile --format progress",
  ],
  "debuter-entretient": [
    "npx cucumber-js --config cucumber-profiles.js --profile debuter-entretient --format progress",
  ],
  "calendrier": [
    "npx cucumber-js --config cucumber-profiles.js --profile calendrier-total-download --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile calendrier-total-filtre --format progress",
    "npx cucumber-js --config cucumber-profiles.js --profile calendrier-autres-filtres --format progress",
  ],
  "access-authentification-changement-profile": [
    
  ],
  "prise-rdv-public": [
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-public --format progress",
  ],
  "prise-rdv-agent-via-troov-rdv-creation-alfa": [
    "npx cucumber-js --config cucumber-profiles.js --profile prise-rdv-agent-via-troov-rdv-creation-alfa --format progress",
  ],
  "deplacement-rdv-masse-alfa": [
    "npx cucumber-js --config cucumber-profiles.js --profile deplacement-rdv-masse-alfa --format progress",
  ],
  "gestion-lieu-alfa": [
    "npx cucumber-js --config cucumber-profiles.js --profile gestion-lieu-alfa --format progress",
  ],


  "troov-objets-signalement-usager-objets-perdu": [
    "npx cucumber-js --config cucumber-profiles.js --profile troov-objets-signalement-usager-objets-perdu --format progress",
  ],

  
};
