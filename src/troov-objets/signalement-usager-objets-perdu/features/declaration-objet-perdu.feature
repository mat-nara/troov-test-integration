Feature: Declaration d'un objet perdu

## Scenario: Cliquer sur le bouton "signaler un objet perdu"
##  Given l'usager est sur "http://localhost:3000/"
##  When l'usager clique sur le bouton "signaler un objet perdu"
##  Then l'usager est redirige vers le formulaire de signalement
##  * l'etat de l'objet est automatiquement renseigne a "perdu"

## Scenario: La page de signalement/declaration s'affiche
##  Given l'usager est sur le formulaire de signalement
##  Then la page de signalement s'affiche
##  * les differents champs du formulaire sont visibles
##  * l'etat est selectionne par defaut
## * le partenaire est selectionne par defaut

## Scenario: Remplir les champs et valider le formulaire
##  Given l'usager est sur le formulaire de signalement
##  When l'usager remplit tous les champs du formulaire
##  Then le bouton de validation en fin de page est cliquable
##  * l'usager valide le formulaire

## Scenario: Choisir une categorie et une sous-categorie d'objet
##  Given l'usager est sur le formulaire de signalement
##  When l'usager selectionne une categorie d'objet
##  Then la liste des sous-categories associees s'affiche
##  * l'usager selectionne une sous-categorie d'objet

## Scenario: S'assurer que les champs obligatoires soient bien contraignants
## Given l'usager est sur le formulaire de signalement
##  When l'usager laisse un champ obligatoire vide
##  * l'usager clique sur le bouton de validation
##  Then le formulaire n'est pas valide
##  * un message d'erreur s'affiche sur le champ obligatoire

## Scenario: Ajouter une question d'authentification a la fin du formulaire
##  Given l'usager est sur le formulaire de signalement
##  When l'usager renseigne les informations de l'objet
##  Then des questions d'authentification predefinies sont proposees selon l'objet
##  * l'usager peut ajouter une question libre

## Scenario: Valider le formulaire
##  Given l'usager a rempli le formulaire de signalement
##  When l'usager soumet le formulaire de signalement
##  Then l'usager est redirige vers la page de connexion ou de creation de compte

## Scenario: Creer un compte
##  Given l'usager est sur la page de creation de compte
##  When l'usager saisit les informations necessaires a la creation de compte
##  Then les champs obligatoires sont bien remplis

## Scenario: Se connecter
##  Given l'usager est sur la page de connexion
##  * l'usager possede deja un compte
##  When l'usager saisit ses identifiants de connexion
##  Then les informations de connexion sont bien renseignees

## Scenario: Valider le formulaire de connexion/de creation de compte
##  Given l'usager est sur la page de connexion ou de creation de compte
##  When l'usager coche la case "conditions"
##  * l'usager coche la case "news"
##  Then l'usager valide la page
##  * la connexion ou la creation de compte est confirmee

## Scenario: Affichage de la page d'accueil de l'espace usager
##  Given l'usager s'est connecte ou a cree son compte
##  Then la page d'accueil de l'espace usager s'affiche correctement

## Scenario: Message apparait pour verifier le compte usager
##  Given l'usager arrive sur son espace usager
## Then un mail de verification de compte est envoye
##  * un message s'affiche pour verifier le compte usager
##  * l'usager peut renvoyer le mail via la pop up

## Scenario: La page propose de signaler un objet, de voir mes objets 
##  Given l'usager est sur son espace usager
##  Then la page s'affiche correctement
##  * l'usager peut acceder a "signaler un objet"
##  * l'usager peut acceder a "mes objets"

## Scenario: Mes objets permet de suivre l'etat de mon objet perdu
##  Given l'usager est sur la page "mes objets"
##  Then l'usager peut suivre l'etat de son objet
##  * l'etat "trouve" est visible
##  * l'etat "choix de restitution" est visible
##  * l'etat "paiement" est visible
##  * l'etat "restitution" est visible

## Scenario: Possibilite de declarer son objet comme "retrouve" ou de le supprimer a tout moment
##  Given l'usager est sur la page "mes objets"
##  When l'usager clique sur "declarer comme retrouve"
##  Then l'objet est marque comme retrouve
##  When l'usager clique sur "supprimer l'annonce"
##  Then l'annonce est supprimee de l'espace usager

## Scenario: Un mail est envoye a chaque etape de suivi de l'objet perdu
##  Given l'objet perdu de l'usager change d'etape
##  Then un mail de suivi est envoye a l'usager
##  * le suivi est visible sur la plateforme