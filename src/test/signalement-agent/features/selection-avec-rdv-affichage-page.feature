@authenticated @signalementAgentAvecRdvAffichage 
Feature: Signalement d'une arrivée avec RDV (agent): Affichage 

	Scenario: La fenetre signalement d'une arrivée avec rendez-vous s'affiche correctement 
    Given La fenêtre "signaler une arrivée" est ouverte | signalement avec rendez-vous
    When Cliquer sur "Un usager avec RDV" 
    Then On passe à la recherche du rendez-vous.