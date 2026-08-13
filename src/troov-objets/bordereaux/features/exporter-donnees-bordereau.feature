Feature: Confirmation et Export du bordereau

Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
     * L'utilisateur clique sur le bordereau "Contact Test Auto" dans la liste
    Then La page de détail du bordereau s'affiche avec le titre "Contact Test Auto"

 ## Scenario: Afficher la page récapitulative
 ##   Then La page récapitulative s'affiche avec :
 ##     * "Informations sur mon bordereau" : Nom, Modèle, Type, Date d'envoi, Receveur, Message
 ##     * Boutons "Enregistrer" et "Supprimer"
 ##     * Section "Objets sélectionnés" (dépliable)
 ##     * Bouton "Exporter les données" en haut à droite
 ##     * Bouton "Terminer" en bas à droite


Scenario: Exporter les données au format Excel
    When L'utilisateur coche la case du premier objet
     * L'utilisateur clique sur le bouton d'export "Exporter Excel"
    Then Le fichier au format "excel" se télécharge correctement

 Scenario: Exporter les données au format PDF
    When L'utilisateur coche la case du premier objet
    * L'utilisateur clique sur le bouton d'export "Exporter PDF"
    Then Le fichier au format "pdf" se télécharge correctement