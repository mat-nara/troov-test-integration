@GestionServiceAutresOptions
Feature: Gestion Service: Autres options 

    Background:
        Given L'utilisateur est connecté à l'application Troov
           
    Scenario: Accéder à la gestion des services
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Mes paramètres" s'affiche

        Then Le parametre "Activer la réservation pour les familles" est visible et modifiable
           * Les 3 champ associée au parametre "Activer la réservation pour les familles" sont visible et modifiable
        
        When L'utilisateur clique sur "Gérer les jours de fermeture de votre lieu"
        Then La page "Jours de fermeture" s'affiche

        When Il clique sur "Ajouter un jour de fermeture"
        Then Une nouvelle jour de fermeture apparait et la date du jour est préselectionné

        When L'utilisateur clique dans la zone Bleue du nouveau jour de fermeture créer
           * Il sélectionne une date du pour le jour de fermeture sur le calendrier qui apparait
        Then La date du jour de fermeture est sélectionnée
           * Une icone de suppression est affichée et cliquable à côté de la zone du jour de fermeture
           * Le boutton "Supprimer tous les jours fériés" est visible et cliquable

        When Il cliquer sur "Ajouter une plage de fermeture"
        Then Un calendrier s'affiche

        When Il séléctionne deux dates dans le calendrier
           * Il clique sur "Ajouter"
        Then Chaque jours dans la plage de fermeture est affiché en tant que jour de fermeture

        When L'utilisateur clique sur "Sauvegarder les changements"
           * L'utilisateur clique sur "Gérer les jours de fermeture de votre lieu"
        Then La date de fermeture est bien enregitrée
