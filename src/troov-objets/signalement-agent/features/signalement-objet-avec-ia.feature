Feature: Signalement d'un objet trouve avec IA
  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent

  Scenario: Ouvrir le formulaire via l'icone appareil photo dans la barre du haut
    When L'utilisateur clique sur l'icone appareil photo dans la barre du haut
    Then Le formulaire de signalement avec IA s'ouvre
        * Le compteur de photos affiche "0/3"

  Scenario: Ouvrir le formulaire via les boutons dédies
    When L'utilisateur clique sur le bouton "Signaler un objet"
    Then Le formulaire de signalement classique s'ouvre

  Scenario: Ajouter plusieurs photos depuis l'onglet photo
    When L'utilisateur clique sur l'icone appareil photo dans la barre du haut
    Then Le formulaire de signalement avec IA s'ouvre
    When L'utilisateur ajoute 3 photos depuis l'onglet photo
    Then Les 3 photos sont visibles en miniature et le compteur affiche "3/3"