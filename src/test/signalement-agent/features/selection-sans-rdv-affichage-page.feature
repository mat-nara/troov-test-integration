@authenticated  @SignalementAgentsansRdvAffichage 
Feature: Signalement d'une arrivée sans RDV (agent): Affichage 

  Scenario: La page sans rendez-vous s'affiche correctement 
    Given La fenêtre "signaler une arrivée" est ouverte | signalement sans rendez-vous
    When Cliquer sur "Un usager sans RDV" 
    Then On passe aux choix du motif