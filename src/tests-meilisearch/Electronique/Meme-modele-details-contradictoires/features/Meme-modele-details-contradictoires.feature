Feature: E4 - Description generale identique, details contradictoires

  Scenario: 1 - L'agent cree un casque audio Sony noir trouve avec details filaires
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ          | Valeur                        |
      | Categorie      | Electronique                  |
      | Sous-categorie | Audio                         |
      | Marque         | Sony                          |
      | Modele         | casque audio                  |
      | Couleur        | Noir                          |
      | Etat           | Satisfaisant                  |
      | Detail         | casque supra-auriculaire avec fil |

  Scenario: 2 - L'usager declare un casque audio Sony noir perdu avec details sans fil
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ          | Valeur                        |
      | Categorie      | Electronique                  |
      | Sous-categorie | Audio                         |
      | Marque         | Sony                          |
      | Modele         | casque audio                  |
      | Couleur        | Noir                          |
      | Etat           | Satisfaisant                  |
      | Detail         | casque intra-auriculaire sans fil |

  Scenario: 3 - Le matching cree un match (description generale identique, details contradictoires)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    When L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche