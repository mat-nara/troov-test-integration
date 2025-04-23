@GestionEquipe 
Feature: Gestion des membres d’équipe dans Troov

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Accéder à la gestion des équipes
        When L'utilisateur clique sur "Paramètres" depuis la page d'accueil
        And Il clique sur "Mon Équipe - Gestion des équipes"
        Then La page "Gérer mes équipes" s'affiche

    Scenario: Sélectionner plusieurs équipes à afficher
        Given L'utilisateur est sur la page "Gérer mes équipes"
        When Il sélectionne plusieurs équipes via la zone "Choisissez une ou plusieurs équipes"
        Then Les différentes équipes sélectionnées s'affichent

    Scenario: Supprimer une équipe de la sélection
        Given Plusieurs équipes sont séléctionné
        When L'utilisateur clique sur la croix d'une équipe affichée
        Then L’équipe est retirée de l’affichage

    
    Scenario: Rechercher un membre de l’équipe
        When L'utilisateur saisit le nom ou prénom dans la barre de recherche
        Then Le membre correspondant s'affiche dans la liste
    
    Scenario: Modifier un utilisateur existant
        Given Un utilisateur est affiché dans les résultats
        When L'utilisateur clique sur le nom dans le tableau des résultats
        Then La fiche de l’utilisateur s’ouvre  
    
    Scenario: Modifier le rôle de l’utilisateur
        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur clique dans la zone "Rôle" et sélectionne un nouveau rôle
        Then Le rôle de l’utilisateur est mis à jour visuellement
    
    Scenario: Attribuer tous les services à l’utilisateur
        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur clique dans la zone "Services" et sélectionne Tous les services
        Then Tous les services sont attribués à l’utilisateur
    
    Scenario: Deselectionner tous les services attribués
        Given Tous les services sont attribués a un membre
        When L'utilisateur clique dans la zone services puis sur "Déselectionner tout"
        Then Aucun service n’est sélectionné pour ce membre
    
    Scenario: Attribuer des services un à un
        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur sélectionne des services un à un
        Then Les services sélectionnés s’ajoutent pour ce membre
    
    Scenario: Cocher ou décocher Action possible
        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur coche ou décoche les autres paramètres
        Then L'état de l'option est mis à jour
    
    Scenario: Enregistrer les modifications de la fiche utilisateur
        Given La fiche de l’utilisateur est ouverte
            * La fiche de l’utilisateur a été modifié
        When L'utilisateur clique sur le bouton "Mettre à jour"
        Then Un message de confirmation de la mise a jours s’affiche
    
    Scenario: Supprimer un utilisateur
        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur clique sur le bouton "Supprimer" en bas de la fiche et confirme la suppression via la pop-up
        Then Un message de confirmation de la suppression s’affiche

    # Création Membre
    Scenario: Créer un utilisateur dans une équipe
        Given L'utilisateur est sur la page "Gérer mes équipes"
            * L'utilisateur sélectionne une équipe
        When Il clique sur "Ajouter un membre"
        Then Une fiche vide s’affiche pour l’utilisateur
    
    Scenario: Enregistrer la création d’un nouvel utilisateur
        Given Une nouvelle fiche membre vide est ouverte
            * L'utilisateur remplit les champs du formulaire
        When L'utilisateur clique sur le bouton "Enregistrer"
        Then Le nouveau membre est créer et apparaît dans la liste des membres
    
    Scenario: Supprimer un utilisateur nouvellement créé
        Given Un nouveau membre vient d’être créé et sa fiche est ouvert
        When L'utilisateur clique sur le bouton "Supprimer" en bas de la fiche et confirme la suppression via la pop-up
        Then Un message de confirmation de la suppression du nouveau membre s’affiche