Feature: Modification d'un objet trouve

Background:
  Given l'utilisateur est sur "http://localhost:3000/login"
  When L'utilisateur se connecte avec ces identifiants SSO
  Then L'utilisateur arrive sur sa page d'accueil agent
  * L'utilisateur se trouve sur la page "Mes objets"

Scenario: Modifier un objet via la fiche objet
  When L'utilisateur clique sur l'objet
  Then La fiche de l'objet s'affiche
  When L'utilisateur clique sur le bouton "Modifier la fiche"
    * L'utilisateur modifie la couleur de l'objet
  When L'utilisateur clique sur le bouton "Enregistrer"
  Then Les modifications de l'objet sont enregistrees

## Scenario: Modifier un objet via le menu d'actions
## When L'utilisateur clique sur l'objet
## Then La fiche de l'objet s'affiche
## * L'utilisateur passe par le bouton "Actions" pour modifier
## Then Les modifications de l'objet sont enregistrees