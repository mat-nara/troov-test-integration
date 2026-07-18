@sansRdvEnregistrement
Feature: Signalement d'une arrivée sans RDV (usager): Enregistrement 

    Background:
        Given L'utilisateur est connecté à l'application Troov

    Scenario: La page de prise de RDV public s'affiche correctement 
        When Il clique sur "Ma page de RDV" puis sur "Accéder aux services"
        Then La page de sélection de la personne et du service s’affiche

    Scenario: Vérification de la page de sélection de la personne et du service 
        Given La page de sélection de la personne et du service est ouverte
        
        # Sélection de personne 
        Then Le nombre de personnes sélectionné est "1"
        When Il clique sur "+" de l'icone nombre de personne
        Then Le nombre de personnes sélectionné est "2"
        When Il clique sur "-" de l'icone nombre de personne
        Then Le nombre de personnes sélectionné est "1"
        
        # Sélection de service 
        When Il clique sur "+" du service "CNI"
        Then Le service "CNI" est sélectionné avec "1" personne
        When Il clique sur "-" du service "CNI"
        Then Le service "CNI" est sélectionné avec "0" personne
        When Il associé une personne a maximum deux services différent "CNI" et "Passeport"
        Then Tout les autres services sont désactivés
        When L'utilisateur sélectionne "3" personnes
        Then Le nombre de personne possible associé aux service "CNI" est maximum "3"
        When Il remet le nombre de personne à "1" et sélectionne le service "CNI" et enleve le service "Passeport"
           * Il clique sur "Confirmé"
        Then La page suivante "Pré-demande ANTS" s’affiche
    
    Scenario: Vérification de la page "Pré-demande ANTS"
        Given La page "Pré-demande ANTS" est ouverte
        When Il clique sur "Aide pour réaliser votre Pré-demande"
        Then Une fenetre d'aide s'affiche
        When Il clique sur "Je fais ma pré-demande"
        Then Une nouvelle onglet s'ouvre vers le site ANTS
        When Il clique sur "J'ai fait ma pré-demande, je prends RDV"
           * La page information important s'affiche, il coche "J'ai bien lu",  puis il clique sur "Prendre rendez-vous"
        Then La page "Créneaux" s'affiche

    Scenario: Vérification de la page "Créneaux"
        Given La page "Créneaux" est ouverte
        Then Une liste de créneaux disponible s'affiche
        When Il clique sur l'icone "Suivante" sur les dates
        Then Les prochaines dates disponibles s'affichent
        When Il clique sur l'icone "Précédente" sur les dates
        Then Les dates précédentes disponibles s'affichent
        When Il sélectionne un autres dates
        Then Les heures disponibles pour la date sélectionnée s'affichent
        When Il sélectionne un créneau disponible
        Then Le créneau sélectionné s'affiche correctement
        When Il clique sur "Valider le calendrier"
        Then La page "Vos coordonnées" s'affiche
        
    Scenario: Vérification de la page "Vos coordonnées"
        Given La page "Vos coordonnées" est ouverte
        When Tout les champs sont remplis correctement
        Then Le bouton "Valider vos coordonnées" est cliquable

        # Vérification champ vide
        When Le champ "Nom" est vidé
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le champ "Prénom" est vidé
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le champ "Email" est vidé        
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le champ "Numéro de téléphone" est vidé
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le champ "Date de naissance" est vidé
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le champ "Pré-demande ANTS" est vidé
        Then Le bouton "Valider vos coordonnées" est désactivé

        # Vérification champ invalide
        When Le "Nom" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le "Prénom" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le "Email" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le "Numéro de téléphone" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le "Date de naissance" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé
        When Le "Pré-demande ANTS" saisi est invalide
        Then Le bouton "Valider vos coordonnées" est désactivé

        When Il clique sur "Valider vos coordonnées"
        Then La page "Confirmez votre demande" s'affiche


    Scenario: Vérification de la page "Confirmez votre demande"
        Given La page "Confirmez votre demande" est ouverte
        Then Les information sur la page "Confirmez votre demande" sont correctes
        When Il clique sur le "Condition d'utilisation"
           * Il résout le captcha
        Then Le bouton "Confirmer mon RDV" est cliquable
        When Il clique sur "Modifier"
        Then Une fenetre de choix du modification s'affiche
        When Il clique sur "Calendrier"
        Then Il revient a la page "Créneaux"
        When Il navigue de la page "Créneaux" vers la page "Confirmez votre demande"
           * Il clique sur "Modifier"
           * Il clique sur "Vos coordonnées"
        Then Il revient a la page "Vos coordonnées"
        When Il navigue de la page "Vos coordonnées" vers la page "Confirmez votre demande"
        When Il accepte les conditions d'utilisation, résout le captcha et clique sur "Confirmer mon RDV"
        Then Une fenetre "Rendez-vous confirmé" s'affiche

    Scenario: Vérification du nouveau rendez-vous prise dans Troov
        Given Un rendez-vous a été pris depuis la prise de RDV public
        When Il consulte l'agenda dans Troov
        Then Le rendez-vous pris depuis la prise de RDV public est bien présent dans l'agenda avec les bonnes informations