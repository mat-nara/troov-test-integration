const config = require('../../config/env.js');
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const LoginPage = require('./pages/LoginPage.js');
const CalendarPage = require('./pages/CalendarPage.js');
const { generateRandomNIR, generateRandomPhone } = require('./helper.js');
const { fakerFR } = require('@faker-js/faker');


setDefaultTimeout(60 * 1000);

BeforeAll(async function () {
    // Create new rendez-vous
//    const browser = await chromium.launch({ headless: false });
//    const context = await browser.newContext();
//    var page = await context.newPage();
//
//    var loginPage = new LoginPage(page);
//    await loginPage.navigate(page);
//    await loginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
//    console.log('login was finished')
//
//    var calendarPage = new CalendarPage(page);
//    await calendarPage.navigate();
//
//    // Generate random data for appointment
//    global.nom = fakerFR.person.firstName()
//    global.prenoms = fakerFR.person.lastName()
//    global.email = global.prenoms.toLowerCase() + '@test.com';
//    global.NIR = generateRandomNIR();
//    global.phone = generateRandomPhone();
//
//    await calendarPage.createAppointment(global.nom, global.prenoms, global.email, global.NIR, global.phone);
//    console.log('appointment creation was finished')
//    await browser.close(); 

    //global.NIR = '9999999999999'
    //global.phone = '0999999999'
});

Before(async function () {
    console.log('before init called')
    await this.init(); // Initialise le navigateur et les pages
});

Before('@authenticated', async function () {
    await this.loginPage.navigate();
    await this.loginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
});

Before('@appointmentRequired', async function () {
});

After('@appointmentRequired', async function () {
});

After(async function () {
  await this.destroy();
});

AfterAll(async function () {
//    const browser = await chromium.launch({ headless: false });
//    const context = await browser.newContext();
//    var page = await context.newPage();
//
//    var loginPage = new LoginPage(page);
//    await loginPage.navigate(page);
//    await loginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
//
//    var calendarPage = new CalendarPage(page);
//    await calendarPage.navigate();
//    await calendarPage.deleteAppointment(global.nom, global.prenoms);
//    await browser.close(); 
});