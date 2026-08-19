Feature: Export des donnees (Etape 3) & Fiche bordereau

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO "mairie@troov.com" et "Hello(123)"
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Bordereaux" dans la sidebar
    * L'utilisateur complete la selection et la sauvegarde des objets puis clique sur "Suivant"

##  Scenario: Etape 3 - Exporter les donnees (Recapitulatif)
##    Then La section "Informations sur mon bordereau" s'affiche avec : Nom, Modele, Type, Date d'envoi, Receveur, Message
##    * Les boutons "Enregistrer" et "Supprimer" s'affichent
##    * La section "Objets selectionnes" est depliable
##    * Le bouton "Exporter les donnees" s'affiche en haut a droite
##    * Le bouton "Terminer" s'affiche en bas a droite

##  Scenario: Exporter les donnees - Choix du format
##    When L'utilisateur clique sur le bouton "Exporter les donnees"
##    Then Un menu deroulant s'affiche avec les deux formats d'export :
##      | EXCEL |
##     | PDF   |

##  Scenario: Exporter en Excel - Choix des colonnes
##    When L'utilisateur selectionne le format "EXCEL"
##    Then La page de choix des colonnes s'affiche avec la liste complete : Reference, Type, Date de declaration, Nom, ## Photo, Nationalite, Detail, Marque, Couleur
##    * Le bouton "Selectionner tout" s'affiche en haut a droite
##    * Le bouton "EXCEL" s'affiche en bas pour lancer l'export

##  Scenario: Export Excel - Telechargement du fichier
##    When L'utilisateur choisit ses colonnes et clique sur le bouton "EXCEL"
##    Then Le fichier au format Excel se telecharge correctement sur le poste de l'utilisateur

##  Scenario: Fiche bordereau apres "Terminer"
##    When L'utilisateur clique sur le bouton "Terminer"
##    Then La fiche finale du bordereau s'affiche avec les informations : Nom, Modele, Type, Date d'envoi, Receveur, ##Message
##    * Les boutons "Enregistrer" et "Supprimer" s'affichent
##    * Les boutons "Export Excel" et "Export PDF" s'affichent en haut a droite
##    * La liste des objets s'affiche avec filtres (date, type, rechercher, filtres)
##    * Le compteur de selection et le bouton "Exporter les donnees" s'affichent
##    * Pour chaque objet s'affichent : photo, date, type, nom, ref, details et les icones d'actions (imprimer, ##modifier, supprimer)
##    * La pagination s'affiche en bas a droite