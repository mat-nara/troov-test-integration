const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium, firefox, webkit } = require('@playwright/test');
const exp = require('constants');



setDefaultTimeout(120 * 1000);


Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate();
    await this.loginPageAlt.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);

    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});

Given("L'utilisateur est sur la page \"Gestion de la file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-reservation span[title="File d\'attente"]').click(); 
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
});

Given("L'utilisateur est sur la page \"Paramètres\" et le menu \"Mon compte\" est ouverte", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
});

Given("L'utilisateur est sur la page \"Gestion de la file d'attente\" avec un autres navigateur", async function() {
//    this.setupBrowser = await webkit.launch({ headless: false });
//    this.setupContext = await this.setupBrowser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
//    this.backofficePageAlt = await this.setupContext.newPage();
//    this.setupLoginPage = new LoginPage(this.backofficePageAlt);
//    await this.setupLoginPage.navigate(this.backofficePageAlt);
//    await this.setupLoginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
//
//    // *** Naviger vers parametres *** //
//    await this.backofficePageAlt.locator('i[title="Paramètres"]').click(); 
//    await this.backofficePageAlt.locator('#common-reservation span[title="File d\'attente"]').click(); 
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("L'utilisateur clique sur \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("Il clique sur \"File d'attente - Gestion de la file d'attente\"", async function() {
    await this.backofficePage.locator('#common-reservation span[title="File d\'attente"]').click(); 
});

When("Il clique sur \"Paramètres généraux\"", async function() {
    await this.backofficePage.locator('h2').filter({ hasText: "Paramètres généraux ( salle d'attente, membres, divers...)" }).click();
});

When("Il clique sur \"Ajouter une salle d'attente\" puis \"Choisissez les Services\" et choisi \"Tout sélectionner\"", async function() {
    await this.backofficePage.locator('button[title="Ajouter une salle d\'attente"]').click();
    const salleLocator =   this.backofficePage.locator('h3')
                                              .filter({ hasText: "Salles d'attentes" })
                                              .locator('xpath=following-sibling::*')
                                              .locator('xpath=following-sibling::*')
                                              .locator('> div:first-child > div:last-child > div')
    const spanServicelocator = salleLocator.locator('span').filter({ hasText: "Choisissez les services" });
    await spanServicelocator.click();
    const serviceFirstListLocator = salleLocator.locator('div.multiselect__content-wrapper > ul > li > span > span').filter({ hasText: "Sélectionner tout" });
    await serviceFirstListLocator.click();
});


When("L'utilisateur clique sur \"Ajouter un membre\"", async function() {
    this.countMembre = await  this.backofficePage.locator('h3')
                             .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
                             .locator('xpath=following-sibling::*')
                             .locator('xpath=following-sibling::*')
                             .locator('> div:first-child > div')
                             .count();
    await this.backofficePage.locator('button[title="Ajouter un membre"]').click();
});

//When("Il sélectionne un agent et un rôle", async function() {
//
//   // Séletionne un agent
//   const agentlocator = this.backofficePage.locator('h3')
//                                            .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
//                                            .locator('xpath=following-sibling::*')
//                                            .locator('xpath=following-sibling::*')
//                                            .locator('> div:first-child > div:last-child > div')
//    
//    const spanAgentlocator = agentlocator.locator('span').filter({ hasText: "Choisissez l'agent" });
//    await spanAgentlocator.click();
//    const agentListLocator = agentlocator.locator('div.multiselect__content-wrapper > ul > li');
//    await agentListLocator.nth(1).click();
//
//    // Sélectionne un rôle
//    const rolelocator = this.backofficePage.locator('h3')
//                                            .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
//                                            .locator('xpath=following-sibling::*')
//                                            .locator('xpath=following-sibling::*')
//                                            .locator('> div:first-child > div:last-child > div')
//
//    const spanRolelocator = rolelocator.locator('span').filter({ hasText: "Choisissez le rôle" });
//    await spanRolelocator.click();
//    const roleListLocator = rolelocator.locator('div.multiselect__content-wrapper > ul > li');
//    await roleListLocator.nth(1).click();
//});

When("Il clique sur l'icône corbeille d'un membre", async function() {
    const deleteMembreLocator = this.backofficePage.locator('h3')
                                                    .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('> div:first-child > div i.bx-trash').first();
    await deleteMembreLocator.click();
});

When("L'utilisateur modifie chaque horaire de fermeture de la semaine de 18h à 17h", async function() {
     
    const dayLocator = this.backofficePage.locator('h3')
                                                    .filter({ hasText: "Heures de fermeture de la file d'attente" })
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('fieldset div.day-row')
    await dayLocator.locator('div > label').filter({ hasText: "Lundi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Mardi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Mercredi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Jeudi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Vendredi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Samedi" }).locator('xpath=following-sibling::select').selectOption({ label: '17:00' });
});

When("Il clique sur \"Sauvegarder les changements\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(2000); // wait for 2 seconds
});

When("Il clique sur \"Paramètres\" pour revenir à la page principale et réouvre la page \"Gestion de la file d'attente\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-reservation span[title="File d\'attente"]').click(); 
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
    await this.backofficePage.locator('h2').filter({ hasText: "Paramètres généraux ( salle d'attente, membres, divers...)" }).click();
});

When("Il clique sur \"Paramétrage des alertes et automatisation\"", async function() {
    await this.backofficePage.locator('h2').filter({ hasText: "Paramétrage des alertes et automatisation" }).click();
});

When("L'utilisateur modifie chaques champs disponibles de la section \"Paramétrage des alertes et automatisation\"", async function() {

    const RdvEnCoursLocator                      = await this.backofficePage.locator('label').filter({ hasText: "RDV en cours" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvEnPauseLocator                      = await this.backofficePage.locator('label').filter({ hasText: "RDV en pause" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvAttenduJamaisArriveLocator          = await this.backofficePage.locator('label').filter({ hasText: "RDV attendu qui n'est jamais arrivé" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const DureeAvantApresPresentationRdvLocator  = await this.backofficePage.locator('label').filter({ hasText: "Durée avant ou apres laquelle un RDV peut se présenter" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvDansFileDAttenteDepuisPlusLocator   = await this.backofficePage.locator('label').filter({ hasText: "RDV qui est dans la file d'attente depuis plus de :" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const TempsAttenteGlobalMoyenneLocator       = await this.backofficePage.locator('label').filter({ hasText: "Temps d'attente global moyen" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const NbrVisiteurTempsReelLocator            = await this.backofficePage.locator('label').filter({ hasText: "Nombre de visiteurs en temps réel" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvConsidereEnAvanceLocator            = await this.backofficePage.locator('label').filter({ hasText: "RDV considéré en avance (RAV)" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvConsidereEnRetardLocator            = await this.backofficePage.locator('label').filter({ hasText: "RDV considéré en retard (RAP)" }).locator('xpath=following-sibling::*').locator('input[type="number"]')

    this.oldRdvEnCours                      = await RdvEnCoursLocator.inputValue();
    this.oldRdvEnPause                      = await RdvEnPauseLocator.inputValue();
    this.oldRdvAttenduJamaisArrive          = await RdvAttenduJamaisArriveLocator.inputValue();
    this.oldDureeAvantApresPresentationRdv  = await DureeAvantApresPresentationRdvLocator.inputValue();
    this.oldRdvDansFileDAttenteDepuisPlus   = await RdvDansFileDAttenteDepuisPlusLocator.inputValue();
    this.oldTempsAttenteGlobalMoyenne       = await TempsAttenteGlobalMoyenneLocator.inputValue();
    this.oldNbrVisiteurTempsReel            = await NbrVisiteurTempsReelLocator.inputValue();
    this.oldRdvConsidereEnAvance            = await RdvConsidereEnAvanceLocator.inputValue();
    this.oldRdvConsidereEnRetard            = await RdvConsidereEnRetardLocator.inputValue();
    
    this.newRdvEnCours                      = parseInt(this.oldRdvEnCours, 10) + 1 
    this.newRdvEnPause                      = parseInt(this.oldRdvEnPause, 10) + 1 
    this.newRdvAttenduJamaisArrive          = parseInt(this.oldRdvAttenduJamaisArrive, 10) + 1 
    this.newDureeAvantApresPresentationRdv  = parseInt(this.oldDureeAvantApresPresentationRdv, 10) + 1 
    this.newRdvDansFileDAttenteDepuisPlus   = parseInt(this.oldRdvDansFileDAttenteDepuisPlus, 10) + 1 
    this.newTempsAttenteGlobalMoyenne       = parseInt(this.oldTempsAttenteGlobalMoyenne, 10) + 1 
    this.newNbrVisiteurTempsReel            = parseInt(this.oldNbrVisiteurTempsReel, 10) + 1 
    this.newRdvConsidereEnAvance            = parseInt(this.oldRdvConsidereEnAvance, 10) + 1 
    this.newRdvConsidereEnRetard            = parseInt(this.oldRdvConsidereEnRetard, 10) + 1 

    await RdvEnCoursLocator.fill(this.newRdvEnCours.toString());
    await RdvEnPauseLocator.fill(this.newRdvEnPause.toString());
    await RdvAttenduJamaisArriveLocator.fill(this.newRdvAttenduJamaisArrive.toString());
    await DureeAvantApresPresentationRdvLocator.fill(this.newDureeAvantApresPresentationRdv.toString());
    await RdvDansFileDAttenteDepuisPlusLocator.fill(this.newRdvDansFileDAttenteDepuisPlus.toString());
    await TempsAttenteGlobalMoyenneLocator.fill(this.newTempsAttenteGlobalMoyenne.toString());
    await NbrVisiteurTempsReelLocator.fill(this.newNbrVisiteurTempsReel.toString());
    await RdvConsidereEnAvanceLocator.fill(this.newRdvConsidereEnAvance.toString());
    await RdvConsidereEnRetardLocator.fill(this.newRdvConsidereEnRetard.toString());
});


When("Il clique sur \"Paramétrage du matériel\"", async function() {
    //await this.backofficePageAlt.locator('h2').filter({ hasText: "Paramétrage du matériel" }).click();
    await this.backofficePage.locator('h2').filter({ hasText: "Paramétrage du matériel" }).click();
});

When("L'utilisateur clique sur \"Copier le lien de l'écran d'appel\"", async function() {
//    this.backofficePageAlt.locator('h2').filter({ hasText: "Ecran d'appel" }).locator('../..').locator('div.actions > button.copy-link').click();
//    this.clipboardText = await this.backofficePageAlt.evaluate(() => navigator.clipboard.readText());
//
    this.backofficePage.locator('h2').filter({ hasText: "Ecran d'appel" }).locator('../..').locator('div.actions > button.copy-link').click();
    this.clipboardText = await this.backofficePage.evaluate(() => navigator.clipboard.readText());
});

When("Il colle le lien dans la barre d’adresse du navigateur et l’exécute", async function() {
    // this.callscreenPage = await this.setupContext.newPage();

    this.callscreenPage = await this.context.newPage();
    await this.callscreenPage.goto(this.clipboardText); 
    await this.callscreenPage.waitForTimeout(2000); // wait for 2 seconds
});







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page \"Gestion de la file d'attente\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: "Paramètres généraux ( salle d'attente, membres, divers...)" }) ).toBeVisible();
});

Then("La section des \"Paramètres généraux\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h3').filter({ hasText: "Salles d'attentes" }) ).toBeVisible();
});

Then("Tous les services sont sélectionnés", async function() {
    const salleLocator =   this.backofficePage.locator('h3')
                                            .filter({ hasText: "Salles d'attentes" })
                                            .locator('xpath=following-sibling::*')
                                            .locator('xpath=following-sibling::*')
                                            .locator('> div:first-child > div:last-child > div')
    const count = await salleLocator.locator('div.multiselect__tags > div > span.multiselect-tag').count(); 
    await expect(count).toBeGreaterThan(2);
});

Then("Un nouveau champ d'associacion membre agent - role s'affiche", async function() {
    this.countMembreNew = await this.backofficePage.locator('h3')
        .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
        .locator('xpath=following-sibling::*')
        .locator('xpath=following-sibling::*')
        .locator('> div:first-child > div')
        .count();
        await expect(this.countMembre).toBe(this.countMembreNew - 1);
});

Then("Après avoir cliqué sur \"Choisissez l'agent\", la liste s'affiche et l'utilisateur peut sélectionner un agent", async function() {
    const agentlocator = this.backofficePage.locator('h3')
        .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
        .locator('xpath=following-sibling::*')
        .locator('xpath=following-sibling::*')
        .locator('> div:first-child > div:last-child > div')
         
    const spanAgentlocator = agentlocator.locator('span').filter({ hasText: "Choisissez l'agent" });
    await spanAgentlocator.click();
    const agentListLocator = agentlocator.locator('div.multiselect__content-wrapper > ul > li');
    await expect(agentListLocator.first()).toBeVisible();
    await agentListLocator.first().click();
    const content = await agentListLocator.first().locator('> span > span').textContent();
    await expect(agentlocator.locator('span').filter({ hasText: content }).first() ).toBeVisible();
});

Then("Après avoir cliqué sur \"Choisissez le rôle\", la liste des rôles s'affiche et l'utilisateur peut en sélectionner un", async function() {
    const rolelocator = this.backofficePage.locator('h3')
                                            .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
                                            .locator('xpath=following-sibling::*')
                                            .locator('xpath=following-sibling::*')
                                            .locator('> div:first-child > div:last-child > div')
     
    const spanRolelocator = rolelocator.locator('span').filter({ hasText: "Choisissez le rôle" });
    await spanRolelocator.click();
    const roleListLocator = rolelocator.locator('div.multiselect__content-wrapper > ul > li');
    await expect(roleListLocator.first()).toBeVisible();
    await roleListLocator.first().click();
    const content = await roleListLocator.first().locator('> span > span').textContent();
    await expect(rolelocator.locator('span').filter({ hasText: content }).first() ).toBeVisible();
});

Then("L'association membre - agent - role est supprimé de la liste", async function() {
    this.countMembreNew = await this.backofficePage.locator('h3')
        .filter({ hasText: "Membres (Ajouter / Modifier / Supprimer)" })
        .locator('xpath=following-sibling::*')
        .locator('xpath=following-sibling::*')
        .locator('> div:first-child > div')
        .count();
    await expect(this.countMembre).toBe(this.countMembreNew);
});

Then("Les nouvelles heures de fermeture sont affichées", async function() {

    const dayLocator = this.backofficePage.locator('h3')
                                            .filter({ hasText: "Heures de fermeture de la file d'attente" })
                                            .locator('xpath=following-sibling::*')
                                            .locator('xpath=following-sibling::*')
                                            .locator('fieldset div.day-row')
                                            
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

    for (const jour of jours) {
    const selectLocator = dayLocator
        .locator('div > label')
        .filter({ hasText: jour })
        .locator('xpath=following-sibling::select');

    const selectedValue = await selectLocator.inputValue();
    expect(selectedValue).toBe('17:00');
    }

    // Restaurer les heures de fermeture à 18h
    await dayLocator.locator('div > label').filter({ hasText: "Lundi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Mardi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Mercredi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Jeudi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Vendredi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });
    await dayLocator.locator('div > label').filter({ hasText: "Samedi" }).locator('xpath=following-sibling::select').selectOption({ label: '18:00' });

    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(2000); // wait for 2 seconds
});

Then("Les options de la section \"Autres paramétrages\" sont modifiables", async function() {
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation d'une alerte sonore et visuelle quand un nouvel usager arrive en file d'attente sur un de mes services" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Phrase à afficher pour le public prioritaire" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation du mode selection de guichet" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la lecture du numéro de ticket" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la mise en pause d'un rendez-vous" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
    await expect(this.backofficePage.locator('label').filter({ hasText: "Activation de la visibilité du temps d'attente sur l'écran d'appel" }).locator('..').locator('input[type="checkbox"]')).toBeEnabled();
});

Then("Chaques modification ont été correctement sauvegardé", async function() {
    const RdvEnCoursLocator                      = await this.backofficePage.locator('label').filter({ hasText: "RDV en cours" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvEnPauseLocator                      = await this.backofficePage.locator('label').filter({ hasText: "RDV en pause" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvAttenduJamaisArriveLocator          = await this.backofficePage.locator('label').filter({ hasText: "RDV attendu qui n'est jamais arrivé" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const DureeAvantApresPresentationRdvLocator  = await this.backofficePage.locator('label').filter({ hasText: "Durée avant ou apres laquelle un RDV peut se présenter" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvDansFileDAttenteDepuisPlusLocator   = await this.backofficePage.locator('label').filter({ hasText: "RDV qui est dans la file d'attente depuis plus de :" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const TempsAttenteGlobalMoyenneLocator       = await this.backofficePage.locator('label').filter({ hasText: "Temps d'attente global moyen" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const NbrVisiteurTempsReelLocator            = await this.backofficePage.locator('label').filter({ hasText: "Nombre de visiteurs en temps réel" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvConsidereEnAvanceLocator            = await this.backofficePage.locator('label').filter({ hasText: "RDV considéré en avance (RAV)" }).locator('xpath=following-sibling::*').locator('input[type="number"]')
    const RdvConsidereEnRetardLocator            = await this.backofficePage.locator('label').filter({ hasText: "RDV considéré en retard (RAP)" }).locator('xpath=following-sibling::*').locator('input[type="number"]')

    expect(await RdvEnCoursLocator.inputValue()).toBe(this.newRdvEnCours.toString());
    expect(await RdvEnPauseLocator.inputValue()).toBe(this.newRdvEnPause.toString());
    expect(await RdvAttenduJamaisArriveLocator.inputValue()).toBe(this.newRdvAttenduJamaisArrive.toString());
    expect(await DureeAvantApresPresentationRdvLocator.inputValue()).toBe(this.newDureeAvantApresPresentationRdv.toString());
    expect(await RdvDansFileDAttenteDepuisPlusLocator.inputValue()).toBe(this.newRdvDansFileDAttenteDepuisPlus.toString());
    expect(await TempsAttenteGlobalMoyenneLocator.inputValue()).toBe(this.newTempsAttenteGlobalMoyenne.toString());
    expect(await NbrVisiteurTempsReelLocator.inputValue()).toBe(this.newNbrVisiteurTempsReel.toString());
    expect(await RdvConsidereEnAvanceLocator.inputValue()).toBe(this.newRdvConsidereEnAvance.toString());
    expect(await RdvConsidereEnRetardLocator.inputValue()).toBe(this.newRdvConsidereEnRetard.toString());

    // Restaurer les anciennnes valeurs
    await RdvEnCoursLocator.fill(this.oldRdvEnCours.toString());
    await RdvEnPauseLocator.fill(this.oldRdvEnCours.toString());
    await RdvAttenduJamaisArriveLocator.fill(this.oldRdvEnCours.toString());
    await DureeAvantApresPresentationRdvLocator.fill(this.oldRdvEnCours.toString());
    await RdvDansFileDAttenteDepuisPlusLocator.fill(this.oldRdvEnCours.toString());
    await TempsAttenteGlobalMoyenneLocator.fill(this.oldRdvEnCours.toString());
    await NbrVisiteurTempsReelLocator.fill(this.oldRdvEnCours.toString());
    await RdvConsidereEnAvanceLocator.fill(this.oldRdvEnCours.toString());
    await RdvConsidereEnRetardLocator.fill(this.oldRdvEnCours.toString());

    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(2000); // wait for 2 seconds

});

Then("La section \"Paramétrage du matériel\" s'affiche", async function() {
    // expect(this.backofficePageAlt.locator('h2').filter({ hasText: "Ecran d'appel" }) ).toBeVisible();
    expect(this.backofficePage.locator('h2').filter({ hasText: "Ecran d'appel" }) ).toBeVisible();
});

Then("Le lien est copié dans le presse-papiers", async function() {
    console.log('this.clipboardText: ', this.clipboardText)
    expect(this.clipboardText).toContain('https');
});

Then("L'écran d'appel s'affiche", async function() {
    await expect(this.callscreenPage.locator('div').filter({ hasText: "RDV appelés / en cours" }).first() ).toBeVisible();
});


