Feature: Gestion de l'annonce (declarer comme retrouve ou supprimer)

    Scenario: Ouverture de la confirmation pour marquer l'objet comme retrouve
        Given L'utilisateur est connecte a son espace usager
            * L'utilisateur a une annonce active pour un objet perdu
        When L'utilisateur clique sur le bouton "Objet retrouve ?"
        Then Une pop-up "Confirmation objet retrouve" s'affiche
            * Le message "Voulez-vous vraiment marquer l'objet comme etant retrouve ?" est visible
            * Les boutons "Annuler" et "Objet rendu" sont disponibles
        When L'utilisateur clique sur le bouton "Annuler"
        Then La pop-up se ferme
            * Le statut de l'annonce reste inchange ("Perdu")
        When L'utilisateur clique sur le bouton "Objet retrouve ?"
        Then Une pop-up "Confirmation objet retrouve" s'affiche
        When L'utilisateur clique sur le bouton "Objet rendu"
        Then Le statut de l'annonce passe a "Trouve"
            * La pop-up se ferme

##    Scenario: Changement d'etat de l'objet via la section "Modifier l'annonce"
##        Given L'utilisateur est sur la fiche detaillee de son objet perdu
##            * La section "Modifier l'annonce" est ouverte
##        When L'utilisateur bascule le toggle "Etat" de "Perdu" vers "Trouve"
##            * L'utilisateur valide les modifications
##        Then Le statut de l'objet est mis a jour en "Trouve"

##    Scenario: Suppression d'une annonce a tout moment
##        Given L'utilisateur est connecte a son espace usager
##            * L'utilisateur a une annonce active
##        When L'utilisateur clique sur l'action "Supprimer l'annonce" depuis son espace usager
##        Then L'annonce est supprimee
##            * L'annonce n'apparait plus dans la page "Mes objets"