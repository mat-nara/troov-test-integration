@sansRdvConfirmation
Feature: Signalement d'une arrivée sans RDV (usager): Confirmation 

  Scenario: La page de confirmation sans rendez-vous s'affiche correctement 
    Given La page de confirmation de la création de ticket sans rendez-vous est ouverte
    Then Le titre "Vous êtes bien enregistré !" s'affiche sur la page de confirmation signalement sans rendez-vous
    But Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la page
  
  Scenario: Téléchargement du ticket digital
    Given La page de confirmation de la création de ticket sans rendez-vous est ouverte
    When L'utilisateur clique sur le bouton "Télécharger mon ticket" de la page confirmation signalement sans rendez-vous
    Then Le fichier ticket digital sur page de confirmation sans rendez-vous doit être téléchargé

