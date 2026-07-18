@SignalementAgentAvecRdvAffichageRdvDansDashboard  
Feature: Signalement d'une arrivée avec RDV (agent): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 

  Background:
    Given L'utilisateur est connecté à l'application Troov
        * Un rendez-vous a été créer 
        * Un ticket associé a ce rendez-vous a été créer et la page de confirmation est ouverte

  Scenario: Vérification le signalement arrivé s'affiche dans la file d'attente du lieu concerné  
    Then le ticket doit s'afficher dans la file d'attente avec rendez-vous
       * Le numéro et le motif du ticket confirmé dans le signalement avec rendez-vous doivent être identiques à ceux présents dans la file d'attente.