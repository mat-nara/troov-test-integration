Feature: Creation d'un bordereau (Etape 1)

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO "mairie@troov.com" et "Hello(123)"
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Bordereaux" dans la sidebar
    * L'utilisateur clique sur le bouton "+ Ajouter un bordereau"

  Scenario: Ajouter un bordereau - Affichage de l'etape 1
    Then Le formulaire en 3 etapes s'affiche avec les indicateurs :
      | Creer un bordereau   |
      | Selectionner un objet |
      | Exporter les donnees  |
    * Les champs "Nom du bordereau", "Type" s'affichent
    * Les options de receveur "A un nouveau contact" et "A compte Troov" s'affichent
    * Les champs "Nom", "Adresse", "Ville", "Code postal", "Pays" et "Type d'entite" s'affichent
    * Les toggles "Receveur (bordereaux)" et "Service deposant" s'affichent
    * Le bouton "Ajouter", le champ "Message" et le bouton "Suivant" s'affichent

 ## Scenario: Modele de bordereau - Verification des options
 ##   When L'utilisateur ouvre le menu deroulant "Modele"
 ##   Then Le menu deroulant "Modele" propose exactement les 3 options :
 ##     | Defaut                 |
 ##     | Prefecture de Paris    |
 ##     | Etiquettes individuelles|

 ## Scenario: Type - Verification des options disponibles
 ##   When L'utilisateur ouvre le menu deroulant "Type"
 ##   Then La liste deroulante propose les types de bordereaux disponibles

  Scenario: Receveur - choix du type de contact (Onglet A un nouveau contact)
    When L'utilisateur selectionne l'onglet "A un nouveau contact"
    Then Les champs "Nom", "Adresse", "Ville", "Code postal", "Pays" et "Type d'entite" s'affichent
    * Les toggles "Receveur (bordereaux)" et "Service deposant" s'affichent
    * Le champ "Message" s'affiche

  Scenario: Receveur - choix du type de contact (Onglet A un compte Troov)
    When L'utilisateur selectionne l'onglet "A un compte Troov"
    Then Le champ "Email" s'affiche
    * Le bouton "Rechercher" s'affiche
    * Le champ "Message" s'affiche