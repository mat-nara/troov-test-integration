Feature: A2 - Couleur proche (noir vs bleu)

  Scenario: 1 - L'agent cree un sac a dos Eastpak noir trouve
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'agent cree l'objet trouve suivant :
      | Champ     | Valeur          |
      | Categorie | Sacs & Bagages  |
      | Marque    | Eastpak         |
      | Modele    | sac a dos       |
      | Couleur   | Noir            |
      | Etat      | Satisfaisant    |
      | Detail    |                 |

##  Scenario: 2 - L'usager declare un sac a dos Eastpak bleu perdu
##    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
##      | Champ     | Valeur          |
##      | Categorie | Sacs & Bagages  |
##      | Marque    | Eastpak         |
##      | Modele    | sac a dos       |
##      | Couleur   | Bleu            |
##      | Etat      | Satisfaisant    |
##      | Detail    |                 |

##  Scenario: 3 - Le matching traite le couple noir / bleu (couleur proche)
##    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
##    When L'utilisateur attend 15 secondes
##    * L'utilisateur ouvre la fiche du match cote back office
##    * L'utilisateur demande a Charlie d'analyser si le badge est grise
##    Then Un score IA est affiche