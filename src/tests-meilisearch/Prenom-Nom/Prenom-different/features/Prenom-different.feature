Feature: C4 - Prenom different, nom identique

  Scenario: 1 - L'agent cree une carte d'identite Pierre Martin trouvee
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Carte d'identite               |
      | Prenom            | Pierre                         |
      | Nom               | Martin                         |
      | Date de naissance | 1988-11-05                     |

  Scenario: 2 - L'usager declare une carte d'identite Paul Martin perdue
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Carte d'identite               |
      | Prenom            | Paul                           |
      | Nom               | Martin                         |
      | Date de naissance | 1988-11-05                     |

Scenario: 3 - Le matching traite le couple prenom different et nom identique
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office