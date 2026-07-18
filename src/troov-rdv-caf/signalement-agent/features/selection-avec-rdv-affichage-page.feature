@signalementAgentAvecRdvAffichage 
Feature: Signalement d'une arrivée avec RDV (agent): Affichage 

    Background:
        Given L'utilisateur est connecté à l'application Troov

	Scenario: La fenetre signalement d'une arrivée avec rendez-vous s'affiche correctement 
        When Il clique sur "Fil d'attente", ensuite "Signaler une arrivée" puis "Usager avec rendez-vous" 
        Then La page "Enregistrer l’usager" s'affiche