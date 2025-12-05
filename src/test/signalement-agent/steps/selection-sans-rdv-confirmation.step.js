const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const LoginPage = require('../../signalement-usager/pages/LoginPage');


setDefaultTimeout(60 * 1000);


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


Given("La page de confirmation de la création de ticket sans rendez-vous est ouverte", async function() {

	await this.backofficePage.locator('i[title="File d\'attente"]').click();
	const signalerArriveeButton = await this.backofficePage.locator('button[title="Signaler une arrivée"]');
	await signalerArriveeButton.waitFor({ state: 'visible' });
	await signalerArriveeButton.click();
	await this.backofficePage.locator('button').filter({ hasText: "Usager sans rendez-vous" }).click();
	await expect(this.backofficePage.getByText("Enregistrer l’usager")).toBeVisible();

	// Remplir les informations de l'usager
	const inputNIRLocator = this.backofficePage.locator('label[for="social-security-number"] + input');
	await inputNIRLocator.fill(generateRandomNIR());
	const inputPhoneLocator = this.backofficePage.locator('label[for="phone-number"] + input');
	await inputPhoneLocator.fill(generateRandomPhone());
	const buttonLocator = await this.backofficePage.locator('button').filter({ hasText: 'Continuer' });
	await expect(buttonLocator).toBeEnabled();
	await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();

	// Page Motif de visite 
	await expect(await this.backofficePage.getByText("Choisir le motif de visite")).toBeVisible();
	const inputOfficeTypeLocator = this.backofficePage.locator('label[for="office-type"] + div span.p-select-label');
	await inputOfficeTypeLocator.click();
	await this.backofficePage.locator(`li[aria-label="Enfant"]`).click();
	const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
	expect(updatedTextOfficeType.trim()).toBe("Enfant");
	await this.backofficePage.locator('label[for="office"] + div span.p-select-label').click();
	const liAttendEnfantLocator = await this.backofficePage.locator(`li[aria-label="J'attends / J'accueille un enfant"]`);
	//const liAttendEnfantLocator = await this.backofficePage.locator(`li[aria-label="J’ai besoin d’aide pour mes démarches en ligne"]`);
	await liAttendEnfantLocator.click();
	const updatedTextOffice = await liAttendEnfantLocator.textContent();
	expect(updatedTextOffice.trim()).toBe("J'attends / J'accueille un enfant");
	await this.backofficePage.locator('button').filter({ hasText: 'Continuer' }).click();

  	// Page de confirmation
  	await expect(await this.backofficePage.getByText("L’usager a été ajouté dans la file d’attente")).toBeVisible();
});

// Téléchargement du ticket digital
When("L'utilisateur clique sur le bouton \"Télécharger mon ticket\" de la page confirmation signalement sans rendez-vous", async function() {
  await this.backofficePage.getByText('Télécharger mon ticket').click();
});

// La page de confirmation sans rendez-vous s'affiche correctement 
Then("Le titre \"Vous êtes bien enregistré !\" s'affiche sur la page de confirmation signalement sans rendez-vous", async function() {
  const heading = await this.backofficePage.getByText("Vous êtes bien enregistré !");
  await expect(heading).toBeVisible();
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

Then("Le fichier ticket digital sur page de confirmation sans rendez-vous doit être téléchargé", async function() {
  const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("ticket.pdf");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

After(async function () {
    console.log('==> CLEANING OF TICKET CREATED');
    
    if (!(await this.backofficePage.locator('text="Numéro à communiquer à l’usager"').count() > 0)) {
        console.log('==> Aucun ticket à nettoyer');
        return;
    }
    
    // Chercher le numero du ticket
    const pElement = this.backofficePage.locator('text="Numéro à communiquer à l’usager"').locator('xpath=/following-sibling::div[1]/p');
    this.ticket = await pElement.textContent();
	console.log('==> Ticket to delete: ' + this.ticket);

    if (!this.ticket) {
        console.log('==> Aucun ticket a néttoyer');
        return;
    }
	this.backofficePage.locator('button').filter({ hasText: 'Terminer' }).click()


    //***********************   Supprimer le ticket créé *************************/
    
    await this.backofficePage.locator('i[title="File d\'attente"]').click();
    await this.backofficePage.waitForTimeout(2000); 

    // Localiser le ticket dans la section "Attente sans RDV"
    const ticketBlock = this.backofficePage.getByText(/Attente sans RDV \(\d+\)/)
                                           .locator('xpath=..//..//..')
                                           .locator('div.font-size-large.w-25:has-text("' + this.ticket + '")');
    
    await ticketBlock.locator('..').locator('button[title="Annuler le ticket"]').click();
    await this.backofficePage.waitForTimeout(1000);
    await this.backofficePage.locator('.modal-dialog footer button').filter({ hasText: 'Oui' }).click();

    await ticketBlock.waitFor({ state: 'detached', timeout: 5000 });

    console.log('==> Ticket deleted');
});
