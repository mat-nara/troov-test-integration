@PlageExceptionnel
Feature: Gestion des services : Plage exceptionnel

    Background:
        Given L'utilisateur est connecté à l'application Troov
        
    Scenario: Accéder à la gestion des services
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Gestion des services" s'affiche

        When Il clique sur le calendrier avec étoile d'un guichet en particulier
        Then La page "Plage horaire exceptionnel" du guichet s'affiche

        When Il sélectionne une date
        Then La date est bien sélectionnée

        When Il clique sur le bouton "Ajouter une plage horaire exceptionnelle"
        Then Une nouvelle ligne avec une étoile s'affiche

        When Il clique sur l'icone "plus" puis sélectionne un services
        Then Le service est bien sélectionné et la couleur du service choisi s'affiche

        When Il choisit une plage horaire
        Then La plage horaire est bien 
        
        When Il clique sur l'icone "cocher" pour valider la plage horaire
        Then La plage horaire exceptionnelle est bien enregistrée

        When Il clique sur l'icone "Horloge"
        Then Une fenetre "Ajouter une récurrence" s'affiche
        When Il sélectionne une récurence, Mardi et Mercredi, puis sélectionne une période concerné
           * Il clique sur le bouton "Valider"
        Then La récurrence est bien enregistrée
           * La nouvelle plage horaire exceptionnelle est nettoyée 