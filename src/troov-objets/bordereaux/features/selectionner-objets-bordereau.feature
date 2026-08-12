Feature: Sélectionner les objets du bordereau

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar

  Scenario: Afficher la liste des objets et les filtres de recherche
    When L'utilisateur clique sur le bordereau "Contact Test Auto" dans la liste
    Then La page de détail du bordereau s'affiche avec le titre "Contact Test Auto"
    When L'utilisateur clique sur le bouton "Filtrer" de la liste des objets
    Then Le panneau des filtres de recherche s'affiche avec :
      | Onglets : Objets en stock / Objets Archivés / Numéro références |
      | Ordre : Tri par objets récent / ancien                          |
      | État : Perdu / Trouvé                                           |
      | Date : Date de perte/trouvaille / Date de déclaration           |
      | Statut : Avec match validé / Sans match / Avec match potentiel  |

## Scenario: Lancer une recherche sans date
##    When L'utilisateur clique sur le bordereau "Contact Test Auto" dans la liste
##    When L'utilisateur clique sur le bouton "Filtrer" de la liste des objets
##     * L'utilisateur remplit le filtre "Nom/Prénom" avec "TestNom"
##     * L'utilisateur clique sur le bouton "Appliquer"
##    Then Le message "Aucun objet dans ce bordereau." s'affiche

Scenario: Filtrer par plage de dates et sélectionner des objets
    When L'utilisateur saisit la plage de dates "02/08/2026 - 03/08/2026"
      * L'utilisateur clique sur le bouton "Appliquer"
    Then La liste des objets s'affiche avec :
      * Le compteur d'objets "2/2"
      * Les colonnes : Type d'objet, État - N° réf., Date, Nom/Prénom, Informations clefs
      * Des cases à cocher pour chaque objet
      * La pagination au bas de la liste
    When L'utilisateur coche la case du premier objet
    Then La case de l'objet est cochée
      * Le compteur de sélection indique "1 Objet sélectionné"
      * Les boutons d'action globale et de suppression s'affichent

## Scenario: Passer à l'étape suivante sans sauvegarder
##    When L'utilisateur clique sur "Suivant" sans sauvegarder
##    Then Une pop-up d'erreur s'affiche "Enregistrez vos changements avant de continuer"