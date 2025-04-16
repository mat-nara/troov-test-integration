@DebuterEntretientPhysique 
Feature: Démarrer un entretien physique

    Scenario: Accéder à la file d’attente depuis la page d’accueil
        Given L'utilisateur est sur la page d’accueil de Troov
        When Il clique sur le menu "File d'attente"
        Then La page "File d'attente" s'affiche

    Scenario: Appeler un ticket depuis la file d’attente
        Given Un rendez-vous a été créé
            * La personne ayant rendez-vous a été signalée comme arrivée, et le ticket est passé dans la colonne "Attente avec RDV"
        When Il clique sur le bouton "Appeler" du ticket dans la file "Attente avec RDV"
        Then Une pop-up "Choisir un guichet" s’affiche
        When L'utilisateur sélectionne un guichet et clique sur "Confirmer"
        Then Le ticket passe dans la colonne "RDV en cours"

    Scenario: Ouvrir la fenêtre d'information du rendez-vous
        Given Un rendez-vous a été créé
            * La personne ayant rendez-vous a été signalée comme arrivée, et le ticket est passé dans la colonne "Attente avec RDV"
            * Le ticket est appelé et passe de "Attente avec RDV" à la colonne "RDV en cours"
        When L'agent clique sur le ticket
        Then La fenêtre "Information RDV" s'affiche
# 
##    Scenario: Démarrer un entretien et afficher la fiche V360 de l’usager
##        Given La fenêtre "Information RDV" est affichée pour un ticket en cours
##        When L'agent clique sur le bouton "Démarrer un entretien"
##        Then Un nouvel onglet s'ouvre avec la fiche V360 de l'usager
##        And La fiche V360 correspond à la bonne personne et au bon foyer