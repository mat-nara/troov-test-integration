Feature: Statistiques d'objets trouvés

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Statistiques" dans la sidebar
     * L'utilisateur clique sur "Statistiques d'objets trouvés"

  Scenario: Affichage de la page Statistiques d'objets trouvés
    Then Le titre des statistiques s'affiche
     * Le filtre partenaire s'affiche
     * Le champ de plage de dates s'affiche
     * Le bouton "Rechercher" s'affiche
     * Le lien "Statistiques d'objet trouvés" s'affiche en haut à droite
     * Les 4 blocs de statistiques s'affichent :
      | Nombre d'objets déclarés perdus par semaine                  |
      | Nombre d'objets déclarés trouvés par semaine                 |
      | Top 3 de vos objets rendus                                   |
      | Nombre d'objets déclarés rendus ou en cours de restitution par semaine |

  Scenario: Sélection de la plage de dates
    When L'utilisateur clique sur le champ de plage de dates
    Then Le calendrier s'ouvre
     * La navigation par mois et année est visible
     * Les menus déroulants mois et année s'affichent
     * Les jours de la semaine s'affichent de "Lun" à "Dim"
     * Une date peut être sélectionnée et mise en surbrillance
     * Le bouton "Ok" s'affiche pour valider