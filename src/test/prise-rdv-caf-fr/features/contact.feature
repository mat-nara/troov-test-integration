@priseRdvCafFrContact 
Feature: Le parcours de prise de RDV caf.fr: Contact

    Background:
        Given La page de contact est ouverte

    Scenario: L'écran contact s'affiche correctement
        Then Le titre "Confirmer vos coordonnées :" s'affiche
    
    Scenario: Saisie de l'Email et du Téléphone : Passage à l'étape suivante  
        Given L'utilisateur saisit un email et un numéro de téléphone  
            * L'utilisateur choisit un mode de contact  
        When L'utilisateur clique sur le bouton "Valider" sur la page de contact  
        Then L'utilisateur est redirigé vers l'écran de confirmation et le message "Votre rendez-vous sur site est confirmé" s'affiche  
   
    Scenario: Saisie d'un email au mauvais format : Affichage d'un message d'erreur  
        Given L'utilisateur saisit un email au format incorrect
            * L'utilisateur choisit un mode de contact  
        When L'utilisateur clique sur le bouton "Valider" sur la page de contact 
        Then Un message d'erreur lié à l'email s'affiche  
    
    Scenario: Saisie d'un téléphone au mauvais format : Affichage d'un message d'erreur  
        Given L'utilisateur saisit un numéro de téléphone au format incorrect
            * L'utilisateur choisit un mode de contact  
        When L'utilisateur clique sur le bouton "Valider" sur la page de contact 
        Then Un message d'erreur lié au téléphone s'affiche  
    
    Scenario: Sélection du mode de contact  
        #When L'utilisateur sélectionne un mode de contact  
        Then Le mode de contact est défini correctement et les boutons de sélection sont cliquables  

    Scenario: Validation – Passage à l’étape suivante  
        Given L'utilisateur saisit un email et un numéro de téléphone  
            * L'utilisateur choisit un mode de contact  
        When L'utilisateur clique sur le bouton "Valider" sur la page de contact 
        Then L'utilisateur est redirigé vers l'écran de confirmation et le message "Votre rendez-vous sur site est confirmé" s'affiche 