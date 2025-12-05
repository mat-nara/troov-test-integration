@SignalementAgentAvecRdvConfirmation
Feature: Signalement d'une arrivée avec RDV (agent): Confirmation 

  Background:
    Given L'utilisateur est connecté à l'application Troov
        * Un rendez-vous a été créer 
        * Un ticket associé a ce rendez-vous a été créer et la page de confirmation est ouverte

  Scenario: La fenêtre de confirmation avec rendez-vous s'affiche correctement 
    Then Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page