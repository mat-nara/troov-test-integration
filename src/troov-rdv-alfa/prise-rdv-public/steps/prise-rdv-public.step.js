const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { faker, fakerFR  } = require('@faker-js/faker');


setDefaultTimeout(120 * 1000);

/**
 * Génère une date de naissance réaliste entre 18 et 80 ans.
 * @returns {string} Date au format dd/mm/yyyy
 */
function generateBirthDate() {
  const birthDate = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });

  const day = String(birthDate.getDate()).padStart(2, '0');
  const month = String(birthDate.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
  const year = birthDate.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Génère un nombre aléatoire à 10 chiffres sans boucle
 * @returns {string} Nombre à 10 chiffres
 */
function generateANTS() {
  return String(Math.floor(Math.random() * 1_000_000_0000)).padStart(10, '0');
}



Given("L'utilisateur est connecté à l'application Troov", async function() {
  
	//***********************   Login Backoffice *************************/
    await this.backofficePage.goto(config.troovPublicUserBackofficeURL);
    await this.backofficePage.waitForTimeout(2000);

    await this.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
    await this.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
    await this.backofficePage.locator('button[type="submit"]').first().click();

    await this.backofficePage.waitForTimeout(2000);
    if (await this.backofficePage.locator('#password').isVisible()) {
        await this.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await this.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await this.backofficePage.locator('button[type="submit"]').first().click();
    }

    await this.backofficePage.waitForTimeout(2000);
    if (await this.backofficePage.locator('#password').isVisible()) {
        await this.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await this.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await this.backofficePage.locator('button[type="submit"]').first().click();
    }

    await this.backofficePage.waitForTimeout(2000);
    if (await this.backofficePage.locator('#password').isVisible()) {
        await this.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await this.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await this.backofficePage.locator('button[type="submit"]').first().click();
    }

	// wait for backoffice loaded
	await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

	let currentURL = await this.backofficePage.url();
	while (!currentURL.includes('calendar')) {

		await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
		currentURL = await this.backofficePage.url();
	}
	expect(await this.backofficePage.url()).toContain('calendar');
});



Given("La page de sélection de la personne et du service est ouverte", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();
});

Given("La page \"Pré-demande ANTS\" est ouverte", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();


    // Sélection d'un service et confirmation pour arriver à la page "Pré-demande ANTS"
    await this.publicPage.locator('.service-applicant span').filter({ hasText: 'CNI' }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();

    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();
});

Given("La page \"Créneaux\" est ouverte", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();


    // Sélection d'un service et confirmation pour arriver à la page "Pré-demande ANTS"
    await this.publicPage.locator('.service-applicant span').filter({ hasText: 'CNI' }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();

    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();

    // Clique sur "J'ai fait ma pré-demande, je prends RDV"
    await this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" }).click();

    // Information important
    await expect(this.publicPage.locator('span', { hasText: '- Informations importantes' })).toBeVisible();
    await this.publicPage.locator('label').filter({ hasText: 'J\'ai bien lu l\'ensemble des informations disponibles sur le site' }).click();
    await this.publicPage.locator('button').filter({ hasText: 'Prendre rendez-vous' }).click();
    
    // Vérification de la page "Créneaux"
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();
    await this.publicPage.setDefaultTimeout(2000);
});

Given("La page \"Vos coordonnées\" est ouverte", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();


    // Sélection d'un service et confirmation pour arriver à la page "Pré-demande ANTS"
    await this.publicPage.locator('.service-applicant span').filter({ hasText: 'CNI' }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();

    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();

    // Clique sur "J'ai fait ma pré-demande, je prends RDV"
    await this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" }).click();
    
    // Information important
    await expect(this.publicPage.locator('span', { hasText: '- Informations importantes' })).toBeVisible();
    await this.publicPage.locator('label').filter({ hasText: 'J\'ai bien lu l\'ensemble des informations disponibles sur le site' }).click();
    await this.publicPage.locator('button').filter({ hasText: 'Prendre rendez-vous' }).click();
    
    // Vérification de la page "Créneaux"
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();

    // Sélection d'un créneau pour arriver à la page "Vos coordonnées"
    await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().click();
    await this.publicPage.locator('button:has-text("Valider le calendrier")').click();
    await expect(this.publicPage.locator('span', { hasText: '- Vos coordonnées' })).toBeVisible();
});

Given("La page \"Confirmez votre demande\" est ouverte", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();


    // Sélection d'un service et confirmation pour arriver à la page "Pré-demande ANTS"
    await this.publicPage.locator('.service-applicant span').filter({ hasText: 'CNI' }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();

    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();

    // Clique sur "J'ai fait ma pré-demande, je prends RDV"
    await this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" }).click();
    
    // Information important
    await expect(this.publicPage.locator('span', { hasText: '- Informations importantes' })).toBeVisible();
    await this.publicPage.locator('label').filter({ hasText: 'J\'ai bien lu l\'ensemble des informations disponibles sur le site' }).click();
    await this.publicPage.locator('button').filter({ hasText: 'Prendre rendez-vous' }).click();
    
    // Vérification de la page "Créneaux"
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();

    // Sélection d'un créneau pour arriver à la page "Vos coordonnées"
    this.selectedDate = await this.publicPage.locator('.date-container.date-active').textContent();
    this.selectedTime = await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().textContent(); 

    await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().click();
    await this.publicPage.locator('button:has-text("Valider le calendrier")').click();
    await expect(this.publicPage.locator('span', { hasText: '- Vos coordonnées' })).toBeVisible();



    // Remplissage des coordonnées pour arriver à la page "Confirmez votre demande"

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';
    this.phone = generateRandomPhone();
    this.dob = generateBirthDate();
    this.ANTS = generateANTS();
    // Fill the form
    await this.publicPage.locator('input#lastname').fill(this.name);
    await this.publicPage.locator('input#firstname').fill(this.firstname);
    await this.publicPage.locator('input#email').fill(this.email);
    await this.publicPage.locator('input#phone').fill(this.phone);
    await this.publicPage.locator('input#birthdate').fill(this.dob);
    await this.publicPage.locator('div#ants-number > input').fill(this.ANTS);
    await this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' }).click();
    await expect(this.publicPage.locator('span', { hasText: '- Confirmez votre demande' })).toBeVisible();

});

Given("Un rendez-vous a été pris depuis la prise de RDV public", async function() {
    // Page "Accéder aux services"
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
    await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();


    // Sélection d'un service et confirmation pour arriver à la page "Pré-demande ANTS"
    await this.publicPage.locator('.service-applicant span').filter({ hasText: 'CNI' }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();

    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();

    // Clique sur "J'ai fait ma pré-demande, je prends RDV"
    await this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" }).click();
    
    // Information important
    await expect(this.publicPage.locator('span', { hasText: '- Informations importantes' })).toBeVisible();
    await this.publicPage.locator('label').filter({ hasText: 'J\'ai bien lu l\'ensemble des informations disponibles sur le site' }).click();
    await this.publicPage.locator('button').filter({ hasText: 'Prendre rendez-vous' }).click();
    
    // Vérification de la page "Créneaux"
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();

    // Sélection d'un créneau pour arriver à la page "Vos coordonnées"
    this.selectedDate           = await this.publicPage.locator('.date-container.date-active').textContent();
    this.selectedFormatedDate   = (await this.publicPage.locator('.date-container.date-active').locator('..') .getAttribute('data-date')).split('-').reverse().join('/');
    this.selectedTime           = await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().textContent(); 

    await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().click();
    await this.publicPage.locator('button:has-text("Valider le calendrier")').click();
    await expect(this.publicPage.locator('span', { hasText: '- Vos coordonnées' })).toBeVisible();



    // Remplissage des coordonnées pour arriver à la page "Confirmez votre demande"

    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';
    this.phone = generateRandomPhone();
    this.dob = generateBirthDate();
    this.ANTS = generateANTS();
    // Fill the form
    await this.publicPage.locator('input#lastname').fill(this.name);
    await this.publicPage.locator('input#firstname').fill(this.firstname);
    await this.publicPage.locator('input#email').fill(this.email);
    await this.publicPage.locator('input#phone').fill(this.phone);
    await this.publicPage.locator('input#birthdate').fill(this.dob);
    await this.publicPage.locator('div#ants-number > input').fill(this.ANTS);
    await this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' }).click();
    await expect(this.publicPage.locator('span', { hasText: '- Confirmez votre demande' })).toBeVisible();

    // Acceptation des conditions, résolution du captcha et confirmation du RDV
    await this.publicPage.locator('span', { hasText: 'J\'ai lu et j\'accepte ' }).click();
    await this.publicPage.locator('#captcha-input').fill('aaaa');
    await this.publicPage.locator('button', { hasText: 'Confirmer' }).click();
    await expect(this.publicPage.locator('span', { hasText: 'Rendez-vous confirmé' })).toBeVisible();
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------






When("Il clique sur \"Ma page de RDV\" puis sur \"Accéder aux services\"", async function() {
    const [publicPage] = await Promise.all([
        this.backofficePage.context().waitForEvent('page'),
        this.backofficePage.locator('img[title="Ma page de RDV"]').click()
    ]);
    
    this.publicPage = publicPage;
    await this.publicPage.waitForLoadState('domcontentloaded');
    await this.publicPage.locator('button').filter({ hasText: 'Accéder aux services' }).click();
});



When("Il clique sur \"+\" de l'icone nombre de personne", async function() {
    await this.publicPage.locator("#number-of-applicants-label").locator("..").locator("button[aria-label='Plus']").first().click();
});

When("Il clique sur \"-\" de l'icone nombre de personne", async function() {
    await this.publicPage.locator("#number-of-applicants-label").locator("..").locator("button[aria-label='Moins']").first().click();
});

When("Il clique sur \"+\" du service {string}", async function(serviceName) {
    await this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).locator('..').locator('button[aria-label="Plus"]').first().click();
});

When("Il clique sur \"-\" du service {string}", async function(serviceName) {
    await this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).locator('..').locator('button[aria-label="Moins"]').first().click();
});

When("Il associé une personne a maximum deux services différent {string} et {string}", async function(serviceName1, serviceName2) {
    await this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName1 }).locator('..').locator('button[aria-label="Plus"]').first().click();
    await this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName2 }).locator('..').locator('button[aria-label="Plus"]').first().click();
});

When("L'utilisateur sélectionne {string} personnes", async function(nombre) {
    for (let i = 1; i < parseInt(nombre); i++) {
        await this.publicPage.locator("#number-of-applicants-label").locator("..").locator("button[aria-label='Plus']").first().click();
        await this.publicPage.waitForTimeout(1000); 
    }
});


When("Il remet le nombre de personne à {string} et sélectionne le service {string} et enleve le service {string}", async function(nombrePersonnes, serviceName, serviceNameToRemove) {

    const nombrePersonnesLocator = this.publicPage.locator("#number-of-applicants-label").first().locator('..');
    const serviceNameLocator = this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).first().locator('..');
    const serviceNameToRemoveLocator = this.publicPage.locator('.service-applicant span').filter({ hasText: serviceNameToRemove }).first().locator('..');
    // Remet le nombre de personne à 1
    let currentNumber = await serviceNameLocator.locator("output#number-of-applicants").first().innerText();  

    while (parseInt(currentNumber) > parseInt(nombrePersonnes)) {
        await nombrePersonnesLocator.locator('button[aria-label="Moins"]').first().click();
        await this.publicPage.waitForTimeout(500); 
        //await serviceNameLocator.locator('button[aria-label="Moins"]').first().click();
        //await this.publicPage.waitForTimeout(500); 
        //await serviceNameToRemoveLocator.locator('button[aria-label="Moins"]').first().click();
        //await this.publicPage.waitForTimeout(500); 
        currentNumber = await serviceNameLocator.locator("output#number-of-applicants").first().innerText();   
    }     
    await serviceNameToRemoveLocator.locator('button[aria-label="Moins"]').first().click();
    await this.publicPage.waitForTimeout(500); 

    // Verification que le service est bien sélectionné avec le bon nombre de personne
    expect(await serviceNameLocator.locator("output#number-of-applicants").first().innerText()).toBe("1");
    expect(await serviceNameToRemoveLocator.locator("output#number-of-applicants").first().innerText()).toBe("0");
});      

When("Il clique sur \"Confirmé\"", async function() {
    await this.publicPage.locator('button').filter({ hasText: 'Confirmer' }).click();
});

When("Il clique sur \"Aide pour réaliser votre Pré-demande\"", async function() {
    await this.publicPage.locator('button').filter({ hasText: 'Aide pour réaliser votre Pré-demande' }).click();
});

When("Il clique sur \"Je fais ma pré-demande\"", async function() {
    const [antsPage] = await Promise.all([
        this.publicPage.context().waitForEvent('page'),
        this.publicPage.locator('a').filter({ hasText: 'Je fais ma pré-demande' }).click(),
    ]);

    this.antsPage = antsPage;
    await this.antsPage.waitForLoadState('domcontentloaded');     
});

When("Il clique sur \"J'ai fait ma pré-demande, je prends RDV\"", async function() {
    await this.publicPage.locator('button').filter({ hasText: 'J\'ai fait ma pré-demande, je prends RDV' }).click();
});

When("La page information important s'affiche, il coche \"J'ai bien lu\",  puis il clique sur \"Prendre rendez-vous\"", async function() {
    await this.publicPage.locator('label').filter({ hasText: 'J\'ai bien lu l\'ensemble des informations disponibles sur le site' }).click();
    await this.publicPage.locator('button').filter({ hasText: 'Prendre rendez-vous' }).click();
});


When("Il clique sur l'icone \"Suivante\" sur les dates", async function() {
    
    // 1. Récupérer la date active actuelle
    const activeDate = this.publicPage.locator('.date-container.date-active');
    this.currentDateText = await activeDate.textContent();

    // 2. Cliquer sur le bouton "suivant"
    await this.publicPage.locator('.v-hl-btn-next').click();
});

When("Il clique sur l'icone \"Précédente\" sur les dates", async function() {
    
    // 1. Récupérer la date active actuelle
    const activeDate = this.publicPage.locator('.date-container.date-active');
    this.currentDateText = await activeDate.textContent();

    // 2. Cliquer sur le bouton "previous"
    await this.publicPage.locator('.v-hl-btn-prev').click();
});

When("Il sélectionne un autres dates", async function() {

    // 1. Cliquer sur la date suivante dynamiquement
    const activeSection = this.publicPage.locator('section:has(.date-container.date-active)');
    const nextSection = activeSection.locator('xpath=following-sibling::section[1]');
    await nextSection.locator('.date-container').click();
});

When("Il sélectionne un créneau disponible", async function() {
    // 1. Récupérer le premier creneau disponible
    await this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first().click();
});

When("Il clique sur \"Valider le calendrier\"", async function() {
    await this.publicPage.locator('button:has-text("Valider le calendrier")').click();
});

When("Tout les champs sont remplis correctement", async function() {
    
    // Generate random data for appointment
    this.name = faker.person.lastName();
    this.firstname = faker.person.firstName();
    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    this.email = this.name.toLowerCase() + "-" + this.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';
    this.phone = generateRandomPhone();
    this.dob = generateBirthDate();
    this.ANTS = generateANTS();

    // Fill the form
    await this.publicPage.locator('input#lastname').type(this.name, { delay: 100 });
    await this.publicPage.locator('input#firstname').type(this.firstname, { delay: 100 });
    await this.publicPage.locator('input#email').type(this.email, { delay: 100 });
    await this.publicPage.locator('input#phone').type(this.phone, { delay: 100 });
    await this.publicPage.locator('input#birthdate').type(this.dob, { delay: 100 });
    await this.publicPage.locator('div#ants-number > input').type(this.ANTS, { delay: 100 });
});

When("Le champ {string} est vidé", async function(fieldName) {
    switch(fieldName) {
        case 'Nom':
            await this.publicPage.locator('input#lastname').fill('');
            console.log("nom vidé");
            this.modifiedField = 'Nom';
            break;
        case 'Prénom':
            await this.publicPage.locator('input#firstname').fill('');
            console.log("prenom vidé");
            this.modifiedField = 'Prénom';
            break;
        case 'Email':
            await this.publicPage.locator('input#email').fill('');
            console.log("email vidé");
            this.modifiedField = 'Email';
            break;
        case 'Numéro de téléphone':
            await this.publicPage.locator('input#phone').fill('');
            console.log("phone vidé");
            this.modifiedField = 'Numéro de téléphone';
            break;
        case 'Date de naissance':
            await this.publicPage.locator('input#birthdate').fill('');
            console.log("dob vidé");
            this.modifiedField = 'Date de naissance';
            break;
        case 'Pré-demande ANTS': 
            await this.publicPage.locator('div#ants-number > input').fill('');
            console.log("ants vidé");
            this.modifiedField = 'Pré-demande ANTS';
            break;
        default:
            throw new Error(`Champ inconnu: ${fieldName}`);
    } 
    await this.publicPage.waitForTimeout(1000);
});

When("Le {string} saisi est invalide", async function(fieldName) {
    switch(fieldName) {
        case 'Nom':
            await this.publicPage.locator('input#lastname').fill(this.name + "123");
            console.log("nom invalide");
            this.modifiedField = 'Nom';
            break;
        case 'Prénom':
            await this.publicPage.locator('input#firstname').fill(this.firstname + "123");
            console.log("prenom invalide");
            this.modifiedField = 'Prénom';
            break;
        case 'Email':
            await this.publicPage.locator('input#email').fill(this.firstname + "." + this.name + "@test");
            console.log("email invalide");
            this.modifiedField = 'Email';
            break;
        case 'Numéro de téléphone':
            await this.publicPage.locator('input#phone').fill(this.phone.slice(0, -2)); // Enlève les 2 derniers chiffres pour rendre le numéro invalide
            console.log("phone invalide ");
            this.modifiedField = 'Numéro de téléphone';
            break;
        case 'Date de naissance':
            await this.publicPage.locator('input#birthdate').fill(this.dob.slice(0, -2));
            console.log("dob invalide");
            this.modifiedField = 'Date de naissance';
            break;
        case 'Pré-demande ANTS': 
            await this.publicPage.locator('div#ants-number > input').fill('');
            console.log("ants invalide");
            this.modifiedField = 'Pré-demande ANTS';
            break;
        default:
            throw new Error(`Champ inconnu: ${fieldName}`);
    } 
    await this.publicPage.waitForTimeout(1000);
});

When("Il clique sur \"Valider vos coordonnées\"", async function() {
    await this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' }).click();
});

When("Il clique sur le \"Condition d'utilisation\"", async function() {
    await this.publicPage.locator('span', { hasText: 'J\'ai lu et j\'accepte ' }).click();
});

When("Il résout le captcha", async function() {
    await this.publicPage.locator('#captcha-input').fill('aaaa');
});

When("Il clique sur \"Modifier\"", async function() {
    await this.publicPage.locator('button', { hasText: 'Modifier' }).click();
});

When("Il clique sur \"Calendrier\"", async function() {
    await this.publicPage.locator('button', { hasText: 'Calendrier' }).click();
});

When("Il navigue de la page \"Créneaux\" vers la page \"Confirmez votre demande\"", async function() {
    await this.publicPage.locator('button:has-text("Valider le calendrier")').click();
    await this.publicPage.locator('div#ants-number > input').fill(this.ANTS);
    await this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' }).click();
    expect(await this.publicPage.locator('span', { hasText: '- Confirmez votre demande' })).toBeVisible();
});


When("Il clique sur \"Vos coordonnées\"", async function() {
    await this.publicPage.locator('button', { hasText: 'Vos coordonnées' }).click();
});

When("Il navigue de la page \"Vos coordonnées\" vers la page \"Confirmez votre demande\"", async function() {
    await this.publicPage.locator('div#ants-number > input').fill(this.ANTS);
    await this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' }).click();
    expect(await this.publicPage.locator('span', { hasText: '- Confirmez votre demande' })).toBeVisible();
});

When("Il accepte les conditions d'utilisation, résout le captcha et clique sur \"Confirmer mon RDV\"", async function() {
    await this.publicPage.locator('span', { hasText: 'J\'ai lu et j\'accepte ' }).click();
    await this.publicPage.locator('#captcha-input').fill('aaaa');
    await this.publicPage.locator('button', { hasText: 'Confirmer' }).click();
});

When("Il consulte l'agenda dans Troov", async function() {
    await this.backofficePage.locator('i[title="Calendrier"]').click();
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------






Then("La page de sélection de la personne et du service s’affiche", async function() {
  await expect(this.publicPage.locator('legend').filter({ hasText: "Pour quels services souhaitez-vous prendre rendez-vous ?" })).toBeVisible();
});

Then("Le nombre de personnes sélectionné est {string}", async function(nombrePersonnes) {
    await expect(this.publicPage.locator("#number-of-applicants-label").locator("..").locator("output").first()).toHaveText(nombrePersonnes);
});

Then("Le service {string} est sélectionné avec {string} personne", async function(serviceName, nombrePersonnes) {
    const service = this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).first().locator('..');
    // await expect(service).toHaveClass(/bg-primary/)
    await expect(service.locator("output#number-of-applicants").first()).toHaveText(nombrePersonnes);
});

Then("Tout les autres services sont désactivés", async function() {
    const serviceName = "Naissance"; 
    await expect(this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).locator('..').locator('button[aria-label="Plus"]').first()).toBeDisabled();
});

Then("Le nombre de personne possible associé aux service {string} est maximum {string}", async function(serviceName, nombrePersonnes) {

    const service = this.publicPage.locator('.service-applicant span').filter({ hasText: serviceName }).first().locator('..');
    // Click le service 3 fois
    for (let i = 0; i < 3; i++) {
        await service.locator('button[aria-label="Plus"]').first().click();
        await this.publicPage.waitForTimeout(500); 
    }
    // Vérification que le nombre de personnes est bien égal au nombre de click
    await expect(service.locator("output#number-of-applicants").first()).toHaveText(nombrePersonnes);

    // Ajout forcé d'un click surplus pour vérifier que le nombre ne change pas
    await service.locator('button[aria-label="Plus"]').first().click();

    // Vérification que le nombre de personnes reste le même
    await expect(service.locator("output#number-of-applicants").first()).toHaveText(nombrePersonnes);
});

Then("La page suivante \"Pré-demande ANTS\" s’affiche", async function() {
    await expect(this.publicPage.locator('button').filter({ hasText: "J'ai fait ma pré-demande, je prends RDV" })).toBeVisible();
});


Then("Une fenetre d'aide s'affiche", async function() {
    await expect(this.publicPage.locator('h5').filter({ hasText: "Aide pour réaliser votre Pré-demande" })).toBeVisible();
    await this.publicPage.waitForTimeout(1000);
    await this.publicPage.mouse.click(10, 10); // Click en dehors de la fenetre d'aide pour la fermer
    await this.publicPage.waitForTimeout(1000);
});

Then("Une nouvelle onglet s'ouvre vers le site ANTS", async function() {
    await expect(this.antsPage).toHaveURL('https://passeport.ants.gouv.fr/demarches-en-ligne');
});

Then("La page \"Créneaux\" s'affiche", async function() {
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();
});

Then("Une liste de créneaux disponible s'affiche", async function() {
    await expect(this.publicPage.locator('#reservation-time-slot-list .hour-span').first()).toBeVisible();
});

Then("Les prochaines dates disponibles s'affichent", async function() {
    // 3. Vérifier que la date active a changé
    const newActiveDate = this.publicPage.locator('.date-container.date-active');
    await expect(newActiveDate).not.toHaveText(this.currentDateText);
});

Then("Les dates précédentes disponibles s'affichent", async function() {
    // 3. Vérifier que la date active a changé
    const newActiveDate = this.publicPage.locator('.date-container.date-active');
    await expect(newActiveDate).not.toHaveText(this.currentDateText);
});

Then("Les heures disponibles pour la date sélectionnée s'affichent", async function() {
    // 2. Attendre que la liste soit recalculée
    await expect.poll(async () => {  return await this.publicPage.locator('#reservation-time-slot-list .hour-span').count();}).toBeGreaterThan(0);
});

Then("Le créneau sélectionné s'affiche correctement", async function() {
      await expect(this.publicPage.locator('#reservation-time-slot-list .btn-custom-slot').first()).toHaveClass(/active/);
});

Then("La page \"Vos coordonnées\" s'affiche", async function() {
    await expect(this.publicPage.locator('span', { hasText: '- Vos coordonnées' })).toBeVisible();
});

Then("Le bouton \"Valider vos coordonnées\" est cliquable", async function() {
    await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).toBeEnabled();
});

Then("Le bouton \"Valider vos coordonnées\" est désactivé", async function() {
     
    switch(this.modifiedField) {
        case 'Nom':
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator('input#lastname').fill(this.name);
            break;
        case 'Prénom':
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator('input#firstname').fill(this.firstname);
            break;
        case 'Email':
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator('input#email').fill(this.email);
            break;
        case 'Numéro de téléphone':
            await this.publicPage.waitForTimeout(5000);
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator('input#phone').fill(this.phone);
            break;
        case 'Date de naissance':
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator(`input#birthdate`).fill(this.dob);
            break;
        case 'Pré-demande ANTS': 
            await expect(this.publicPage.locator('button', { hasText: 'Valider vos coordonnées' })).not.toBeEnabled();
            await this.publicPage.locator('div#ants-number > input').fill(this.ANTS);
            break;
        default:
            throw new Error(`Champ inconnu: ${fieldName}`);
    } 
});

Then("La page \"Confirmez votre demande\" s'affiche", async function() {
    await expect(this.publicPage.locator('span', { hasText: '- Confirmez votre demande' })).toBeVisible();
});

Then("Les information sur la page \"Confirmez votre demande\" sont correctes", async function() {
    // Vérification des informations affichées
    await expect(this.publicPage.locator('div').filter({ hasText: this.selectedDate.trim() }).first()).toBeVisible();
    await expect(this.publicPage.locator('div').filter({ hasText: this.selectedTime.trim().replace(/:/g, 'h') }).first()).toBeVisible();
    await expect(this.publicPage.locator('div').filter({ hasText: this.name }).first()).toBeVisible();
    await expect(this.publicPage.locator('div').filter({ hasText: this.firstname }).first()).toBeVisible();
});

Then("Le bouton \"Confirmer mon RDV\" est cliquable", async function() {
    await expect(this.publicPage.locator('button', { hasText: 'Confirmer' })).not.toBeDisabled();
});

Then("Une fenetre de choix du modification s'affiche", async function() {
    await expect(this.publicPage.locator('h2', { hasText: 'Vous souhaitez modifier vos informations' })).toBeVisible();
});

Then("Il revient a la page \"Créneaux\"", async function() {
    await expect(this.publicPage.locator('span', { hasText: '- Créneaux' })).toBeVisible();
});

Then("Il revient a la page \"Vos coordonnées\"", async function() {
    await expect(this.publicPage.locator('span', { hasText: '- Vos coordonnées' })).toBeVisible();
});

Then("Une fenetre \"Rendez-vous confirmé\" s'affiche", async function() {
    await expect(this.publicPage.locator('span', { hasText: 'Rendez-vous confirmé' })).toBeVisible();
});

Then("Le rendez-vous pris depuis la prise de RDV public est bien présent dans l'agenda avec les bonnes informations", async function() {
    
    console.log('this.selectedFormatedDate: ', this.selectedFormatedDate)
    console.log('this.selectedTime: ', this.selectedTime)

    this.dateRdv    = this.selectedFormatedDate;
    this.heureRdv   = this.selectedTime;

    //// Changer selecteur de nombre de jours a afficher
    const filterLocator = this.backofficePage.locator('.calendar-mode-select').nth(1).locator('.multiselect');
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Semaine 5 jours (multi guichets)", exact: true }).nth(0).click();

    // Rechercher le rendez-vous
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);

    // Vérification de l'heure
    const minTop =  parseInt(this.heureRdv.split(":")[0]) * 70;
    const maxTop = (parseInt(this.heureRdv.split(":")[0]) + 1) * 70;

    const topValueRdv = await appointmentLocator.evaluate((element) => { return window.getComputedStyle(element).top; });
    
    console.log('minTop: ', minTop)
    console.log('maxTop: ', maxTop)
    console.log('topValueRdv: ', topValueRdv)  

    expect(parseInt(topValueRdv)).toBeGreaterThanOrEqual(minTop);
    expect(parseInt(topValueRdv)).toBeLessThanOrEqual(maxTop);

    // Vérification de la date
    const [day, month, year] = this.dateRdv.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const dayNumber = date.getDay();

    const dayLocator = this.backofficePage.locator('.vuecal__body .vuecal__bg .week-view > div > div').nth(dayNumber - 1);
    const appointmentDayLocator = dayLocator.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..//..').nth(0);
    expect(await appointmentDayLocator.count()).toBeGreaterThanOrEqual(1);
});
