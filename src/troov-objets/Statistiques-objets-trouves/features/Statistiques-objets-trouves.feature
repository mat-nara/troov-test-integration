Feature: Statistiques d'objets trouves

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Statistiques" dans la sidebar
    * L'utilisateur clique sur "Statistiques d'objets trouvés"

  Scenario: Affichage de la page Statistiques d'objets trouves
    Then Le titre "Vos statistiques" s'affiche avec la date et l'heure
    * Le filtre partenaire s'affiche
    * Le champ de plage de dates s'affiche
    * Le bouton "Rechercher" s'affiche
    * Le lien "Statistiques d'objet trouvés" s'affiche en haut à droite
    * Les 4 blocs de statistiques s'affichent :
      | Nombre d'objets déclarés perdus par semaine                  |
      | Nombre d'objets déclarés trouvés par semaine                 |
      | Top 3 de vos objets rendus                                   |
      | Nombre d'objets déclarés rendus ou en cours de restitution par semaine |
    * Le graphique "Nombre d'objets déclarés perdus par semaine" affiche des barres vertes et son total
    * Le graphique "Nombre d'objets déclarés trouvés par semaine" affiche des barres oranges et son total
    * Le bloc "Top 3 de vos objets rendus" affiche le classement avec icônes
    * Le graphique "Nombre d'objets déclarés rendus ou en cours de restitution par semaine" affiche des barres bleues et son total

  Scenario: Selection de la plage de dates
    When L'utilisateur clique sur le champ de plage de dates
    Then Le calendrier s'ouvre
    * La navigation par mois et année avec flèches gauche et droite est visible
    * Les menus déroulants du mois et de l'année s'affichent
    * Les jours de la semaine s'affichent de "Lun" à "Dim"
    * La date sélectionnée est mise en surbrillance turquoise
    * Le bouton "Ok ✓" s'affiche pour valider