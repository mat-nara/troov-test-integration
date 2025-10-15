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
//  "rendez-vous": [
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-enregistrement --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-motif --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-confirmation --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-sans-rdv-backoffice --format progress",
//
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-recherche --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-confirmation --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-avec-rdv-backoffice --format progress",
//
//    "npx cucumber-js --config cucumber-profiles.js --profile signalement-usager-via-PC-NEW-PCLS --format progress",
//    "npx cucumber-js --config cucumber-profiles.js --profile fil-d-attente-signalement --format progress",
//  ],
};
