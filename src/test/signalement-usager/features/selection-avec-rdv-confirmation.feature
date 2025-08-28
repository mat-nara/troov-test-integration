@avecRdvConfirmation
Feature: Signalement d'une arrivée avec RDV (usager): Confirmation 

  Scenario: La page de confirmation avec rendez-vous s'affiche correctement 
    Given Un rendez-vous a été créer
      * La page de confirmation de la création de ticket avec rendez-vous est ouverte
    Then Le titre "Vous êtes bien enregistré !" s'affiche sur la page
    But Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page
  
  Scenario: Télécharger un fichier après avoir appuyé sur un bouton "Télécharger mon ticket"
    Given Un rendez-vous a été créer
       * La page de confirmation de la création de ticket avec rendez-vous est ouverte
    When l'utilisateur clique sur le bouton "Télécharger mon ticket"
    Then le fichier ticket digital sur page de confirmation avec rendez-vous doit être téléchargé
