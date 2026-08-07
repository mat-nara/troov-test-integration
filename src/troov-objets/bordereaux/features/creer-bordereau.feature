Feature: Créer un bordereau

  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    And L'utilisateur clique sur le bouton "Créer manuellement"

  Scenario: Remplir l'etape Informations et passer à la selection des objets
    Then Le formulaire de création de bordereau s'affiche
      * Les 3 etapes "Informations", "Selection des objets" et "Confirmation" sont visibles
      * Les champs "Nom du bordereau", "Type de bordereau", "Destinataire" et "Message" sont visibles
      * Le bouton "Ajouter un contact" sur le champ Destinataire est visible
      * Le bouton "Suivant" est visible
    When L'utilisateur renseigne le nom du bordereau
      * L'utilisateur selectionne l'option "transfert" sur le Type de bordereau
      * L'utilisateur renseigne le message
      * L'utilisateur clique sur le bouton "Ajouter un contact"
    Then Les options "Contact externe" et "Contact troov" s'affichent
    When L'utilisateur clique sur "Contact troov"
    Then Les champs "Nom", "Adresse", "Ville", "Code postal" et "Pays" sont visibles
      * Les options "Type d'entite" et "Equipe" sont visibles
    When L'utilisateur choisit une équipe
    Then Les champs restants se remplissent automatiquement avec les informations de l'equipe choisie
    When L'utilisateur clique sur le bouton "Suivant"
    Then L'etape "Selection des objets" s'affiche

