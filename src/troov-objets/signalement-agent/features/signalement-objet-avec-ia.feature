Feature: Signalement d'un objet trouvé avec IA

  Background:
    Given l'utilisateur est connecté et sur sa page d'accueil

  Scenario: Ouvrir le formulaire via l'icone appareil photo dans la barre du haut
    When L'utilisateur clique sur l'icone appareil photo dans la barre du haut
    Then Le formulaire de signalement avec IA s'ouvre

  Scenario: Ouvrir le formulaire via les boutons dédiés
    When L'utilisateur clique sur l'un des deux boutons de signalement
    Then Le formulaire de signalement avec IA s'ouvre

  Scenario: Ajouter plusieurs photos depuis l'onglet photo
    When L'utilisateur ouvre le formulaire avec IA
    And L'utilisateur ajoute une ou plusieurs photos via l'onglet photo
    Then Les photos sont ajoutées au formulaire

  Scenario: Ajouter un objet lie dans le formulaire de signalement
    When L'utilisateur remplit le formulaire de signalement principal
    And L'utilisateur ajoute un objet lie dans le formulaire
    Then L'objet lié est cree et apparait dans la fiche de l'objet principal

  Scenario: Ajouter un objet lie en faisant appel à l'IA avec une photo
    When L'utilisateur ajoute un objet lie
    And L'utilisateur ajoute une photo pour faire appel à l'IA
    Then L'objet lie est genere par l'IA
    And L'objet lie se retrouve dans la fiche de l'objet principal