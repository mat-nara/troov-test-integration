@AccessProfileUtilisateurAcceuil
Feature: Vérification des accès: Profile utiliateur acceuil 

    Background:
        Given L'utilisateur est connecté à l'application Troov
           
    Scenario: Prise et gestion de rendez-vous usagers
        When L'utilisateur clique sur Calendrier
        Then La page "Calendrier" est accessible
           * Le bouton "Ajouter un RDV" est cliquable
        When L'utilisateur crée un rendez-vous 
        Then Le rendez-vous est créé avec succès et visible dans le calendrier

    Scenario: Accès a la File d'attente
        When L'utilisateur clique sur File d'attente
        Then La page "File d'attente" est accessible
           * Le bouton "Signaler une arrivee" est cliquable
        When L'utilisateur crée un signalement d'arrivée sans rendez-vous
        Then Le signalement d'arrivée est créé avec succès et visible dans la file d'attente sur la colone "attente sans RDV"

    Scenario: Impossibilité à l'accès du pilotage de l’activité en temps réel
        When L'utilisateur clique sur "Statistiques"
        Then Absence du bouton "Pilotage file d'attente" 

    Scenario: Impossibilité à l'accès à l'onglet "Paramètres"
        Then Le boutton "Paramètres" n'est pas visible dans le menu de gauche

    Scenario: Vérifier l'accès aux statistiques individuelles de l'agent
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques RDV"
        Then La page "Statistiques RDV" est accessible
        
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques file d'attente"
        Then La page "Statistiques file d'attente" est accessible
    

