Feature: Stock d'objets trouvés

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Statistiques" dans la sidebar
     * L'utilisateur clique sur "Stock d'objets trouvés"

  Scenario: Affichage de la page Stock d'objets trouvés
    Then Le titre "Tableau des entrées et sorties du stock d’objets trouvés" s'affiche
     * Le filtre partenaire s'affiche
     * Le champ de plage de dates s'affiche
     * Le filtre "Type de destinataire" s'affiche
     * Les boutons "Exporter les données" et "Rechercher" s'affichent
     * Le lien "Statistiques d'objet trouvés" s'affiche en haut à droite
     * Les 4 blocs de données s'affichent :
      | Nombre d'objets trouvés en stock en début de période |
      | Entrées                                              |
      | Sorties                                              |
      | Nombre d'objets trouvés en stock en fin de période   |
     * Le bloc "Nombre de signalements d'objets perdus" s'affiche

  Scenario: Filtrer par type de destinataire
    When L'utilisateur clique sur le filtre "Type de destinataire"
    Then Les options du filtre type de destinataire s'affichent
     * L'utilisateur peut sélectionner une option et filtrer les résultats
     * Le menu "Statistiques d'objet trouvés" reste visible

  Scenario: Export des données (Jour / Semaine / Mois)
    When L'utilisateur clique sur le bouton "Exporter les données"
    Then Les options d'export s'affichent :
      | Jour    |
      | Semaine |
      | Mois    |
    When L'utilisateur clique sur l'option d'export "Jour"
    Then Le fichier se télécharge directement