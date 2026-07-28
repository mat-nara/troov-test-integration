Feature: Modification d'un objet trouve

  Background:
    Given L'utilisateur est connecte et se trouve sur la page "Mes objets"

  Scenario: Modifier un objet via la fiche objet
    When L'utilisateur clique sur l'objet
    Then La fiche de l'objet s'affiche
    When L'utilisateur clique sur le bouton "Modifier la fiche"
        * L'utilisateur modifie  un champ comme la marque de l'objet
        * L'utilisateur clique sur "Enregistrer"
    Then Les modifications de l'objet sont enregistrees

  Scenario: Modifier un objet via le menu d'actions
    When L'utilisateur clique sur l'objet
    Then La fiche de l'objet s'affiche
     * L'utilisateur passe par le bouton "Actions" pour modifier
    Then Les modifications de l'objet sont enregistrees