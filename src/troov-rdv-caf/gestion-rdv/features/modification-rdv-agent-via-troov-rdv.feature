@modificationRdvAgentViaTroovRdv 
Feature: Modification d'un RDV par un agent via Troov RDV

##    Scenario: Connexion à l'application Troov RDV  
##        Given L'utilisateur est un usager connu du SI  
##        When L'utilisateur clique sur la connexion SSO  
##        Then L'utilisateur est connecté à l'application Troov RDV  

    Scenario: Connexion à Troov RDV sans SSO en environnement Recette
        Given L'utilisateur est sur la page de connexion
        When Il entre ses identifiants et clique sur "Se connecter"
        Then Il accède à l'application Troov RDV
    

    # Calendrier (option 1)
    Scenario: Ouvrir l'agenda de la Caf pour lequel nous avons pris le RDV
        Given L'utilisateur est connecté à l'application Troov
        When Il clique sur "Calendrier"
        Then L'agenda s'affiche correctement

    Scenario: Ouvrir la fiche d'un rendez-vous depuis l'agenda
        Given Un rendez-vous a été créé
           * L'utilisateur est sur l'agenda
        When Il sélectionne le rendez-vous à modifier
        Then La fiche du rendez-vous doit être affichée correctement

    Scenario: Modification d'un rendez-vous
        Given Un rendez-vous a été créé
            * Il sélectionne le rendez-vous à modifier
            * Il modifie la date et l'heure du rendez-vous
        When Il clique sur le bouton "Modifier" de la fiche de rendez-vous.
        Then Une pop-up de confirmation affichant "La réservation a été modifiée" s'affiche 

    Scenario: Vérification de la modification dans l'agenda
        Given Un rendez-vous a été créé
            * L'utilisateur a modifié le rendez-vous dans l'agenda
        When Il consulte l'agenda
        Then Le rendez-vous doit être déplacé à la date et à l'heure choisies          
        But  Les modifications de la date et de l'heure du rendez-vous doivent être correctement enregistrées

    Scenario: Consultation de l'historique des modifications
        Given Un rendez-vous a été créé et ses informations ont été enregistrées
            * L'utilisateur a modifié le rendez-vous dans l'agenda
        When Il sélectionne le rendez-vous, puis clique sur "Historique", suivi de "Rendez-vous pris"
        Then L'historique affiche les informations correspondant à la prise et à la modification du rendez-vous  


    # Carnet d'adresse (option 2)
     Scenario: Recherche d'un rendez-vous via le carnet d'adresse
         Given Un rendez-vous a été créé
             * L'utilisateur a modifié le rendez-vous dans l'agenda 
             * L'utilisateur ouvre le carnet d'adresse
         When Il renseigne les informations de l'usager et recherche un rendez-vous
         Then Le rendez-vous modifié précédemment est trouvé
 
     Scenario: Nouvelle modification du rendez-vous via le carnet d'adresse
         Given Un rendez-vous a été créé
             * L'utilisateur a recherché le rendez-vous depuis le carnet d'adresses et l'a ouvert  
             * Il modifie la date et l'heure du rendez-vous
         When Il clique sur le bouton "Modifier" de la fiche de rendez-vous.
         Then Une pop-up de confirmation affichant "La réservation a été modifiée" s'affiche  
 
     Scenario: Vérification de la modification effectuée depuis le carnet d'adresses dans le calendrier  
         Given Un rendez-vous a été créé
             * L'utilisateur a recherché le rendez-vous depuis le carnet d'adresses et l'a ouvert  
             * Il modifie la date et l'heure du rendez-vous
             * Il clique sur le bouton "Modifier" de la fiche de rendez-vous.         
         When Il consulte l'agenda
         Then Le rendez-vous doit être déplacé à la date et à l'heure choisies          
         But  Les modifications de la date et de l'heure du rendez-vous doivent être correctement enregistrées


     # Buton Deplacer (option 3)
     Scenario: Activation de l'option "Déplacer des RDVs" dans l'agenda de la Caf  
         Given L'utilisateur est connecté à l'application Troov
             * Il consulte l'agenda
             * Le bouton "Déplacer des RDVs" est désélectionné et affiché en blanc
         When Il clique sur le bouton "Déplacer des RDVs"  
         Then Le bouton "Déplacer des RDVs" est sélectionné et reste affiché en verte
 
     Scenario: Déplacement du rendez-vous dans la pochette de déplacement
         Given Un rendez-vous a été créé
             * Le bouton "Déplacer des RDVs" est activé
         When L'utilisateur clique sur le rendez-vous pour le déplacer
         Then Le rendez-vous apparaît dans la pochette de déplacement sous le bouton "Déplacer des RDVs"
 
     Scenario: Repositionnement du rendez-vous depuis la pochette de déplacement vers le nouvel emplacement  
         Given Un rendez-vous a été créé
             * Le rendez-vous a été placé dans la pochette de déplacement
         When L'utilisateur glisse-dépose le rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure
         Then Une fenêtre de confirmation du déplacement s'affiche  
 
    # Probleme drag & drop
 #    Scenario: Repositionnement direct d'un rendez-vous 
 #        Given Un rendez-vous a été créé
 #            * Le bouton "Déplacer des RDVs" est activé
 #        When L'utilisateur fait glisser le rendez-vous d'un emplacement à un autre, en mettant à jour la date et l'heure
 #        Then Une fenêtre de confirmation du déplacement s'affiche  
 
 #    Scenario: Confirmation d'un rendez-vous via glisser-déposer  
 #        Given Un rendez-vous a été repositionné via un glisser-déposer  
 #        When L'utilisateur clique sur le bouton "Confirmer"  
 #        Then Une pop-up de confirmation affichant "La réservation a été modifiée" s'affiche  
 
#     Scenario: Vérification de la modification effectuée via un glisser-déposer dans le calendrier  
#         Given Un rendez-vous a été créé
#             * Le rendez-vous a été repositionné via un glisser-déposer 
#         When Il consulte l'agenda  
#         Then Le rendez-vous doit être déplacé à la date et à l'heure choisies  
#         And Les modifications de la date et de l'heure du rendez-vous doivent être correctement enregistrées
# 
#     Scenario: Consultation de l'historique des modifications après une modification par glisser-déposer  
#         Given Un rendez-vous a été créé et ses informations ont été enregistrées
#             * Le rendez-vous a été repositionné via un glisser-déposer 
#         When Il sélectionne le rendez-vous, puis clique sur "Historique", suivi de "Rendez-vous pris"
#         Then L'historique affiche les informations correspondant à la prise et à la modification du rendez-vous  



    # Caf.fr et V360
##    Scenario: Vérification de la mise à jour du RDV dans l'agenda de l'usager sur Caf.fr  
##        Given Un rendez-vous est confirmé  
##        When L'utilisateur ouvre le compte de l'usager sur Caf.fr  
##        And L'utilisateur clique sur "Consulter mes RDVs"  
##        Then Le RDV est bien mis à jour dans l'agenda de l'usager  
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
