@AccessProfileSuperviseur
Feature: Vérification des accès: Profile Superviseur 

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

    Scenario: Accès au pilotage de l'activité en temps réel
        When L'utilisateur clique sur "Statistiques" puis "Pilotage file d'attente"
        Then La page "Pilotage file d'attente" est accessible

    Scenario: Accès à l'onglet "Paramètres"
        When L'utilisateur clique sur "Paramètres"
        Then La page Paramètres est accessible, avec les trois modules de paramétrage cliquables et absence du module "File d'attente"

    Scenario: Impossibilité de création de sites (Comptes)
        When L'utilisateur clique sur le profil puis "Changer de compte" dans le menu de droite
        Then La liste des comptes existants s'affiche avec l'option "Ajouter un nouveau compte" 
           * Le boutton "Ajouter un nouveau compte" est absent
    
    Scenario: Accès au gestion des équipes
        Given L'utilisateur est sur la page paramètres
        When  L'utilisateur clique sur "Gestion des équipes"
        Then La page "Gestion des équipes" est accessible
        
        When L'utilisateur clique sur "Ajouter un membre"
           * L'utilisateur remplit les champs du formulaire et enregistre
        Then Le nouveau membre est créer et apparaît dans la liste des membres

        Given La fiche de l’utilisateur est ouverte
        When On modifie les informations de l'utilisateur
           * L'utilisateur clique sur le bouton "Mettre à jour"
        Then Un message de confirmation de la mise a jours s’affiche

        Given La fiche de l’utilisateur est ouverte
        When L'utilisateur clique sur le bouton "Supprimer" en bas de la fiche et confirme la suppression via la pop-up
        Then Un message de confirmation de la suppression s’affiche

    Scenario: Accès au gestion des Services: création des motifs de RDV - Services
        When L'utilisateur est sur la page paramètres
           * L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Gestion des Services" est accessible
           * Les icones de modification, suppression et création de service sont absente

        
    Scenario: Accès au gestion des Services: Guichet
        When L'utilisateur est sur la page paramètres
           * L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then Accès au guichet sur un périmètre local, avec les icônes de modification, de suppression absent et uniquement icone "calendrier à étoile" visibles et cliquable

    Scenario: Gérer des plages horaires exceptionnelles (ouverture, fermeture) / Gestion des RDV en masse
        Given La page "Gestion des Services" est ouverte
        Then Une icone de calendrier avec une étoile est présent sur chaques guichets
        When L'utilisateur clique sur l'icone de calendrier avec une étoile
        Then La page "Plage horaire exceptionnelles" s'affiche
           * Possibilité d'intervenir sur "Déplacer les RDV en masse"

   #Scenario: Vérifier la possibilité de gérer les guichets / réservations ouverte aux usagers ? en interne ? au niveau National (tous sites)

    Scenario: Vérifier impossibilité de paramétrer la gestion des flux / paramétrer l'affichage dynamique
        When L'utilisateur est sur la page paramètres
        Then La page Paramètres est accessible, avec les trois modules de paramétrage cliquables et absence du module "File d'attente"

    # niveau local uniquement
    Scenario: Vérifier l'accès aux statistiques (au niveau National, toutes Caf)
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques RDV"
        Then La page "Statistiques RDV" est accessible
        
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques file d'attente"
        Then La page "Statistiques file d'attente" est accessible
        
        When L'utilisateur clique sur "Statistiques" puis sur "Pilotage file d'attente"
        Then La page "Pilotage file d'attente" est accessible

