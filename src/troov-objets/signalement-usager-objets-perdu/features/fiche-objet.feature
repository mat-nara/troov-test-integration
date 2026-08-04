Feature: Fiche detaillee de l'objet

    Scenario: Affichage de la fiche detaillee d'un objet
        Given L'utilisateur est connecte a son espace usager
            * L'utilisateur a declare un objet perdu
        When L'utilisateur accede a la fiche de l'objet depuis "Mes objets"
        Then La fiche objet affiche le statut ("Perdu"), le type d'objet, le declarant, la date de declaration et la reference
            * Le bouton "Les matchs potentiels" est visible


##    Scenario: Consultation des matchs potentiels pour un objet perdu
##        Given L'utilisateur est sur la fiche detaillee de son objet perdu
##        When L'utilisateur clique sur le bouton "Les matchs potentiels"
##        Then La liste des objets trouves potentiellement correspondants s'affiche

##    Scenario: Modification de l'annonce depuis la fiche objet
##        Given L'utilisateur est sur la fiche detaillee de son objet perdu
##        When L'utilisateur accede a la section "Modifier l'annonce"
##        Then Les champs suivants sont modifiables : Etat (Perdu/Trouve), Ou, Quand ?, Type, Marque
