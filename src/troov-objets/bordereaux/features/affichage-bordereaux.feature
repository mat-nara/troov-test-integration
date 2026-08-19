Feature: Affichage de la liste

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO "mairie@troov.com" et "Hello(123)"
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Bordereaux" dans la sidebar

  Scenario: Affichage de la page Bordereaux
    Then La page des bordereaux s'affiche correctement
    * Les filtres "Periode", "Statut", "Destinataire" s'affichent
    ## Le filtre rapide "En attente" s'affiche
    * Le bouton "+ Ajouter un bordereau" s'affiche en haut a droite
    * La liste des bordereaux s'affiche avec les colonnes :
      | Nom                 |
      | Statut              |
      | Destinataire        |
      | Objets              |
    ##  | Auteur              |
      | Date de declaration |