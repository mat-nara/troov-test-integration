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

  Scenario: Vérification de la formulaire de déclaration d'un objet perdu: sélection de la date 
        Given L'utilisateur est sur la page de déclaration d'objet perdu
        When L'utilisateur sélectionne la date aujourd'hui dans le calendrier
        Then La date d'aujourd'hui sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu

        When L'utilisateur sélectionne la date d'hier dans le calendrier
        Then La date d'hier sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu

         When L'utilisateur sélectionne la date d'avant-hier dans le calendrier
        Then La date d'avant-hier est correctement affichée dans le formulaire de déclaration d'objet perdu

        When L'utilisateur sélectionne une date dans le calendrier
        Then La date sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu

    Scenario: Vérification de la formulaire de déclaration d'un objet perdu: De l'endroit de la perte 
        Given L'utilisateur est sur la page de déclaration d'objet perdu

        When L'utilisateur saisie une adresse "Paris"
       Then Une suggestion s'affiche et cliquable
      When L'utilisateur sélectionne la suggestion "Paris, France"
       Then L'adresse "Paris, France" est correctement sélectionnée dans le formulaire de déclaration d'objet perdu

       When L'utilisateur clique sur Transport    
          * L'utilisateur sélectionne un réseau de transport "Agence des Mobilités Taneo"
         * L'ultisateur sélectionne une type de transport "Bus" 
         * L'ulisateur sélectionne une ligne de transport "T1"
       Then L'adresse "Agence des Mobilités Taneo, Bus, T1" est correctement sélectionnée dans le formulaire de déclaration d'objet perdu

   Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Catégorie et sous-catégorie
       Given L'utilisateur est sur la page de déclaration d'objet perdu

       When L'utilisateur sélectionne la catégorie "Portefeuille, CB & argent" dans le formulaire de déclaration d'objet perdu
       Then Les sous-catégories "Carte bleue - Portefeuille, Porte-monnaie - Argent, billet, monnaie" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

       When L'utilisateur sélectionne la catégorie "Papiers et documents officiels" dans le formulaire de déclaration d'objet perdu
       Then Les sous-catégories "Carte d'identité, Passeport, Permis de conduire" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

       When L'utilisateur sélectionne la catégorie "Sacs & Bagages" dans le formulaire de déclaration d'objet perdu
       Then Les sous-catégories "Sac, Petite valise cabine (< 10kg), Sac à main" correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu

    Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Champ spécifique pour la catégorie et sous-catégorie
       Given L'utilisateur est sur la page de déclaration d'objet perdu
       When L'utilisateur sélectionne la catégorie "Sacs & Bagages", puis "Sac" dans le formulaire de déclaration d'objet perdu
       Then Les champs associé a la catégorie "Marque, Couleur de l'objet , Modèle" s'affiche

        Given L'utilisateur clique sur retour dans la catégorie

        When L'utilisateur sélectionne la catégorie "Papiers et documents officiels", puis "Carte d'identité" dans le formulaire de déclaration d'objet perdu
       Then Les champs associé a la catégorie "Nationalité , Date de naissance" s'affiche

  Scenario: Vérification de la formulaire de déclaration d'un objet perdu: Contreinte de validation des champs
      Given L'utilisateur est sur la page de déclaration d'objet perdu
           * L'utilisateur sélectionne la catégorie "Sacs & Bagages", puis "Sac" dans le formulaire de déclaration d'objet perdu
       When L'utilisateur clique sur le bouton "Ajouter mon annonce" sans remplir les champs obligatoires
       Then Les messages d'erreur de validation des champs obligatoires s'affichent correctement dans le formulaire de déclaration d'objet perdu

       When L'utilisateur remplit les champs obligatoires avec des valeurs invalides et clique sur le bouton "Ajouter mon annonce"
       Then On passe a la page d'inscription ou de connexion

