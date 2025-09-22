@CalendrierTotalFiltre 
Feature: Calendrier - Total - Filtre sur la fenetre Total

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Téléchargement des exports
        Given L'utilisateur est sur la page calendrier
            # * Quatre rendez-vous de différente status ont été créés 
        When L'utilisateur clique sur "Total"
        Then La fenetre Total s'affiche

        When L'utilisateur fitre par prénom uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce prénom s'affiche 
        Given Le filtre sur le prenom est réinitialisé
        
        When L'utilisateur saisie un nom de famille
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce nom de famille s'affiche  
        Given Le filtre sur le nom de famille est réinitialisé

        When L'utilisateur applique un filtre sur "RDV pris par" en "Agent" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre "RDV pris par" en "Agent" s'affiche  
        Given Le filtre sur "RDV pris par" est réinitialisé 

        When L'utilisateur applique un filtre sur "RDV pris par" en "Usager" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre "RDV pris par" en "Usager" s'affiche  
        Given Le filtre sur "RDV pris par" est réinitialisé

        Given L'utilisateur remet le filtre sur "RDV pris par" en "Sélectionner tout"
        When Il clique sur "Rechercher" 
           * L'utilisateur clique sur l'icone d'envoie d'email sur un rendez-vous de la liste
        Then Une fenetre d'envoie d'email s'affiche et le bouton d'envoie est cliquable
        Given L'utilisateur ferme la fenetre d'envoie d'email

        When L'utilisateur clique sur l'icone de suppression sur un rendez-vous de la liste
        Then Une fenetre de confirmation de la suppression s'affiche et le bouton d'annulation du rendez-vous est cliquable
        Given L'utilisateur ferme la fenetre de confirmation de la suppression
 


#        # Filtre par status
#        Scenario Outline: Filtre par rapport au status du rendez-vous
#            When L'utilisateur applique un filtre sur "statut RDV" en "<statutRDV>" uniquement
#               * Il clique sur "Rechercher"
#            Then Seule les rendez-vous associé a ce filtre sur "statut RDV" en "<statutRDV>" s'affiche  
#            Given Le filtre sur "statut RDV" est réinitialisé
#
#        Examples:            
#            | statutRDV          |
#            | Non défini         |
#            | Pré confirmé       |
#            | Non pré-confirmé   |
#            | N'a pas répondu    |
#        
        When L'utilisateur applique un filtre sur "statut RDV" en "Non défini" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre sur "statut RDV" en "Non défini" s'affiche  
        Given Le filtre sur "statut RDV" est réinitialisé

        When L'utilisateur applique un filtre sur "statut RDV" en "Pré-confirmé" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre sur "statut RDV" en "Pré-confirmé" s'affiche  
        Given Le filtre sur "statut RDV" est réinitialisé

        When L'utilisateur applique un filtre sur "statut RDV" en "Non pré-confirmé" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre sur "statut RDV" en "Non pré-confirmé" s'affiche  
        Given Le filtre sur "statut RDV" est réinitialisé

        When L'utilisateur applique un filtre sur "statut RDV" en "N'a pas répondu" uniquement
           * Il clique sur "Rechercher"
        Then Seule les rendez-vous associé a ce filtre sur "statut RDV" en "N'a pas répondu" s'affiche  
        Given Le filtre sur "statut RDV" est réinitialisé
             * La fenetre Total est fermée

        When L'utilisateur clique sur un rendez-vous sur le calendrier
        Then Les information sur le rendez-vous sont visible
        When L'utilisateur clique sur historique
        Then Les information sur l'historique du rendez-vous avec plusieur onglet sont visible







