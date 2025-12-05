@avecRdvRecherche 
Feature: Signalement d'une arrivée avec RDV (usager): Recherche 

    Background:
        Given La page "Je m'enregistre" avec rendez-vous est ouverte

    Scenario: NIR uniquement saisie: Le RDV est retrouvé
        Given Un rendez-vous a été créer 
            * que NIR uniquement est saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Passe à l'etape suivant: "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV

    Scenario: Téléphone uniquement saisie: Le RDV est retrouvé
		Given Un rendez-vous a été créer 
            * que Téléphone uniquement est saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Passe à l'etape suivant: "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV
  
    Scenario: NIR et Téléphone saisie: Le RDV est retrouvé
		Given Un rendez-vous a été créer 
            * que NIR et Téléphone sont saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Passe à l'etape suivant: "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV
    
    Scenario: NIR sans RDV: Un message d'erreur s'affiche
		Given que NIR sans RDV est saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Message d'erreur 'Aucun rendez-vous' s'affiche
    
    Scenario: Phone sans RDV: Un message d'erreur s'affiche
		Given que phone sans RDV est saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Message d'erreur 'Aucun rendez-vous' s'affiche

    Scenario: NIR dans un mauvais format: Un message d'erreur s'affiche
		Given NIR saisie au mauvais format
        # When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Message d'erreur associé au NIR s'affiche

    Scenario: Téléphone dans un mauvais format: Un message d'erreur s'affiche
        Given Téléphone saisie au mauvais format
        # When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Message d'erreur associé au Téléphone s'affiche

    Scenario: Boutton continuer: On peut passer à l'étape suivante
        Given Un rendez-vous a été créer 
            * que NIR et Téléphone sont saisie
        When Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then Passe à l'etape suivant: "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV
    
    Scenario: Boutton quitter de la page d'enregistrement: On revient sur la page initiale pour le signalement d'une arrivée
        When Cliquer sur 'Quitter' de la page: Enregistrement avec RDV
        Then Revient sur la page initiale: "Je signale mon arrivée" s'affiche sur la page