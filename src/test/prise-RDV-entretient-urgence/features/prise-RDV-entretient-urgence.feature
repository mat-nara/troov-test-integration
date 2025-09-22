@priseRDVEntretientUrgence 
Feature: Prise d'un RDV Entretient d'urgence

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Prise RDV entretient urgence usager connue SI
        Given Un utilisateur a été créé lors d'une prise de rendez-vous précédente
        When L'utilisateur clique sur le bouton "Ajouter un RDV"
        Then Une fenêtre "Ajouter un RDV" s'ouvre

        When Il choisi le service "Entretien d'urgence"
           * Il sélectionne un mode de RDV
           * Il choisi la date et l'heure du RDV
           * Il recherche un usager déja connue par son nom dans le SI Cnaf
        Then L'utilisateur est trouvé

        When Il ajoute des notes internes relatives au rendez-vous
           * Il sélectionnne le mode de prise du rendez-vous
           * Il clique sur le bouton "Bloquer ce créneau" pour confirmer le rendez-vous
        
        Then Le rendez-vous est bien affiché dans l'agenda à la date, à l'heure sélectionnées et dans le guichet 
        
        When L'utilisateur clique sur le RDV et ouvre "Historique"  
           * L'utilisateur sélectionne "Rendez-vous pris"  
        Then Les informations du RDV correspondent à celles saisies


    Scenario: Prise RDV entretient urgence usager inconnue SI
        When L'utilisateur clique sur le bouton "Ajouter un RDV"
        Then Une fenêtre "Ajouter un RDV" s'ouvre

        When Il choisi le service "Entretien d'urgence"
           * Il sélectionne un mode de RDV
           * Il choisi la date et l'heure du RDV
           * Il recherche un usager inconnue par son nom dans le SI Cnaf
        Then Aucun utilisateur n'est trouvé
        When Il clique sur le bouton "Créer un utilisateur"
           * Il renseigne les informations de l'usager
           * Il valide la création de l'usager
        Then L'utilisateur est créer et sélectionné pour le rendez-vous

        When Il ajoute des notes internes relatives au rendez-vous
           * Il sélectionnne le mode de prise du rendez-vous
           * Il clique sur le bouton "Bloquer ce créneau" pour confirmer le rendez-vous
        
        Then Le rendez-vous est bien affiché dans l'agenda à la date, à l'heure sélectionnées et dans le guichet 
        
        When L'utilisateur clique sur le RDV et ouvre "Historique"  
           * L'utilisateur sélectionne "Rendez-vous pris"  
        Then Les informations du RDV correspondent à celles saisies