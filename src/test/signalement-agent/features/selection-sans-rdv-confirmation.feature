@authenticated @SignalementAgentSansRdvConfirmation
Feature: Signalement d'une arrivée sans RDV (agent): Confirmation 

  Scenario: La fenêtre de confirmation sans rendez-vous s'affiche correctement 
    Given La fenêtre de confirmation de la création de ticket sans rendez-vous est ouverte
    Then Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la fenêtrer sans rendez-vous
  
  Scenario: Téléchargement du ticket digital
    Given La fenêtre de confirmation de la création de ticket sans rendez-vous est ouverte
    When L'utilisateur clique sur le bouton "Télécharger mon ticket" de la page confirmation signalement sans rendez-vous
    Then Le fichier ticket digital sur page de confirmation sans rendez-vous doit être téléchargé