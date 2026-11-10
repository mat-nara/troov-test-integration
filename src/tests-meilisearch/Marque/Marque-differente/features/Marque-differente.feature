Feature: D4 - Marque differente, reste identique

## Scenario: 1 - L'agent cree un smartphone Samsung noir trouve
##    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
##    When L'agent cree l'objet trouve suivant :
##      | Champ          | Valeur       |
##      | Categorie      | Electronique |
##      | Sous-categorie | Telephone    |
##      | Marque         | Samsung      |
##      | Modele         | smartphone   |
##      | Couleur        | Noir         |
##      | Etat           | Satisfaisant |

##  Scenario: 2 - L'usager declare un smartphone Apple noir perdu
##    When L'usager declare l'objet perdu correspondant le jour meme via le formulaire public "disneyland-paris-le-monde-de-la-reine-des-neiges-1" :
##      | Champ          | Valeur       |
##      | Categorie      | Electronique |
##      | Sous-categorie | Telephone    |
##      | Marque         | Apple        |
##      | Modele         | smartphone   |
##      | Couleur        | Noir         |
##      | Etat           | Satisfaisant |

 Scenario: 3 - Le matching traite le cas marque absente cote usager
    Given l'agent "Charlie" est en service et connecte sur le back-office Troov de l'equipe "Disney" (demo.troov.com)
    When L'utilisateur attend 15 secondes
     * L'utilisateur ouvre la fiche du match cote back office