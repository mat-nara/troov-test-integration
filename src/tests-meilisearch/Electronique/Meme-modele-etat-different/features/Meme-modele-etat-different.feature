Feature: E3 - Meme modele, etat tres different + detail

  Scenario: 1 - L'agent cree un iPad Air Apple gris neuf trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ          | Valeur               |
      | Categorie      | Electronique         |
      | Sous-categorie | Tablette             |
      | Marque         | Apple                |
      | Modele         | iPad Air             |
      | Couleur        | Gris                 |
      | Etat           | Neuf sans etiquette  |

  Scenario: 2 - L'usager declare un iPad Air Apple gris abime perdu avec details
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ          | Valeur               |
      | Categorie      | Electronique         |
      | Sous-categorie | Tablette             |
      | Marque         | Apple                |
      | Modele         | iPad Air             |
      | Couleur        | Gris                 |
      | Etat           | Abime                |
      | Detail         | ecran fissure        |

  Scenario: 3 - Le matching cree un match (meme modele, etats et details differents)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    When L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche