Feature: D3 - Meme marque, modeles differents

  Scenario: 1 - L'agent cree un iPhone 14 Apple noir trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ          | Valeur       |
      | Categorie      | Electronique |
      | Sous-categorie | Telephone    |
      | Marque         | Apple        |
      | Modele         | iPhone 14    |
      | Couleur        | Noir         |
      | Etat           | Satisfaisant |

  Scenario: 2 - L'usager declare un iPhone 13 Apple noir perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ          | Valeur       |
      | Categorie      | Electronique |
      | Sous-categorie | Telephone    |
      | Marque         | Apple        |
      | Modele         | iPhone 13    |
      | Couleur        | Noir         |
      | Etat           | Satisfaisant |

  Scenario: 3 - Le matching cree un match (meme marque, modeles differents)
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    When L'utilisateur ouvre "Details de l'analyse IA"
    Then Un score IA est affiche