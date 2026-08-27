Feature: Modification d'un objet trouve
Background:
  Given l'utilisateur est sur "http://localhost:3000/login"
  When L'utilisateur se connecte avec ces identifiants SSO
  Then L'utilisateur arrive sur sa page d'accueil agent
  * L'utilisateur se trouve sur la page "Mes objets"

Scenario: Modifier un objet via la fiche objet
  When L'utilisateur clique sur l'objet
  Then La fiche de l'objet s'affiche
  When L'utilisateur clique sur le bouton "Acceder a la fiche objet"
  Then La fiche de l'objet s'ouvre
  * Les modifications de l'objet sont possibles
  When L'utilisateur modifie la couleur de l'objet
  * L'utilisateur clique sur le bouton "Enregistrer"
  Then Les modifications de l'objet sont enregistrees

## Scenario: Effectuer une action sur un objet via le menu Actions
##  When L'utilisateur clique sur l'objet
##  Then La fiche de l'objet s'affiche
##  When L'utilisateur clique sur le bouton "Acceder a la fiche objet"
##  Then La fiche de l'objet s'ouvre
##  When L'utilisateur clique sur le bouton "Actions"
##  Then Plusieurs actions sont proposees
##  * Les actions proposees permettent d'effectuer les operations correspondantes

