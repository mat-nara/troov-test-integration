@StatistiquesRdv
Feature: Statistique individuel utilisateur acceuil

    Background:
        Given L'utilisateur est connecté à l'application Troov
        
    Scenario: Accéder à la page Statistiques RDV
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques RDV"
        Then La page des statistiques RDV s'affiche

        When L'utilisateur clique sur l'icone de téléchargement excel
        Then Le fichier Excel des statistiques RDV est téléchargé

        When L'utilisateur clique sur "Historiques" 
        Then Le filter Historiques est bien sélectionnée

        When L'utilisateur sélectionne une plage de période
        Then La plage de période est bien sélectionnée

        When L'utilisateur clique sur "Rechercher"
        Then Le filtre est appliqué et les statistiques RDV sont affichées

        When L'utilisateur clique sur l'icone de téléchargement excel
        Then Le fichier Excel des statistiques RDV est téléchargé