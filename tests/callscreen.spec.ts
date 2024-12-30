const { test, expect } = require('@playwright/test');
import { config } from '../config/env';

let page_troov_vue, page_callscreen;

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();

    // Login and get service name
    page_troov_vue = await context.newPage();

    await page_troov_vue.goto(config.troovURL + '/login');
    await page_troov_vue.getByLabel('Email').fill(config.username);
    await page_troov_vue.getByLabel('Mot de passe').fill(config.password);
    await page_troov_vue.getByRole('button', { name: 'Connexion' }).click();
    await page_troov_vue.waitForSelector('#side-menu'); // Wait for the login to complete

    // Get service name
    const imgLocator    = page_troov_vue.locator('img[title="Ma page de RDV"]');
    const parentLocator = imgLocator.locator('..');
    const href          = await parentLocator.getAttribute('href');

    let service = "";
    if (href) service = href.split('/')[1];

    page_callscreen = await context.newPage();
    await page_callscreen.goto( config.callscreenURL + '/' + service);
});

test('Check date and time', async ({}) => {

    // Get the displayed time
    const displayedTime = await page_callscreen.locator('.text-primary .font-extrabold').textContent();
    
    // Get Date 
    const locator = page_callscreen.locator('.text-primary .font-medium');
    let textContent = "";
    while (textContent === null || textContent.trim() === '') {
        textContent = await locator.textContent();
        await page_callscreen.waitForTimeout(100);
    }
    const displayedDate = await locator.textContent();
    
    // Get the system time and date
    const now = new Date();
    const systemTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const systemDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    // Helper function to convert time string to minutes
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const systemTimeInMinutes       = timeToMinutes(systemTime);
    const displayedTimeInMinutes    = timeToMinutes(displayedTime.trim());
  
    // Define acceptable range in minutes (±5 minutes)
    const rangeInMinutes = 5;
  
    // Check if displayed time is within the acceptable range of system time
    const isTimeInRange = Math.abs(displayedTimeInMinutes - systemTimeInMinutes) <= rangeInMinutes;

    console.log(`Displayed Time: ${displayedTime}, System Time: ${systemTime}`);
    console.log(`Displayed Date: ${displayedDate}, System Date: ${systemDate}`);

    // Assertions
    //expect(displayedTime.trim()).toBe(systemTime);
    expect(isTimeInRange).toBe(true);
    expect(displayedDate.trim().toLowerCase()).toBe(systemDate.toLowerCase());
});
