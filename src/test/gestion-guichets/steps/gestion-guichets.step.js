const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
const { text } = require('stream/consumers');



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

Given("L'utilisateur est sur la page \"Mes paramètres - Gestion des Services\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

Given("La page de création d’un guichet est ouverte", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
    await this.backofficePage.locator('span').filter({ hasText: "Ajouter un guichet" }).click(); 
});



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur navigue vers \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("L'utilisateur clique sur \"Mes calendriers - Gestion des Services\"", async function() {
    await this.backofficePage.locator('h3[title="Gestion des services"]').click(); 
});

When("L'utilisateur clique sur \"+ Ajouter un guichet\"", async function() {
    await this.backofficePage.locator('span').filter({ hasText: "Ajouter un guichet" }).click(); 
});

When("L'utilisateur clique sur \"Affichez tout\"", async function() {
    await this.backofficePage.locator('button.expand_button').filter({ hasText: "Afficher tout" }).click(); 
});

When("L'utilisateur complète le nom et le nom public du guichet", async function() {
    const companyName = fakerFR.company.name();
    this.guichetName = "Guichet " + companyName;
    this.guichetPublicName = "Guichet Public " + companyName;
    await this.backofficePage.locator('#accordion-infos #name').first().fill(this.guichetName);
    await this.backofficePage.locator('#accordion-infos #name').nth(1).fill(this.guichetPublicName);
});

When("Il compléte les dates d'ouverture du nouveau Guichet et cliquer sur \"Activer le calendrier glissant\"", async function() {
    // La date du jour est préselectionné par defaut
    await this.backofficePage.locator('#accordion-openning span').filter({ hasText: "Activer le calendrier glissant" }).click(); 
});

When("Il clique sur \"Ajouter un jour de fermeture\"", async function() {
    await this.backofficePage.locator('#accordion-openning button[title="Ajouter un jour de fermeture"]').click();
});

When("L'utilisateur clique dans la zone Bleue du nouveau jour de fermeture créer", async function() {
    await this.backofficePage.locator('#closed_days > div input').last().click();    
});

When("Il sélectionne une date du pour le jour de fermeture sur le calendrier qui apparait", async function() {
    // await this.backofficePage.locator('.vc-popover-content-wrapper .vc-day .vc-highlights').locator('..').locator('xpath=following-sibling::*').first().click(); 
    const jour = this.backofficePage.locator('.vc-popover-content-wrapper .vc-day .vc-highlights').locator('..').locator('xpath=following-sibling::*').locator('span').first();

    await jour.waitFor({ state: 'visible' });
    await this.backofficePage.waitForTimeout(500); // attendre que l’animation finisse
    await jour.click();
});

When("Il cliquer sur \"Ajouter une plage de fermeture\"", async function() {
    await this.backofficePage.locator('#accordion-openning button[title="Ajouter une plage de fermeture"]').click();
});

When("Il séléctionne deux dates dans le calendrier", async function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois en 2 chiffres
    const formattedBegin = `id-${year}-${month}-01`;
    const formattedEnd = `id-${year}-${month}-03`;

    await this.backofficePage.locator('#modal-closed-range .vc-weeks .' + formattedBegin + ' span').click();
    await this.backofficePage.locator('#modal-closed-range .vc-weeks .' + formattedEnd + ' span').click();
});

When("Il clique sur \"Ajouter\"", async function() {
    await this.backofficePage.locator('#modal-closed-range .modal-footer button span').filter({ hasText: "Ajouter" }).click();    
});

When("Il clique sur \"Ajouter un jour d'ouverture\"", async function() {
    await this.backofficePage.locator('#accordion-planning button').filter({ hasText: "Ajouter une plage d'ouverture" }).click();    
});
 

When("Il compléter le planning de la semaine donc ajoute les jours d'ouverture du guichet un a un du lundi au vendredi", async function() {
    // Sélectionner le jour de la semaine 1 a 1
    const jourDeLaSemaine = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Jour de la semaine:" }).locator('..');
    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    await jourDeLaSemaine.locator('span').filter({ hasText: "Choisissez les jours d'ouverture" }).click();
    for (const day of daysOfWeek) {
        await jourDeLaSemaine.locator('ul > li').filter({ hasText: day }).click();
        await this.backofficePage.waitForTimeout(500); // Attendre que le jour soit sélectionné
    }
});

When("Il sélectionne une plage horaire d'ouverture pour ce guichet pour en cliquant sur l'heure, en la modifiant à l'aide des flèches, puis en cliquant sur \"Close\"", async function() {
    // await this.backofficePage.locator('#closed_days > div input').last().click();    
    const HoraireLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Horaires:" }).locator('..');
    
    await HoraireLocator.locator('div#hours .b-form-timepicker').first().locator('> button').click();
    var selectedHour = await HoraireLocator.locator('.b-time div[title="Hours"] output bdi').textContent();

    // Changer en 9 heure l'heure sélectionnée
    nbrClicks = Math.abs(9 - parseInt(selectedHour));
    if (parseInt(selectedHour) < 9 ){
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Hours"] button[aria-label="Increment"]').first().click(); 
        }
    }else if (parseInt(selectedHour) > 9 ){
        nbrClicks = Math.abs(9 - parseInt(selectedHour));
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Hours"] button[aria-label="Decrement"]').first().click(); 
        }
    }
    await HoraireLocator.locator('.b-time footer button[aria-label="Close"]').click();



    // Parameter l'heure de fermeture
    await HoraireLocator.locator('div#hours .b-form-timepicker').last().locator('> button').click();
    var selectedHourFin = await HoraireLocator.locator('.b-time div[title="Hours"] output bdi').textContent();
    // Changer en 16:30 l'heure sélectionnée

    nbrClicks = Math.abs(16 - parseInt(selectedHourFin));
    if (parseInt(selectedHourFin) < 16 ){
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Hours"] button[aria-label="Increment"]').first().click(); 
        }
    }else if (parseInt(selectedHourFin) > 16 ){
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Hours"] button[aria-label="Decrement"]').first().click(); 
        }
    }

    var selectedMinuteFin = await HoraireLocator.locator('.b-time div[title="Minutes"] output bdi').textContent();
    nbrClicks = Math.abs(30 - parseInt(selectedMinuteFin));
    if (parseInt(selectedMinuteFin) < 30 ){
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Minutes"] button[aria-label="Increment"]').first().click(); 
        }
    }else if (parseInt(selectedMinuteFin) > 30 ){
        for (let i = 0; i < nbrClicks; i++) {
            await HoraireLocator.locator('.b-time div[title="Minutes"] button[aria-label="Decrement"]').first().click(); 
        }
    }
    await HoraireLocator.locator('.b-time footer button[aria-label="Close"]').click();
});

When("Il cliquer sur \"Choisissez les Services\" puis \"Sélectionner tout\"", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..');
    await ServicesLocator.locator('span').filter({ hasText: "Choisissez les services" }).click();
    await ServicesLocator.locator('ul > li').filter({ hasText: "Sélectionner tout" }).click();
});

When("Il cliquer sur la zone ou il y a les services séléctionné puis a nouveau sur \"Sélectionner tout\"", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..');
    await ServicesLocator.locator('.multiselect__tags').click();
    await ServicesLocator.locator('ul > li').filter({ hasText: "Sélectionner tout" }).click();
});

When("Il cliquer sur la zone ou il y a les services séléctionné puis sur un service en particulier", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..');
    // await ServicesLocator.locator('span').filter({ hasText: "Choisissez les services" }).click();   
    await ServicesLocator.locator('ul > li').filter({ hasText: "J'attends / J'accueille un enfant" }).click();
});

When("Il clique sur l'icone croix pour supprimer le services", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..');
    ServicesLocator.locator('.multiselect__tags .rounded-pill').filter({ hasText: "J'attends / J'accueille un enfant" }).locator('i.bx-x').click();
    await this.backofficePage.waitForTimeout(1000);
});

When("Il clique sur \"Appuyer pour rechercher un membre de votre equipe\"", async function() {
    await this.backofficePage.locator('#accordion-members #select-members input').first().click();
});

When("Il clique sur un membre dans la liste des membres", async function() {
   
});

When("Il clique sur l'icone corbeille pour supprimer le membre", async function() {
   
});

When("L'utilisateur clique sur \"Sauvegarder les changements\"", async function() {
    await this.backofficePage.locator('button').filter({ hasText: "Sauvegarder les changements" }).click();
});










// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("La page \"Mes paramètres\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Fonctionnalités' })).toBeVisible();
});

Then("La page création de guichet s'affiche", async function() {
    await expect(this.backofficePage.locator('label').filter({ hasText: 'Nom du guichet' })).toBeVisible();
});

Then("Toutes les zones de paramétrage du guichet sont dépliées", async function() {
    await expect(this.backofficePage.locator('#accordion-infos')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-openning')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-planning')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-members')).toHaveClass(/show/);
    await expect(this.backofficePage.locator('#accordion-activate')).toHaveClass(/show/);
});

Then("Une nouvelle jour de fermeture apparait et la date du jour est préselectionné", async function() {
    
    expect(await this.backofficePage.locator('#closed_days > div > fieldset').count()).toBeGreaterThan(0);

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const year = today.getFullYear();   
    const formattedDate = `${day}/${month}/${year}`;
    const dateInput = await this.backofficePage.locator('#closed_days > div input').last().inputValue();   
    console.log("Date préselectionnée :", dateInput);
    console.log("Date formatée :", formattedDate); 
    expect(dateInput).toBe(formattedDate);
});

Then("La date du jour de fermeture est sélectionnée", async function() {
    const nextday = new Date();
    nextday.setDate(nextday.getDate() + 1);

    const day = String(nextday.getDate()).padStart(2, '0');
    const month = String(nextday.getMonth() + 1).padStart(2, '0'); 
    const year = nextday.getFullYear();   
    const formattedDate = `${day}/${month}/${year}`;
    const dateInput = await this.backofficePage.locator('#closed_days > div input').last().inputValue();    
    expect(dateInput).toBe(formattedDate);
});

Then("Une icone de suppression est affichée et cliquable à côté de la zone du jour de fermeture", async function() {
    await expect(this.backofficePage.locator('#closed_days > div > fieldset:last-child i.bx-trash')).toBeVisible();    
});

Then("Le boutton \"Supprimer tous les jours fériés\" est visible et cliquable", async function() {
    await expect(this.backofficePage.locator('button[title="Supprimer tous les jours fériés"]')).toBeVisible();
});

Then("Un calendrier s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-closed-range header span').filter({ hasText: "Ajouter une plage de fermeture" }) ).toBeVisible();
});

Then("Chaque jours dans la plage de fermeture est affiché en tant que jour de fermeture", async function() {
    // await expect(this.backofficePage.locator('button[title="Supprimer tous les jours fériés"]')).toBeVisible();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois en 2 chiffres
    const date_1 = `id-${year}-${month}-01`;
    const date_2 = `id-${year}-${month}-02`;
    const date_3 = `id-${year}-${month}-03`;

    const dateInput_1 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[2]').locator('input').first().inputValue();   
    const dateInput_2 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('xpath=preceding-sibling::fieldset[1]').locator('input').first().inputValue();   
    const dateInput_3 = await this.backofficePage.locator('#closed_days > div fieldset').last().locator('input').first().inputValue();   

    const iso_date_1 = `01/${month}/${year}`;
    const iso_date_2 = `02/${month}/${year}`;
    const iso_date_3 = `03/${month}/${year}`;

    // console.log("Date selectionnée :", dateInput_2);
    // console.log("Date formatée :", iso_date_2); 
    // await this.backofficePage.waitForTimeout(10000); // Attendre que le jour soit sélectionné

    expect(dateInput_1).toBe(iso_date_1);
    expect(dateInput_2).toBe(iso_date_2);
    expect(dateInput_3).toBe(iso_date_3);
});

Then("La selection du planning de la semaine s'effectue correctement", async function() {
    // await expect(this.backofficePage.locator('button[title="Supprimer tous les jours fériés"]')).toBeVisible();

    const jourDeLaSemaine = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Jour de la semaine:" }).locator('..');
    const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    // await jourDeLaSemaine.locator('span').filter({ hasText: "Choisissez les jours d'ouverture" }).click();
    await this.backofficePage.mouse.click(10, 10);
    for (const day of daysOfWeek) {
        await expect(jourDeLaSemaine.locator('.multiselect__tags span').filter({ hasText: day }).first()).toBeVisible();
        await this.backofficePage.waitForTimeout(500); // Attendre que le jour soit sélectionné
    }
});

Then("La selection du plage horaire d'ouverture de la semaine s'effectue correctement", async function() {
    const HoraireLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Horaires:" }).locator('..');

    await expect(await HoraireLocator.locator('div#hours .b-form-timepicker ').first().locator('label').textContent()).toBe("09:00");
    await expect(await HoraireLocator.locator('div#hours .b-form-timepicker ').last().locator('label').textContent()).toBe("16:30");
});

Then("Tous les services sont sélectionnés", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..'); 
    expect(await ServicesLocator.locator('.multiselect__tags .rounded-pill').count()).toBeGreaterThan(2);
});

Then("Tous les services sont désélectionnés", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..'); 
    expect(await ServicesLocator.locator('.multiselect__tags .rounded-pill').count()).toBe(0);
});

Then("Le service est ajouté à la liste des services sélectionnés", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..'); 
    expect(await ServicesLocator.locator('.multiselect__tags .rounded-pill').filter({ hasText: "J'attends / J'accueille un enfant" }).count()).toBeGreaterThan(0);
});

Then("Le service est supprimé de la liste des services sélectionnés", async function() {
    const ServicesLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Services:" }).locator('..'); 
    expect(await ServicesLocator.locator('.multiselect__tags .rounded-pill').filter({ hasText: "J'attends / J'accueille un enfant" }).count()).toBe(0);
});

Then("Le champ pause apres RDV est modifiale - a parametrer a 5mn", async function() {
    const pauseApresRdvLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Pause après RDV:" }).locator('..'); 
    const inputLocator = pauseApresRdvLocator.locator('input').first();
    
    await expect(inputLocator).toBeEnabled();
    await inputLocator.fill('5');
});

Then("Le champ mode de RDV est modifiable - a parametrer a \"Physique\"", async function() {
    const modeDeRdvLocator = this.backofficePage.locator('#accordion-planning > div fieldset').last().locator('span').filter({ hasText: "Modes de RDV:" }).locator('..'); 
    
    const inputLocator = modeDeRdvLocator.locator('input').first();
    await expect(inputLocator).toBeEnabled();
    
    await modeDeRdvLocator.locator('.vue-treeselect__input').first().click();
    await modeDeRdvLocator.locator('.vue-treeselect__menu-container label').filter({ hasText: "physique" }).click();
});

Then("Un champ d'ajout de membre est visible et modifiable", async function() {
    await expect(this.backofficePage.locator('#accordion-members #select-members input').first()).toBeEnabled();
});

Then("Le membre est ajouté à la liste des membres du guichet", async function() {
    
});

Then("Le membre est supprimé de la liste des membres du guichet", async function() {
    
});

Then("Les champ \"Autoriser les réservations par vos usagers\" est visible et modifiable", async function() {
    await expect(this.backofficePage.locator('#accordion-activate span').filter({ hasText: "Autoriser les réservations par vos usagers" })).toBeEnabled();
});

Then("Le champ \"Autoriser les réservations en interne\" est visible", async function() {
    await expect(this.backofficePage.locator('#accordion-activate span').filter({ hasText: "Autoriser les réservations en interne" })).toBeEnabled();
});

Then("Le guichet est créé et le message de confirmation s'affiche", async function() {
    // await expect(this.backofficePage.locator('#accordion-activate span').filter({ hasText: "Autoriser les réservations en interne" })).toBeEnabled();
    try {
        await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Nous avons pris en compte vos changements')).toBeVisible();
        await expect(this.backofficePage.locator('.desks-card table > tbody > tr > td').filter({ hasText: this.guichetName }) ).toBeVisible();

        // Néttoyage de la base de données
        this.backofficePage.locator('.desks-card table > tbody > tr > td').filter({ hasText: this.guichetName }).locator('..').locator('i[title="Supprimer un guichet: attention, en supprimant ce guichet, vous supprimez les RDV affectés à ce guichet."]').click();
        await this.backofficePage.waitForTimeout(1000); 
        await this.backofficePage.locator('#delete-desk-modal button').filter({ hasText: "Oui" }).click();
        await this.backofficePage.locator('#confirm-to-save-modal button[aria-label="Close"]').click();
        await this.backofficePage.waitForTimeout(1000); 
        await this.backofficePage.locator('button[title="Enregistrer"]').click();
        await this.backofficePage.waitForTimeout(2000); 
    } catch (error) {
        throw error; // Rejeter l'erreur pour que le test échoue toujours
    }
});
