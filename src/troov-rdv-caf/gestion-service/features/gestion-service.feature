Feature: Gestion des services : Paramètres / Mes calendriers / Services (Motifs)

  Background:
    Given L'utilisateur est connecté avec un profil Admin Caf ou CDR

  Scenario: Accéder à la gestion des services
    When L'utilisateur navigue vers "Paramètres" depuis la page d'accueil
    And L'utilisateur clique sur "Mes calendriers - Gestion des Services"
    Then La page "Mes paramètres" s'affiche

  Scenario: Vérifier les permissions de modification de prise de rendez-vous et la création de services enfants
    Given L'utilisateur est sur la page "Gestion des Services"
    Then L'utilisateur a la possibilité d’activer l’option "Activer la prise de rendez-vous dans votre lieu"
       * L'utilisateur ne peut pas désactiver l’option "Bloquer la création de services enfants"

  Scenario: Vérifier la création et modification des services
    Given L'utilisateur est sur la page "Gestion des Services"
    Then L'utilisateur ne peut pas créer de nouveaux motifs de RDV
       * L'utilisateur peut modifier et supprimer les services existants

  Scenario: Ouvrir la fiche de paramétrage d’un service
    Given L'utilisateur est sur la page "Gestion des Services"
    When L'utilisateur clique sur l'icône crayon d’un service existant
    Then La fiche de paramétrage du service s’affiche

  Scenario: Déplier toutes les zones du paramétrage
    Given La fiche de paramétrage d’un service est ouverte
    When L'utilisateur clique sur "Affichez tout"
    Then Toutes les zones de paramétrage sont dépliées

  Scenario: Modifier la couleur du calendrier
    Given Un service est créé et sa fiche de paramétrage est ouverte
    When L'utilisateur change la valeur de "code couleur du calendrier"
       * L'utilisateur clique sur "Sauvegarder les changements"
    Then La couleur du calendrier est mise à jour

  Scenario: Vérifier les champs non modifiables
    Given L'utilisateur est connecté en tant que membre d'une equipe 
        * Un service est créé et sa fiche de paramétrage est ouverte
    Then Le nom du Service est non modifiable
       * Le type de Service est non modifiable

  Scenario: Modifier la jauge de réservation
    Given Un service est créé et sa fiche de paramétrage est ouverte
    When L'utilisateur modifie la jauge de temps de réservation
       * L'utilisateur clique sur "Sauvegarder les changements"
    Then La jauge est mise à jour avec la nouvelle valeur

  Scenario: Modifier les zones de la rubrique "Personnalisation"
    Given Un service est créé et sa fiche de paramétrage est ouverte
    When L'utilisateur active, désactive ou modifie les zones de la rubrique "Personnalisation"
       * L'utilisateur clique sur "Sauvegarder les changements"
    Then Les modifications sont prises en compte

  Scenario: Activer ou désactiver les options dans la rubrique "Activation"
    Given Un service est créé et sa fiche de paramétrage est ouverte
    When L'utilisateur active, désactive ou modifie les zones de la rubrique "Activation"
       * L'utilisateur clique sur "Sauvegarder les changements"
    Then Les modifications de la rubrique "Activation" sont prises en compte 