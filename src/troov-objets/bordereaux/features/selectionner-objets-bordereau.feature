Feature: Sélectionner les objets du bordereau

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec ces identifiants SSO
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur clique sur le menu "Bordereaux" dans la sidebar
       * L'utilisateur clique sur le bouton "+ Ajouter un bordereau"
       * L'utilisateur remplit le formulaire de création de bordereau
       * L'utilisateur clique sur le bouton "Suivant"

  Scenario: Afficher l'étape Sélectionner un objet
    Then La page s'affiche avec de nombreux filtres de recherche :
      * Onglets : Objets en stock / Objets Archivés / Numéro références
      * Ordre : Tri par objets récent / ancien
      * État : Perdu / Trouvé
      * Date : Date de perte/trouvaille / Date de déclaration
      * Statut : Avec match validé / Sans match / Avec match potentiel / Objet abandonné / Durée de conservation expirée / En livraison
      * Ajouté par, Type, Nom mentionné, Marque, Modèle, Détail, Origine du dépôt, Autre
      * Bouton "Rechercher" + "Retour" / "Suivant"

  Scenario: Lancer une recherche sans date
    When L'utilisateur clique sur le bouton "Rechercher" sans choisir de date
    Then Une pop-up d'erreur s'affiche : "Vous devez choisir une plage de dates pour la recherche"

  Scenario: Sélectionner des objets
    When L'utilisateur effectue une recherche avec une plage de dates
    Then La page affiche :
      * Lien "Voir le résultat de mes recherches"
      * Message "Cochez les éléments à supprimer"
      * Compteur de sélection (X/X Objet sélectionné)
      * Liste des objets avec : photo, date, type, nom, ref et détails (couleur, marque, état, etc.)
      * Cases à cocher pour chaque objet
      * Pagination en bas à droite
      * Bouton "Sauvegarder les changements" en haut à droite
      * Boutons "Retour" / "Suivant"
    When L'utilisateur coche des objets
    Then Les objets cochés s'affichent en surbrillance (fond beige/orange) avec le texte en rouge
      * Le compteur se met à jour

  Scenario: Passer à l'étape suivante sans sauvegarder
    When L'utilisateur clique sur "Suivant" sans sauvegarder
    Then Une pop-up d'erreur s'affiche "Enregistrez vos changements avant de continuer"