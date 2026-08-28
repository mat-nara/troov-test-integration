Feature: Declaration d'un OIC
  Background:
    Given l'usager est sur la page d'accueil

  Scenario: Cliquer sur le bouton "signaler un OIC"
    When l'usager clique sur le bouton "signaler un OIC"
    Then l'usager est redirige vers le formulaire de signalement OIC
    * l'etat de l'objet est automatiquement renseigne a "OIC"

##  Scenario: Saisir le numero de reference communique par l'agent
##    * l'usager est sur le formulaire de signalement OIC
##    When l'usager saisit le numero de reference OIC
##    * l'usager clique sur le bouton de validation de la reference
##    Then le formulaire OIC se charge

##  Scenario: Declarer un OIC (champs adaptes)
##    * l'usager est sur le formulaire de signalement OIC
##    * l'usager a saisi un numero de reference valide
##    When l'usager renseigne les informations de l'OIC
##    Then les champs du formulaire OIC sont visibles
##    * l'usager peut valider la declaration de l'OIC

##  Scenario: Suivre les indications jusqu'a la restitution
##    * l'usager a declare un OIC
##    * l'usager est sur le suivi de son OIC
##    When l'usager choisit un mode de restitution
##    * l'usager effectue le paiement si necessaire
##    Then l'usager peut finaliser la restitution de l'objet
##    * le suivi de l'OIC est mis a jour

##  Scenario: Affichage de la page de paiement
##    * l'usager a declare un OIC
##    * l'usager a choisi un mode de restitution necessitant un paiement
##    When l'usager accede a la page de paiement
##    Then la page de paiement s'affiche
##    * l'usager peut renseigner ses coordonnees bancaires