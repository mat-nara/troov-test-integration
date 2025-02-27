@authenticated @SignalementAgentSansRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée sans RDV (agent): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
        Given qu’un signalement d’arrivée côté agent sans rendez-vous est confirmé.

  Scenario: Vérification que le signalement d'une arrivé s'affiche dans la file d'attente du lieu concerné et vérification de l'exactitude des informations du ticket confirmé
    When la page de la file d'attente du backoffice est ouverte | signalement sans rendez-vous côté agent
    Then Le signalement sans rendez-vous côté agent doit s'afficher dans la file d'attente avec les informations correspondantes