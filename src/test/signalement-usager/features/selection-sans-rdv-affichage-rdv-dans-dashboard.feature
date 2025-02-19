@authenticated @sansRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée sans RDV (usager): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
        Given que un signalement d'arrivée sans rendez-vous est confirmé 

  Scenario: Vérification le signalement arrivé s'affiche dans la file d'attente du lieu concerné  
    When la page de la file d'attente du backoffice est ouverte
    Then le ticket doit s'afficher dans la file d'attente sans rendez-vous

  Scenario: Vérification de l'exactitude des informations du ticket confirmé
    When la page de la file d'attente du backoffice est ouverte
    Then le numéro et le motif du ticket confirmé doivent correspondre à ceux présents dans la file d'attente