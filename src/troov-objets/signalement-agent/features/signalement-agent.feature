Feature: Signalement d'un objet trouve sans IA

  Background:L'utilisateur est connecté sur sa page d'accueil

  Scenario: Ouvrir le formulaire depuis le bouton principal
    When L'utilisateur clique sur "Signaler un objet"
    Then Le formulaire s'ouvre

  Scenario: Ouvrir le formulaire depuis la barre express
    When L'utilisateur utilise la barre de signalement express
    Then le formulaire s'ouvre

  Scenario: Créer une annonce complete et imprimer le ticket
    When L'utilisateur ouvre le formulaire de signalement
    Then la date, le statut trouve et le partenaire sont remplis automatiquement
    When L'utilisateur  complète les infos de l'objet
        * L'utilisateur ajoute une photo
        * L'utilisateur coche "Impression de ticket avec QR code"
        *L'utilisateur clique sur "Ajouter mon annonce"
    Then  l'annonce est enregistrée
        *Le ticket avec le QR code s'imprime