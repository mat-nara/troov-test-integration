@authenticated @SignalementAgentSansRdvMotif
Feature: Signalement d'une arrivée sans RDV (agent): Motif 

  Background:
    Given La fenêtre "Choix du service" est ouverte pour un signalement sans rendez-vous

  Scenario: Sélection du service
    Given L'utilisateur choisi sur un service pour un signalement sans rendez-vous
    When L'utilisateur clique sur 'Valider' sur la page de choix du service pour un signalement sans rendez-vous
    Then Passe à l'etape suivant: "Je renseigne les informations de l’usager qui souhaite prendre un RDV" s'affiche sur la page depuis la page choix du service

  Scenario: Bouton Retour de la fenetre choix du service: On revient sur la page initiale pour le signalement d'une arrivée
    When L'utilisateur clique sur 'Retour' de la fenêtre de choix du service
    Then L'utilisateur revient sur la page initiale depuis le choix du service : "Je signale une arrivée pour :" s'affiche sur la page