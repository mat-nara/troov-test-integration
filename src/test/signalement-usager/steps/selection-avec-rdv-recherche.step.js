const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const config = require('../../../../config/env.js')
const { generateRandomNIR, generateRandomPhone } = require('../utils/helper');
const LoginPage = require('../pages/LoginPage');
const { faker, fakerFR  } = require('@faker-js/faker');




setDefaultTimeout(60 * 1000);

function randomNIR() {
  const sexe = Math.random() < 0.5 ? 1 : 2;          // 1 ou 2
  const annee = String(Math.floor(Math.random() * 100)).padStart(2, '0'); // 00..99
  const mois = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'); // 01..12
  const dept = String(Math.floor(Math.random() * 96) + 1).padStart(2, '0'); // 01..95
  const commune = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');
  const ordre = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');

  return `${sexe} ${annee} ${mois} ${dept} ${commune} ${ordre}`;
}


async function setupRdv(world) {

    console.log('==> CREATION OF RDV');

    // Open window Ajouter un RDV
    await world.backofficePage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = world.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = world.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de proche aidant (AJPA)" }).first(); 
    // const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "Demande d'abandon du recouvrement (M1)" }).first(); 

    await firstItemService.click();

    // Choix du mode
    // const selectorModeDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Select heure du RDV 
    // const selectorDateDuRDV = world.backofficePage.locator('label').filter({ hasText: 'Date du RDV' }).locator('xpath=following-sibling::span//div//input');
    // await selectorDateDuRDV.click();
    // world.backofficePage.locator('span[aria-label="jeudi 28 août 2025"]').nth(1).click();
    // await selectorDateDuRDV.fill('28/08/2025');

    const selectorHeureDuRDV = world.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  //

    // Create new user
    const selectorButtonCreerUser = world.backofficePage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    world.name = faker.person.lastName();
    world.firstname = faker.person.firstName();
    world.email = world.name.toLowerCase() + '@test.com';
    // world.NIR = generateRandomNIR();
    world.NIR = randomNIR()
    world.phone = generateRandomPhone();

    await world.backofficePage.getByPlaceholder('Ajouter un Nom').fill(world.name);
    await world.backofficePage.getByPlaceholder('Ajouter un Prénom').fill(world.firstname);
    await world.backofficePage.getByPlaceholder('Ajouter un Email').fill(world.email);
    await world.backofficePage.getByPlaceholder('1 48 05 99 *** ***').fill(world.NIR);
    await world.backofficePage.getByPlaceholder('Numéro de téléphone').fill(world.phone);
    
    await world.backofficePage.locator('button[title="Confirmer"]').click()

    // Mode de prise du rendez-vous
    //await this.backofficePage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = world.backofficePage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = world.backofficePage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // ------------------------- Récuperation de la date/heure du rendez-vous initial -----------//
    const dateInputLocator = world.backofficePage.getByText('Date du RDV').locator('xpath=following-sibling::*').locator('input[aria-label="Cliquez ici pour choisir la date"]');
    world.initialAppointmentDate  = await dateInputLocator.inputValue();

    // const selectorHeureDuRDV = world.backofficePage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    world.initialAppointmentTime  = await selectorHeureDuRDV.inputValue();

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await world.backofficePage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = world.backofficePage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = world.backofficePage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await world.backofficePage.waitForTimeout(1000);

    var fullname = world.name.toUpperCase() + ' ' + world.firstname
    const appointmentLocator = world.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    world.oldDateRdv     = world.initialAppointmentDate
    world.oldHeureRdv    = world.initialAppointmentTime

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    world.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    world.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    world.userName           = await world.backofficePage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();

    console.log('==> RDV CREATED');
    
    return { name: world.name, firstname: world.firstname, NIR: world.NIR, phone: world.phone, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime};
};


Given("Un rendez-vous a été créer", async function() {
        
    //****************** Se connecter ******************/ 
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

    // Changer de compte en CNAF Formation
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Changer de compte"]').click();
    await this.backofficePage.waitForTimeout(3000); 

    await this.backofficePage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > span.p-tree-node-label').click();

    currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');


    //****************** Création d'un rendez-vous ******************/
    this.backofficePage.waitForTimeout(2000); 
    const { name, firstname, NIR, phone, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
    this.name         = name;
    this.firstname    = firstname;
    this.NIR          = NIR;
    this.phone        = phone;
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
});





Given("La page \"Je m'enregistre\" avec rendez-vous est ouverte", async function() {
    await this.terminalPage.goto(config.troovCafUserArrivalURL);
    const avecRdvButton = this.terminalPage.locator('button[aria-label="J\'ai un rendez-vous"]');
    await avecRdvButton.click();
    const heading = await this.terminalPage.getByText("Je m'enregistre");
    await expect(heading).toBeVisible();
});

// Scenario NIR uniquement
Given("que NIR uniquement est saisie", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(this.NIR);
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// Scenario Téléphone uniquement
Given("que Téléphone uniquement est saisie", async function() {
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(this.phone);
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// Scenario NIR et Téléphone sont saisie
Given("que NIR et Téléphone sont saisie", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(this.NIR);
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(this.phone);
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// NIR sans RDV: Un message d'erreur s'affiche
Given("que NIR sans RDV est saisie", async function() {
    var NIR = randomNIR();
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(NIR);

    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// Phone sans RDV: Un message d'erreur s'affiche
Given("que phone sans RDV est saisie", async function() {
    var phone = generateRandomPhone();
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(phone);
    
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// NIR dans un mauvais format: Un message d'erreur s'affiche
Given("NIR saisie au mauvais format", async function() {
    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');

    this.NIR = randomNIR();
    this.phone = generateRandomPhone();

    // remove one character from NIR
    var NIR = this.NIR
    NIR = NIR.substring(0, NIR.length - 1)
    await inputNIRLocator.fill(NIR); // 12 caracter au lieu de 13
  
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(this.phone);
  
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

// Téléphone dans un mauvais format: Un message d'erreur s'affiche
Given("Téléphone saisie au mauvais format", async function() {
    this.NIR = randomNIR();
    this.phone = generateRandomPhone();

    const inputNIRLocator = this.terminalPage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(this.NIR); 

    // remove one character from Phone number
    var phone = this.phone
    phone = phone.substring(0, phone.length - 1)
  
    const inputPhoneLocator = this.terminalPage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(phone); // 9 caracter au lieu de 10
  
    const buttonLocator = await this.terminalPage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
  });


// ------------------------------------------------------------------------

When("Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV", async function() {
    await this.terminalPage.locator('button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page: Enregistrement avec RDV", async function() {
    await this.terminalPage.locator('button[aria-label="Quitter"]').click();
  });

// ------------------------------------------------------------------------

Then("Passe à l'etape suivant: \"Vous êtes bien enregistré !\" s'affiche sur la page confirmation avec RDV", async function() {
    // const heading = await this.terminalPage.getByText("Vous êtes bien enregistré !");
    // await expect(heading).toBeVisible();

    const messagesPossibles = [
        "Vous êtes bien enregistré !",
        "Vous êtes en dehors du délai prévu pour vous présenter à votre rendez-vous. Pour rappel votre RDV est prévu à",
    ];

    const pageText = await this.terminalPage.textContent('.p-message-info');
    const trouve = messagesPossibles.some(msg => pageText.includes(msg));

    expect(trouve).toBeTruthy();
});

Then("Revient sur la page initiale: \"Je signale mon arrivée\" s'affiche sur la page", async function() {
    const heading = await this.terminalPage.getByText("Je signale mon arrivée");
    await expect(heading).toBeVisible();
});



Then("Message d'erreur NIR incorrecte s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte (13 caractères ; Exemple : 2 94 03 75 120 005)");
    await expect(heading).toBeVisible();
});

Then("Message d'erreur phone incorrecte s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Saisie incorrecte (10 caractères ; Exemple : 07 21 30 89 28)");
    await expect(heading).toBeVisible();
});

Then("Message d'erreur 'Aucun rendez-vous' s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Aucun rendez-vous");
    await expect(heading).toBeVisible();
});