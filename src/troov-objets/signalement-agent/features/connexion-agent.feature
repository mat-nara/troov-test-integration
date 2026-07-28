Feature: Connexion Agent

  Scenario: Se connecter au compte agent
    Given l'utilisateur est  sur "localhost:3000"
    WHen L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent