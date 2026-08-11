Feature: Créer un bordereau

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    And L'utilisateur clique sur le bouton "Créer manuellement"

  Scenario: Afficher le formulaire de création en 3 étapes
    Then Un formulaire en 3 étapes s'affiche avec :
      * Les étapes "Informations", "Sélection des objets" et "Confirmation" sont visibles
      * Le champ "Nom du bordereau" est visible
      * Les types de bordereau "Transfert", "Modification", "Introuvable", "Destruction", "Restitution" et "Archivage" sont visibles
      * Le champ "Destinataire" avec le placeholder "Choisir un contact" est visible
      * Les boutons "Filtres" et "Ajouter un contact" sont visibles
      * Le champ "Message" est visible
      * Le bouton "Continuer" est visible en bas à droite

  Scenario: Vérifier l'ajout d'un contact
    When L'utilisateur clique sur le bouton "Ajouter un contact"
    Then Les options de contact s'affichent

  Scenario: Créer un bordereau complet avec succès
    When L'utilisateur renseigne le nom du bordereau "Bordereau Test Auto"
     * L'utilisateur sélectionne le type de bordereau "Transfert"
     * L'utilisateur clique sur le bouton "Ajouter un contact"
     * L'utilisateur renseigne le nouveau contact avec les informations suivantes :
      | Nom          | Contact Test Auto          |
      | Adresse      | 12 rue de la Paix          |
      | Ville        | Paris                      |
      | Code postal  | 75001                      |
      | Pays         | France                     |
      | Type d'entité| Entreprise                 |
     * L'utilisateur clique sur le bouton "Ajouter"
     * L'utilisateur renseigne le message "Message de test automatisé"
     * L'utilisateur clique sur le bouton "Continuer"

    Then L'étape "Sélection des objets" s'affiche
    When L'utilisateur clique sur l'onglet "Objets en stock"
     * L'utilisateur sélectionne la plage de dates du "01/08/2026" au "03/08/2026"
     * L'utilisateur clique sur le bouton "Rechercher"
     * L'utilisateur sélectionne un objet
     * L'utilisateur clique sur le bouton "Valider la sélection"
     * L'utilisateur clique sur le bouton "Continuer"

    Then L'étape "Confirmation" s'affiche
    When L'utilisateur clique sur le bouton "Créer le bordereau"
    Then Le bordereau est créé avec succès