@authenticated @SignalementAgentSansRdvEnregistrement
Feature: Signalement d'une arrivée sans RDV (usager): Enregistrement 

  Background:
    Given La fenêtre "Informations de l'usager" sans rendez-vous est ouverte

		Scenario: Nom uniquement saisi : On peut passer à l'étape suivante
			Given Le nom uniquement est saisi | signalement sans rendez-vous
      When L'utilisateur clique sur 'Valider' sur la page des informations de l'usager pour un signalement sans rendez-vous
      Then L'étape suivante est atteinte : "Sélectionnez le RDV qui concerne l'usager" s'affiche sur la page après la page des informations de l'usager
        *  Le nom saisi récemment s'affiche sur la page de confirmation

		Scenario: Prénom uniquement saisi : On peut passer à l'étape suivante
			Given Le prénom uniquement est saisi | signalement sans rendez-vous
      When L'utilisateur clique sur 'Valider' sur la page des informations de l'usager pour un signalement sans rendez-vous
      Then L'étape suivante est atteinte : "Sélectionnez le RDV qui concerne l'usager" s'affiche sur la page après la page des informations de l'usager
        *  Le prénom saisi récemment s'affiche sur la page de confirmation

		Scenario: Nom et prénom saisi : On peut passer à l'étape suivante
			Given Le nom et le prénom sont saisis | signalement sans rendez-vous
      When L'utilisateur clique sur 'Valider' sur la page des informations de l'usager pour un signalement sans rendez-vous
      Then L'étape suivante est atteinte : "Sélectionnez le RDV qui concerne l'usager" s'affiche sur la page après la page des informations de l'usager
        *  Le nom et le prénom saisi récemment s'affiche sur la page de confirmation
		
		Scenario: Nom dans un mauvais format: Un message d'erreur s'affiche
			Given que le nom est saisi au mauvais format dans un signalement sans rendez-vous
      Then un message d'erreur relatif au nom s'affiche
		
		Scenario: Prénom dans un mauvais format: Un message d'erreur s'affiche
			Given que le prénom est saisi dans un mauvais format dans un signalement sans rendez-vous
      Then un message d'erreur relatif au prénom s'affiche

		Scenario: Bouton Valider : On peut passer à l'étape suivante
			Given Le nom et le prénom sont saisis | signalement sans rendez-vous
      When L'utilisateur clique sur 'Valider' sur la page des informations de l'usager pour un signalement sans rendez-vous
      Then L'étape suivante est atteinte : "Sélectionnez le RDV qui concerne l'usager" s'affiche sur la page après la page des informations de l'usager
    
    Scenario: Bouton Retour de la page informations de l'usager : On revient sur la page choix du service d'un signalement sans rendez-vous
        When L'utilisateur clique sur 'Retour' de la page des informations de l'usager
        Then L'utilisateur revient sur la page de choix du service pour un signalement sans rendez-vous : "Je choisis le service pour lequel l’usager souhaite prendre un RDV" s'affiche sur la page
    