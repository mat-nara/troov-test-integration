Feature: Connexion et affichage de la page d'accueil agent

  Background:
    Given L'utilisateur est sur la page de connexion de Troov

  Scenario: Se connecter via Troov.com (ID/ MDP - connexion SSO)
    When L'utilisateur saisit ses identifiants et valide la connexion
    Then La page de connexion s'affiche correctement

  Scenario: Affichage de la page d'accueil de l'agent concerne
    When L'utilisateur est connecte avec un compte agent valide
    Then La page s'affiche correctement