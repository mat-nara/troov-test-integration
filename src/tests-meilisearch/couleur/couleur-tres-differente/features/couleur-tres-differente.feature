 Feature: A1 - Couleur tres differente, meme objet

   Scenario: 1 - L'agent cree un sac a main Lacoste noir trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
     | Champ     | Valeur              |
     | Categorie | Sacs & Bagages      |
      | Marque    | Lacoste             |
      | Modele    | sac a main          |
      | Couleur   | Noir                |
      | Etat      | Neuf sans etiquette |
      | Detail    |                     |

  Scenario: 2 - L'usager declare un sac a main Lacoste gris perdu
    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
      | Champ     | Valeur              |
      | Categorie | Sacs & Bagages      |
      | Marque    | Lacoste             |
      | Modele    | sac a main          |
      | Couleur   | Gris                |
      | Etat      | Neuf sans etiquette |
      | Detail    |                     |

  Scenario: 3 - Le matching rejette le couple noir / gris
   Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
   When L'utilisateur attends 15 secondes
    * L'utilisateur ouvre la fiche du match cote back office
    * L'utilisateur demande a Charlie d'analyser si le badge est grise
    Then Un score IA est affiche
    