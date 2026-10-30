Feature: A3 - Meme couleur, detail contradictoire

  Scenario: 1 - L'agent cree un sac a main Longchamp noir trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur                  |
      | Categorie | Sacs & Bagages          |
      | Marque    | Longchamp               |
      | Modele    | sac a main              |
      | Couleur   | Noir                    |
      | Etat      | Satisfaisant            |
      | Detail    | avec bandouliere doree  |

  Scenario: 2 - L'usager declare un sac a main Longchamp noir perdu (detail contradictoire)
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur               |
      | Categorie | Sacs & Bagages       |
      | Marque    | Longchamp            |
      | Modele    | sac a main           |
      | Couleur   | Noir                 |
      | Etat      | Satisfaisant         |
      | Detail    | sans bandouliere     |

  Scenario: 3 - Le matching traite le couple meme couleur / detail contradictoire
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    ##    * L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche