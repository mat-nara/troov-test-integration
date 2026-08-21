Feature: Stock d'objets trouves
Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Statistiques" dans la sidebar
    * L'utilisateur clique sur "Stock d'objets trouves"

  Scenario: Affichage de la page Stock d'objets trouves
    Then Le titre "Tableau des entrees et sorties du stock d'objets trouves" s'affiche
    * Le filtre partenaire s'affiche
    * Le champ de plage de dates s'affiche
    * Le filtre "Type de destinataire" s'affiche
    * Les boutons "Exporter les donnees" et "Rechercher" s'affichent
    * Le lien "Statistiques d'objet trouves" s'affiche en haut a droite
    * Les 4 blocs de donnees s'affichent :
      | Nombre d'objets trouves en stock en debut de periode |
      | Entrees (avec sous-categorie "Autres")               |
      | Sorties (avec sous-categories "Rendus" -> "Rendu en main propre" et "Archives") |
      | Nombre d'objets trouves en stock en fin de periode   |
    * Le bloc turquoise "Nombre de signalements d'objets perdus" s'affiche

  Scenario: Filtrer par type de destinataire
    When L'utilisateur selectionne une option dans le filtre "Type de destinataire"
    * L'utilisateur clique sur le bouton "Rechercher"
    Then Les resultats sont filtres selon l'option selectionnee

  Scenario: Export des donnees
    When L'utilisateur clique sur le bouton "Exporter les donnees"
    * L'utilisateur selectionne l'une des options d'export :
      | Jour    |
      | Semaine |
      | Mois    |
    Then Le fichier se telecharge directement sans etape supplementaire