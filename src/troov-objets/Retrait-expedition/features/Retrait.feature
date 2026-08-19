Feature: Suivi des commandes dans la Section Retrait

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Retrait/Expédition" dans la sidebar
     * L'utilisateur clique sur "Retrait"

  Scenario: Affichage de la page Suivi des commandes et du tableau
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
     * Le tableau des retraits s'affiche avec les colonnes :
      | Type                      |
      | Ref-Trouvé                |
      | Nom du propriétaire       |
      | Date de paiement          |
      | Date souhaitée de retrait |
      | Statut                    |
      | Action                    |

Scenario: Ouverture de la pop-up Plus de filtres et onglet Références des objets
    When L'utilisateur clique sur le bouton "Filtres"
    Then La pop-up "Plus de filtres" s'ouvre
     * L'onglet "Références des objets" est sélectionné
     * Le champ de recherche "# Référence" s'affiche dans la pop-up
     * Les boutons "Fermer" et "Rechercher" s'affichent dans la pop-up

  Scenario: Utilisation du filtre avancé - Onglet Objets
    When L'utilisateur clique sur le bouton "Filtres"
    * L'utilisateur clique sur l'onglet "Objets" dans la pop-up
    Then Les options de tri s'affichent :
      | Tri par objets récent |
      | Tri par objets ancien |
    * Le menu déroulant "Tous les types" s'affiche
    * Les options de statut s'affichent :
      | Tous les retraits    |
      | Retrait non effectué |
      | Retrait effectué     |
    * Les boutons "Fermer" et "Rechercher" s'affichent dans la pop-up