Feature: E1 - Meme modele, fond d'ecran different

  Scenario: 1 - L'agent cree un Samsung Galaxy S22 noir trouve avec details
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ          | Valeur                       |
      | Categorie      | Electronique                 |
      | Sous-categorie | Telephone                    |
      | Marque         | Samsung                      |
      | Modele         | Galaxy S22                   |
      | Couleur        | Noir                         |
      | Etat           | Satisfaisant                 |
      | Detail         | fond d'ecran foret, coque transparente |

  Scenario: 2 - L'usager declare un Samsung Galaxy S22 noir perdu avec details differents
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ          | Valeur                       |
      | Categorie      | Electronique                 |
      | Sous-categorie | Telephone                    |
      | Marque         | Samsung                      |
      | Modele         | Galaxy S22                   |
      | Couleur        | Noir                         |
      | Etat           | Satisfaisant                 |
      | Detail         | fond d'ecran ville, sans coque |

  Scenario: 3 - Le matching cree un match (meme modele, details de fond d'ecran differents)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    When L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche