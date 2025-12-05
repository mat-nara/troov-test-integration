@SignalementAgentSansRdvMotif
Feature: Signalement d'une arrivée sans RDV (agent): Motif 

  
  Background:
    Given L'utilisateur est connecté à l'application Troov
        * La page "Choisir le motif de visite" d'un signalement sans rendez-vous est ouverte

  Scenario: Selection du motif/sous-motif
    Given Choisir motif: "Enfant"
        * Choisir sous-motif: "J'attends / J'accueille un enfant"
    When Cliquer sur 'Continuer' de la page motif
    Then Passe à l'etape suivant: "L’usager a été ajouté dans la file d’attente" s'affiche sur la page

#  Scenario Outline: Validité des sous motif par rapport au motif
#    When Choisir motif: "<motif>"
#    Then Chaque sous-motif de la liste doit contenir: "<motClef>"
#
#  Examples:
#    | motif                     | motClef             |
#    | Enfant                    | enfant              |
#    | Handicap                  | handicapé           |
#    | Situation professionnelle | Je suis travailleur |

  Scenario: Boutton quitter de la page motif: On revient sur la page initiale pour le signalement d'une arrivée
    When Cliquer sur 'Quitter' de la page motif
    Then Revient sur la page initiale depuis la page motif: "Signaler l’arrivée d’un usager" s'affiche sur la page