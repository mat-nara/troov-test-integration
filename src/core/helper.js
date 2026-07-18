const config = require('../../config/env.js')
const { expect } = require('@playwright/test');



// 13 digits
function generateRandomNIR() { 
    // Sexe : 1, 2, 3, 4, 7 ou 8
    const sexe = String([1, 2, 3, 4, 7, 8][Math.floor(Math.random() * 6)]);

    // Année : 00 – 99
    const annee = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    // Mois:
    // - 01 à 12 // - 20 à 39 // - 40 à 42 // - 50 à 99
    function randomMois() {
        const ranges = [[1, 12],[20, 39],[40, 42],[50, 99]];
        const r = ranges[Math.floor(Math.random() * ranges.length)];
        const value = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];
        return String(value).padStart(2, '0');
    }
    const mois = randomMois();

    // Département : 2A, 2B, 2a, 2b, 00–99, ou 970–989 (fixé a 2 chiffre)
    function randomDepartement() {
        const corsica = ["2A", "2B", "2a", "2b"];
        const mode = Math.floor(Math.random() * 3);
        if (mode === 0) {
            return corsica[Math.floor(Math.random() * corsica.length)];
        } else if (mode === 1) {
            return String(Math.floor(Math.random() * 100)).padStart(2, '0');
         } else {
        //     return "9" + (7 + Math.floor(Math.random() * 2)) + String(Math.floor(Math.random() * 10));
            return String(Math.floor(Math.random() * 100)).padStart(2, '0');
        }
    }
    const departement = randomDepartement();

    // Commune : 2 ou 3 chiffres
    // const commune = Math.random() < 0.5 ? String(Math.floor(Math.random() * 100)).padStart(2, '0') : String(Math.floor(Math.random() * 1000)).padStart(3, '0'); 
    // Commune (fixé a 3 chiffres)
    const commune = String(Math.floor(Math.random() * 1000)).padStart(3, '0');


    // Ordre : 001 – 999
    const ordre = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

    // Construction finale du NIR
    return `${sexe}${annee}${mois}${departement}${commune}${ordre}`;
}

// 10 digits with 0 as first character
function generateRandomPhone() {
    // Choose the prefix
    const prefixes = [
        "01", "02", "03", "04", "05", // geographic numbers
        "06", "07",                   // mobile numbers
        "08",                         // special service numbers
        "09"                          // VoIP / non-geographic numbers
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    // Generate the remaining 8 digits
    const rest = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    
    return `${prefix}${rest}`;
}

async function connexionAlfa(world) {

    await world.backofficePage.goto(config.troovPublicUserBackofficeURL);
    await world.backofficePage.waitForTimeout(2000);

    await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
    await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
    await world.backofficePage.locator('button[type="submit"]').first().click();

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    await world.backofficePage.waitForTimeout(2000);
    if (await world.backofficePage.locator('#password').isVisible()) {
        await world.backofficePage.locator('#email').fill(config.troovPublicUserBackofficeUsername);
        await world.backofficePage.locator('#password').fill(config.troovPublicUserBackofficePassword);
        await world.backofficePage.locator('button[type="submit"]').first().click();
    }

    // wait for backoffice loaded
    await world.backofficePage.waitForSelector('#page-topbar', { state: 'visible' }); 

    let currentURL = await world.backofficePage.url();
    while (!currentURL.includes('calendar')) {

        await world.backofficePage.waitForTimeout(1000); // wait for 1 second before checking again
        currentURL = await world.backofficePage.url();
    }
    expect(await world.backofficePage.url()).toContain('calendar');
}

module.exports = { generateRandomNIR, generateRandomPhone, connexionAlfa };