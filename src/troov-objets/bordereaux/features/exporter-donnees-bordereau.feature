Feature: Exporter les données du bordereau

  Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
    Then L'utilisateur arrive sur la liste des bordereaux

  Scenario: Afficher la fiche d'un bordereau et exporter les objets selectionnes
    When L'utilisateur clique sur un bordereau de la liste
    Then La fiche du bordereau s'affiche
      * Le tableau de la liste des objets sélectionnés est visible
      * Les boutons "Modifier", "Exporter PDF", "Exporter Excel" et "Historique" sont visibles en haut
      * Les informations Type d'objet, N° Ref, Date, Nom/Prénom et Informations cles sont visibles
    When L'utilisateur coche un element dans la liste
    Then Les boutons "Selectionner tout" et "Supprimer" s'affichent en bas
    When L'utilisateur clique sur le bouton "Exporter PDF"
    Then Le telechargement d'un fichier PDF des elements selectionnes demarre
    When L'utilisateur clique sur le bouton "Exporter Excel"
    Then Le telechargement d'un fichier Excel des elements selectionnes demarre
