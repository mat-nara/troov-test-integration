Feature: C3 - Nom vide cote agent, renseigne cote usager

  Scenario: 1 - L'agent cree un permis de conduire Julie trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Permis de conduire             |
      | Prenom            | Julie                          |
      | Nom               |                                |
      | Date de naissance | 1992-07-20                     |

  Scenario: 2 - L'usager declare un permis de conduire Julie Marchand perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Permis de conduire             |
      | Prenom            | Julie                          |
      | Nom               | Marchand                       |
      | Date de naissance | 1992-07-20                     |

  Scenario: 3 - Le matching traite le cas nom vide cote agent et renseigne cote usager
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office