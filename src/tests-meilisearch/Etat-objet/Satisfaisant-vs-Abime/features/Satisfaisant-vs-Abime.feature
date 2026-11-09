Feature: Satisfaisant vs Abime (nuance fine)

  Scenario: 1 - L'agent cree un portefeuille Calvin Klein noir satisfaisant trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur                    |
      | Categorie | Portefeuille, CB & argent |
      | Marque    | Calvin Klein              |
      | Modele    | portefeuille              |
      | Couleur   | Noir                      |
      | Etat      | Satisfaisant              |
      | Detail    |                           |

  Scenario: 2 - L'usager declare un portefeuille Calvin Klein noir abime perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur                    |
      | Categorie | Portefeuille, CB & argent |
      | Marque    | Calvin Klein              |
      | Modele    | portefeuille              |
      | Couleur   | Noir                      |
      | Etat      | Abime                     |
      | Detail    |                           |

  Scenario: 3 - Le matching traite le couple Satisfaisant vs Abime (nuance fine)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    Then Un score IA est affiche