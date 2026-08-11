Feature: Confirmation et Export du bordereau

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    # ... (chemin jusqu'à l'étape Confirmation)

  Scenario: Afficher la page récapitulative
    Then La page récapitulative s'affiche avec :
      * "Informations sur mon bordereau" : Nom, Modèle, Type, Date d'envoi, Receveur, Message
      * Boutons "Enregistrer" et "Supprimer"
      * Section "Objets sélectionnés" (dépliable)
      * Bouton "Exporter les données" en haut à droite
      * Bouton "Terminer" en bas à droite

  Scenario: Exporter les données
    When L'utilisateur clique sur le bouton "Exporter les données"
    Then Un menu déroulant s'affiche avec deux formats d'export :
      * EXCEL
      * PDF
    When L'utilisateur choisit "EXCEL"
    Then Une page s'affiche permettant de choisir les colonnes à exporter avec :
      * Une liste complète de colonnes disponibles (Référence, Type, Date de déclaration, Nom, Photo, Nationalité, Détail, Marque, Couleur, etc.)
      * Bouton "Sélectionner tout" en haut à droite
      * Bouton "EXCEL" en bas pour lancer l'export
    When L'utilisateur clique sur "EXCEL"
    Then Le fichier Excel se télécharge correctement