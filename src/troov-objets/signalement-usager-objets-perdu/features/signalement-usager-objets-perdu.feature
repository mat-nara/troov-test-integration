Feature: Gestion des services : Paramètres / Mes calendriers / Services (Motifs)

##  Background:
##    Given L'utilisateur est connecté avec un profil Admin Caf ou CDR
##
##   Scenario: Accéder à la page partenaire sur laquelle l'usager se connecte
##      When L'utilisateur navigue vers la page partenaire 
##      Then La page partenaire s'affiche correctement et l'usager peut déclarer un objet trouvé
##
##    Scenario: Affichage de la page Partenaire sur différente navigateur 
##        When L'utilisateur navigue vers la page partenaire sur chrome
##        Then La page présente sa fonctionnalité phare et est responsive, et permet de déclarer un OP ou un OIC
##
##        When L'utilisateur navigue vers la page partenaire sur firefox
##        Then La page présente sa fonctionnalité phare et est responsive, et permet de déclarer un OP ou un OIC
##
##        When L'utilisateur navigue vers la page partenaire sur edge
##        Then La page présente sa fonctionnalité phare et est responsive, et permet de déclarer un OP ou un OIC
##
##        When L'utilisateur navigue vers la page partenaire sur safari
##        Then La page présente sa fonctionnalité phare et est responsive, et permet de déclarer un OP ou un OIC
##
##    ## Déclaration d'un objet perdu
    Scenario: Vérification de la déclaration d'un objet perdu
        Given L'utilisateur est sur la page partenaire
        When L'utilisateur clique sur le bouton "J'ai perdu"
        Then La page de déclaration d'objet perdu s'affiche correctement et l'usager peut déclarer un objet perdu
##
##  Scenario: Vérification de la formulaire de déclaration d'un objet perdu: sélection de la date 
##        Given L'utilisateur est sur la page de déclaration d'objet perdu
##        When L'utilisateur sélectionne la date aujourd'hui dans le calendrier
##        Then La date d'aujourd'hui sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu
##
##        When L'utilisateur sélectionne la date d'hier dans le calendrier
##        Then La date d'hier sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu
##
##         When L'utilisateur sélectionne la date d'avant-hier dans le calendrier
##        Then La date d'avant-hier est correctement affichée dans le formulaire de déclaration d'objet perdu
##
##        When L'utilisateur sélectionne une date dans le calendrier
##        Then La date sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu
##
##    Scenario: Vérification de la formulaire de déclaration d'un objet perdu: De l'endroit de la perte 
##        Given L'utilisateur est sur la page de déclaration d'objet perdu
##
##        When L'utilisateur saisie une adresse "Paris"
##       Then Une suggestion s'affiche et cliquable
##       When L'utilisateur sélectionne la suggestion "Paris, France"
##       Then L'adresse "Paris, France" est correctement sélectionnée dans le formulaire de déclaration d'objet perdu
##
##       When L'utilisateur clique sur Transport    
##          * L'utilisateur sélectionne un réseau de transport "Agence des Mobilités Taneo"
##         * L'ultisateur sélectionne une type de transport "Bus" 
##         * L'ulisateur sélectionne une ligne de transport "T1"
##       Then L'adresse "Agence des Mobilités Taneo, Bus, T1" est correctement sélectionnée dans le formulaire de déclaration d'objet perdu
##
##   Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Catégorie et sous-catégorie
##       Given L'utilisateur est sur la page de déclaration d'objet perdu

##       When L'utilisateur sélectionne la catégorie "Portefeuille, CB & argent" dans le formulaire de déclaration d'objet perdu
##       Then Les sous-catégories "Carte bleue - Portefeuille, Porte-monnaie - Argent, billet, monnaie" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

##       When L'utilisateur sélectionne la catégorie "Papiers et documents officiels" dans le formulaire de déclaration d'objet perdu
##       Then Les sous-catégories "Carte d'identité, Passeport, Permis de conduire" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

##       When L'utilisateur sélectionne la catégorie "Sacs & Bagages" dans le formulaire de déclaration d'objet perdu
##       Then Les sous-catégories "Sac, Petite valise cabine (< 10kg), Sac à main" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

##    Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Champ spécifique pour la catégorie et sous-catégorie
##       Given L'utilisateur est sur la page de déclaration d'objet perdu
##       When L'utilisateur sélectionne la catégorie "Sacs & Bagages", puis "Sac" dans le formulaire de déclaration d'objet perdu
##       Then Les champs associé a la catégorie "Marque, Couleur de l'objet , Modèle" s'affiche

##        Given L'utilisateur clique sur retour dans la catégorie

##        When L'utilisateur sélectionne la catégorie "Papiers et documents officiels", puis "Carte d'identité" dans le formulaire de déclaration d'objet perdu
##       Then Les champs associé a la catégorie "Nationalité , Date de naissance" s'affiche
##
  Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Contreinte de validation des champs
      Given L'utilisateur est sur la page de déclaration d'objet perdu
           * L'utilisateur sélectionne la catégorie "Sacs & Bagages", puis "Sac" dans le formulaire de déclaration d'objet perdu
##       When L'utilisateur clique sur le bouton "Ajouter mon annonce" sans remplir les champs obligatoires
##       Then Les messages d'erreur de validation des champs obligatoires s'affichent correctement dans le formulaire de déclaration d'objet perdu

       When L'utilisateur remplit les champs obligatoires avec des valeurs invalides et clique sur le bouton "Ajouter mon annonce"
       Then On passe a la page d'inscription ou de connexion

Feature: Création de compte utilisateur

  Scénario: Tentative de création de compte avec un champ obligatoire manquant
    Given l'utilisateur est sur la page de création de compte
    When l'utilisateur saisit les informations en laissant un champ obligatoire vide (Email)
      * l'utilisateur valide le formulaire sur le bouton "Accepter"
    Then un message d'erreur indique que le champ est requis
      * le compte n'est pas créé

      Scenario: Création de compte sans cocher la case newsletter
    Given l'utilisateur est sur la page de création de compte
    When l'utilisateur saisit toutes les informations obligatoires
      * l'utilisateur ne coche pas la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
      * l'utilisateur coche la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialité"
      * l'utilisateur saisit le texte affiché dans le champ Captcha "Je ne suis pas un robot 🤖"
      * l'utilisateur valide le formulaire sur le bouton "Accepter"
    Then le message d'eereur s'affiche "L'ajout de votre compte a échoué. Veuillez vérifier la saisie de vos champs"

  Scenario: Tentative de création de compte sans accepter les conditions d'utilisation
    Given l'utilisateur est sur la page de création de compte
    When l'utilisateur saisit toutes les informations obligatoires
      * l'utilisateur coche la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
      * l'utilisateur ne coche pas la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialité"
      * l'utilisateur saisit le texte affiché dans le champ Captcha "Je ne suis pas un robot 🤖"
      * l'utilisateur valide le formulaire sur le bouton "Accepter"
    Then le message d'erreur s'affiche "le texte ne correspond pas au captcha"

  Scenario: Tentative de création de compte sans remplir le Captcha
    Given l'utilisateur est sur la page de création de compte
    When l'utilisateur saisit toutes les informations obligatoires
      * l'utilisateur coche la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
      * l'utilisateur coche la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialité"
      * l'utilisateur ne remplit pas le champ Captcha "Je ne suis pas un robot 🤖"
      * l'utilisateur valide le formulaire sur le bouton "Accepter"
    Then un message d'erreur indique que le champ est requis

  Scénario: Création de compte avec tous les champs obligatoires renseignés
    Given l'utilisateur est sur la page de création de compte
    When l'utilisateur saisit les informations obligatoires (Civilité, Nom, Prénom, Email, Téléphone, Mot de passe)
      * l'utilisateur coche la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
      * l'utilisateur coche la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialité"
      * l'utilisateur saisit le texte affiché dans le champ Captcha "Je ne suis pas un robot 🤖"
      * l'utilisateur valide le formulaire sur le bouton "Accepter"
    Then le compte utilisateur est créé
     * Arrivé sur la page du tableau de bord, l'utilisateur voit s'afficher l'objet qu'il a déclaré précédemment

Feature: Connexion utilisateur

  Scénario: Tentative de connexion 
    Given l'utilisateur est sur la page de connexion
    When l'utilisateur saisit un email ou un mot de passe incorrect
         * l'utilisateur valide le formulaire sur bouton "Connexion"
    Then  un message d'erreur m'indique "Erreur de connexion : Mot de passe ou nom d'utilisateur incorrect "
         *l'utilisateur reste sur la page de connexion

    When  L'utilisateur saisit un email et un mot de passe valides
        * l'utilisateur valide le formulaire sur bouton "Connexion"
    Then l'utilisateur  connecté à mon espace usager



## Feature: Vérification du compte usager
## ----------------------------------------------------

Feature: Vérification du compte usager

  Scénario: Affichage du message "Compte non vérifié" si le compte n'est pas encore validé
    Given l'utilisateur est connecté à son espace usager
      * l'utilisateur n'a pas encore vérifié son compte
    When l'utilisateur accède à la page "Accueil"
    Then une pop-up "Compte non vérifié" s'affiche en bas de la page
      * un bouton "Renvoyer l'email de confirmation" est disponible dans la pop-up

  Scénario: Renvoi de l'email de confirmation depuis la page d'accueil
    Given l'utilisateur est connecté à son espace usager
      * la pop-up "Compte non vérifié" est affichée
    When l'utilisateur clique sur le bouton "Renvoyer l'email de confirmation"
    Then un nouveau mail de vérification est envoyé à l'adresse email de l'utilisateur

  Scénario: Fermeture de la pop-up "Compte non vérifié"
    Given l'utilisateur est connecté à son espace usager
      * la pop-up "Compte non vérifié" est affichée
    When l'utilisateur clique sur la croix de fermeture de la pop-up
    Then la pop-up "Compte non vérifié" n'est plus visible sur la page
    


## Feature: Page d'accueil de l'espace usager
## ------------------------------------------------------------

Feature: Page d'accueil de l'espace usager

  Scénario: Affichage de la page d'accueil après connexion
    Given l'utilisateur est connecté à son espace usager
    When l'utilisateur accède à la page "Accueil"
    Then la page d'accueil s'affiche correctement
      * le menu latéral affiche les liens "Accueil", "Mes objets" et "Troov"
      * le titre "La gestion intelligente de mes objets perdus et trouvés" est visible

  Scénario: Affichage du dernier objet ajouté sur la page d'accueil
    Given l'utilisateur est connecté à son espace usager
      * l'utilisateur a déclaré au moins un objet perdu
    When l'utilisateur accède à la page "Accueil"
    Then le bloc "Mon dernier objet ajouté" s'affiche
      * la référence de l'objet est visible (ex: "Ref. P263098369")
      * la catégorie, la date et le lieu de l'objet sont affichés
      * le nom du déclarant est affiché
      * les boutons "Aperçu rapide" et "Objet retrouvé ?" sont disponibles

  Scénario: Affichage du bouton "Signaler un objet" sur la page d'accueil
    Given l'utilisateur est connecté à son espace usager
    When l'utilisateur accède à la page "Accueil"
    Then le bouton "Signaler un objet" est visible en haut de la page

  Scénario: Accès au formulaire de déclaration via le bouton "Signaler un objet"
    Given l'utilisateur est sur la page "Accueil"
    When l'utilisateur clique sur le bouton "Signaler un objet"
    Then l'utilisateur est redirigé vers le formulaire de déclaration d'objet perdu ou trouvé

  Scénario: Accès à la page "Mes objets" depuis le menu latéral
    Given l'utilisateur est connecté à son espace usager
    When l'utilisateur clique sur le lien "Mes objets" dans le menu latéral
    Then l'utilisateur est redirigé vers la page listant tous ses objets déclarés


## Feature: Suivi de l'état de l'objet perdu depuis la page "Mes objets"
##------------------------------------------------------------------------

Feature: Suivi de l'état de l'objet perdu depuis la page "Mes objets"

  Scénario: Accès à la page "Mes objets"
    Given l'utilisateur est connecté à son espace usager
    When l'utilisateur clique sur le lien "Mes objets" dans le menu latéral
    Then la liste de tous les objets déclarés par l'utilisateur s'affiche

  Scénario: Suivi de l'étape "Annonce déposée"
    Given l'utilisateur a déclaré un objet perdu
      * l'objet vient d'être déclaré et n'a pas encore été trouvé
    When l'utilisateur consulte le détail de l'objet depuis la page "Mes objets"
    Then l'étape "Annonce déposée" est mise en évidence comme étape actuelle
      * les étapes suivantes ("Authentification en cours", "Authentification validée", "Restitution en cours", "Objet restitué") sont affichées en grisé

  Scénario: Suivi de l'étape "Authentification en cours"
    Given un objet correspondant à la déclaration de l'utilisateur a été trouvé
    When l'utilisateur consulte le détail de l'objet depuis la page "Mes objets"
    Then l'étape "Authentification en cours" est mise en évidence comme étape actuelle

  Scénario: Suivi de l'étape "Authentification validée"
    Given l'authentification de l'objet trouvé a été validée
    When l'utilisateur consulte le détail de l'objet depuis la page "Mes objets"
    Then l'étape "Authentification validée" est mise en évidence comme étape actuelle

  Scénario: Suivi de l'étape "Restitution en cours" (choix de restitution et paiement)
    Given l'utilisateur a choisi son mode de restitution
      * l'utilisateur a effectué le paiement lié à la restitution (si applicable)
    When l'utilisateur consulte le détail de l'objet depuis la page "Mes objets"
    Then l'étape "Restitution en cours" est mise en évidence comme étape actuelle

  Scénario: Suivi de l'étape finale "Objet restitué"
    Given l'objet a été restitué à l'utilisateur
    When l'utilisateur consulte le détail de l'objet depuis la page "Mes objets"
    Then l'étape "Objet restitué" est mise en évidence comme étape finale
      * toutes les étapes précédentes apparaissent comme validées


## Feature: Fiche détaillée de l'objet
## -----------------------------------------------------------------------
Feature: Fiche détaillée de l'objet

  Scénario: Affichage de la fiche détaillée d'un objet
    Given l'utilisateur est connecté à son espace usager
      * l'utilisateur a déclaré un objet perdu
    When l'utilisateur accède à la fiche de l'objet depuis "Mes objets"
    Then la fiche objet affiche le statut ("Perdu"), le type d'objet, le déclarant, la date de déclaration et la référence
      * le bouton "Les matchs potentiels" est visible

  Scénario: Consultation des matchs potentiels pour un objet perdu
    Given l'utilisateur est sur la fiche détaillée de son objet perdu
    When l'utilisateur clique sur le bouton "Les matchs potentiels"
    Then la liste des objets trouvés potentiellement correspondants s'affiche

  Scénario: Modification de l'annonce depuis la fiche objet
    Given l'utilisateur est sur la fiche détaillée de son objet perdu
    When l'utilisateur accède à la section "Modifier l'annonce"
    Then les champs suivants sont modifiables : État (Perdu/Trouvé), Où, Quand ?, Type, Marque

-
## Feature: Gestion de l'annonce (déclarer comme retrouvé ou supprimer)
## ----------------------------------------------------------------------
Feature: Gestion de l'annonce (déclarer comme retrouvé ou supprimer)

  Scénario: Ouverture de la confirmation pour marquer l'objet comme retrouvé
    Given l'utilisateur est connecté à son espace usager
      * l'utilisateur a une annonce active pour un objet perdu
    When l'utilisateur clique sur le bouton "Objet retrouvé ?"
    Then une pop-up "Confirmation objet retrouvé" s'affiche
      * le message "Voulez-vous vraiment marquer l'objet comme étant retrouvé ?" est visible
      * les boutons "Annuler" et "Objet rendu" sont disponibles

  Scénario: Confirmation de l'objet comme retrouvé
    Given la pop-up "Confirmation objet retrouvé" est affichée
    When l'utilisateur clique sur le bouton "Objet rendu"
    Then le statut de l'annonce passe à "Trouvé"
      * la pop-up se ferme

  Scénario: Annulation de la déclaration "objet retrouvé"
    Given la pop-up "Confirmation objet retrouvé" est affichée
    When l'utilisateur clique sur le bouton "Annuler"
    Then la pop-up se ferme
      * le statut de l'annonce reste inchangé ("Perdu")

  Scénario: Changement d'état de l'objet via la section "Modifier l'annonce"
    Given l'utilisateur est sur la fiche détaillée de son objet perdu
      * la section "Modifier l'annonce" est ouverte
    When l'utilisateur bascule le toggle "État" de "Perdu" vers "Trouvé"
      * l'utilisateur valide les modifications
    Then le statut de l'objet est mis à jour en "Trouvé"

  Scénario: Suppression d'une annonce à tout moment
    # ⚠️ Non confirmé visuellement sur les captures fournies — à valider avec une capture du bouton/de l'action réelle
    Given l'utilisateur est connecté à son espace usager
      * l'utilisateur a une annonce active
    When l'utilisateur clique sur l'action "Supprimer l'annonce" depuis son espace usager
    Then l'annonce est supprimée
      * l'annonce n'apparaît plus dans la page "Mes objets"


## Feature: Notifications par email à chaque étape de suivi de l'objet perdu
## --------------------------------------------------------------------------

Feature: Notifications par email à chaque étape de suivi de l'objet perdu

  Scénario: Email envoyé lors du dépôt de l'annonce
    Given l'utilisateur vient de déclarer un objet perdu
    Then l'étape "Annonce déposée" est visible sur la plateforme
      * un mail informant l'utilisateur du dépôt de son annonce est envoyé à son adresse email

  Scénario: Email envoyé lors du passage à "Authentification en cours"
    Given un objet correspondant à la déclaration de l'utilisateur a été trouvé
    Then l'étape "Authentification en cours" est visible sur la plateforme
      * un mail informant l'utilisateur de ce changement de statut est envoyé à son adresse email

  Scénario: Email envoyé lors du passage à "Authentification validée"
    Given l'authentification de l'objet trouvé vient d'être validée
    Then l'étape "Authentification validée" est visible sur la plateforme
      * un mail informant l'utilisateur de la validation est envoyé à son adresse email

  Scénario: Email envoyé lors du passage à "Restitution en cours"
    Given l'utilisateur a choisi son mode de restitution (et effectué le paiement si nécessaire)
    Then l'étape "Restitution en cours" est visible sur la plateforme
      * un mail informant l'utilisateur du début de la restitution est envoyé à son adresse email

  Scénario: Email envoyé lors de la restitution finale de l'objet
    Given l'objet vient d'être restitué à l'utilisateur
    Then l'étape "Objet restitué" est visible sur la plateforme
      * un mail confirmant la restitution est envoyé à l'adresse email de l'utilisateur



      
