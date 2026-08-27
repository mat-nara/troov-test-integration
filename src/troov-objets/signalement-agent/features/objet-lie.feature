Feature: Ajout d'un objet lie
Background:
  Given l'utilisateur est sur "http://localhost:3000/login"
  When L'utilisateur se connecte avec ces identifiants SSO
  Then L'utilisateur arrive sur sa page d'accueil agent

## Scenario: Ajouter un objet lie dans le formulaire de signalement
##  When L'utilisateur clique sur le bouton "Signaler un objet"
##  * L'utilisateur remplit le formulaire de signalement principal
##  * L'utilisateur clique sur le bouton "Lier un nouvel objet a cette fiche"
##  Then Une pop-in s'ouvre proposant un formulaire identique au signalement de base

## Scenario: Ajouter un objet lie et faire appel a l'IA en ajoutant une photo
##  When L'utilisateur clique sur le bouton "Signaler un objet"
##  * L'utilisateur remplit le formulaire de signalement principal
##  * L'utilisateur clique sur le bouton "Lier un nouvel objet a cette fiche"
##  * L'utilisateur ajoute une photo pour faire appel a l'IA
##  Then Les champs du formulaire de l'objet lie se remplissent automatiquement

Scenario: L'objet lie est cree et se retrouve dans la fiche de l'objet principal
  When L'utilisateur clique sur le bouton "Signaler un objet"
  * L'utilisateur remplit le formulaire de signalement principal
  * L'utilisateur ajoute un objet lie dans le formulaire
  Then L'objet lie est cree 