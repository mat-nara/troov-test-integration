Feature: Gestion des signalements d objets perdus et espace usager

  Background:
    Given l usager est sur le formulaire de signalement

  Scenario: Signalement complet d un objet perdu par un usager anonyme
    When l usager remplit tous les champs du formulaire
    * l usager clique sur le bouton de validation
    Then la page de signalement s affiche
    * les differents champs du formulaire sont visibles
    * l etat est selectionne par defaut
    * le partenaire est selectionne par defaut
    * le bouton de validation en fin de page est cliquable

  Scenario: Selection de la categorie et de la sous categorie d un objet
    When l usager selectionne une categorie d objet
    Then la liste des sous-categories associees s affiche
    * l usager selectionne une sous-categorie d objet

  Scenario: Soumission du formulaire avec un champ obligatoire manquant
    When l usager laisse un champ obligatoire vide
    * l usager clique sur le bouton de validation
    Then le formulaire n est pas valide
    * un message d erreur s affiche sur le champ obligatoire


  Scenario: Saisie des questions d authentification de l objet
    When l usager renseigne les informations de l objet
    Then des questions d authentification predefinies sont proposees selon l objet
    * l usager peut ajouter une question libre

  Scenario: Creation de compte usager suite au signalement
    Given l usager est sur la page de connexion ou de creation de compte
    When l usager saisit les informations necessaires a la creation de compte
    * l usager coche la case "conditions"
    * l usager coche la case "news"
    Then les champs obligatoires sont bien remplis
    * l usager valide la page
    * la connexion ou la creation de compte est confirmee
    * un mail de verification de compte est envoye
    * un message s affiche pour verifier le compte usager
    * l usager peut renvoyer le mail via la pop up

  Scenario: Connexion d un usager existant
    Given l usager possede deja un compte
    * l usager est sur la page de connexion
    When l usager saisit ses identifiants de connexion
    Then les informations de connexion sont bien renseignees
    * la connexion ou la creation de compte est confirmee

  Scenario: Navigation au sein de l espace usager
    Given l usager est sur son espace usager
    Then la page d accueil de l espace usager s affiche correctement
    * la page s affiche correctement
    * l usager peut acceder a "signaler un objet"
    * l usager peut acceder a "mes objets"