Feature: Affichage de la page Bordereaux

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar

Scenario: Accéder à la page Bordereaux via le menu latéral
    Then La page Bordereaux s'affiche correctement avec :
      * Le titre "Bordereaux" est visible
      * La liste des bordereaux affiche les colonnes : Nom, Type, Statut, Contact, Objets, Date
      * Les boutons "Créer depuis un fichier" et "+ Créer manuellement" sont visibles en haut à droite

##  Scenario: Vérifier le filtre TYPE
##    When L'utilisateur clique sur le filtre "TYPE"
##    Then Les options de type s'affichent

##  Scenario: Vérifier le filtre CONTACT
##    When L'utilisateur clique sur le filtre "CONTACT"
##    Then Les options de contact s'affichent

##  Scenario: Vérifier le filtre de période
##    When L'utilisateur clique sur le filtre de période
##    Then Le calendrier de sélection de période s'affiche