@SignalementAgentSansRdvConfirmation
Feature: Signalement d'une arrivée sans RDV (agent): Confirmation 

  Background:
    Given L'utilisateur est connecté à l'application Troov
        * La page de confirmation de la création de ticket sans rendez-vous est ouverte

  Scenario: La fenêtre de confirmation sans rendez-vous s'affiche correctement 
    Then Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la page