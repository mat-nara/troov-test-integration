Feature: Connexion utilisateur

    Scenario: Tentative de connexion avec des identifiants incorrects puis connexion reussie
        Given L'utilisateur est sur la page de connexion
        When L'utilisateur saisit un email ou un mot de passe incorrect
            * L'utilisateur valide le formulaire sur le bouton "Connexion"
        Then Un message d'erreur indique "Erreur de connexion : Mot de passe ou nom d'utilisateur incorrect"
            * L'utilisateur reste sur la page de connexion

        When L'utilisateur saisit un email et un mot de passe valides
            * L'utilisateur valide le formulaire sur le bouton "Connexion"
        Then L'utilisateur est connecte a son espace usager
