@SignalementArriverViaPCNEWPCLS
Feature: Signalement d'une arrivée via PC NEW PCLS  

    Background:
        Given L'utilisateur est connecté à l'application Troov
    
    Scenario: Signalement d'une arrivée avec RDV (usager)
        Given Un rendez-vous a été créer
            * La page principale du signalement d'arrivée est ouverte
        When Il clique sur "J'ai un rendez-vous" 
        Then Le titre "Je m'enregistre" s'affiche sur la page

        When Il saisie le NIR et Téléphone associé aux rendez-vous
           * Il clique sur le bouton "Continuer" 
        Then "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV

        When Il clique sur "Télécharger mon ticket"
        Then Le ticket est téléchargé avec succès
        
        When Il ouvre la page File d'attente du backoffice Troov
        Then Le signalement sans rendez-vous doit s'afficher dans "Attente avec rendez vous"
    

    Scenario: Signalement d'une arrivée sans RDV (usager)
        Given La page principale du signalement d'arrivée est ouverte
        When Il clique sur "Je n'ai pas rendez-vous" 
        Then Le titre "Je m'enregistre" s'affiche sur la page

        When Il saisie le NIR et Téléphone associé aux rendez-vous
           * Il clique sur le bouton "Continuer"
        Then Il est redirigé vers la page de choix du motif

        When Il choisit un motif et un sous-motif
           * Il clique sur le bouton "Continuer" 
        Then "Vous êtes bien enregistré !" s'affiche sur la page confirmation avec RDV

        When Il clique sur "Télécharger mon ticket"
        Then Le ticket est téléchargé avec succès

        When Il ouvre la page File d'attente du backoffice Troov
        Then Le signalement sans rendez-vous doit s'afficher dans "Attente sans rendez vous"