@DeplacementRdv
Feature: Gestion des masse de rendez-vous: Deplacement

    Background:
        Given L'utilisateur est connecté à l'application Troov
        
    Scenario: Accéder à la gestion des services
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Gestion des services" s'affiche

    Scenario: Ouvrir la page "plage horaire exceptionnel" d'un Guichet
        Given L'utilisateur est sur la page "Gestion des Services"
        When Il clique sur le calendrier avec étoile du "Guichet 1"
        Then La page "Plage horaire exceptionnel" du guichet s'affiche

    Scenario: Lancer le déplacement en masse des RDV
        Given La page "plage horaire exceptionnel" du "Guichet 1" est ouverte
        When L'utilisateur clique sur "Déplacer les RDV en masse"
        Then La fenetre "Deplacer les RDV" étape 1/3 s'affiche
     
    Scenario: Compléter l'étape 1 du déplacement
        Given La page "plage horaire exceptionnel" du "Guichet 1" est ouverte
            * La fenetre "Deplacer les RDV" étape 1/3 est ouverte
        When L'utilisateur remplit les champs de l'étape 1/3 et clique sur "Valider 1/3"
        Then La fenetre "Deplacer les RDV" étape 2/3 s'affiche
    
    Scenario: Compléter l'étape 2 du déplacement
        Given La page "plage horaire exceptionnel" du "Guichet 1" est ouverte
            * La fenetre "Deplacer les RDV" étape 1/3 est ouverte
            * L'utilisateur remplit les champs de l'étape 1/3 et clique sur "Valider 1/3"
        When L'utilisateur remplit les champs de l'étape 2/3 et clique sur "Valider 2/3"
        Then La fenetre "Deplacer les RDV" étape 3/3 s'affiche
    
    Scenario: Valider le déplacement
        Given La page "plage horaire exceptionnel" du "Guichet 1" est ouverte
            * La fenetre "Deplacer les RDV" étape 1/3 est ouverte
            * L'utilisateur remplit les champs de l'étape 1/3 et clique sur "Valider 1/3"
            * L'utilisateur remplit les champs de l'étape 2/3 et clique sur "Valider 2/3"
        When L'utilisateur clique sur le bouton de validation de l’étape 3
        Then Un message de confirmation du déplacement en masse s’affiche
            # * Le déplacement est bien effectué
           # * Un email de confirmation est envoyé

    Scenario: Vérifier que les RDV ont bien été déplacés
        Given Un rendez-vous a été créé
            * La page "plage horaire exceptionnel" du "Guichet 1" est ouverte
            * La fenetre "Deplacer les RDV" étape 1/3 est ouverte
            * L'utilisateur remplit les champs de l'étape 1/3 et clique sur "Valider 1/3"
            * L'utilisateur remplit les champs de l'étape 2/3 et clique sur "Valider 2/3"
            * L'utilisateur clique sur le bouton de validation de l’étape 3
        When L'utilisateur retourne dans le calendrier
        Then Les rendez-vous sont correctement placé