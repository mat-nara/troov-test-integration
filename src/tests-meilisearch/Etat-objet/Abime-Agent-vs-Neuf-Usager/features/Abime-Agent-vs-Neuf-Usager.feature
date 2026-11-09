Feature: Abime cote agent vs Neuf cote usager (sens inverse)

  Scenario: 1 - L'agent cree un sac a dos American Tourister noir abime trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur                  |
      | Categorie | Sacs & Bagages          |
      | Marque    | American Tourister      |
      | Modele    | sac a dos               |
      | Couleur   | Noir                    |
      | Etat      | Abime                   |
      | Detail    | fermeture eclair cassee |

  Scenario: 2 - L'usager declare un sac a dos American Tourister noir neuf perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur              |
      | Categorie | Sacs & Bagages      |
      | Marque    | American Tourister  |
      | Modele    | sac a dos           |
      | Couleur   | Noir                |
      | Etat      | Neuf sans etiquette |
      | Detail    |                     |

  Scenario: 3 - Le matching traite le couple Abime vs Neuf (sens inverse)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    Then Un score IA est affiche