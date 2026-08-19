Feature: Selection des objets (Etape 2)

  Background:
    Given L'utilisateur est sur "http://localhost:3000/login"
    When L'utilisateur se connecte avec les identifiants SSO "mairie@troov.com" et "Hello(123)"
    Then L'utilisateur arrive sur sa page d'accueil agent
    When L'utilisateur ouvre le menu "Bordereaux" dans la sidebar
    * L'utilisateur cree une premiere etape de bordereau valide et clique sur "Suivant"

  Scenario: Etape 2 - Rechercher des objets a ajouter au bordereau
    Then La page de recherche des objets s'affiche avec les onglets :
      | Objets en stock    |
      | Objets Archives   |
      | Numero references  |
    * Les filtres d'ordre "Tri par objets recent" et "Tri par objets ancien" s'affichent
    * Les filtres d'etat "Perdu" et "Trouve" s'affichent
    * Les filtres de date "Date de perte/trouvaille" et "Date de declaration" s'affichent
    * Les filtres de statut s'affichent :
      | Avec match valide         |
      | Sans match                |
##      | Avec match potentiel      |
##      | Objet abandonne           |
##      | Duree de conservation expiree |
##      | En livraison              |
    * Les filtres  "Type", "Nom mentionne", "Marque", "Modele" s'affichent
    * Les boutons "Rechercher", "Retour" et "Suivant" s'affichent

##  Scenario: Liste des recherches
##    When L'utilisateur clique sur le bouton "Rechercher" sans remplir de filtres
##    Then La "Liste des recherches" affiche le message "Aucun element a afficher"

Scenario: Liste des recherches - Validation des filtres obligatoires
    When L'utilisateur clique sur le bouton "Rechercher" sans remplir de filtres
    Then La "Liste des recherches" affiche le message "Veuillez sélectionner une plage de dates"

Scenario: Selectionner les objets du bordereau
    When L'utilisateur effectue une recherche d'objets valide
    Then Le lien "Voir le resultat de mes recherches" s'affiche
##     * Le message "Cochez les elements a supprimer" s'affiche
     * Le compteur de selection "X/X Objet selectionne" s'affiche
     * La liste des objets s'affiche avec photo, date, type, nom, ref, details et cases a cocher
##     * Le bouton "Sauvegarder les changements" s'affiche en haut a droite
     * La pagination et les boutons "Retour" / "Suivant" s'affichent

  Scenario: Selectionner et sauvegarder les objets
    When L'utilisateur coche un ou plusieurs objets dans la liste
    Then  Le compteur de selection se met a jour 
##    * Les objets meches s'affichent en surbrillance avec fond beige/orange et texte en rouge
##    When L'utilisateur clique sur "Suivant" sans sauvegarder
##    Then Une pop-up d'erreur s'affiche avec le message "Enregistrez vos changements avant de continuer"