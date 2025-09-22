@CalendrierTotalDownload 
Feature: Calendrier - Total - Téléchargement des exports

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Téléchargement des exports
        Given L'utilisateur est sur la page calendrier
            * Tout les services sont sélectionné
        When L'utilisateur clique sur "Total"
        Then La fenetre Total s'affiche

        When L'utilisateur clique sur "Exporter les données", puis PDF
        Then Le fichier d'export des rdv PDF est télécharger
        When L'utilisateur clique directement sur le logo PDF
        Then Le fichier d'export des rdv PDF est télécharger

        When L'utilisateur clique sur "Exporter les données", puis Excel
        Then Le fichier d'export des rdv Excel est télécharger
        When L'utilisateur clique directement sur le logo Excel
        Then Le fichier d'export des rdv Excel est télécharger

        When L'utilisateur clique sur "Exporter les données", puis CSV
        Then Le fichier d'export des rdv CSV est télécharger
