@SignalementAgentSansRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée sans RDV (agent): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
    Given L'utilisateur est connecté à l'application Troov
        * que un signalement d'arrivée sans rendez-vous est confirmé 

  Scenario: Vérification le signalement arrivé s'affiche dans la file d'attente du lieu concerné  
    When la page de la file d'attente du backoffice est ouverte
    Then le ticket doit s'afficher dans la file d'attente sans rendez-vous
       * Le numéro et le motif du ticket confirmé dans le signalement sans rendez-vous doivent être identiques à ceux présents dans la file d'attente.