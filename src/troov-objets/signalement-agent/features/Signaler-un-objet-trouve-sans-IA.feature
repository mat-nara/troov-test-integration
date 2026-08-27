Feature: Signaler un objet trouve sans IA

   Background:
    Given l'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent

  Scenario: Signaler un objet depuis le bouton signaler un objet
    Given L agent est sur la page d accueil
    When L agent clique sur le bouton "signaler un objet"
    Then La page de signalement s affiche

  Scenario: Signaler un objet depuis la barre de signalement express
    Given L agent est sur la page d accueil
    When L agent clique sur un objet dans la barre de signalement express
    Then La page de signalement correspondante s affiche

  Scenario: Remplir les champs du formulaire de signalement
    Given L agent est sur la page de signalement
    When L agent remplit les champs obligatoires du formulaire
    * L agent remplit les champs optionnels du formulaire
    Then Tous les champs requis sont valides

  Scenario: Champs trouves date et partenaires remplis automatiquement
    Given L agent ouvre le formulaire de signalement
    Then Les champs "trouve", "date" et "partenaires" sont pre-remplis automatiquement
    * Les champs pre-remplis restent modifiables

##  Scenario: Ajouter une photo dans le formulaire de signalement
##    Given L agent est sur le formulaire de signalement
##    When L agent selectionne et importe une photo depuis l ordinateur
##    Then La photo est chargee avec succes dans le formulaire

##  Scenario: Cocher impression de ticket avec QR code
##    Given L agent est sur le formulaire de signalement
##    When L agent coche l option "impression de ticket avec QR code"
##    Then Une fenetre s ouvre et affiche le QR code
##    * L agent a la possibilite d imprimer ou d enregistrer le QR code

  Scenario: Cliquer sur Ajouter mon annonce
    Given L agent a valide le formulaire de signalement
    When L agent clique sur le bouton "Ajouter mon annonce"
    Then L annonce est ajoutee avec succes
    * L agent est redirige vers la page de l objet