@authenticated @SignalementAgentAvecRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée avec RDV (agent): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
        Given qu’un signalement d’arrivée côté agent avec rendez-vous est confirmé.

  Scenario: Vérification que le signalement d'une arrivé s'affiche dans la file d'attente du lieu concerné et vérification de l'exactitude des informations du ticket confirmé
    When la page de la file d'attente du backoffice est ouverte | signalement avec rendez-vous côté agent
    Then Le signalement avec rendez-vous côté agent doit s'afficher dans la file d'attente avec les informations correspondantes