Feature: D2 - Marque absente des deux cotes

  Scenario: 1 - L'agent cree un portefeuille marron sans marque trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur                  |
      | Categorie | Portefeuille, CB & argent |
      | Marque    |                         |
      | Modele    | portefeuille            |
      | Couleur   | Marron                  |
      | Etat      | Satisfaisant            |

  Scenario: 2 - L'usager declare un portefeuille marron sans marque perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur                  |
      | Categorie | Portefeuille, CB & argent |
      | Marque    |                         |
      | Modele    | portefeuille            |
      | Couleur   | Marron                  |
      | Etat      | Satisfaisant            |

  Scenario: 3 - Le matching cree un match (marque absente des deux cotes)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    When L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche