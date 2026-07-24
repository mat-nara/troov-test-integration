Feature: Page d'accueil de l'espace usager

    Scenario: Affichage de la page d'accueil apres connexion
        Given L'utilisateur est connecte a son espace usager
        When L'utilisateur accede a la page "Accueil"
        Then La page d'accueil s'affiche correctement
            * Le menu lateral affiche les liens "Accueil", "Mes objets" et "Troov"
            * Le titre "La gestion intelligente de mes objets perdus et trouvés" est visible

    Scenario: Acces au formulaire de declaration via le bouton "Signaler un objet"
        Given L'utilisateur est sur la page "Accueil"
        When L'utilisateur clique sur le bouton "Signaler un objet"
        Then L'utilisateur est redirige vers le formulaire de declaration d'objet perdu ou trouve

   Scenario: Navigation vers Mes objets puis retour a l'accueil et renvoi de l'email de confirmation
    Given L'utilisateur est sur la page "Accueil"
    When L'utilisateur clique sur le lien "Mes objets" dans le menu lateral
    Then L'utilisateur est redirige vers la page listant tous ses objets declares
    When L'utilisateur clique sur le lien "Accueil" dans le menu lateral
    Then L'utilisateur est de retour sur la page d'accueil
    When L'utilisateur clique sur le popup "Compte non verifie"
        * L'utilisateur clique sur le bouton "Renvoyer l'email de confirmation"
    Then Le popup "Compte non verifie" disparait