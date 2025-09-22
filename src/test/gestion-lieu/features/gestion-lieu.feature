@GestionLieu 
Feature: Gestion du lieu dans Troov

    Background:
        Given L'utilisateur est connecté à l'application Troov

    # Modifier les informations de votre lieu
    Scenario: Accéder au paramètres "Modifier les informations de votre lieu"
        When L'utilisateur clique sur "Paramètres" depuis la page d'accueil
           * Il clique sur "Mon compte - Gestion du lieu"
        Then Le menu "Mon compte" apparaît
        When Il clique sur "Modifier les informations de votre lieu"
        Then La page "Informations concernant mon lieu" s'affiche

    Scenario: Modifier les informations du lieu, puis les restaurer
        Given La page "Informations concernant mon lieu" est ouverte
        When L'utilisateur modifie les champs disponibles et clique sur "Sauvegarder les changements"
           * Il réouvre la page "Informations concernant mon lieu"
        Then Les informations du lieu sont bien mises à jour
        When L'utilisateur rétablit les valeurs d'origine dans les champs modifiés et clique sur "Sauvegarder les changements"
           * Il réouvre la page "Informations concernant mon lieu"
        Then Les informations du lieu sont bien restaurées

    # Modifier votre compte principal et vérifier que le compte principal par défaut est bien sélectionné à la reconnexion et restaurer le compte principal initial
    Scenario: Modifier le compte principal par défaut
        Given L'utilisateur est sur la page "Paramètres" et le menu "Mon compte" est ouverte
        When Il clique sur "Modifier votre compte principal"
        Then La page de modification du compte principal s'affiche
        When L'utilisateur sélectionne le compte principal "CAF TEST" et clique sur "Sauvegarder"
        Then Un message de confirmation du changement du compte principal s'affiche

        When L'utilisateur se déconnecte de Troov et se reconnecte à Troov
        Then Le compte principal sélectionné précédemment "CAF TEST" est utilisé par défaut

        Given L'utilisateur est sur la page "Paramètres" et le menu "Mon compte" est ouverte
        When Il clique sur "Modifier votre compte principal"
        When L'utilisateur sélectionne le compte principal "CNAF Formation" et clique sur "Sauvegarder"
        Then Un message de confirmation du changement du compte principal s'affiche



    # Filtre Blacklist IP/Utilisateur
    Scenario: Accéder à la page "Blacklist"
        When L'utilisateur clique sur "Paramètres" depuis la page d'accueil
            * Il clique sur "Mon compte - Gestion du lieu"
            * Il clique sur "Blacklister des utilisateurs"
        Then La page "Blacklist" s'affiche

    Scenario: Bloquer une IP depuis la section "Adresses IP bloquées"
        Given L'utilisateur est sur la page "Blacklist"
        When Il clique sur le bouton "Bloquer l'IP"
        Then Un popup s'ouvre avec la possibilité de saisir une adresse IP dans le champ prévu à cet effet
        When Il saisit une adresse IP dans le champ prévu
           * Il clique sur le bouton de confirmation "Bloquer l'IP"
        Then Un message de confirmation d'adresse IP bloquée avec succès s'affiche
          * L'adresse IP figure dans la liste des IP bloquées avec la bonne date et heure

    Scenario: Débloquer une IP depuis la section "Adresses IP bloquées"
        Given Une adresse IP est présente dans la liste des IP bloquées
        When L'utilisateur clique sur l'icône cadenas correspondant a l'IP bloquée
        Then L'adresse IP est supprimée de la liste
        And Un message de déblocage est affiché

    Scenario: Bloquer une IP depuis la section "Adresses IP qui ont réservé le plus de créneaux"
        Given L'utilisateur est sur la page "Blacklist"
            * Une adresse IP est dans la liste de la section "Adresses IP qui ont réservé le plus de créneaux"
        When Il clique sur "Bloquer l'IP", l'icône "sens interdit" pour une IP donnée
        Then Un message de confirmation d'adresse IP bloquée avec succès s'affiche
           * L'adresse IP figure dans la liste des IP bloquées avec la bonne date et heure

##    Scenario: Débloquer une IP depuis la liste des IP bloquées
##        Given Une adresse IP est présente dans la liste des IP bloquées
##        When L'utilisateur clique sur l'icône cadenas correspondant
##        Then L'adresse IP est supprimée de la liste
##            * Un message de déblocage est affiché

    Scenario: Exporter en Excel depuis la liste de la section "Adresses IP qui ont réservé le plus de créneaux"
        Given L'utilisateur est sur la page "Blacklist"
        When Dans la liste d'IP de la section "Adresses IP qui ont réservé le plus de créneaux", il clique sur le bouton "Export Excel" pour une IP
        Then Le fichier Excel est téléchargé
            * Le fichier contient la liste des RDV associés à cette IP

    Scenario: Bloquer une adresse e-mail depuis la section "Adresses e-mail bloquées" puis la débloquer
        Given L'utilisateur est sur la page "Blacklist"
        When Dans la section "Adresses e-mail bloquées", il clique sur le bouton "+ Bloquer un email"
        Then Un popup s'ouvre avec la possibilité de saisir une adresse e-mail dans le champ prévu à cet effet
        When Il saisit une adresse e-mail dans le champ prévu
           * Il clique sur le bouton de confirmation "Bloquer l'email"
        Then Un message de confirmation d'email bloquée avec succès s'affiché
            * L'adresse e-mail figure dans la liste des e-mails bloqués avec la bonne date et heure

    Scenario: Débloquer une adresse e-mail depuis la section "Adresses e-mail bloquées"
        Given Une adresse e-mail est présente dans la liste des e-mails bloqués
        When L'utilisateur clique sur l'icône cadenas correspondant à cette adresse email
        Then L'adresse e-mail est supprimée de la liste
            * Un message de confirmation de déblocage de l'email est affiché

    Scenario: Bloquer une IP depuis la section "Adresses email qui ont reservé le plus de créneaux"
        Given L'utilisateur est sur la page "Blacklist"
            * Une adresse email est dans la liste de la section "Adresses email qui ont reservé le plus de créneaux"
        When Il clique sur "Bloquer l'email", l'icône "sens interdit" pour un email donnée
        Then Un message de confirmation d'email bloquée avec succès s'affiché
            * L'adresse e-mail figure dans la liste des e-mails bloqués avec la bonne date et heure

##   Scenario: Débloquer une adresse e-mail bloquée depuis la section "Adresses email qui ont reservé le plus de créneaux"
##        Given L'utilisateur est sur la page "Blacklist"
##            * Une adresse e-mail a été bloquée depuis la section "Adresses email qui ont reservé le plus de créneaux"
##        When L'utilisateur clique sur l'icône cadenas correspondant à cette adresse email
##        Then L'adresse e-mail est supprimée de la liste
##            * Un message de confirmation de déblocage de l'email est affiché

    Scenario: Exporter en Excel depuis la liste de la section "Adresses email qui ont reservé le plus de créneaux"
        Given L'utilisateur est sur la page "Blacklist"
        When Dans la liste d'email de la section "Adresses email qui ont reservé le plus de créneaux", il clique sur le bouton "Export Excel" pour une email
        Then Le fichier Excel associé a l'email est téléchargé 
           * Le fichier contient la liste des RDV associés à cette adresse e-mail