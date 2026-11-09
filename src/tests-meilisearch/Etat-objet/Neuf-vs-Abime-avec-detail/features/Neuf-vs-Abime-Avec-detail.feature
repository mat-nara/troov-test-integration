Feature: Neuf vs Abime - avec detail cote usager

  Scenario: 1 - L'agent cree une valise Rimowa grise neuve trouvee
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur              |
      | Categorie | Sacs & Bagages      |
      | Marque    | Rimowa              |
      | Modele    | valise              |
      | Couleur   | Gris                |
      | Etat      | Neuf sans etiquette |
      | Detail    |                     |

  Scenario: 2 - L'usager declare une valise Rimowa grise abimee perdue (avec detail)
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur                         |
      | Categorie | Sacs & Bagages                 |
      | Marque    | Rimowa                         |
      | Modele    | valise                         |
      | Couleur   | Gris                           |
      | Etat      | Abime                          |
      | Detail    | poignee cassee, roulette abimee |

  Scenario: 3 - Le matching traite le couple Neuf vs Abime (avec detail cote usager)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    ##  * L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche