@priseRdvCafFrAffichage 
Feature: Le parcours de prise de RDV caf.fr: Motif

    Scenario: Affichage du parcours de prise de RDV
        Given L'utilisateur ouvre le lien du prise de rendez-vous
        Then Le parcours de prise de RDV s'affiche correctement à l'écran dans un délai acceptable

    Scenario: Selection du motif/sous-motif pour le rendez-vous
        Given La page sélection de motif du parcours rendez-vous est ouvert
            * L'utilisateur choisit le motif de rendez-vous: "Enfant"
            * L'utilisateur choisit le sous-motif de rendez-vous: "J'attends / J'accueille un enfant"
        When Il clique sur le bouton 'Continuer' de la page de sélection du motif
        Then Il est redirigé vers la page suivante avec le titre "Choisir votre créneau"
