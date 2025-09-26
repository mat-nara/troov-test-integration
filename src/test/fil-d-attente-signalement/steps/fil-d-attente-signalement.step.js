const { Given, When, Then, setDefaultTimeout, After } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
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
    world.motif = "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de proche aidant (AJPA)"
    const selectorService = world.backofficePage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = world.backofficePage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: world.motif }).first(); 
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
    
    return { name: world.name, firstname: world.firstname, NIR: world.NIR, phone: world.phone, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime, motif: world.motif };
};

Given("Un rendez-vous a été créer", async function() {
        
    //****************** Création d'un rendez-vous ******************/
    this.backofficePage.waitForTimeout(2000); 
    const { name, firstname, NIR, phone, oldDateRdv, oldHeureRdv, appointmentDate, appointmentTime, motif } = await setupRdv(this);
    this.name         = name;
    this.firstname    = firstname;
    this.NIR          = NIR;
    this.phone        = phone;
    this.dateRdv      = oldDateRdv;
    this.heureRdv     = oldHeureRdv;
    this.datePriseRdv  = appointmentDate;
    this.heurePriseRdv = appointmentTime;
    this.motif         = motif;
    console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
});

Given("L'utilisateur est connecté à l'application Troov", async function() {
    this.loginPageAlt = new LoginPage(this.backofficePage);
    await this.loginPageAlt.navigate(this.backofficePage);
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
});

Given("Il clique sur le menu \"File d'attente\" puis sur \"Signaler une arrivée\"", async function() {
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await this.backofficePage.waitForTimeout(2000); 
    await this.backofficePage.mouse.move(0, 0);
    await this.backofficePage.locator('button[title="Signaler une arrivée"]').click();
    await this.backofficePage.waitForTimeout(1000); 
});

Given("La page enregistrement d’usager sans rendez-vous est ouverte", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Usager sans rendez-vous' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h3').filter({ hasText: 'Usager sans rendez-vous' }) ).toBeVisible();
});

Given("Le Téléphone uniquement est saisie", async function() {
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

Given("Le NIR et le Téléphone sont saisie", async function() {
    const NIR   = randomNIR();
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

Given("que le NIR est saisi au mauvais format dans un signalement sans rendez-vous", async function() {
    const NIR   = randomNIR().slice(0, -1); // 12 caracter au lieu de 13
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

Given("que le téléphone est saisi au mauvais format dans un signalement sans rendez-vous", async function() {
    const NIR   = randomNIR(); 
    const phone = generateRandomPhone().slice(0, -1); // 9 caracter au lieu de 10
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

Given("La page choisir le motif de visite sans rendez-vous est ouverte", async function() {
    // Ouvrir le modal de signalement d'arrivée sans RDV
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Usager sans rendez-vous' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Enregistrer l’usager' }) ).toBeVisible();

    // Remplir NIR et téléphone
    const NIR   = randomNIR();
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();
});

Given('Choisir motif: {string}', async function (motif) {
  const inputOfficeTypeLocator = this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office-type"] + div span.p-select-label');
  await inputOfficeTypeLocator.click();
  const liEnfantLocator = this.backofficePage.locator(`li[aria-label="${motif}"]`);
  await liEnfantLocator.click();
  const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
  expect(updatedTextOfficeType.trim()).toBe(motif);
});

Given("Choisir sous-motif: {string}", async function (sousMotif) {
  const inputOfficeLocator = this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office"] + div span.p-select-label');
  await inputOfficeLocator.click();
  const liAttendEnfantLocator = await this.backofficePage.locator(`li[aria-label="${sousMotif}"]`);
  await liAttendEnfantLocator.click();
  const updatedTextOffice = await liAttendEnfantLocator.textContent();
  expect(updatedTextOffice.trim()).toBe(sousMotif);
});

Given("La page de confirmation de la création de ticket sans rendez-vous est ouverte", async function() {
    // Ouvrir le modal de signalement d'arrivée sans RDV
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Usager sans rendez-vous' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Enregistrer l’usager' }) ).toBeVisible();

    // Remplir NIR et téléphone
    const NIR   = randomNIR();
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();

    // Choix du motif et sous-motif
    const motif = "Enfant";
    const sousMotif = "J'attends / J'accueille un enfant";
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office-type"] + div span.p-select-label').click();
    await this.backofficePage.locator(`li[aria-label="${motif}"]`).click();

    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office"] + div span.p-select-label').click();
    await this.backofficePage.locator(`li[aria-label="${sousMotif}"]`).click();

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    // await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();
});

Given("Un signalement d'arrivée sans rendez-vous est confirmé", async function() {
    // Ouvrir le modal de signalement d'arrivée sans RDV
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Usager sans rendez-vous' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Enregistrer l’usager' }) ).toBeVisible();

    // Remplir NIR et téléphone
    const NIR   = randomNIR();
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();

    // Choix du motif et sous-motif
    const motif = "Enfant";
    const sousMotif = "J'attends / J'accueille un enfant";
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office-type"] + div span.p-select-label').click();
    await this.backofficePage.locator(`li[aria-label="${motif}"]`).click();

    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="office"] + div span.p-select-label').click();
    await this.backofficePage.locator(`li[aria-label="${sousMotif}"]`).click();

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    // await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'L’usager a été ajouté dans la file d’attente' }) ).toBeVisible();
});

Given("La page enregistrement d’usager avec rendez-vous est ouverte", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Usager avec rendez-vous' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h3').filter({ hasText: 'Usager avec rendez-vous' }) ).toBeVisible();
});

Given("La page de confirmation de la création de ticket avec rendez-vous est ouverte", async function() {
    // Ouvrir le modal de signalement d'arrivée avec RDV
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Enregistrer l’usager' }) ).toBeVisible();

    // Remplir NIR et téléphone
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(this.NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(this.phone);

    // Cliquer sur le bouton "Continuer"
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
    await this.backofficePage.waitForTimeout(1000);
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'L’usager a été ajouté dans la file d’attente' }) ).toBeVisible();
});






// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




When("Le NIR uniquement est saisie", async function() {
    const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(randomNIR());
    const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

When("Cliquer sur le bouton \"Continuer\" de la page d'enregistrement", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur le bouton 'Continuer' de la page d'enregistrement", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page d'enregistrement", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Quitter' }).click();
});

When("Cliquer sur 'Continuer' de la page motif", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
});

When("Cliquer sur 'Quitter' de la page motif", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Quitter' }).click();
});

When("L'utilisateur clique sur \"Afficher le QR code\" de la page confirmation signalement sans rendez-vous", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Afficher le QR code' }).click();
});

When("L'utilisateur clique sur \"Masquer le QR Code\" de la page confirmation signalement sans rendez-vous", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Masquer le QR Code' }).click();
});

When("L'utilisateur clique sur \"Terminer\" de la page confirmation signalement sans rendez-vous", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Terminer' }).click();
});

When("La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé sans rendez-vous", async function() {
    // Recuperer le numero ticker
    this.ticket = await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h4').filter({ hasText: 'Numéro à communiquer à l’usager' }).locator('xpath=following-sibling::*').locator('p').textContent();

    // Cherche le motif du ticket
    const motifInfo = await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment span').filter({ hasText: 'Motif :' }).textContent();
    const match     = motifInfo.match(/Motif :\s*(.*)/);
    this.motif      = match[1].trim();

    // Fermer le modal de signalement d'arrivée
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Terminer' }).click();
});

When("Cliquer sur le bouton 'Continuer' de la page: Enregistrement avec RDV", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Continuer' }).click();
});

When("Seul le NIR associé à l’usager propriétaire du rendez-vous est saisi", async function() {
    await this.backofficePage.locator('label[for="social-security-number"] + input').fill(this.NIR);
    const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

When("Seul le Téléphone associé à l’usager propriétaire du rendez-vous est saisi", async function() {
    await this.backofficePage.locator('label[for="phone-number"] + input').fill(this.phone);
    const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

When("Le NIR et le Téléphone associé à l’usager propriétaire du rendez-vous sont saisi", async function() {
    await this.backofficePage.locator('label[for="social-security-number"] + input').fill(this.NIR);
    await this.backofficePage.locator('label[for="phone-number"] + input').fill(this.phone);
    const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
});

When("Un NIR non associé a un rendez-vous est saisi", async function() {
    const NIR = randomNIR();
    await this.backofficePage.locator('label[for="social-security-number"] + input').fill(NIR);
});

When("Un Téléphone non associé a un rendez-vous est saisi", async function() {
    const phone = generateRandomPhone();
    await this.backofficePage.locator('label[for="phone-number"] + input').fill(phone);
});

When("Le NIR est saisie au mauvais format", async function() {
    const NIR   = randomNIR().slice(0, -1); // 12 caracter au lieu de 13
    const phone = generateRandomPhone();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

When("Le Téléphone saisie au mauvais format", async function() {
    const NIR   = randomNIR(); 
    const phone = generateRandomPhone().slice(0, -1); // 9 caracter au lieu de 10
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"] + input').fill(NIR);
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"] + input').fill(phone);
});

When("Cliquer sur 'Quitter' de la page: Enregistrement avec RDV", async function() {
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Quitter' }).click();
});

When("La page de la file d'attente du backoffice est ouverte à côté de la page du signalement usagé avec rendez-vous", async function() {
    // Recuperer le numero ticker
    this.ticket = await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h4').filter({ hasText: 'Numéro à communiquer à l’usager' }).locator('xpath=following-sibling::*').locator('p').textContent();

    // Cherche le motif du ticket
    const motifInfo = await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment span').filter({ hasText: 'Motif :' }).textContent();
    const match     = motifInfo.match(/Motif :\s*(.*)/);
    this.motif      = match[1].trim();

    // Fermer le modal de signalement d'arrivée
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Terminer' }).click();
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




Then("La fenetre de signalement d'arrivé du backoffice s'affiche correctement", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival header span').filter({ hasText: 'Signaler une arrivée' }) ).toBeVisible(); 
}); 

Then("Passe à l'etape suivant: \"Choisir le motif de visite\" s'affiche sur la page", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'Choisir le motif de visite' }) ).toBeVisible();
}); 

Then("Message d'erreur sur le NIR s'affiche", async function() {
    await expect(await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="social-security-number"]').locator('..').locator('.p-message-text').filter({ hasText: 'Saisie incorrecte' }) ).toBeVisible(); 
}); 

Then("Message d'erreur sur le téléphone s'affiche", async function() {
    await expect(await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label[for="phone-number"]').locator('..').locator('.p-message-text').filter({ hasText: 'Saisie incorrecte' }) ).toBeVisible(); 
}); 

Then("Revient sur la page initiale depuis la page d'enregistrement, signalement sans rendez-vous: \"Signaler l’arrivée d’un usager\" s'affiche sur la page", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h3').filter({ hasText: 'Signaler l’arrivée d’un usager' }) ).toBeVisible(); 
}); 

Then("Passe à l'etape suivant: \"L’usager a été ajouté dans la file d’attente\" s'affiche sur la page", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: 'L’usager a été ajouté dans la file d’attente' }) ).toBeVisible();
});

Then("Chaque sous-motif de la liste doit contenir: {string}", async function (sousMotif) {

    //const liSousMotifLocator = await this.terminalPage.locator(`text=${sousMotif}`).first();
    // const ariaLabels = await liSousMotifLocator.locator('..').locator('..').locator('li').allTextContents();
    await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label').filter({ hasText: 'Précisez' }).locator('..').locator('span[aria-label="Choisir"]').click(); 
    
    ariaLabels = await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment label').filter({ hasText: 'Précisez' }).locator('..').locator('.p-select-option-label').allTextContents();
    const normalizedMotif = sousMotif.toLowerCase();
    console.log(ariaLabels)
    console.log('normalizedMotif: ', normalizedMotif)
    const containsMotif = ariaLabels.every(label => label.toLowerCase().includes(normalizedMotif));
    expect(containsMotif).toBeTruthy();
});

Then("Revient sur la page initiale depuis la page motif: \"Signaler l’arrivée d’un usager\" s'affiche sur la page", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h3').filter({ hasText: 'Signaler l’arrivée d’un usager' }) ).toBeVisible(); 
}); 

Then("Tous les informations sur le signalement sans rendez-vous s'affiche correctement sur la page", async function() {

    //***** */ Date/Heure de l'enregistrement
    const dateTextLocator = this.backofficePage.getByText('Enregistré le');
    const dateEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(1)');
    const timeEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(2)');

    const recordedDate = await dateEnregistrementLocator.textContent();
    const recordedTime = await timeEnregistrementLocator.textContent();

    // Vérifier que la date est au format "DD/MM/YYYY"
    expect(recordedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    // Vérifier que l'heure est au format "HHhMM"
    expect(recordedTime).toMatch(/^\d{2}h\d{2}$/);

    //***** */ Motif
    const motifTextLocator = this.backofficePage.getByText('Motif :');
    const motifLocator = motifTextLocator.locator('b');
    const motif = await motifLocator.textContent();
    expect(motif).toBeTruthy();
}); 

Then("Le code QR s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment p').filter({ hasText: "QR code de l'entretien" }) ).toBeVisible(); 
}); 

Then("On revient sur la page de confirmation du signalement sans rendez-vous", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h4').filter({ hasText: "Numéro à communiquer à l’usager" }) ).toBeVisible(); 
}); 

Then("La fenetre de signalement d'arrivé se ferme", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival header span').filter({ hasText: 'Signaler une arrivée' }) ).not.toBeVisible(); 
}); 

Then("Le ticket doit s'afficher dans la file d'attente sans rendez-vous", async function() {
  console.log('ticket number: ', this.ticket);
  
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');

  await expect(ticketBlock).toBeVisible();
});

Then("Le numéro et le motif du ticket confirmé dans le signalement sans rendez-vous doivent être identiques à ceux présents dans la file d'attente.", async function() {
    console.log('ticket number: ', this.ticket);
    console.log('motif: ', this.motif);

    const attenteSansRDVHeader = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/);
    const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
    const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    await expect(ticketBlock).toBeVisible();

    const motifBlock = ticketBlock.locator('xpath=..//..').getByText(this.motif);
    await expect(motifBlock).toBeVisible();
});

Then("Message d'erreur 'Aucun rendez-vous' s'affiche", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment .p-message').filter({ hasText: 'Aucun rendez-vous' })).toBeVisible();
});

Then("Revient sur la page initiale: \"Signaler l’arrivée d’un usager\" s'affiche sur la page", async function() {
    await expect(this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment h3').filter({ hasText: 'Signaler l’arrivée d’un usager' }) ).toBeVisible(); 
}); 

Then("Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page", async function() {
    
    //***** */ Heure du rendez-vous
    const rendezVousTextLocator = this.backofficePage.getByText('Votre rendez-vous de');
    const timeLocator = rendezVousTextLocator.locator('b');
    const rendezVousTime = await timeLocator.textContent();
    // Vérifier que l'heure est au format "HHhMM" (e.g., "19h30")
    expect(rendezVousTime).toMatch(/^\d{2}h\d{2}$/);

    expect(rendezVousTime.replace("h", ":")).toBe(this.heureRdv);

    //***** */ Date/Heure de l'enregistrement
    const dateTextLocator = this.backofficePage.getByText('Enregistré le');
    const dateEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(1)');
    const timeEnregistrementLocator = dateTextLocator.locator('b:nth-of-type(2)');
    
    const recordedDate = await dateEnregistrementLocator.textContent();
    const recordedTime = await timeEnregistrementLocator.textContent();

    // Vérifier que la date est au format "DD/MM/YYYY"
    expect(recordedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    // Vérifier que l'heure est au format "HHhMM"
    expect(recordedTime).toMatch(/^\d{2}h\d{2}$/);

    console.log('recordedDate: ' + recordedDate);
    console.log('recordedTime ' + recordedTime);
    console.log('this.dateRdv ' + this.dateRdv);
    console.log('this.heureRdv ' + this.heureRdv);

    expect(recordedDate).toBe(this.datePriseRdv);
    expect(recordedTime.replace("h", ":")).toBe(this.heurePriseRdv);

    //***** */ Motif
    const motifTextLocator = this.backofficePage.getByText('Motif :');
    const motifLocator = motifTextLocator.locator('b');
    const motif = await motifLocator.textContent();
    expect(motif).toBeTruthy();
    expect(motif).toBe(this.motif);
    
    console.log('motif: ' + motif);
    console.log(dateRdv);
    console.log(heureRdv);
    console.log(this.motif);
}); 


Then("Le ticket doit s'afficher dans la file d'attente avec rendez-vous", async function() {
  console.log('ticket number: ', this.ticket);
  
  const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
  const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
  const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');

  await expect(ticketBlock).toBeVisible();
});


Then("Le numéro et le motif du ticket confirmé dans le signalement avec rendez-vous doivent être identiques à ceux présents dans la file d'attente.", async function() {
    console.log('ticket number: ', this.ticket);
    console.log('motif: ', this.motif);

    const attenteSansRDVHeader = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/);
    const parentBlock = attenteSansRDVHeader.locator('xpath=..//..//..'); 
    const ticketBlock = parentBlock.locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    await expect(ticketBlock).toBeVisible();

    const motifBlock = ticketBlock.locator('xpath=..//..').getByText(this.motif);
    await expect(motifBlock).toBeVisible();
});

After(async function () {
    console.log('==> CLEANING OF RDV');

    if (!this.name || !this.firstname) {
        console.log('==> Aucun rendez-vous a néttoyer');
        return;
    }

    //***********************   Fermer la fenetre signalement d'arrivé si elle est ouvert *************************/
    await this.backofficePage.waitForTimeout(1000);
    if ((await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Terminer' }).count()) > 0) {
        await this.backofficePage.locator('#modal-signal-arrival troov-ce-queue-enrollment button').filter({ hasText: 'Terminer' }).click();
    }


    //***********************   Aller à la page calendrier *************************/
    this.backofficePage.locator('i[title="Calendrier"]').click();
    await this.backofficePage.waitForTimeout(2000);


    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.backofficePage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.backofficePage.waitForTimeout(1000);

    //***********************   Clique sur annuler, puis Annuler ce/ces rendez-vous *************************/
    const annulerBtnLocator = this.backofficePage.locator('#reservation-edit-modal button').filter({ hasText: "Annuler ce/ces rendez-vous" });
    
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.backofficePage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();


    await appointmentLocator.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> RDV deleted');
});
