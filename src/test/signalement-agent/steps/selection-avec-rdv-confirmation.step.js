const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { faker, fakerFR  } = require('@faker-js/faker');



setDefaultTimeout(60 * 1000);


async function setupRdv(world) {

    console.log('==> CREATION OF RDV');

	await setupRdvManagementPage(world);

    // Open window Ajouter un RDV
    await world.rdvManagementPage.locator('button[title="Ajouter un RDV"]').click();

    // Choix du Service (1st item)
    const selectorService = world.rdvManagementPage.locator('span').filter({ hasText: 'Choisir un service' })
    await selectorService.click();
    const selectorServiceLegend = world.rdvManagementPage.locator('legend').filter({ hasText: 'Service' })
    const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "06 - J'ai une demande concernant le handicap ou la dépendance - Je souhaite faire une demande d'allocation journalière de proche aidant (AJPA)" }).first(); 
    // const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li').filter({ hasText: "Demande d'abandon du recouvrement (M1)" }).first(); 

    await firstItemService.click();

    // Choix du mode
    // const selectorModeDuRDV = world.rdvManagementPage.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
    // await selectorModeDuRDV.selectOption({ index: 0 });  

    // Select heure du RDV 
    // const selectorDateDuRDV = world.rdvManagementPage.locator('label').filter({ hasText: 'Date du RDV' }).locator('xpath=following-sibling::span//div//input');
    // await selectorDateDuRDV.click();
    // world.rdvManagementPage.locator('span[aria-label="jeudi 28 août 2025"]').nth(1).click();
    // await selectorDateDuRDV.fill('28/08/2025');

    const selectorHeureDuRDV = world.rdvManagementPage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    await selectorHeureDuRDV.selectOption({ index: 1 });  //

    // Create new user
    const selectorButtonCreerUser = world.rdvManagementPage.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
    await selectorButtonCreerUser.click();

    // Generate random data for appointment
    world.name = faker.person.lastName();
    world.firstname = faker.person.firstName();
    // world.email = world.name.toLowerCase() + '@test.com';
    // this.email = this.name.toLowerCase() + '@test.com';

    const randomNumber = Math.floor(100 + Math.random() * 999); // Générer un nombre aléatoire à 6 chiffres
    world.email = world.name.toLowerCase() + "-" + world.firstname.toLowerCase() + "-" + randomNumber.toString() + '@test.com';

    world.NIR = generateRandomNIR();
    world.phone = generateRandomPhone();

    await world.rdvManagementPage.getByPlaceholder('Ajouter un Nom').fill(world.name);
    await world.rdvManagementPage.getByPlaceholder('Ajouter un Prénom').fill(world.firstname);
    await world.rdvManagementPage.getByPlaceholder('Ajouter un Email').fill(world.email);
    await world.rdvManagementPage.getByPlaceholder('1 48 05 99 *** ***').fill(world.NIR);
    await world.rdvManagementPage.getByPlaceholder('Numéro de téléphone').fill(world.phone);
    
    await world.rdvManagementPage.locator('button[title="Confirmer"]').click()

    // Mode de prise du rendez-vous
    //await this.rdvManagementPage.locator('#radio-taken-mode label').first().click(); // prise sur site
    // Choix du Service (1st item)
    const selectorPriseRdv = world.rdvManagementPage.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
    await selectorPriseRdv.click();
    const selectorPriseRdvLegend = world.rdvManagementPage.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
    const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
    await firstItemPriseRdv.click();

    // ------------------------- Récuperation de la date/heure du rendez-vous initial -----------//
    const dateInputLocator = world.rdvManagementPage.getByText('Date du RDV').locator('xpath=following-sibling::*').locator('input[aria-label="Cliquez ici pour choisir la date"]');
    world.initialAppointmentDate  = await dateInputLocator.inputValue();

    // const selectorHeureDuRDV = world.rdvManagementPage.locator('legend').filter({ hasText: 'Heure du RDV' }).locator('xpath=following-sibling::div//select');
    world.initialAppointmentTime  = await selectorHeureDuRDV.inputValue();

    // -------------------------  Confirmation du rendez-vous ----------------------- //
    // Bloquer le créneau
    await world.rdvManagementPage.locator('button[title="Bloquer ce créneau"]').click()

    // Confirmer le rendez-vous
    const textLocator = world.rdvManagementPage.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
    await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click();

    // Changer selecteur de nombre de jours a afficher
    const filterLocator = world.rdvManagementPage.locator('.calendar-mode-select .multiselect').nth(1);
    await filterLocator.click();
    await filterLocator.locator('.multiselect__content-wrapper ul li').filter({ hasText: "Journée", exact: true }).nth(0).click();

    await world.rdvManagementPage.waitForTimeout(1000);

    var fullname = world.name.toUpperCase() + ' ' + world.firstname
    const appointmentLocator = world.rdvManagementPage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.waitFor({ state: 'visible' });

    world.oldDateRdv     = world.initialAppointmentDate
    world.oldHeureRdv    = world.initialAppointmentTime

    // Récuperer la date courant
    const now = new Date();
    // Format the current date and time in 'DD/MM/YYYY HH:mm' format
    world.appointmentDate    = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    world.appointmentTime    = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    world.userName           = await world.rdvManagementPage.locator('img[alt="Photo de profil"]').locator('xpath=preceding-sibling::span').textContent();

    console.log('==> RDV CREATED');
    
    return { name: world.name, firstname: world.firstname, NIR: world.NIR, phone: world.phone, oldDateRdv: world.oldDateRdv, oldHeureRdv: world.oldHeureRdv, appointmentDate: world.appointmentDate, appointmentTime: world.appointmentTime};
};

async function setupRdvManagementPage(world) {
	// Open a new page for RDV management and set profile
	world.rdvManagementPage = await world.context.newPage();
	world.rdvManagementPage.goto(config.troovCafUserBackofficeURL);

	// wait for backoffice loaded
	await world.rdvManagementPage.waitForSelector('#page-topbar', { state: 'visible' }); 

	let currentURL = await world.rdvManagementPage.url();
	while (!currentURL.includes('calendar')) {
		await world.rdvManagementPage.waitForTimeout(1000); // wait for 1 second before checking again
		currentURL = await world.rdvManagementPage.url();
	}
	expect(await world.rdvManagementPage.url()).toContain('calendar');

	// Changer de compte en CNAF Formation
	await world.rdvManagementPage.locator('img.header-profile-user').click();
	await world.rdvManagementPage.locator('button[title="Changer de compte"]').click();
	await world.rdvManagementPage.waitForTimeout(3000); 

	await world.rdvManagementPage.locator('li[aria-label="CNAF Formation"] > div.p-tree-node-content > span.p-tree-node-label').click();

	currentURL = await world.rdvManagementPage.url();
	while (!currentURL.includes('calendar')) {
		await world.rdvManagementPage.waitForTimeout(1000); // wait for 1 second before checking again
		currentURL = await world.rdvManagementPage.url();
	}
	expect(await world.rdvManagementPage.url()).toContain('calendar');
};


Given("L'utilisateur est connecté à l'application Troov", async function() {
  
  //***********************   Login Backoffice *************************/
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


Given("Un rendez-vous a été créer", async function() {

	//****************** Création d'un rendez-vous ******************/
	this.backofficePage.waitForTimeout(2000); 
	const { name, firstname, NIR, phone, oldDateRdv_1, oldHeureRdv_1, appointmentDate_1, appointmentTime_1 } = await setupRdv(this);
	this.name         = name;
	this.firstname    = firstname;
	this.NIR          = NIR;
	this.phone        = phone;
	console.log('==> Rendez-vous 1 créé pour ' + this.name + " " + this.firstname); 
});


Given("Un ticket associé a ce rendez-vous a été créer et la page de confirmation est ouverte", async function() {

	await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.locator('button').filter({ hasText: "Usager avec rendez-vous" }).click();
	await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();

	// Remplir les informations de l'usager
	const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
    await inputNIRLocator.fill(this.NIR);
    const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
    await inputPhoneLocator.fill(this.phone);
    const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
    await expect(buttonLocator).toBeEnabled();
	await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();

  	// Page de confirmation
  	await expect(await this.backofficePage.getByText("L’usager a été ajouté dans la file d’attente")).toBeVisible();
});



Then("Tous les informations sur le signalement avec rendez-vous s'affiche correctement sur la page", async function() {

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


After(async function () {

	console.log('==> CLEANING OF RDV');

    if (!this.name || !this.firstname) {
        console.log('==> Aucun rendez-vous a néttoyer');
        return;
    }
	
    //***********************   Selectionne le rendez-vous *************************/
    var fullname = this.name.toUpperCase() + ' ' + this.firstname
    const appointmentLocator = this.rdvManagementPage.locator('span.font-weight-bold').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
    await appointmentLocator.click();
    await this.rdvManagementPage.waitForTimeout(1000);

    //***********************   Clique sur annuler, puis Annuler ce/ces rendez-vous *************************/
    const annulerBtnLocator = this.rdvManagementPage.locator('#reservation-edit-modal button').filter({ hasText: "Annuler ce/ces rendez-vous" });
    
    await annulerBtnLocator.click();
    const annulerCesRdvBtnLocator = this.rdvManagementPage.locator('#send-message span:has-text("Annuler ce/ces rendez-vous")').locator('..');
    await annulerCesRdvBtnLocator.click();


    await appointmentLocator.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> RDV deleted');

    //*********************************************** End of suppression du rendez-vous *************************/
    console.log('==> CLEANING OF TICKET CREATED');
    
    if (!(await this.backofficePage.locator('text="Numéro à communiquer à l’usager"').count() > 0)) {
        console.log('==> Aucun ticket à nettoyer');
        return;
    }
    
    // Chercher le numero du ticket
    const pElement = this.backofficePage.locator('text="Numéro à communiquer à l’usager"').locator('xpath=/following-sibling::div[1]/p');
    this.ticket = await pElement.textContent();

    if (!this.ticket) {
        console.log('==> Aucun ticket a néttoyer');
        return;
    }

	await this.backofficePage.locator('button').filter({ hasText: 'Terminer' }).click()
    
    //***********************   Supprimer le ticket créé *************************/
    
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await this.backofficePage.waitForTimeout(2000); 

    // Localiser le ticket dans la section "Attente sans RDV"
    const ticketBlock = this.backofficePage.getByText(/Attente avec RDV \(\d+\)/)
                                           .locator('xpath=..//..//..')
                                           .locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    
    await ticketBlock.locator('..').locator('button[title="Annuler le ticket"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('.modal-dialog footer button').filter({ hasText: 'Oui' }).click();

    await ticketBlock.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> Ticket deleted');
});
