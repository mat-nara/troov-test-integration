Feature: Ajout d'un objet lié
  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent

  Scenario: Ajouter un objet lié dans le formulaire de signalement
    When L'utilisateur clique sur le bouton "Signaler un objet"
     * L'utilisateur remplit le formulaire de signalement principal
     * L'utilisateur clique sur le bouton "Lier un nouvel objet à cette fiche"
    Then Une pop-in s'ouvre proposant un formulaire identique au signalement de base

##  Scenario: Ajouter un objet lié en faisant appel à l'IA via une photo
##    When L'utilisateur clique sur le bouton "Signaler un objet"
##     * L'utilisateur remplit le formulaire de signalement principal
##     * L'utilisateur clique sur le bouton "Lier un nouvel objet à cette fiche"
##     * L'utilisateur ajoute une photo pour faire appel à l'IA
##    Then Les champs du formulaire de l'objet lié se remplissent automatiquement

  Scenario: L'objet lié créé apparaît dans la fiche de l'objet principal
    When L'utilisateur clique sur le bouton "Signaler un objet"
       * L'utilisateur remplit le formulaire de signalement principal
       * L'utilisateur ajoute un objet lie dans le formulaire
    Then L'objet lié est cree et apparait dans la fiche de l'objet principal