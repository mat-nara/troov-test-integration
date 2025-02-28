@authenticated @signalementAgentAvecRdvRecherche 
Feature: Signalement d'une arrivée avec RDV (agent): Recherche de RDV

    Background:
        Given La fenêtre "Retrouver le RDV" du signalement avec rendez-vous est ouverte

    Scenario: Recherche par nom uniquement: Le RDV est retrouvé
        Given que l'utilisateur saisit uniquement le nom de la personne  
            * que la liste des suggestions affiche la personne recherchée via nom en première position  
            * que l'utilisateur sélectionne cette personne
        When il clique sur le bouton "Valider" sur la page de recherche de RDV  
        Then le rendez-vous correspondant est affiché et disponible pour la confirmation  

    Scenario: Recherche par téléphone uniquement: Le RDV est retrouvé
        Given que l'utilisateur saisit uniquement le téléphone de la personne  
            * que la liste des suggestions affiche la personne recherchée via téléphone en première position  
            * que l'utilisateur sélectionne cette personne
        When il clique sur le bouton "Valider" sur la page de recherche de RDV  
        Then le rendez-vous correspondant est affiché et disponible pour la confirmation  

    Scenario: Nom sans RDV - Aucune suggestion affichée 
        Given que l'utilisateur saisit un nom sans rendez-vous associé  
            * aucune suggestion ne s'affiche  
        When il clique sur le bouton "Valider" sur la page de recherche de RDV  
        Then aucun rendez-vous n'est affiché et disponible pour la confirmation  
    
    Scenario: Téléphone sans RDV - Aucune suggestion affichée 
        Given que l'utilisateur saisit un téléphone sans rendez-vous associé  
            * aucune suggestion ne s'affiche  
        When il clique sur le bouton "Valider" sur la page de recherche de RDV  
        Then aucun rendez-vous n'est affiché et disponible pour la confirmation  

    Scenario: Bouton 'Valider': On peut passer à l'étape suivante
        Given que l'utilisateur saisit uniquement le nom de la personne  
            * que la liste des suggestions affiche la personne recherchée via nom en première position  
            * que l'utilisateur sélectionne cette personne
        When il clique sur le bouton "Valider" sur la page de recherche de RDV  
        Then le rendez-vous correspondant est affiché et disponible pour la confirmation  
    
    Scenario: Boutton 'Retour' de la page de recherche de RDV: On revient sur la page initiale pour le signalement d'une arrivée
        When Cliquer sur 'Retour' de la page: recherche de RDV
        Then Revient sur la page initiale: "Je signale une arrivée pour :" s'affiche sur la page