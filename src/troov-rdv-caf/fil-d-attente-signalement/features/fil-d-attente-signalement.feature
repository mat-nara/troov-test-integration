@filDAttenteSignalement 
Feature: Signalement d'une arrivée via le menu fil d'attente du backoffice Troov  

    Background:
        Given L'utilisateur est connecté à l'application Troov 

    # Signalement d'une arrivée sans RDV: Affichage 
    Scenario: La fenetre de signalement d'arrivé du backoffice s'affiche correctement
        When Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"          
        Then La fenetre de signalement d'arrivé du backoffice s'affiche correctement

    #Signalement d'une arrivée sans RDV (usager): Enregistrement 
    Scenario: NIR uniquement saisie: On peut passer à l'étape suivante
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * Le NIR uniquement est saisie
        When  Cliquer sur le bouton "Continuer" de la page d'enregistrement
        Then  Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page

    Scenario: Téléphone uniquement saisie: On peut passer à l'étape suivante
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * Le Téléphone uniquement est saisie
        When  Cliquer sur le bouton 'Continuer' de la page d'enregistrement
        Then  Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page
    
    Scenario: NIR et Téléphone saisie: On peut passer à l'étape suivante
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * Le NIR et le Téléphone sont saisie
        When  Cliquer sur le bouton 'Continuer' de la page d'enregistrement
        Then  Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page

    Scenario: NIR dans un mauvais format: Un message d'erreur s'affiche
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * que le NIR est saisi au mauvais format dans un signalement sans rendez-vous
        When  Cliquer sur le bouton 'Continuer' de la page d'enregistrement
        Then  Message d'erreur sur le NIR s'affiche

    Scenario: Téléphone dans un mauvais format: Un message d'erreur s'affiche
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * que le téléphone est saisi au mauvais format dans un signalement sans rendez-vous
        When  Cliquer sur le bouton 'Continuer' de la page d'enregistrement
        Then  Message d'erreur sur le téléphone s'affiche

    Scenario: Boutton continuer: On peut passer à l'étape suivante
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
            * Le NIR et le Téléphone sont saisie
        When  Cliquer sur le bouton 'Continuer' de la page d'enregistrement
        Then  Passe à l'etape suivant: "Choisir le motif de visite" s'affiche sur la page
    
    Scenario: Boutton quitter de la page d'enregistrement: On revient sur la page initiale pour le signalement d'une arrivée
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager sans rendez-vous est ouverte
        When Cliquer sur 'Quitter' de la page d'enregistrement 
        Then Revient sur la page initiale depuis la page d'enregistrement, signalement sans rendez-vous: "Signaler l’arrivée d’un usager" s'affiche sur la page


    # Signalement d'une arrivée sans RDV (usager): Motif 
    Scenario: Selection du motif/sous-motif
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page choisir le motif de visite sans rendez-vous est ouverte
            * Choisir motif: "Enfant"
            * Choisir sous-motif: "J'attends / J'accueille un enfant"
        When Cliquer sur 'Continuer' de la page motif
        Then Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page

    # Scenario Outline: Validité des sous motif par rapport au motif
    #     Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
    #         * La page choisir le motif de visite sans rendez-vous est ouverte
    #     When  Choisir motif: "<motif>"
    #     Then  Chaque sous-motif de la liste doit contenir: "<motClef>"
    #
    #Examples:
    #    | motif                     | motClef             |
    #    | Enfant                    | enfant              |
    #    | Handicap                  | handicapé           |
    #    | Situation professionnelle | Je suis travailleur |

    Scenario: Boutton quitter de la page motif: On revient sur la page initiale pour le signalement d'une arrivée
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page choisir le motif de visite sans rendez-vous est ouverte
        When  Cliquer sur 'Quitter' de la page motif
        Then  Revient sur la page initiale depuis la page motif: "Signaler l’arrivée d’un usager" s'affiche sur la page


    # Signalement d'une arrivée sans RDV (usager): Confirmation 
    Scenario: La page de confirmation sans rendez-vous s'affiche correctement 
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page de confirmation de la création de ticket sans rendez-vous est ouverte
        Then  Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page
        But   Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la page
    
    Scenario: Téléchargement du ticket digital
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page de confirmation de la création de ticket sans rendez-vous est ouverte
        When  L'utilisateur clique sur "Afficher le QR code" de la page confirmation signalement sans rendez-vous
        Then  Le code QR s'affiche 
        When  L'utilisateur clique sur "Masquer le QR Code" de la page confirmation signalement sans rendez-vous
        Then  On revient sur la page de confirmation du signalement sans rendez-vous
        When  L'utilisateur clique sur "Terminer" de la page confirmation signalement sans rendez-vous
        Then  La fenetre de signalement d'arrivé se ferme


    # Signalement d'une arrivée sans RDV (usager): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 
    Scenario: Vérification le signalement arrivé s'affiche dans la file d'attente du lieu concerné  
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * Un signalement d'arrivée sans rendez-vous est confirmé 
        When  La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé sans rendez-vous
        Then  Le ticket doit s'afficher dans la file d'attente sans rendez-vous

    Scenario: Vérification de l'exactitude des informations du ticket confirmé
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * Un signalement d'arrivée sans rendez-vous est confirmé 
        When  La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé sans rendez-vous
        Then  Le numéro et le motif du ticket confirmé dans le signalement sans rendez-vous doivent être identiques à ceux présents dans la file d'attente.


#   ************************************************************************************************************************
#   SIGNALEMENT AVEC RDV
#   ************************************************************************************************************************

    # Signalement d'une arrivée avec RDV (usager): Recherche du RDV
    Scenario: NIR uniquement saisie: Le RDV est retrouvé
        Given Un rendez-vous a été créer 
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * Seul le NIR associé à l’usager propriétaire du rendez-vous est saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page

    Scenario: Téléphone uniquement saisie: Le RDV est retrouvé
		Given Un rendez-vous a été créer 
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * Seul le Téléphone associé à l’usager propriétaire du rendez-vous est saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page
  
    Scenario: NIR et Téléphone saisie: Le RDV est retrouvé
		Given Un rendez-vous a été créer 
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * Le NIR et le Téléphone associé à l’usager propriétaire du rendez-vous sont saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page
    
    Scenario: NIR sans RDV: Un message d'erreur s'affiche
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
		    * Un NIR non associé a un rendez-vous est saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Message d'erreur 'Aucun rendez-vous' s'affiche
    
    Scenario: Phone sans RDV: Un message d'erreur s'affiche
		Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
		     * Un Téléphone non associé a un rendez-vous est saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Message d'erreur 'Aucun rendez-vous' s'affiche

    Scenario: NIR dans un mauvais format: Un message d'erreur s'affiche
		Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
		    * Le NIR est saisie au mauvais format
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Message d'erreur sur le NIR s'affiche

    Scenario: Téléphone dans un mauvais format: Un message d'erreur s'affiche
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
		    * Le Téléphone saisie au mauvais format
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Message d'erreur sur le téléphone s'affiche

    Scenario: Boutton continuer: On peut passer à l'étape suivante
        Given Un rendez-vous a été créer 
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * Le NIR et le Téléphone associé à l’usager propriétaire du rendez-vous sont saisi
        When  Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV
        Then  Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page
    
    Scenario: Boutton quitter de la page d'enregistrement: On revient sur la page initiale pour le signalement d'une arrivée
        Given Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
        When  Cliquer sur 'Quitter' de la page: Enregistrement avec RDV
        Then  Revient sur la page initiale: "Signaler l’arrivée d’un usager" s'affiche sur la page


    # Signalement d'une arrivée avec RDV (usager): Confirmation 
    Scenario: La page de confirmation avec rendez-vous s'affiche correctement 
        Given Un rendez-vous a été créer
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * La page de confirmation de la création de ticket avec rendez-vous est ouverte
        Then Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page
    
#    Scenario: Télécharger un fichier après avoir appuyé sur un bouton "Télécharger mon ticket"
#        Given Un rendez-vous a été créer
#            * La page de confirmation de la création de ticket avec rendez-vous est ouverte
#        When l'utilisateur clique sur le bouton "Télécharger mon ticket"
#        Then le fichier ticket digital sur page de confirmation avec rendez-vous doit être téléchargé

    
    # Signalement d'une arrivée avec RDV (usager): Vérification que le signalement d'une arrivée s'affiche correctement dans la file d'attente. 
    Scenario: Vérification le signalement arrivé avec rendez-vous s'affiche dans la file d'attente du lieu concerné  
        Given Un rendez-vous a été créer
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * La page de confirmation de la création de ticket avec rendez-vous est ouverte
        When  La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé avec rendez-vous
        Then  Le ticket doit s'afficher dans la file d'attente avec rendez-vous

    Scenario: Vérification de l'exactitude des informations du ticket confirmé
        Given Un rendez-vous a été créer
            * Il clique sur le menu "File d'attente" puis sur "Signaler une arrivée"
            * La page enregistrement d’usager avec rendez-vous est ouverte
            * La page de confirmation de la création de ticket avec rendez-vous est ouverte
        When  La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé avec rendez-vous
        Then  Le numéro et le motif du ticket confirmé dans le signalement avec rendez-vous doivent être identiques à ceux présents dans la file d'attente.