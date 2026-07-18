@CalendrierAutresFiltres 
Feature: Calendrier - Autres filtres

    Background:
        Given L'utilisateur est connecté à l'application Troov

    #07- Bouton Horaires d'ouverture
    Scenario: Horaires d'ouverture
        #Given L'utilisateur est sur la page calendrier
        When L'utilisateur clique sur "Horaires d'ouverture"
        Then La page "Gestion de plages horaires exceptionnelles" s'affiche

    #08- Bouton Services
    Scenario: Bouton Services
        Given Une date avec des rendez-vous est séléctionné
        When L'utilisateur clique sur le filtre "Services"
        Then Tous les services sont pré-sélectonner et sont en vert

        When L'utilisateur déselectionne un services particulier
        Then Les rendez-vous associés à ce service sont masqués
           * Le chiffre ecrit sur le bouton "Services" diminue
        
        When L'utilisateur resélectionne le service précédemment déselectionné
        Then Les rendez-vous associés à ce service sont de nouveau affichés
           * Le chiffre ecrit sur le bouton "Services" augmente

        When L'utilisateur désélectionne un a un chaque service
        Then Tous les rendez-vous disparait
        
        When L'utilisateur resélectionne tous les services
        Then Tous les rendez-vous sont de nouveau affichés

    #09- Bouton Guichet
    Scenario: Bouton Services
        When L'utilisateur déselectionne tout les guichet apart le "Guichet 1"
        Then Seule le "Guichet 1" est affiché dans le calendrier

        When L'utilisateur clique sur le menu déroulant des guichets puis sur le "Guichet 2" 
        Then On a maintenant sur le calendrier le "Guichet 1" et le "Guichet 2"
        
        When L'utilisateur rajoute tous les autres guichets
        Then Tous les guichets sont affichés dans le calendrier

    #10- Filtres haut de page
    Scenario: Filtre compte
        When L'utilisateur sélectionne un compte particuler 
        Then Le filtre sur le compte est appliqué

    Scenario: Filtre zoom, journé et rdv maintenus
        Given Le filtre zoom est sur "zoom X 1"
        When L'utilisateur clique sur le bouton "zoom X 2"
        Then Le zoom est appliqué au calendrier
        When L'utilisateur clique sur le bouton "zoom X 3"
        Then Le zoom est appliqué au calendrier
        When L'utilisateur clique sur le bouton "zoom X 4"
        Then Le zoom est appliqué au calendrier
        When L'utilisateur clique sur le bouton "zoom X 8"
        Then Le zoom est appliqué au calendrier
        When L'utilisateur clique sur le bouton "zoom X 1"
        
        When L'utilisateur sélectionne sur le filtre journée  "Semaine 5 jours"
        Then Le calendrier affiche les 5 jours de la semaine en cours
        When L'utilisateur sélectionne sur le filtre journée  "Semaine 5 jours - multi guichets"
        Then Le calendrier affiche les 5 jours de la semaine en cours avec tous les guichets sur chaque jour
        When L'utilisateur sélectionne sur le filtre journée  "Semaine 7 jours"
        Then Le calendrier affiche les 7 jours de la semaine en cours
        When L'utilisateur sélectionne sur le filtre journée  "Semaine 7 jours - multi guichets"
        Then Le calendrier affiche les 7 jours de la semaine en cours avec tous les guichets sur chaque jour
        When L'utilisateur sélectionne sur le filtre journée  "Journée"
        Then Le calendrier affiche la journée en cours

        When L'utilisateur clique sur "RDV MAINTENUS"
        Then Le bouton change en "RDV ANNULES" et les rendez-vous annulé sont affichés
        

