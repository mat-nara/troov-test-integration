@StatistiquesRdv
Feature: Console de pilotage en temps différé : Statistiques RDV

    Background:
        Given L'utilisateur est connecté à l'application Troov
        
    Scenario: Accéder à la page Statistiques RDV
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques RDV"
        Then La page des statistiques RDV s'affiche
    
    Scenario: Sélectionner un site ou un lieu
        Given L'utilisateur est sur la page "Statistiques RDV"
        When Il sélectionne un site ou lieu en haut de la page
        Then La séléction du site est bien effectuée

    Scenario: Sélectionner les types de services
        Given L'utilisateur est sur la page "Statistiques RDV"
        When L'utilisateur clique sur le filtre type de service puis sur "Sélectionner tout"
        Then Tous les types de RDV sont sélectionnés
        When Il clique sur la croix de certain service
        Then Le service choisi est bien désélectionné
        #   * Les types de RDV sélectionnés sont enregistrés comme filtres   

    Scenario: Définir une période de dates dans l'historique
        Given L'utilisateur est sur la page "Statistiques RDV"
        When L'utilisateur clique sur "Historiques" et sélectionne une date de début et une date de fin
        Then La période choisie est bien sélectionnée

#    Scenario: Rechercher les statistiques avec les filtres sélectionnés
#        Given L'utilisateur est sur la page "Statistiques RDV"
#        Given Tous les filtres sont paramétrés
#        When L'utilisateur clique sur "Rechercher"
#        Then Les statistiques s'affichent et sont cohérentes avec les filtres
    
    Scenario: Sélectionner une seule date dans l'historique et affichage des statistiques 
        Given L'utilisateur est sur la page "Statistiques RDV"
        When L'utilisateur clique sur "Historiques" et sélectionne une seule date 
        Then Seule la date choisie est sélectionnée

    Scenario: Exporter les statistiques au format XLS
        Given L'utilisateur est sur la page "Statistiques RDV"
        When L'utilisateur clique sur le bouton "Exporter en XLS"
        Then Un fichier Excel est téléchargé contenant les données des RDV
    
    Scenario: Exporter les statistiques au format PDF
        Given L'utilisateur est sur la page "Statistiques RDV"
        When L'utilisateur clique sur le bouton "Exporter en PDF"
        Then Un fichier PDF est téléchargé contenant les données des RDV

