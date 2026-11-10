Feature:  Prenom identique, nom different

 Scenario: 1 - L'agent cree une carte d'identite Sophie Bernard trouvee
   Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Carte d'identite               |
      | Prenom            | Sophie                         |
      | Nom               | Bernard                        |
      | Date de naissance | 1990-05-15                     |

 Scenario: 2 - L'usager declare une carte d'identite Sophie Fontaine perdue
   When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
     | Champ             | Valeur                         |
     | Categorie         | Papiers et documents officiels |
     | Sous-categorie    | Carte d'identite               |
     | Prenom            | Sophie                         |
    | Nom               | Fontaine                       |
    | Date de naissance | 1990-05-15                     |

Scenario: 3 - Le matching traite le couple prenom identique et nom different
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office