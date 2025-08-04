@CasApprochePopupGuichets
Feature: Cas approche popup: Guichets 

    Background:
        Given L'utilisateur est connecté à l'application Troov
           
    Scenario: Accéder à la gestion des services
        When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
        And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Mes paramètres" s'affiche
    
    Scenario: Accéder à la page création de guichet
        Given L'utilisateur est sur la page "Mes paramètres - Gestion des Services"
        When L'utilisateur clique sur "+ Ajouter un guichet"
        Then La page création de guichet s'affiche
    
    Scenario: Déplier toutes les zones du paramétrage
        Given La page de création d’un guichet est ouverte
        When L'utilisateur clique sur "Affichez tout"
        Then Toutes les zones de paramétrage du guichet sont dépliées

    Scenario: Vérification toutes les zones du paramétrage
        Given La page de création d’un guichet est ouverte 
        When L'utilisateur clique sur "Affichez tout"
           * L'utilisateur complète le nom et le nom public du guichet
           * Il compléte les dates d'ouverture du nouveau Guichet et cliquer sur "Activer le calendrier glissant"
        #  * Compléter les différentes zones en cliquant, si besoin, sur l'ascenseur pour choisir Jour / Heures ou Mois
           * Il clique sur "Ajouter un jour de fermeture"
        Then Une nouvelle jour de fermeture apparait et la date du jour est préselectionné

        When L'utilisateur clique dans la zone Bleue du nouveau jour de fermeture créer
           * Il sélectionne une date du pour le jour de fermeture sur le calendrier qui apparait
        Then La date du jour de fermeture est sélectionnée
           * Une icone de suppression est affichée et cliquable à côté de la zone du jour de fermeture
           * Le boutton "Supprimer tous les jours fériés" est visible et cliquable

         #Plage de fermeture
        When Il cliquer sur "Ajouter une plage de fermeture"
        Then Un calendrier s'affiche

        When Il séléctionne deux dates dans le calendrier
           * Il clique sur "Ajouter"
        Then Chaque jours dans la plage de fermeture est affiché en tant que jour de fermeture

       When Il clique sur "Ajouter un jour d'ouverture" 
        When Il compléter le planning de la semaine donc ajoute les jours d'ouverture du guichet un a un du lundi au vendredi
        Then La selection du planning de la semaine s'effectue correctement

        When Il sélectionne une plage horaire d'ouverture pour ce guichet pour en cliquant sur l'heure, en la modifiant à l'aide des flèches, puis en cliquant sur "Close"
        Then La selection du plage horaire d'ouverture de la semaine s'effectue correctement
        # When Il séléctionne 9h et 16h30 pour une plage horaire d'ouverture

        # Selection Service
        When Il cliquer sur "Choisissez les Services" puis "Sélectionner tout"
        Then Tous les services sont sélectionnés
        When Il cliquer sur la zone ou il y a les services séléctionné puis a nouveau sur "Sélectionner tout" 
        Then Tous les services sont désélectionnés
        When Il cliquer sur la zone ou il y a les services séléctionné puis sur un service en particulier
        Then Le service est ajouté à la liste des services sélectionnés
        When Il clique sur l'icone croix pour supprimer le services
        Then Le service est supprimé de la liste des services sélectionnés
        # Given Tous les services sont sélectionnés
                
        Then Le champ pause apres RDV est modifiale - a parametrer a 5mn
        Then Le champ mode de RDV est modifiable - a parametrer a "Physique"

        # Membre (actuellement pas de membre disponible)
        #When Il clique sur la section Membre
        #Then La section "Membre" s'affiche  
        Then Un champ d'ajout de membre est visible et modifiable 
        ##When Il clique sur "Appuyer pour rechercher un membre de votre equipe"
        ##   * Il clique sur un membre dans la liste des membres
        ##Then Le membre est ajouté à la liste des membres du guichet      
        ##When Il clique sur l'icone corbeille pour supprimer le membre
        ##Then Le membre est supprimé de la liste des membres du guichet

        # Activation
        #When Il clique sur la section "Activation"
        #Then La section "Activation" s'affiche 
        Then Les champ "Autoriser les réservations par vos usagers" est visible et modifiable
           * Le champ "Autoriser les réservations en interne" est visible 

        #Sauvegarde
        When L'utilisateur clique sur "Sauvegarder les changements"
        Then Le guichet est créé et le message de confirmation s'affiche