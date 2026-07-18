@AccessAuthProfile
Feature: Vérification des accès, authentification et changement de profil 
    
    Scenario: Connexion réussie avec identifiants valides
        Given L'utilisateur est sur la page de connexion
        When  Il saisit un email valide
           *  Il saisit un mot de passe valide 
           *  Il clique sur le bouton "Se connecter"
        Then  Il est redirigé vers la page d'accueil

    Scenario: Échec de connexion avec mot de passe incorrect ou email
        Given L'utilisateur est sur la page de connexion            
        When  Il saisit un email valide
            * Il saisit un mot de passe invalide
            * Il clique sur le bouton "Se connecter"
        Then  Un message d'erreur "Mot de passe ou nom d'utilisateur incorrect" est affiché
            * Il reste sur la page de connexion
        When  Il saisit un email invalide
            * Il saisit un mot de passe valide
        Then  Un message d'erreur "Mot de passe ou nom d'utilisateur incorrect" est affiché
            * Il reste sur la page de connexion

    Scenario: Redirection d'un utilisateur non authentifié
        Given L'utilisateur n'est pas connecté
        When  Il tente d'accéder à la page "Calendrier"
        Then  Il est redirigé vers la page de connexion
        
    Scenario: Déconnexion depuis la page d'accueil
        Given L'utilisateur est connecté avec le compte admin
        When  Il clique sur Profil puis sur le bouton "Déconnexion"
        Then  Il est deconnecté et redirigé vers la page de connexion

    Scenario: Compte principal
        Given L'utilisateur est connecté avec le compte admin
        When  Il va dans "Paramètres" puis "Mon compte" puis "Modifier mon compte principal"
        Then  La page "Sélection du compte principal" est ouverte
           *  Le compte connecté est celui sélectionné dans le compte principal actuel
        When  L'utilisateur change le compte principal en "455 Caf site visioconférence" puis clique sur "Sauvegarder"
        Then  Une notification de mise à jour du compte principal effectuée avec succès est affichée
        When  Il se déconnecte
           *  Il se reconnecte avec le compte admin
        Then  Le nouveau paramétrage du compte principal est pris en compte et il est connecté à ce dernier
        Given Il restaure le paramètre du compte principal précédent


    Scenario: Changement de compte
        Given L'utilisateur est connecté avec le compte admin
        When  Il clique sur le profil puis "Changer de compte" dans le menu de droite
        Then  La liste des comptes existants s'affiche
        When  Il clique "CNAF Formation" puis "455 Caf" puis "455 Caf site physique"
        Then  Le compte "455 Caf site physique" est sélectionner avec tous les données associé
        When  Il se déconnecte
           *  Il se reconnecte avec un compte "Utilisateur acceuil"
        Then  Le compte "Utilisateur acceuil" est sélectionné avec les accès associé et avec le calendrier de "CNAF Formation" par defaut
