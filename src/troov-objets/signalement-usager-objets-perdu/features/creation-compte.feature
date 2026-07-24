@CreationCompte
Feature: Creation de compte utilisateur

 ##   Scenario: Tentative de creation de compte avec un champ obligatoire manquant
 ##       Given L'utilisateur atteint la modale d'inscription depuis une declaration d'objet perdu
 ##       When L'utilisateur saisit les informations en laissant un champ obligatoire vide (Email)
 ##           * L'utilisateur valide le formulaire sur le bouton "Accepter"
 ##       Then Un message d'erreur indique que le champ est requis
 ##           * Le compte n'est pas cree


 ## Scenario Outline: Validation des cases a cocher et du Captcha lors de la creation de compte
 ##   Given L'utilisateur atteint la modale d'inscription depuis une declaration d'objet perdu
 ##   When L'utilisateur saisit toutes les informations obligatoires
 ##     * L'utilisateur <action_newsletter> la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
 ##     * L'utilisateur <action_conditions> la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialite"
 ##     * L'utilisateur <action_captcha> le champ Captcha "Je ne suis pas un robot"
 ##     * L'utilisateur valide le formulaire sur le bouton "Accepter"
 ##  Then <resultat>

 ##   Examples:
 ##    | action_newsletter | action_conditions | action_captcha        | resultat                                             |
 ##    | ne coche pas      | coche             | remplit correctement  | Le compte est cree avec succes                       |
 ##     | coche             | ne coche pas      | remplit correctement  | Un message d'erreur indique que le champ est requis |


     Scenario: Creation de compte avec tous les champs obligatoires renseignes
         Given L'utilisateur atteint la modale d'inscription depuis une declaration d'objet perdu
         When L'utilisateur saisit les informations obligatoires (Civilite, Nom, Prenom, Email, Telephone, Mot de passe)
             * L'utilisateur coche la case "J'accepte de recevoir des infos et offres commerciales des partenaires de Troov (email, sms)"
             * L'utilisateur coche la case "J'ai lu et j'accepte les conditions d'utilisation ainsi que la politique de confidentialite"
             * L'utilisateur saisit le texte affiche dans le champ Captcha "Je ne suis pas un robot"
             * L'utilisateur valide le formulaire sur le bouton "Accepter"
         Then Le compte utilisateur est cree
             * L'utilisateur est redirigé vers son tableau de bord
