@sansRdvConfirmation
Feature: Signalement d'une arrivée sans RDV (usager): Confirmation 

  Scenario: La page de confirmation sans rendez-vous s'affiche correctement 
    Given La page de confirmation est ouverte
    Then Le titre "Vous êtes bien enregistré !" s'affiche sur la page
    But Le titre "Votre numéro d’appel est le suivant :" s'affiche sur la page
  
  Scenario: Téléchargement du ticket digital
    Given La page de confirmation est ouverte
    Then Cliquer sur le ticket digital à télécharger sur page de confirmation

