@authenticated @SignalementAgentAvecRdvConfirmation
Feature: Signalement d'une arrivée avec RDV (agent): Confirmation 

  Background:
    Given La fenêtre de confirmation de la création de ticket avec rendez-vous est ouverte

  Scenario: La fenêtre de confirmation avec rendez-vous s'affiche correctement 
    Then Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la fenêtrer avec rendez-vous
  
  Scenario: Téléchargement du ticket digital
    When L'utilisateur clique sur le bouton "Je confirme et j'imprime le ticket" de la page confirmation signalement avec rendez-vous
    Then Le fichier ticket digital sur page de confirmation avec rendez-vous doit être téléchargé
  
  Scenario: Boutton "Ce n'est pas le bon RDV" de la page de recherche de RDV: On revient sur la page initiale pour le signalement d'une arrivée
    When Cliquer sur "Ce n'est pas le bon RDV" de la page: confirmation de RDV
    Then Revient sur la page de recherche de rendez-vous: "Retrouver le RDV" s'affiche sur la page