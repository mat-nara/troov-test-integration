Feature: B1 - Neuf vs Abime - sans detail

  Scenario: 1 - L'agent cree une valise cabine Samsonite rouge neuve trouvee
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur               |
      | Categorie | Sacs & Bagages       |
      | Marque    | Samsonite            |
      | Modele    | valise cabine        |
      | Couleur   | Rouge                |
      | Etat      | Neuf sans etiquette  |
      | Detail    |                      |

  Scenario: 2 - L'usager declare une valise cabine Samsonite rouge abimee perdue
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur         |
      | Categorie | Sacs & Bagages |
      | Marque    | Samsonite      |
      | Modele    | valise cabine  |
      | Couleur   | Rouge          |
      | Etat      | Abime          |
      | Detail    |                |

  Scenario: 3 - Le matching traite le couple Neuf vs Abime (sans detail)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    ##  * L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche