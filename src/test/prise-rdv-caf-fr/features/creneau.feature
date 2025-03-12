@priseRdvCafFrCreneau 
Feature: Le parcours de prise de RDV caf.fr: Créneau

    Background:
        Given La page de choix du créneau est ouverte

    Scenario: L'écran Créneau s'affiche correctement
        Then Le titre "Choisir votre créneau" s'affiche

    Scenario: Faire défiler les créneaux de RDVs  
        Then L'utilisateur peut effectue un défilement sur la liste des créneaux
   
   # Navigation date par flêche
    Scenario: Naviguer vers une date suivante via la flèche de navigation droite
        Given Nous avons une date et les créneaux correspondant avant le clique sur la flèche de navigation droite
        When L'utilisateur clique sur la flèche de navigation droite pour changer la date
        Then La date affichée est mise à jour en conséquence vers la date suivante

    Scenario: Naviguer vers une date précédente via la flèche de navigation gauche
        Given Nous avons une date et les créneaux correspondant avant le clique sur la flèche de navigation gauche 
        When L'utilisateur clique sur la flèche de navigation gauche pour changer la date
        Then La date affichée est mise à jour en conséquence vers la date précédente

   # Filtre par mode
    Scenario Outline: Filtrer les créneaux par mode
        Given L'utilisateur clique sur l'icône de filtre
        And L'utilisateur sélectionne le mode "<mode>"
        And L'utilisateur clique sur le bouton "Confirmer"
        Then Seuls les créneaux en mode "<mode>" sont affichés, les créneaux des autres modes ne sont pas affichés

    Examples:
        | mode                           |
        | Rendez-vous téléphonique       |
        | Rendez-vous en visioconférence |
        | Rendez-vous sur site           |
       
   
    Scenario Outline: Filtrer les créneaux par site
        Given L'utilisateur clique sur l'icône de filtre
        And L'utilisateur sélectionne le mode "Rendez-vous sur site"
        And L'utilisateur sélectionne le critère "<critère>"
        And L'utilisateur clique sur le bouton "Confirmer"
        Then Seuls les créneaux correspondant au critère "<critère>" sont affichés, les créneaux des autres modes ne sont pas affichés

    Examples:
        | critère                        |
        | Sélection de tous les sites    |
        | Sélection multiple             |
        | Sélection d'un site            |
   

    # Sélection de rendez-vous
    Scenario: Sélectionner un rendez-vous et passer à l'écran suivant
        When L'utilisateur sélectionne un rendez-vous disponible
        And L'utilisateur clique sur le bouton "Sélectionner"
        Then L'utilisateur est redirigé vers l'écran de l'ajout du contact: "Confirmer vos coordonnées" s'affiche