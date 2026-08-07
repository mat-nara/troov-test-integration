Feature: Affichage de la page Bordereaux

  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent

  Scenario: Accéder à la page Bordereaux via le menu latéral
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    Then La page Bordereaux s'affiche correctement

  Scenario: Vérifier les éléments de la page Bordereaux
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    Then Les filtres Type et Contact sont visibles
      * La liste des bordereaux affiche les colonnes "Nom", "Type", "Statut", "Contact", "Objets", "Date"
      * Les deux bouttons "créer depuis un excel" et "créer manuellement" sont visible en haut à droite