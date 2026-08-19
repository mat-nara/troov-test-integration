Feature: Suivi des commandes dans la Section Expédition

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Retrait/Expédition" dans la sidebar
     * L'utilisateur clique sur "Expédition"

  Scenario: Affichage de la page Suivi des commandes - Expédition
    Then Le titre "Suivi des commandes" s'affiche
     * La description "Retrouver toutes vos commandes à expédier ou en cours d'expédition" s'affiche
     * Les filtres principaux suivants sont visibles :
      | Nom mentionné |
      | # Référence   |
     * Les boutons "Rechercher" et "Filtres" s'affichent
     * Les boutons de filtres rapides s'affichent :
      | Objets déjà envoyés |
      | Objets non envoyés  |
      | Afficher tout       |
     * Le bouton "Exporter les données" s'affiche
     * Le tableau des expéditions s'affiche avec les colonnes :
      | Type                |
      | Ref-Trouvé          |
      | Numéro de suivi     |
      | Nom du propriétaire |
      | Date de paiement    |
      | Transporteur        |
      | Format du colis     |
      | Statut              |
      | Action              |