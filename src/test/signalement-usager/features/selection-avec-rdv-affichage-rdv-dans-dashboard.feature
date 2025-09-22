@authenticated @avecRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée avec RDV (usager): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
        Given Un rendez-vous a été créer
            * que un signalement d'arrivée avec rendez-vous est confirmé 

  Scenario: Vérification le signalement arrivé avec rendez-vous s'affiche dans la file d'attente du lieu concerné  
    When la page de la file d'attente du backoffice est ouverte
    Then le ticket doit s'afficher dans la file d'attente avec rendez-vous

  Scenario: Vérification de l'exactitude des informations du ticket confirmé
    When la page de la file d'attente du backoffice est ouverte
    Then le numéro et le motif du ticket confirmé doivent correspondre à ceux présents dans la file d'attente