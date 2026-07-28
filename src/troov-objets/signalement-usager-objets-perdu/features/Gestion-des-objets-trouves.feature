Feature: Gestion des objets trouves (espace Mairie)

    Background:
        Given L'utilisateur mairie est connecte a son espace

    Scenario: Affichage de la page "Mes objets" avec les filtres disponibles
        When L'utilisateur clique sur le lien "Mes objets" dans le menu lateral
        Then La page "Mes objets" s'affiche
            * Les onglets "Objets trouves", "Objets perdus" et "Match en cours" sont disponibles

    Scenario: Declarer un objet comme retrouve ou le supprimer depuis "Mes objets"
        When L'utilisateur clique sur le lien "Mes objets" dans le menu lateral
        And L'utilisateur clique sur la ligne de l'objet "Sac"
        Then Les boutons "Objet rendu ?" et "Modifier la fiche" sont disponibles

        When L'utilisateur clique sur le bouton "Modifier la fiche"
        Then Les boutons "Annuler" et "Enregistrer" sont disponibles
        When L'utilisateur clique sur le bouton "Annuler"
        Then Les boutons "Objet rendu ?" et "Modifier la fiche" sont disponibles

        When L'utilisateur clique sur le bouton "Objet rendu ?"
        Then Une pop-up "Informations sur le proprietaire de l'objet" s'affiche
        When L'utilisateur clique sur le bouton "Annuler"
        Then La pop-up se ferme sans enregistrer