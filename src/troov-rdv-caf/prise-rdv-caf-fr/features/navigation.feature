@priseRdvCafFrNavigation 
Feature: Le parcours de prise de RDV caf.fr: Navigation

    # Contact
    Scenario: À partir de Contact, l'utilisateur peut revenir à l'écran de choix du créneau via la barre d'étape  
        Given La page de contact est ouverte  
        When L'utilisateur clique sur "Créneau" dans la barre d'étape  
        Then L'utilisateur est redirigé vers l'écran de choix du créneau et le message "Choisir votre créneau" s'affiche  
    
    Scenario: À partir de Contact, l'utilisateur peut revenir à l'écran de choix du créneau via le bouton "Précédent"  
        Given La page de contact est ouverte  
        When L'utilisateur clique sur le bouton "Précédent"  
        Then L'utilisateur est redirigé vers l'écran de choix du créneau et le message "Choisir votre créneau" s'affiche  

    Scenario: À partir de Contact, l'utilisateur peut revenir à l'écran de choix du motif via la barre d'étape  
        Given La page de contact est ouverte  
        When L'utilisateur clique sur "Motif" dans la barre d'étape  
        Then L'utilisateur est redirigé vers l'écran de choix du motif et le message "Quel est le motif du rendez-vous ?" s'affiche  
    
    # Créneau
    Scenario: À partir de l'écran de choix du créneau, l'utilisateur peut revenir à l'écran de choix du motif via la barre d'étape  
        Given L'écran de choix du créneau est ouvert  
        When L'utilisateur clique sur "Motif" dans la barre d'étape  
        Then L'utilisateur est redirigé vers l'écran de choix du motif et le message "Quel est le motif du rendez-vous ?" s'affiche  
    
    Scenario: À partir de l'écran de choix du créneau, l'utilisateur peut revenir à l'écran de choix du motif via le bouton "Précédent"  
        Given L'écran de choix du créneau est ouvert  
        When L'utilisateur clique sur le bouton "Précédent"  
        Then L'utilisateur est redirigé vers l'écran de choix du motif et le message "Quel est le motif du rendez-vous ?" s'affiche  

    Scenario: À partir de l'écran de choix du créneau, l'utilisateur peut revenir à l'écran de choix du motif via le bouton "Modifier le motif"  
        Given L'écran de choix du créneau est ouvert  
        When L'utilisateur clique sur le bouton "Modifier le motif"  
        Then L'utilisateur est redirigé vers l'écran de choix du motif et le message "Quel est le motif du rendez-vous ?" s'affiche