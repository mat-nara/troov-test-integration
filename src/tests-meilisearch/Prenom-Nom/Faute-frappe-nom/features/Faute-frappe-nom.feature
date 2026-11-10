Feature: C2 - Faute de frappe sur le nom

  Scenario: 1 - L'agent cree un passeport Thomas Dupuis trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Passeport                      |
      | Prenom            | Thomas                         |
      | Nom               | Dupuis                         |
      | Date de naissance | 1985-03-12                     |

  Scenario: 2 - L'usager declare un passeport Tomas Dupuiss perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ             | Valeur                         |
      | Categorie         | Papiers et documents officiels |
      | Sous-categorie    | Passeport                      |
      | Prenom            | Tomas                          |
      | Nom               | Dupuiss                        |
      | Date de naissance | 1985-03-12                     |

Scenario: 3 - Le matching cree un match (faute de frappe sur le nom)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 30 secondes
    * L'utilisateur ouvre la fiche du match cote back office