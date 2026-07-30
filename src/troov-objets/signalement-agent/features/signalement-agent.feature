Feature: Signalement d'un objet trouvé sans IA

  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent

##  Scenario: Ouvrir le formulaire depuis le bouton principal
##    When L'utilisateur clique sur "Signaler un objet"
##    Then Le formulaire s'ouvre

##   Scenario: Ouvrir le formulaire depuis la barre express
##     When L'utilisateur utilise la barre de signalement express
##     Then Le formulaire s'ouvre

   Scenario: Créer une annonce complète et imprimer le ticket
     When L'utilisateur ouvre le formulaire de signalement
     Then la date, le statut trouvé et le partenaire sont remplis automatiquement
     When L'utilisateur complète les infos de l'objet
       * L'utilisateur ajoute une photo
##     * L'utilisateur coche "Impression de ticket avec QR code"
       * L'utilisateur clique sur "Ajouter mon annonce"
     Then l'annonce est enregistrée
  ##     * Le ticket avec le QR code s'imprime