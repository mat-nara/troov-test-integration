@SignalementAgentSansRdvInfoUsager
Feature: Signalement d'une arrivée sans RDV (agent): Enregistrer l’usager 

  Background:
    Given L'utilisateur est connecté à l'application Troov
        * La page "Enregistrer l’usager" d'un signalement sans rendez-vous est ouverte

	Scenario: NIR uniquement saisie: On peut passer à l'étape suivante
		Given NIR uniquement est saisie
    When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page

  Scenario: Téléphone uniquement saisie: On peut passer à l'étape suivante
		Given Téléphone uniquement est saisie
    When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page
  
  Scenario: NIR et Téléphone saisie: On peut passer à l'étape suivante
		Given NIR et Téléphone sont saisie
    When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page

  Scenario: NIR dans un mauvais format: Un message d'erreur s'affiche
		Given que le NIR est saisi au mauvais format dans un signalement sans rendez-vous
    #When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Message d'erreur associé au NIR s'affiche

  Scenario: Téléphone dans un mauvais format: Un message d'erreur s'affiche
		Given que le téléphone est saisi au mauvais format dans un signalement sans rendez-vous
    #When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Message d'erreur associé au Téléphone s'affiche

  Scenario: Boutton continuer: On peut passer à l'étape suivante
		Given NIR et Téléphone sont saisie
    When Cliquer sur le bouton 'Continuer' de la page d'enregistrement
    Then Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page
  
  Scenario: Boutton quitter de la page d'enregistrement: On revient sur la page initiale pour le signalement d'une arrivée
    When Cliquer sur 'Quitter' de la page d'enregistrement 
    Then Revient sur la page initiale depuis la page d'enregistrement, signalement sans rendez-vous: "Signaler l’arrivée d’un usager" s'affiche sur la page
