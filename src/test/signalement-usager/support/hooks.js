// support/hooks.js
const config = require('../../../../config/env.js');
const { Before, After } = require('@cucumber/cucumber');
//const {CustomWorld} = require("world.js")

//setWorldConstructor(CustomWorld);

Before(async function () {
  await this.init(); // Initialise le navigateur et les pages
});

Before('@authenticated', async function () {
    await this.loginPage.navigate();
    await this.loginPage.login(config.troovCafUserBackofficeUsername, config.troovCafUserBackofficePassword);
});

After(async function () {
  await this.destroy(); // Ferme le navigateur
});