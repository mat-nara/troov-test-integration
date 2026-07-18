@ajoutRdvAgentViaTroovRdv 
Feature: Prise d'un RDV par un agent via Troov RDV

##    Scenario: Connexion à l'application Troov RDV  
##        Given L'utilisateur est un usager connu du SI  
##        When L'utilisateur clique sur la connexion SSO  
##        Then L'utilisateur est connecté à l'application Troov RDV  
##
##    Scenario: Connexion à Troov RDV sans SSO en environnement Recette
##        Given L'utilisateur est sur la page de connexion
##        When Il entre ses identifiants et clique sur "Se connecter"
##        Then Il accède à l'application Troov RDV
##
    Scenario: Bouton Ajout d'un rendez-vous  
        Given L'utilisateur est connecté à Troov RDV et le menu calendrier est ouvert
        When L'utilisateur clique sur le bouton "Ajouter un RDV"  
        Then Une fenêtre "Ajouter un RDV" s'ouvre  

    Scenario Outline: Sélection d'une date et ajout d'un RDV
        Given L'utilisateur est connecté à Troov RDV et le menu calendrier est ouvert
        When L'utilisateur sélectionne une date "<date>" dans le planning
        Then Une fenêtre "Ajouter un RDV" s'ouvre avec la date choisi pré-séléctionné

    Examples:
        | date              |
        | Aujourd'hui       |
        | Hier ou Demain    |

    Scenario: Sélection des détails du rendez-vous  
        Given La fenêtre "Ajouter un RDV" est ouverte  
        Then L'utilisateur peut choisir un service  
           * L'utilisateur peut sélectionner un mode de RDV
           * L'utilisateur peut choisit la date et l'heure du RDV  

    Scenario: Recherche d'un usager connu et inconnu du SI  
        Given Un utilisateur a été créé lors d'une prise de rendez-vous précédente  
            * La fenêtre "Ajouter un RDV" est ouverte
        When L'utilisateur recherche un usager par son nom dans le SI Cnaf
        Then L'utilisateur est trouvé 
        When L'utilisateur effectue une recherche par nom pour un usager inexistant dans le SI Cnaf  
        Then Aucun utilisateur n'est trouvé     

    Scenario: Ajout de notes internes à un rendez-vous
        When L'utilisateur crée un rendez-vous et y ajoute des notes internes
        Then Les notes internes sont bien enregistrées dans la fiche du rendez-vous

    Scenario: Confirmation du rendez-vous  
        Given L'utilisateur a renseigné toutes les informations du RDV  
        When L'utilisateur clique sur "Bloquer ce créneau"  
        Then Le rendez-vous est confirmé  

    Scenario: Vérification de l'ajout d'un RDV dans l'agenda de la Caf  
        Given Un rendez-vous avec un guichet spécifique est confirmé  
        When L'utilisateur consulte l'agenda de la Caf à la date et à l'heure sélectionnées  
        Then Le rendez-vous est bien présent sur le guichet sélectionné  

    Scenario: Vérification de l'ajout d'un RDV dans l'agenda de la Caf avec un guichet attribué automatiquement 
        Given Un rendez-vous a été confirmé  
        When L'utilisateur consulte l'agenda de la Caf à la date et à l'heure sélectionnées  
        Then Le rendez-vous est bien attribué à un guichet automatiquement  

    Scenario: Vérification de l'historique du rendez-vous dans Troov  
        Given Un rendez-vous a été créé  
        When L'utilisateur clique sur le RDV et ouvre "Historique"  
        And L'utilisateur sélectionne "Rendez-vous pris"  
        Then Les informations du RDV correspondent à celles saisies  

    Scenario: Fermeture de l'application Troov RDV  
        Given L'application Troov RDV est ouverte  
        When L'utilisateur ferme l'onglet du navigateur  
        Then L'application Troov RDV doit être complètement fermée  

##    Scenario: Vérification de l'ajout du RDV dans l'agenda de l'usager sur Caf.fr  
##        Given Un rendez-vous est confirmé  
##        When L'utilisateur ouvre le compte de l'usager sur Caf.fr  
##        And L'utilisateur clique sur "Consulter mes RDVs"  
##        Then Le RDV est bien ajouté dans l'agenda de l'usager  
##
##    Scenario: Vérification du RDV dans la fiche V360  
##        Given Un rendez-vous est confirmé  
##        When L'utilisateur ouvre la fiche V360 de l'usager  
##        And L'utilisateur clique sur le bouton d'affichage du RDV  
##        Then Le RDV est affiché avec les informations suivantes :  
##            | Personne | 
##            | Date du rendez-vous | 
##            | Durée | 
##            | Motif | 
##            | Site d'accueil | 
##            | Type |  
##        And Un bouton "Gérer le rendez-vous" est disponible  
##
##    Scenario: Consultation de l'historique des interactions  
##        Given L'utilisateur est connecté à Troov RDV  
##        When L'utilisateur clique sur le bouton "Interactions"  
##        Then La page des interactions s'ouvre  
##
##    Scenario: Recherche d'une interaction RDV  
##        Given La page des interactions est ouverte  
##        When L'utilisateur recherche l'interaction RDV par date et heure  
##        Then L'interaction est affichée sous forme de bulle avec les informations suivantes :  
##            | Picto calendrier |
##            | RDV pris - "Motif du RDV" |
##            | Positionné |
##            | Date et heure du RDV |
##            | Date de l'interaction |
##
##    Scenario: Consultation des détails d'une interaction  
##        Given Une interaction RDV est affichée  
##        When L'utilisateur clique sur la bulle d'interaction  
##        Then Une pop-up s'ouvre avec les détails suivants :  
##            | Émetteur | 
##            | Caf de l'usager | 
##            | Interlocuteur | 
##            | Rôle dans le foyer | 
##            | Canal d'acquisition | 
##            | État |  
##            | Date du RDV | 
##            | Type de RDV | 
##            | Lieu du RDV | 
##            | Motif du RDV | 
##            | Commentaire |  
##
##    Scenario: Vérification de la réception de la confirmation par l'usager  
##        Given Un rendez-vous est confirmé  
##        When L'utilisateur vérifie les notifications envoyées  
##        Then L'usager a reçu un email ou un SMS de confirmation selon son mode de contact choisi  















