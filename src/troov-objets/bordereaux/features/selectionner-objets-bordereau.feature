Feature: Sélectionner les objets du bordereau

  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    And L'utilisateur clique sur le bouton "+ Ajouter un bordereau"
    And L'utilisateur remplit le formulaire de création de bordereau
    And L'utilisateur clique sur le bouton "Suivant"

  Scenario: Afficher le Step 2
    Then L'etape "Selectionner un objet" s'affiche
      * Les onglets "Objets en stock", "Objets Archives" et "Par references" sont visibles
      * Les filtres Ordre, État, Date, Statut sont visibles
      * Le choix "Types d'objets" et les champs "Nom","Marque" et "Modele" sont disponibles
      * Les boutons "Rechercher", "Retour" et "Suivant" sont visibles
    When L'utilisateur clique sur le choix "sacs & Bagages" et apres sur "Sac", choisir une date dans la plage date  tape sur le boutton "Rechercher"
    Then Un tableau de l'objet rechercher s'affiche avec les colonnes "Type","Date","Proprietaire","Reference" s'affiche 
      * Deux boutton "Annuler cette  recherche" et "Valider la selection" s'affiche
    When L'utilisateur clique sur le boutton "Valider le selection"
    Then La statut 1/1 objets selectionnes s'affiche en haut
    When L'utilisateur clique sur le boutton Suivant
    Then la troisieme Step s'affiche 


  Scenario Afficher la troisieme Step
   When L'utilisateur arrive sur Confirmation
   Then le recap d'information borderau s'affiche comme "Destinataire", "Nom d'objets", "Type de bordereau"
    * Deux boutton s'affiche "Annuler" et "Creer le bordereau"
   When L'utilisateur clique sur "Creer le bordereau"
   Then la page arrive sur la page Mes bordereau
    * Le tableau Liste des objets d'affiche avec les informations
