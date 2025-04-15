@annulationRdvAgentViaTroovRdv 
Feature: Annulation d'un RDV par un agent via Troov RDV

    Background: 
        Given Un rendez-vous a été créé

    # Annulation via l’agenda (option 1)
    Scenario: Ouverture de la fiche d’un rendez-vous via l’agenda
        Given L'utilisateur clique sur "Calendrier"
        When Il sélectionne le rendez-vous
        Then La fiche du rendez-vous s’ouvre correctement

    Scenario: Annulation du rendez-vous via la fiche (option 1)
        Given La fiche du rendez-vous est ouverte depuis l’agenda
        When L'utilisateur clique sur le bouton "Annuler" puis sur "Annuler ce rendez-vous"
        Then Le rendez-vous doit disparaître de l'agenda
    #      * Une confirmation d'annulation s’affiche


    # Annulation via le carnet d’adresse (option 2)
    Scenario: Ouverture de la fiche d’un rendez-vous via le carnet d’adresse
        Given L'utilisateur ouvre le carnet d'adresse
        When Il renseigne les informations de l'usager et recherche un rendez-vous
           * Il clique sur le rendez-vous à annuler
        Then La fiche du rendez-vous s’ouvre correctement

    Scenario: Annulation du rendez-vous via la fiche (option 2)
        Given L'utilisateur ouvre le carnet d'adresse 
           * La fiche du rendez-vous est ouverte depuis le carnet d’adresse
        When L'utilisateur clique sur le bouton "Annuler" puis sur "Annuler ce rendez-vous"
           * L'utilisateur revient sur l’agenda via le menu "Calendrier"
        Then Le rendez-vous doit disparaître de l'agenda
    #      * Une confirmation d'annulation s’affiche


    Scenario: Vérification que le rendez-vous a bien été annulé dans l’agenda
        Given Le rendez-vous a été annulé
        When L'utilisateur revient sur l’agenda via le menu "Calendrier"
           * Le filtre des rendez-vous est réglé sur "RDV maintenus"
        Then Le rendez-vous doit disparaître de l'agenda
        When L'utilisateur modifie le filtre et sélectionne "RDV annulés"
        Then Le rendez-vous annulé s'affiche dans la liste

    Scenario: Consultation de l’historique après annulation d’un rendez-vous
        Given Le rendez-vous a été annulé
            * L'utilisateur l’a retrouvé dans "RDV annulés"
        When Il ouvre la fiche du RDV et clique sur "Historique"
        Then Les informations affichées doivent correspondre à la prise initiale puis à l'annulation du rendez-vous
    

##    # Vérification côté usager (Caf.fr et V360)
##    Scenario: Vérification de la suppression du RDV dans l’agenda usager sur Caf.fr
##        Given Le rendez-vous a été annulé
##        When L'utilisateur ouvre le compte usager sur Caf.fr
##            * Il clique sur "Consulter mes RDVs"
##        Then Le rendez-vous n’est plus visible
##
##        Scenario: Vérification de la suppression du RDV dans la fiche V360
##        Given Le rendez-vous a été annulé
##        When L'utilisateur ouvre la fiche V360 de l’usager
##        Then Le rendez-vous n’est plus affiché
##
##    # Interactions Troov RDV
##    Scenario: Recherche de l’interaction d’annulation de RDV
##        Given Le rendez-vous a été annulé
##        When L'utilisateur clique sur "Interactions"
##            * Il recherche la date et heure du RDV annulé
##        Then Une bulle avec "Annulé par l'agent" est affichée avec les informations du RDV
##
##    Scenario: Consultation des détails d’une interaction d’annulation
##        Given Une interaction d’annulation est visible
##        When L'utilisateur clique sur la bulle
##        Then Une pop-up s’ouvre avec les détails suivants :
##            | Emetteur |
##            | Caf de l’usager |
##            | Interlocuteur |
##            | Rôle dans le foyer |
##            | Canal d’acquisition |
##            | État |
##            | Date et heure du RDV |
##            | Type / lieu / motif / commentaire |





