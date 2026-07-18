@priseRdvMultiLieux 
Feature: Prise d'un RDV multi-lieux

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: Filtrer les créneaux par lieu, motif et type de rendez-vous
        When Il clique sur le menu "RDV Multi-lieux"
        Then La page "RDV Multi-lieux" s'affichée

        When Il sélectionne "CNAF Formation" puis "455 Caf" puis "455 caf site" pour le lieux
           * Il sélectionne le motif "Enfant" puis le sous motif "J'attends / J'accueille un enfant"
           * Il sélectionne le mode "Rendez-vous sur site"
           * Il clique sur "Rechercher"
        Then Seuls les créneaux correspondant au lieu "455 caf" et qui est "sur site physique" doivent s'afficher
    
    Scenario: Aucun créneau disponible après filtrage
        When Il clique sur le menu "RDV Multi-lieux"
        Then La page "RDV Multi-lieux" s'affichée

        When Il sélectionne "CNAF Formation" puis "455 Caf" puis "Profil Interface nationale" pour le lieux
           * Il sélectionne le motif "Enfant" puis le sous motif "J'attends / J'accueille un enfant"
           * Il sélectionne le mode "Sélectionner tout"
           * Il clique sur "Rechercher"
        Then Aucun créneaux n'est afficher et un message "Aucun créneau n’est disponible pour le mode de rendez-vous sélectionné, veuillez modifier vos critères" s'affiche 

    Scenario: Prise de rendez-vous depuis multi-site
        When Il clique sur le menu "RDV Multi-lieux"
           * Il sélectionne "CNAF Formation" puis "455 Caf" puis "455 caf site" pour le lieux
           * Il sélectionne le motif "Enfant" puis le sous motif "J'attends / J'accueille un enfant"
           * Il sélectionne le mode "Rendez-vous en visioconférence"
           * Il clique sur "Rechercher"
           * Il sélectionne un créneau
        Then Une fenêtre "Ajouter un RDV" s'affiche
        When Il clique sur "Créer un utilisateur", puis complète les informations, puis confirme
           * Il choisi le mode de prise de rendez-vous 
           * Il clique sur "Bloquer ce créneau" puis "Ajouter"
        Then Une popup de confirmation s'affiche
        When Il clique sur "OK" sur la confirmation
           * Il change de compte "455 Caf site visioconférence"
        Then Le rendez-vous s'affiche bien dans le calendrier au bon endroit