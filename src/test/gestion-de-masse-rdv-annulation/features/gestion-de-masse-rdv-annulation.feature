@GestionDeMasseRdvAnnulation
Feature: Gestion de masse des rendez-vous - Annulation 

    Background:
        Given L'utilisateur est connecté à l'application Troov
            * Un rendez-vous a été créer
    
    Scenario: Fermeture d'une journée de prise de rendez-vous sans annulation des rendez-vous déjà pris 
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Mes paramètres" s'affiche

        When L'utilisateur clique sur cliquer sur le calendrier avec étoile d'un guichet
        Then La page "Gestion des horaires exceptionnels" s'affiche

        When L'utilisateur sélectionne la date du jour ou il y a des rendez-vous
           * Il clique sur "Fermer la journée"
        Then Une fenetre de choix du mode de suppression s'affiche
        When L'utilisateur sélectionne "Fermer la prise de nouveaux rendez-vous et maintenir les rendez-vous déjà pris"
           * L'utilisateur clique sur "Calendrier"
        Then La journée concerne est fermée sans que les rendez-vous soit annulés


    Scenario: Fermeture d'une journée de prise de rendez-vous et annulation des rendez-vous déjà pris
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Mes paramètres" s'affiche

        When L'utilisateur clique sur cliquer sur le calendrier avec étoile d'un guichet
        Then La page "Gestion des horaires exceptionnels" s'affiche

        When L'utilisateur sélectionne la date du jour ou il y a des rendez-vous
           * Il clique sur "Fermer la journée"
        Then Une fenetre de choix du mode de suppression s'affiche
        When L'utilisateur sélectionne "Fermer la prise de nouveaux rendez-vous et annuler les rendez-vous déjà pris"
            * L'utilisateur confirme la fermeture du jour et l'annulation des rendez-vous
            * L'utilisateur clique sur "Calendrier"
        Then La journée concerne est fermée et que tous les rendez-vous de ce guichet sont annulés
