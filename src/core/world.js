const { setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('@playwright/test');
const config = require('../../config/env.js');
const LoginPage = require('./pages/LoginPage.js');
const CalendarPage = require('./pages/CalendarPage.js');

setDefaultTimeout(60 * 1000);

class CustomWorld {
  // Méthode d'initialisation du navigateur et des pages
  async init() {
    console.log('init called')
    // Définir les variables du navigateur
    const browserType = config.browserName || 'chromium'; // Par défaut, utiliser 'chromium' si pas spécifié
    const headless = config.headless || false; // Par défaut, lancer en mode non-headless
    const mobileDevice = config.mobileDevice; // Appareil mobile à émuler (si spécifié)

    // Initialisation du navigateur
    if (mobileDevice) {
      // Si un appareil mobile est spécifié, utiliser les descripteurs d'appareils de Playwright
      const device = devices[mobileDevice];
      
      if (!device) {
        throw new Error(`L'appareil mobile "${mobileDevice}" n'est pas valide dans Playwright.`);
      }

      // Lancer le navigateur avec un appareil mobile
      this.browser = await chromium.launch({ headless });
      this.context = await this.browser.newContext({
        ...device, // Appliquer les paramètres d'émulation du mobile
      });
    } else {
      // Si aucun appareil mobile n'est spécifié, lancer un navigateur desktop (Chromium, Firefox, Webkit)
      switch (browserType) {
        case 'firefox':
          this.browser = await firefox.launch({ headless });
          break;
        case 'webkit': // WebKit pour Safari
          this.browser = await webkit.launch({ headless });
          break;
        case 'chromium':
        default:
          this.browser = await chromium.launch({ headless });
          break;
      }
      this.context = await this.browser.newContext();
    }

    // Initialiser les pages
    this.terminalPage = await this.context.newPage();
    this.backofficePage = await this.context.newPage();
    this.page = this.backofficePage;
    this.loginPage = new LoginPage(this.backofficePage);  // Page de connexion dans le backoffice
    this.calendarPage = new CalendarPage(this.backofficePage);
  }

  // Méthode de nettoyage (fermer le navigateur après chaque test)
  async destroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null; // Nettoyer la variable
    }
  }
}

// Enregistrer la classe CustomWorld pour l'utiliser dans Cucumber
setWorldConstructor(CustomWorld);
