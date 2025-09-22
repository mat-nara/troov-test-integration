@GestionFileDAttente
Feature: Gestion de la file d'attente dans Troov

    Background:
        Given L'utilisateur est connecté à l'application Troov

    # Accéder à la page de gestion de la file d'attente
    Scenario: Accéder à la page de gestion de la file d'attente
        When L'utilisateur clique sur "Paramètres" depuis la page d'accueil
           * Il clique sur "File d'attente - Gestion de la file d'attente"
        Then La page "Gestion de la file d'attente" s'affiche

    Scenario: Déplier les "Paramètres généraux"
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
        When Il clique sur "Paramètres généraux"
        Then La section des "Paramètres généraux" s'affiche 

    Scenario: Sélectionner tous les services
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux"
        When  Il clique sur "Ajouter une salle d'attente" puis "Choisissez les Services" et choisi "Tout sélectionner"    
        Then Tous les services sont sélectionnés

    Scenario: Associacion membre - agent - role
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux"
        When L'utilisateur clique sur "Ajouter un membre"
        Then Un nouveau champ d'associacion membre agent - role s'affiche
            * Après avoir cliqué sur "Choisissez l'agent", la liste s'affiche et l'utilisateur peut sélectionner un agent
            * Après avoir cliqué sur "Choisissez le rôle", la liste des rôles s'affiche et l'utilisateur peut en sélectionner un

    Scenario: Supprimer Associacion membre - agent - role
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux"
        When L'utilisateur clique sur "Ajouter un membre"
        Then Un nouveau champ d'associacion membre agent - role s'affiche 
        When Il clique sur l'icône corbeille d'un membre
        Then L'association membre - agent - role est supprimé de la liste

    Scenario: Modifier les heures de fermeture de la file d'attente
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux"
        When L'utilisateur modifie chaque horaire de fermeture de la semaine de 18h à 17h
            * Il clique sur "Sauvegarder les changements" 
            * Il clique sur "Paramètres" pour revenir à la page principale et réouvre la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux" 
        Then Les nouvelles heures de fermeture sont affichées
    
    Scenario: Activer ou désactiver les zones des "Autres paramétrages"
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramètres généraux"
        Then Les options de la section "Autres paramétrages" sont modifiables

    Scenario: Modifier les champs du "Paramétrage des alertes et automatisation"
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
            * Il clique sur "Paramétrage des alertes et automatisation"
        When L'utilisateur modifie chaques champs disponibles de la section "Paramétrage des alertes et automatisation"
            * Il clique sur "Sauvegarder les changements"
            * Il clique sur "Paramètres" pour revenir à la page principale et réouvre la page "Gestion de la file d'attente"
            * Il clique sur "Paramétrage des alertes et automatisation"
        Then Chaques modification ont été correctement sauvegardé

    Scenario: Accéder à "Paramétrage du matériel", copier et ouvrir le lien de l'écran d'appel
        Given L'utilisateur est sur la page "Gestion de la file d'attente"
        When Il clique sur "Paramétrage du matériel"
        Then La section "Paramétrage du matériel" s'affiche
        When L'utilisateur clique sur "Copier le lien de l'écran d'appel"
        Then Le lien est copié dans le presse-papiers
        When Il colle le lien dans la barre d’adresse du navigateur et l’exécute
        Then L'écran d'appel s'affiche

#    Scenario: Sauvegarder les paramétrages
#        When L'utilisateur clique sur le bouton "Sauvegarder" en bas de page
#        Then Un message de confirmation de sauvegarde s'affiche
