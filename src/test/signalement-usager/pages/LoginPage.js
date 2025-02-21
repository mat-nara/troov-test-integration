// pages/LoginPage.js

const config = require('../../../../config/env.js');

class LoginPage {
    constructor(page) {
      this.page = page;
      this.usernameField = page.locator('#email');
      this.passwordField = page.locator('#password');
      this.loginButton = page.locator('button:text("Connexion")');
    }
  
    async navigate() {
      await this.page.goto(config.troovCafUserBackofficeURL);
    }
  
    async login(username, password) {
      await this.usernameField.fill(username);
      await this.passwordField.fill(password);
      await this.loginButton.click();
    }
  
    async isLoggedIn() {
      // Vérifiez si l'utilisateur est connecté
      return await this.page.locator('img[src="/images/troov/logo-troov-rdv.png"]').isVisible();
    }
  }
  
  module.exports = LoginPage;