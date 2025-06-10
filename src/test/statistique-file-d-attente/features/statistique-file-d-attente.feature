@StatistiquesRdv
Feature: Console de pilotage en temps réel et différé : Pilotage file d'attente

    Background:
        Given L'utilisateur est connecté à l'application Troov
        
    Scenario: Accéder à la page Pilotage file d'attente
        When L'utilisateur clique sur "Statistiques" puis sur "Pilotage file d'attente"
        Then La page "Pilotage file d'attente" s'affiche
    
    Scenario: Sélection des sites
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur clique sur le filtre sites
        Then La liste des sites s'affiche correctement, avec en premier choix "Toutes les équipes", suivi des autres sites uniques 
        When L'utilisateur sélectionne "Toutes les équipes"
        Then Le choix "Toutes les équipes" est sélectionné
        When L'utilisateur sélectionne un site précis
        Then Le site particulier est sélectionné

    Scenario: Sélection du mode Temps réel
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur choisit "Temps réel"
        Then Le mode "Temps réel" est activé
           * La date du jour est sélectionnée automatiquement

    Scenario: Sélection des salles d’attente
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur clique sur le filtre salle d'attente
        Then La liste des salles d'attente s'affiche correctement, avec en premier choix "Toutes les salles d'attente", suivi des autres salles d'attente uniques 
        When L'utilisateur sélectionne "Toutes les salles d'attente"
        Then Le choix "Toutes les salles d'attente" est sélectionné
        When L'utilisateur sélectionne une salle d'attente précis
        Then La salle d'attente particulier est sélectionné

    Scenario: Sélection des agents
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur clique sur le filtre agents
        Then La liste des agents s'affiche correctement, avec une liste unique
        When L'utilisateur sélectionne un agent précis
        Then L'agent particulier est sélectionné
    
    Scenario: Sélection des services
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur clique sur le filtre services
        Then La liste des services s'affiche correctement, avec une liste unique
        When L'utilisateur sélectionne un service précis
        Then Le service particulier est sélectionné

    Scenario: Sélection des guichets
        Given L'utilisateur est sur la page "Pilotage file d'attente"
        When L'utilisateur clique sur le filtre guichets
        Then La liste des guichets s'affiche correctement, avec en premier choix "Tous les guichets", suivi des autres guichets uniques 
        When L'utilisateur sélectionne "Tous les guichets"
        Then Le choix "Tous les guichets" est sélectionné
        When L'utilisateur sélectionne un guichet précis
        Then Le guichet particulier est sélectionné

    Scenario: Lancement de la recherche avec tous les filtres
        Given L'utilisateur est sur la page "Pilotage file d'attente"
            * L'utilisateur choisit "Temps réel"
            * Tous les filtres sont renseignés
        When L'utilisateur clique sur le bouton "Rechercher"
        Then Les résultats de la journée actuelle sont affichés en cohérence avec les filtres
        And Les sections "Avec RDV", "Sans RDV", "Top 5 des services" et la liste des RDV sont visibles

    Scenario: Export des résultats au format XLS
        Given L'utilisateur est sur la page "Pilotage file d'attente"
            * L'utilisateur choisit "Temps réel"
            * L'utilisateur clique sur le bouton "Rechercher"
        When L'utilisateur clique sur le logo "Exporter en XLS"
        Then Le fichier contenant la liste des RDV est téléchargé

    Scenario: Passage au mode Historique
        Given L'utilisateur est sur la page "Pilotage file d'attente"
            * L'utilisateur choisit "Temps réel"
            * Le mode "Temps réel" est activé
        When L'utilisateur sélectionne "Historique" au lieu de "Temps réel"
        Then Le mode "Historique" est activé
        And Une période allant de la date d’ouverture du site à aujourd’hui est sélectionnée

    Scenario: Recherche en mode Historique
        Given L'utilisateur est sur la page "Pilotage file d'attente"
            * L'utilisateur sélectionne "Historique" au lieu de "Temps réel"
            * Tous les filtres sont renseignés
        When L'utilisateur clique sur le bouton "Rechercher"
        Then Les résultats de la journée actuelle sont affichés en cohérence avec les filtres
        And Les sections "Avec RDV", "Sans RDV", "Top 5 des services" et la liste des RDV sont visibles
    
    Scenario: Export des résultats au format XLS
        Given L'utilisateur est sur la page "Pilotage file d'attente"
            * L'utilisateur sélectionne "Historique" au lieu de "Temps réel"
        When L'utilisateur clique sur le logo "Exporter en XLS"
        Then Le fichier contenant la liste des RDV est téléchargé