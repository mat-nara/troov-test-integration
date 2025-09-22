    
@DeplacementRdvViaCalendrier
Feature: Déplacement de rendez-vous via le calendrier

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Déplacement du rendez-vous dans la pochette de déplacement
        Given Un rendez-vous a été créé
            * Un second rendez-vous a été créé
            * Le bouton "Déplacer des RDVs" est désélectionné et affiché en blanc

        When Il clique sur le bouton "Déplacer des RDVs"  
        Then Le bouton "Déplacer des RDVs" est sélectionné et reste affiché en verte

        When L'utilisateur clique sur le rendez-vous pour le déplacer
        Then Le rendez-vous se "glisse" automatiquement en dessous de la case "Déplacer des RDVs"

        When L'utilisateur clique sur le second rendez-vous pour le déplacer
        Then Les deux rendez-vous apparaissent en dessous de la case "Déplacer des RDV"

        Given Pour le premier rendez-vous
            * L'utilisateur clique sur une autres journée dans le calendrier
        #    Then La journée est sélectionnée et le calendrier affiche les plages horaires disponibles pour cette journée
        When L'utilisateur glisse-dépose le premier rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure
        Then Une fenêtre de confirmation du déplacement s'affiche  
        When L'utilisateur confirme le déplacement du rendez-vous
        Then Le rendez-vous est déplacé vers le nouvel emplacement

        Given Pour le second rendez-vous
        When L'utilisateur glisse-dépose le premier rendez-vous depuis la pochette vers un nouvel emplacement à la nouvelle date et heure
        Then Une fenêtre de confirmation du déplacement s'affiche  
        When L'utilisateur confirme le déplacement du rendez-vous
        Then Le rendez-vous est déplacé vers le nouvel emplacement
        
        When Il clique a nouveau sur le bouton "Déplacer des RDVs"  
        Then Le bouton "Déplacer des RDVs" est désélectionné et devient blanc