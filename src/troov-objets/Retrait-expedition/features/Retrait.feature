Feature: Suivi des commandes dans la Section Retrait

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Retrait/Expedition" dans la sidebar
    * L'utilisateur clique sur "Retrait"

  Scenario: Affichage de la page Retrait/Expedition
    Then Le titre "Suivi des commandes" s'affiche
    * La description "Retrouvez toutes vos commandes a expedier ou en cours d'expedition" s'affiche
    * Les filtres principaux suivants sont visibles :
      | Date          |
      | Nom mentionne |
      | # Reference   |
      | Partenaire    |
    * Les boutons "Rechercher" et "Filtres" s'affichent
    * Les boutons de filtres rapides s'affichent :
      | Objets deja envoyes |
      | Objets non envoyes  |
      | Afficher tout       |
    * Le bouton "Exporter les donnees" s'affiche
    * Le tableau des retraits s'affiche avec les colonnes :
      | Type                      |
      | Ref-Trouve                |
      | Nom du proprietaire       |
      | Date de paiement          |
      | Date souhaitee de retrait |
      | Statut                    |
      | Action                    |

  Scenario: Filtres - Retrait
    When L'utilisateur clique sur le bouton "Filtres"
    Then La pop-up "Plus de filtres" s'ouvre
    * Les onglets suivants s'affichent :
      | References des objets |
      | Objets                |
    * Le champ de recherche "# Reference" s'affiche dans la pop-up
    * Les boutons "Fermer" et "Rechercher" s'affichent dans la pop-up

  Scenario: Filtres retrait - onglet "Objets"
    When L'utilisateur clique sur le bouton "Filtres"
    * L'utilisateur clique sur l'onglet "Objets" dans la pop-up
    Then Les options de tri s'affichent :
      | Tri par objets recent |
      | Tri par objets ancien |
    * Le menu deroulant "Tous les types" s'affiche
    * Les options de statut s'affichent :
      | Tous les retraits    |
      | Retrait non effectue |
      | Retrait effectue     |
    * Les boutons "Fermer" et "Rechercher" s'affichent dans la pop-up