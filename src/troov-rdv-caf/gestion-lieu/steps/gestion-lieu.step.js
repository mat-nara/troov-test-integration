const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../config/env.js')
const LoginPage = require('../../signalement-usager/pages/LoginPage');
const { generateRandomNIR, generateRandomPhone } = require('../../signalement-usager/utils/helper');
const { faker, fakerFR  } = require('@faker-js/faker');
const { chromium } = require('@playwright/test');
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

Given("La page \"Indiquez les informations concernant votre lieu\" est ouverte", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Modifier les informations de votre lieu"]').click();
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
});

Given("L'utilisateur est sur la page \"Paramètres\" et le menu \"Mon compte\" est ouverte", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
});

Given("L'utilisateur est sur la page \"Blacklist\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Blacklister des utilisateurs"]').click();
});

Given("Une adresse IP est présente dans la liste des IP bloquées", async function() {
    // --- Ouvrir la page Blacklist ---
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Blacklister des utilisateurs"]').click();

    // --- Bloquer une adresse IP ---
    await this.backofficePage.locator('button.btn-outline-primary').filter({ hasText: 'Bloquer une IP' }).first().click();
    this.ip = faker.internet.ipv4();
    await this.backofficePage.locator('#input-ip').fill(this.ip);
    await this.backofficePage.locator('#block-ip button').filter({ hasText: 'Bloquer l\'IP' }).click();
    await this.backofficePage.waitForTimeout(1000); 
});

Given("Une adresse IP est dans la liste de la section \"Adresses IP qui ont réservé le plus de créneaux\"", async function() {
    
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
    await this.backofficePage.waitForTimeout(2000); 
    const ipFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP qui ont reservé le plus de créneaux' })
                                            .locator('../..')
                                            .locator('xpath=following-sibling::*')
                                            .locator('xpath=following-sibling::*')
                                            .locator('table > tbody > tr');
    expect(await ipFirstLocator.count()).toBeGreaterThan(0);
    console.log('ipFirstLocator.count(): ', await ipFirstLocator.count())
    this.ip = await ipFirstLocator.locator('td').nth(0).innerText();
});

Given("Une adresse e-mail est présente dans la liste des e-mails bloqués", async function() {
    // --- Ouvrir la page Blacklist ---
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Blacklister des utilisateurs"]').click();

    // --- Bloquer une adresse Email ---
    await this.backofficePage.locator('button.btn-outline-primary').filter({ hasText: 'Bloquer un email' }).first().click();
    this.email = faker.person.lastName().toLowerCase() + '@test.com';
    await this.backofficePage.locator('#block-email #input-ip').fill(this.email);
    await this.backofficePage.locator('#block-email button').filter({ hasText: 'Bloquer l\'email' }).click();
    await this.backofficePage.waitForTimeout(1000); 
});

Given("Une adresse email est dans la liste de la section \"Adresses email qui ont reservé le plus de créneaux\"", async function() {
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
    await this.backofficePage.waitForTimeout(2000); 
    const emailFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email qui ont reservé le plus de créneaux' })
                                            .locator('../..')
                                            .locator('xpath=following-sibling::*')
                                            .locator('xpath=following-sibling::*')
                                            .locator('table > tbody > tr');
    expect(await emailFirstLocator.count()).toBeGreaterThan(0);
    this.email = await emailFirstLocator.locator('td').nth(0).innerText();
    console.log('emailFirstLocator.count(): ', await emailFirstLocator.count())
});

Given("Une adresse e-mail a été bloquée depuis la section \"Adresses email qui ont reservé le plus de créneaux\"", async function() {
    const emailFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email qui ont reservé le plus de créneaux' })
                                                    .locator('../..')
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('xpath=following-sibling::*')
                                                    .locator('table > tbody > tr:first-child');

    await emailFirstLocator.locator('td:last-child button[title="Bloquer l\'email"]').click();
    this.email = await emailFirstLocator.locator('td').nth(0).innerText();
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


When("L'utilisateur clique sur \"Paramètres\" depuis la page d'accueil", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
});

When("Il clique sur \"Mon compte - Gestion du lieu\"", async function() {
    await this.backofficePage.locator('#common-my-team').click(); 
});

When("Il clique sur \"Modifier les informations de votre lieu\"", async function() {
    await this.backofficePage.locator('div[title="Modifier les informations de votre lieu"]').click();
});

When("L'utilisateur modifie les champs disponibles et clique sur \"Sauvegarder les changements\"", async function() {

    await this.backofficePage.waitForTimeout(2000); 

    // Afficher les menu déroulant sur l'affinage d'adresse
    const classAttribute = await this.backofficePage.locator('#collapse-address-toggle').getAttribute('class');
    if (!classAttribute?.includes('show')) {
        await this.backofficePage.locator('button > u').filter({ hasText: 'Affiner votre adresse' }).click();
    }

    // Déclaration des locators
    const nameInputLocator = this.backofficePage.locator('input#name').first();
    const typeSelectLocator = this.backofficePage.locator('select#type').first();
    const mobileInputLocator = this.backofficePage.locator('input#mobile').first();
    const emailInputLocator = this.backofficePage.locator('input#email').first();
    const displayEmailInputLocator = this.backofficePage.locator('input#displayEmail').first();
    // const mapInputLocator = this.backofficePage.locator('input#map').first();

    const addressInputLocator = this.backofficePage.locator('input#address').first();
    const regionSelectLocator = this.backofficePage.locator('input#region').first();
    const cityInputLocator = this.backofficePage.locator('input#city').first();
    const zipcodeInputLocator = this.backofficePage.locator('input#zipcode').first();

    // Récupération des valeurs
    this.oldName = await nameInputLocator.inputValue();
    this.oldType = await typeSelectLocator.inputValue();
    this.oldMobile = await mobileInputLocator.inputValue();
    this.oldEmail = await emailInputLocator.inputValue();
    this.oldDisplayEmail = await displayEmailInputLocator.isChecked();
    // this.oldMap = await mapInputLocator.inputValue();

    this.oldAdress = await addressInputLocator.inputValue();
    this.oldRegion = await regionSelectLocator.inputValue();
    this.oldCity = await cityInputLocator.inputValue();
    this.oldZipcode = await zipcodeInputLocator.inputValue();

    console.log('this.oldName: ', this.oldName)
    console.log('this.oldType: ', this.oldType)
    console.log('this.oldMobile: ', this.oldMobile)
    console.log('this.oldEmail: ', this.oldEmail)
    console.log('this.oldDisplayEmail: ', this.oldDisplayEmail)
    // console.log('this.oldMap: ', this.oldMap)
    console.log('this.oldAdress: ', this.oldAdress)
    console.log('this.oldRegion: ', this.oldRegion)
    console.log('this.oldCity: ', this.oldCity)
    console.log('this.oldZipcode: ', this.oldZipcode)    

    // Modification des valeurs
    this.newName            = fakerFR.company.name()
    // this.newType =          
    this.newMobile          = generateRandomPhone().slice(1)
    this.newEmail           = fakerFR.internet.email()
    this.newDisplayEmail    = !this.oldDisplayEmail
    // this.newMap             = fakerFR.location.streetAddress() + ',' + fakerFR.location.city()
    this.newAdress          = fakerFR.location.streetAddress()
    this.newRegion          = 'Auvergne-Rhône-Alpes';
    this.newCity            = fakerFR.location.city()
    this.newZipcode         = fakerFR.location.zipCode()


    await nameInputLocator.fill(this.newName);
    await typeSelectLocator.selectOption({ label: 'Mairie / Police' });
    await mobileInputLocator.fill(this.newMobile);
    await emailInputLocator.fill(this.newEmail);
    await displayEmailInputLocator.locator('xpath=following-sibling::*').click();
    //await mapInputLocator.fill(this.newMap);
    await addressInputLocator.fill(this.newAdress);
    await regionSelectLocator.fill(this.newRegion);
    await cityInputLocator.fill(this.newCity);
    await zipcodeInputLocator.fill(this.newZipcode);

    this.newType = await typeSelectLocator.inputValue();   

    console.log('this.newName: ', this.newName)
    console.log('this.newType: ', this.newType)
    console.log('this.newMobile: ', this.newMobile)
    console.log('this.newEmail: ', this.newEmail)
    console.log('this.newDisplayEmail: ', this.newDisplayEmail)
    // console.log('this.newMap: ', this.newMap)
    console.log('this.newAdress: ', this.newAdress)
    console.log('this.newRegion: ', this.newRegion)
    console.log('this.newCity: ', this.newCity)
    console.log('this.newZipcode: ', this.newZipcode)

    // Enregistrer les modifications
    await this.backofficePage.locator('span').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(3000); 
});

When("L'utilisateur rétablit les valeurs d'origine dans les champs modifiés et clique sur \"Sauvegarder les changements\"", async function() {

    await this.backofficePage.waitForTimeout(2000); 

    // Afficher les menu déroulant sur l'affinage d'adresse
    const classAttribute = await this.backofficePage.locator('#collapse-address-toggle').getAttribute('class');
    if (!classAttribute?.includes('show')) {
        await this.backofficePage.locator('button > u').filter({ hasText: 'Affiner votre adresse' }).click();
    }

    // Déclaration des locators
    const nameInputLocator = this.backofficePage.locator('input#name').first();
    const typeSelectLocator = this.backofficePage.locator('select#type').first();
    const mobileInputLocator = this.backofficePage.locator('input#mobile').first();
    const emailInputLocator = this.backofficePage.locator('input#email').first();
    const displayEmailInputLocator = this.backofficePage.locator('input#displayEmail');
    // const mapInputLocator = this.backofficePage.locator('input#map').first();
    
    const addressInputLocator = this.backofficePage.locator('input#address').first();
    const regionSelectLocator = this.backofficePage.locator('input#region').first();
    const cityInputLocator = this.backofficePage.locator('input#city').first();
    const zipcodeInputLocator = this.backofficePage.locator('input#zipcode').first();

    // Restaurer des valeurs
    await nameInputLocator.fill(this.oldName);
    await typeSelectLocator.selectOption({ value: this.oldType });
    await mobileInputLocator.fill(this.oldMobile);
    await emailInputLocator.fill(this.oldEmail);
    await displayEmailInputLocator.locator('xpath=following-sibling::*').click();
    // await mapInputLocator.fill(this.oldMap);
    await addressInputLocator.fill(this.oldAdress);
    await regionSelectLocator.fill(this.oldRegion);
    await cityInputLocator.fill(this.oldCity);
    await zipcodeInputLocator.fill(this.oldZipcode);
    
    // Enregistrer les modifications
    await this.backofficePage.locator('span').filter({ hasText: "Sauvegarder les changements" }).click();
    await this.backofficePage.waitForTimeout(3000); 
});

When("Il réouvre la page \"Indiquez les informations concernant votre lieu\"", async function() {
    await this.backofficePage.locator('i[title="Paramètres"]').click(); 
    await this.backofficePage.locator('#common-my-team').click(); 
    await this.backofficePage.locator('div[title="Modifier les informations de votre lieu"]').click();
    await this.backofficePage.waitForSelector('h2', { state: 'visible' });
});

When("Il clique sur \"Modifier votre compte principal\"", async function() {
    await this.backofficePage.locator('div[title="Modifier votre compte principal"]').click();
});

When('L\'utilisateur sélectionne le compte principal {string} et clique sur "Sauvegarder"', async function (compte) {
    
    //this.oldAccountPrincipal = "CNAF Formation"
    //this.newAccountPrincipal = "CAF TEST"

    await this.backofficePage.locator(`h5[title="${compte}"]`).locator('..').locator('xpath=following-sibling::*').locator('input[type="radio"]').click();
    await this.backofficePage.locator('button[title="Enregistrer"]').click();
    //await this.backofficePage.waitForTimeout(2000);
});

When("L'utilisateur se déconnecte de Troov et se reconnecte à Troov", async function() {
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Déconnexion"]').click();
    await this.loginPageAlt.navigate();

    // Se reconnecter
    this.loginPageTmp = new LoginPage(this.backofficePage);
    await this.loginPageTmp.navigate();
    await this.loginPageTmp.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
    // wait for backoffice loaded
    await this.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 
    let currentURL = await this.backofficePage.url();
    while (!currentURL.includes('calendar')) {
        await this.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await this.backofficePage.url();
    }
    expect(await this.backofficePage.url()).toContain('calendar');
});

When("Il clique sur \"Blacklister des utilisateurs\"", async function() {
    await this.backofficePage.locator('div[title="Blacklister des utilisateurs"]').click();
});

When("Il clique sur le bouton \"Bloquer l'IP\"", async function() {
    await this.backofficePage.locator('button.btn-outline-primary').filter({ hasText: 'Bloquer une IP' }).first().click();
});

When("Il saisit une adresse IP dans le champ prévu", async function() {
    this.ip = faker.internet.ipv4();
    await this.backofficePage.locator('#input-ip').fill(this.ip);
});

When("Il clique sur le bouton de confirmation \"Bloquer l'IP\"", async function() {
    await this.backofficePage.locator('#block-ip button').filter({ hasText: 'Bloquer l\'IP' }).click();
});

When("L'utilisateur clique sur l'icône cadenas correspondant a l'IP bloquée", async function() {
    const ipLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP bloquées' })
                                          .locator('../../..')
                                          .locator('xpath=following-sibling::*')
                                          .locator('xpath=following-sibling::*')
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.ip })
    await ipLocator.locator('..').locator('td').nth(2).locator('button i.bx-lock-open').click();
    await this.backofficePage.waitForTimeout(1000);
});

When("Il clique sur \"Bloquer l'IP\", l'icône \"sens interdit\" pour une IP donnée", async function() {

    const ipFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP qui ont reservé le plus de créneaux' })
                                           .locator('../..')
                                           .locator('xpath=following-sibling::*')
                                           .locator('xpath=following-sibling::*')
                                           .locator('table > tbody > tr:first-child');

    await ipFirstLocator.locator('td:last-child button[title="Bloquer l\'IP"]').click();
});

When("Dans la liste d'IP de la section \"Adresses IP qui ont réservé le plus de créneaux\", il clique sur le bouton \"Export Excel\" pour une IP", async function() {
    const ipFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP qui ont reservé le plus de créneaux' })
                                           .locator('../..')
                                           .locator('xpath=following-sibling::*')
                                           .locator('xpath=following-sibling::*')
                                           .locator('table > tbody > tr:first-child');

    await ipFirstLocator.locator('td:last-child button[title="Export Excel"]').click();
});

When("Dans la section \"Adresses e-mail bloquées\", il clique sur le bouton \"+ Bloquer un email\"", async function() {
    await this.backofficePage.locator('button.btn-outline-primary').filter({ hasText: 'Bloquer un email' }).first().click();
});

When("Il saisit une adresse e-mail dans le champ prévu", async function() {
    this.email = faker.person.lastName().toLowerCase() + '@test.com';
    await this.backofficePage.locator('#block-email #input-ip').fill(this.email);
});

When("Il clique sur le bouton de confirmation \"Bloquer l'email\"", async function() {
    await this.backofficePage.locator('#block-email button').filter({ hasText: 'Bloquer l\'email' }).click();
});

When("L'utilisateur clique sur l'icône cadenas correspondant à cette adresse email", async function() {
    const emailLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email bloquées' })
                                          .locator('../../..')
                                          .locator('xpath=following-sibling::*')
                                          .locator('xpath=following-sibling::*')
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.email })
    await emailLocator.locator('..').locator('td').nth(2).locator('button i.bx-lock-open').click();
    await this.backofficePage.waitForTimeout(1000);
});

When("Il clique sur \"Bloquer l'email\", l'icône \"sens interdit\" pour un email donnée", async function() {
    const emailFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email qui ont reservé le plus de créneaux' })
                                                .locator('../..')
                                                .locator('xpath=following-sibling::*')
                                                .locator('xpath=following-sibling::*')
                                                .locator('table > tbody > tr:first-child');

    await emailFirstLocator.locator('td:last-child button[title="Bloquer l\'email"]').click();
});

When("Dans la liste d'email de la section \"Adresses email qui ont reservé le plus de créneaux\", il clique sur le bouton \"Export Excel\" pour une email", async function() {
    const ipFirstLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email qui ont reservé le plus de créneaux' })
                                                .locator('../..')
                                                .locator('xpath=following-sibling::*')
                                                .locator('xpath=following-sibling::*')
                                                .locator('table > tbody > tr:first-child');

    await ipFirstLocator.locator('td:last-child button[title="Export Excel"]').click();
});









// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------


Then("Le menu \"Mon compte\" apparaît", async function() {
    await expect(this.backofficePage.locator('h4#common-my-team')).toBeVisible();
});

Then("La page \"Indiquez les informations concernant votre lieu\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h2').filter({ hasText: 'Indiquez les informations concernant votre lieu' }) ).toBeVisible();
});

Then("Les informations du lieu sont bien mises à jour", async function() {

    await this.backofficePage.waitForTimeout(2000); 

    // Afficher les menu déroulant sur l'affinage d'adresse
    const classAttribute = await this.backofficePage.locator('#collapse-address-toggle').getAttribute('class');
    if (!classAttribute?.includes('show')) {
        await this.backofficePage.locator('button > u').filter({ hasText: 'Affiner votre adresse' }).click();
    }

    // Déclaration des locators
    const nameInputLocator = this.backofficePage.locator('input#name').first();
    const typeSelectLocator = this.backofficePage.locator('select#type').first();
    const mobileInputLocator = this.backofficePage.locator('input#mobile').first();
    const emailInputLocator = this.backofficePage.locator('input#email').first();
    const displayEmailInputLocator = this.backofficePage.locator('input#displayEmail').first();
    // const mapInputLocator = this.backofficePage.locator('input#map').first();

    const addressInputLocator = this.backofficePage.locator('input#address').first();
    const regionSelectLocator = this.backofficePage.locator('input#region').first();
    const cityInputLocator = this.backofficePage.locator('input#city').first();
    const zipcodeInputLocator = this.backofficePage.locator('input#zipcode').first();

    // Récupération des valeurs
    valueName = await nameInputLocator.inputValue();
    valueType = await typeSelectLocator.inputValue();
    valueMobile = await mobileInputLocator.inputValue();
    valueEmail = await emailInputLocator.inputValue();
    valueDisplayEmail = await displayEmailInputLocator.isChecked();
    // valueMap = await mapInputLocator.inputValue();
    valueAdress = await addressInputLocator.inputValue();
    valueRegion = await regionSelectLocator.inputValue();
    valueCity = await cityInputLocator.inputValue();
    valueZipcode = await zipcodeInputLocator.inputValue();

    console.log("Premier mise a jours ************************ ")
    console.log('valueName: ', valueName)
    console.log('valueType: ', valueType)
    console.log('valueMobile: ', valueMobile)
    console.log('valueEmail: ', valueEmail)
    console.log('valueDisplayEmail: ', valueDisplayEmail)
    // console.log('valueMap: ', valueMap)
    console.log('valueAdress: ', valueAdress)
    console.log('valueRegion: ', valueRegion)
    console.log('valueCity: ', valueCity)
    console.log('valueZipcode: ', valueZipcode)

    // Vérifier les valeurs de chaque champ
    await expect(valueName).toBe(this.newName);
    await expect(valueType).toBe(this.newType);

    await expect(valueMobile.replace(/[^0-9]/g, '')).toContain(this.newMobile);

    //await expect(valueMobile).toBe(this.newMobile);
    await expect(valueEmail).toBe(this.newEmail);
    await expect(valueDisplayEmail).toBe(this.newDisplayEmail);
    // await expect(valueMap).toBe(this.newMap);
    await expect(valueAdress).toBe(this.newAdress);
    await expect(valueRegion).toBe(this.newRegion);
    await expect(valueCity).toBe(this.newCity);
    await expect(valueZipcode).toBe(this.newZipcode);
});

Then("Les informations du lieu sont bien restaurées", async function() {

    await this.backofficePage.waitForTimeout(2000); 

    // Afficher les menu déroulant sur l'affinage d'adresse
    const classAttribute = await this.backofficePage.locator('#collapse-address-toggle').getAttribute('class');
    if (!classAttribute?.includes('show')) {
        await this.backofficePage.locator('button > u').filter({ hasText: 'Affiner votre adresse' }).click();
    }

    // Déclaration des locators
    const nameInputLocator = this.backofficePage.locator('input#name').first();
    const typeSelectLocator = this.backofficePage.locator('select#type').first();
    const mobileInputLocator = this.backofficePage.locator('input#mobile').first();
    const emailInputLocator = this.backofficePage.locator('input#email').first();
    const displayEmailInputLocator = this.backofficePage.locator('input#displayEmail').first();
    // const mapInputLocator = this.backofficePage.locator('input#map').first();

    const addressInputLocator = this.backofficePage.locator('input#address').first();
    const regionSelectLocator = this.backofficePage.locator('input#region').first();
    const cityInputLocator = this.backofficePage.locator('input#city').first();
    const zipcodeInputLocator = this.backofficePage.locator('input#zipcode').first();

    // Récupération des valeurs
    var valueName = await nameInputLocator.inputValue();
    var valueType = await typeSelectLocator.inputValue();
    var valueMobile = await mobileInputLocator.inputValue();
    var valueEmail = await emailInputLocator.inputValue();
    var valueDisplayEmail = await displayEmailInputLocator.isChecked();
    // var valueMap = await mapInputLocator.inputValue();
    var valueAdress = await addressInputLocator.inputValue();
    var valueRegion = await regionSelectLocator.inputValue();
    var valueCity = await cityInputLocator.inputValue();
    var valueZipcode = await zipcodeInputLocator.inputValue();

    console.log("Restauration mise a jours ************************ ")
    console.log('valueName: ', valueName)
    console.log('valueType: ', valueType)
    console.log('valueMobile: ', valueMobile)
    console.log('valueEmail: ', valueEmail)
    console.log('valueDisplayEmail: ', valueDisplayEmail)
    // console.log('valueMap: ', valueMap)
    console.log('valueAdress: ', valueAdress)
    console.log('valueRegion: ', valueRegion)
    console.log('valueCity: ', valueCity)
    console.log('valueZipcode: ', valueZipcode)

    // Vérifier les valeurs de chaque champ
    await expect(valueName).toBe(this.oldName);
    await expect(valueType).toBe(this.oldType);

    await expect(valueMobile.replace(/[^0-9]/g, '')).toContain(this.oldMobile);

    // await expect(valueMobile).toBe(this.oldMobile);
    await expect(valueEmail).toBe(this.oldEmail);
    await expect(valueDisplayEmail).toBe(this.oldDisplayEmail);
    // await expect(valueMap).toBe(this.oldMap);
    await expect(valueAdress).toBe(this.oldAdress);
    await expect(valueRegion).toBe(this.oldRegion);
    await expect(valueCity).toBe(this.oldCity);
    await expect(valueZipcode).toBe(this.oldZipcode);
});

Then("La page de modification du compte principal s'affiche", async function() {
    await expect(this.backofficePage.locator('h4').filter({ hasText: 'Sélectionnez votre compte principal' }) ).toBeVisible();
});

Then("Un message de confirmation du changement du compte principal s'affiche", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Nous avons pris en compte vos changements')).toBeVisible();
});

Then('Le compte principal sélectionné précédemment {string} est utilisé par défaut', async function(compte) {
    await this.backofficePage.locator('img.header-profile-user').click();
    await this.backofficePage.locator('button[title="Changer de compte"]').click();
    const selectedAccount = await this.backofficePage.locator('span.p-badge-dot').locator('..').getAttribute('title');
    await expect(selectedAccount).toBe(compte);
    await this.backofficePage.mouse.click(10, 10);
});

Then("La page \"Blacklist\" s'affiche", async function() {
    await expect(this.backofficePage.locator('h1').filter({ hasText: 'Blacklist' }) ).toBeVisible();
});

Then("Un popup s'ouvre avec la possibilité de saisir une adresse IP dans le champ prévu à cet effet", async function() {
    await expect(this.backofficePage.locator('#block-ip')).toBeVisible();
    await expect(this.backofficePage.locator('#input-ip')).toBeEditable();
});

Then("Un message de confirmation d'adresse IP bloquée avec succès s'affiche", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse IP bloquée avec succès')).toBeVisible();
});

Then("L'adresse IP figure dans la liste des IP bloquées avec la bonne date et heure", async function() {
    console.log('ip: ', this.ip)
    await this.backofficePage.waitForTimeout(2000);
    const ipLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP bloquées' })
                                          .locator('../../..')
                                          .locator('xpath=following-sibling::*')
                                          .locator('xpath=following-sibling::*')
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.ip })
    expect(await ipLocator.count()).toBeGreaterThan(0);

    const displayedDate = await ipLocator.locator('..').locator('td').nth(0).innerText();
    const now   = new Date();
    const mois  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin','juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const jour  = now.getDate();
    const moisNom   = mois[now.getMonth()];
    const annee     = now.getFullYear();
    const heures    = String(now.getHours()).padStart(2, '0');
    const minutes   = String(now.getMinutes()).padStart(2, '0');
    const nowFormatted = `${jour} ${moisNom} ${annee} ${heures}h${minutes}`;

    expect(displayedDate?.trim()).toBe(nowFormatted);

    // -- Débloquer le l'IP apres les tests --
    await ipLocator.locator('..').locator('td').nth(2).locator('button i.bx-lock-open').click();
    await this.backofficePage.waitForTimeout(2000);
    
    //console.log('displayedDate: ', displayedDate)
    //console.log('nowFormatted: ', nowFormatted)
});

Then("L'adresse IP est supprimée de la liste", async function() {
    const ipLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses IP bloquées' })
                                          .locator('../../..')
                                          .locator('xpath=following-sibling::*')
                                          .locator('xpath=following-sibling::*')
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.ip })
    expect(await ipLocator.count()).toBe(0);
});

Then("Un message de déblocage est affiché", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse IP débloquée avec succès')).toBeVisible();
});

Then("Le fichier Excel est téléchargé", async function() {
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("liste_ips.xlsx");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le fichier contient la liste des RDV associés à cette IP", async function() {
    // await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse IP débloquée avec succès')).toBeVisible();
});

Then("Un popup s'ouvre avec la possibilité de saisir une adresse e-mail dans le champ prévu à cet effet", async function() {
    await expect(this.backofficePage.locator('#block-email')).toBeVisible();
    await expect(this.backofficePage.locator('#block-email #input-ip')).toBeEditable();
});

Then("Un message de confirmation d'email bloquée avec succès s'affiché", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse email bloquée avec succès')).toBeVisible();
});

Then("L'adresse e-mail figure dans la liste des e-mails bloqués avec la bonne date et heure", async function() {
    console.log('this.email: ', this.email)
    await this.backofficePage.waitForTimeout(2000);
    const emailLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email bloquées' })
                                          .locator('../../..')
                                          .locator('xpath=following-sibling::*')
                                          .locator('xpath=following-sibling::*')
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.email })
    expect(await emailLocator.count()).toBeGreaterThan(0);

    const displayedDate = await emailLocator.locator('..').locator('td').nth(0).innerText();
    const now   = new Date();
    const mois  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin','juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const jour  = now.getDate();
    const moisNom   = mois[now.getMonth()];
    const annee     = now.getFullYear();
    const heures    = String(now.getHours()).padStart(2, '0');
    const minutes   = String(now.getMinutes()).padStart(2, '0');
    const nowFormatted = `${jour} ${moisNom} ${annee} ${heures}h${minutes}`;

    expect(displayedDate?.trim()).toBe(nowFormatted);
    
    // console.log('displayedDate: ', displayedDate)
    // console.log('nowFormatted: ', nowFormatted)

    // -- Débloquer le l'email apres les tests --
    await emailLocator.locator('..').locator('td').nth(2).locator('button i.bx-lock-open').click();
    await this.backofficePage.waitForTimeout(2000);
});

Then("L'adresse e-mail est supprimée de la liste", async function() {
    console.log('this.email: ', this.email)
    
    await this.backofficePage.waitForTimeout(2000);
    
    const emailLocator =  this.backofficePage.locator('h2').filter({ hasText: 'Adresses email bloquées' })
                                          //.locator('../../..')
                                          .locator('../../../..')
                                          //.locator('xpath=following-sibling::*')
                                          //.locator('xpath=following-sibling::*')
                                          .locator('> div.col-sm-12 ')
                                          .first()
                                          .locator('table > tbody > tr > td')
                                          .filter({ hasText: this.email })
    // await emailLocator.first().waitFor({ state: 'detached', timeout: 5000 });
    console.log(await emailLocator.allTextContents());
    // expect(await emailLocator.count()).toBe(0);
    await expect(emailLocator).toHaveCount(0);
});

Then("Un message de confirmation de déblocage de l'email est affiché", async function() {
    await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse email débloquée avec succès')).toBeVisible();
});

Then("Le fichier Excel associé a l'email est téléchargé", async function() {
    const download = await this.backofficePage.waitForEvent('download');
	expect(download.suggestedFilename()).toBe("liste_email.xlsx");
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	await download.delete();
});

Then("Le fichier contient la liste des RDV associés à cette adresse e-mail", async function() {
    // await expect(this.backofficePage.locator('.Vue-Toastification__container').getByText('Adresse email débloquée avec succès')).toBeVisible();
});
