@AccessProfileAdministrateur
Feature: Vérification des accès: Profile Administrateur 

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
        Then La page Paramètres est accessible, avec les quatre modules de paramétrage cliquables

    Scenario: Accès à la création de site (compte)
        When L'utilisateur clique sur le profil puis "Changer de compte" dans le menu de droite
        Then La liste des comptes existants s'affiche avec l'option "Ajouter un nouveau compte" 
        When L'utilisateur clique sur "Ajouter un nouveau compte"
        Then La page créer un nouveau compte s'affiche et le bouton "Accepter" pour valider la création du site est cliquable
    
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

    Scenario: Accès au gestion des Services: Impossibilité de créer des motifs de RDV - Services
        When L'utilisateur est sur la page paramètres
           * L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then La page "Gestion des Services" est accessible
           # * Les icones de modification, suppression et création de service sont visible et cliquables
           * Absence du bouton "+ Magasins - Services"
           * Les icones de modification, suppression sont visible et cliquables

        When L'utilisateur clique sur l'icone modification d'un service
        Then Les informations sur le service sont modifiables a part son nom
           * Le bouton "Sauvegarder les changements" est cliquable
        
        When L'utilisateur clique sur l'icone supprimer d'un service
        Then Le service concerné est supprimé localement

        When L'utilisateur clique sur "Associer Magasins - Services" pour récupérer le Service supprimé localement
           * L'utilisateur sélectionne le service concerné et clique sur "Associer"
        Then Le service est de nouveau disponible dans la liste des services

    # Niveau local uniquement
    Scenario: Accès au gestion des Services: Guichet
        When L'utilisateur est sur la page paramètres
           * L'utilisateur clique sur "Mes calendriers - Gestion des Services"
        Then Accès au guichet sur un périmètre local, avec les icônes de modification, de suppression et de création de guichet visibles et cliquables
        When L'utilisateur clique sur modifier un guichet
        Then Ouverture du paramétrage des guichet au niveau local uniquement

    Scenario: Déplier toutes les zones du paramétrage
        Given La fiche de paramétrage d’un guichet est ouverte
        When L'utilisateur clique sur "Affichez tout"
        Then Toutes les zones de paramétrage du guichet sont dépliées

    Scenario: Intervention sur chaque zone du guichet
        Given La fiche de paramétrage d’un guichet est ouverte
        When L'utilisateur clique sur "Affichez tout"
        Then Toutes les zones de paramétrage de chaque section sont modifiable

    # Niveau local uniquement
    Scenario: Gérer des plages horaires exceptionnelles (ouverture, fermeture)  au niveau local / Gestion des RDV en masse
        Given La page "Gestion des Services" est ouverte
        Then Une icone de calendrier avec une étoile est présent sur chaques guichets
        When L'utilisateur clique sur l'icone de calendrier avec une étoile
        Then La page "Plage horaire exceptionnelles" s'affiche

   #Scenario: Vérifier la possibilité de gérer les guichets / réservations ouverte aux usagers ? en interne ? au niveau National (tous sites)

    Scenario: Vérifier la possibilité de paramétrer la gestion des flux sur l'ensemble des sites (périmètre national)
        When L'utilisateur est sur la page paramètres
           * L'utilisateur clique sur "File d'attente - Gestion de la file d'attente"
        Then La page "Gestion de la file d'attente" est accessible
        
        When L'utilisateur déplier le bloc "Paramétres généraux" 
        Then La section "Paramétres généraux" s'affiche et chaques zone est modifiable

        # Nivau local uniquement
        When L'utilisateur déplier le bloc "Paramétrage du matériel" 
        Then La section "Paramétres du matériel" s'affiche et chaques zone est modifiable 
           * Il est possible de sauvegarder les changements au niveau national

    # Niveau local uniquement
    Scenario: Vérifier l'accès aux statistiques (au niveau National, toutes Caf)
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques RDV"
        Then La page "Statistiques RDV" est accessible
        
        When L'utilisateur clique sur "Statistiques" puis sur "Statistiques file d'attente"
        Then La page "Statistiques file d'attente" est accessible
        
        When L'utilisateur clique sur "Statistiques" puis sur "Pilotage file d'attente"
        Then La page "Pilotage file d'attente" est accessible

