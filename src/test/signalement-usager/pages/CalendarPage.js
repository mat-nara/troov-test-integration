// pages/LoginPage.js

const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js');

class CalendarPage {
    constructor(page) {
      this.page = page;
      this.ajouterRDVButton = page.locator('button[title="Ajouter un RDV"]');
    }
  
    async navigate() {
      // need to be connected
      //await expect(this.page.locator('img[src="/images/troov/logo-troov-rdv.png"]').nth(0)).toBeVisible();
      await this.page.locator('i[title="Calendrier"]').click();
      //await expect(ajouterRDVButton).toBeVisible();
    }
  
    async createAppointment(name, firstname, email, NIR, phone) {
      await this.page.waitForSelector('button[title="Ajouter un RDV"]', { state: 'visible' }); 
      await this.ajouterRDVButton.click();

      // Select service (1st item)
      const selectorService = this.page.locator('span').filter({ hasText: 'Choisir un service' })
      await selectorService.click();

      const selectorServiceLegend = this.page.locator('legend').filter({ hasText: 'Service' })
      
      const firstItemService = selectorServiceLegend.locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
      await firstItemService.click();

      // Select physique (1st item)
      //const selectorModeDuRDV = this.page.locator('label').filter({ hasText: 'Modes de RDV' }).locator('xpath=following-sibling::*');
      //await selectorModeDuRDV.selectOption({ index: 0 });  

      //await this.page.waitForTimeout(1000);  

      // Create new user
      const selectorButtonCreerUser = this.page.locator('button > span').filter({ hasText: 'Créer un utilisateur' });
      await selectorButtonCreerUser.click();

      await this.page.getByPlaceholder('Ajouter un Nom').fill(name);
      await this.page.getByPlaceholder('Ajouter un Prénom').fill(firstname);
      await this.page.getByPlaceholder('Ajouter un Email').fill(email);
      //await this.page.getByPlaceholder('1 48 05 99 *** ***').fill(NIR);
      await this.page.getByPlaceholder('Numéro de téléphone').fill(phone);

      await this.page.locator('button[title="Confirmer"]').click()

      // Mode de prise du rendez-vous
      //await this.page.locator('#radio-taken-mode label').first().click(); // prise sur site
      // Choix du Service (1st item)
      const selectorPriseRdv = this.page.locator('span').filter({ hasText: 'Choisir un mode de prise de RDV' })
      await selectorPriseRdv.click();
      const selectorPriseRdvLegend = this.page.locator('span').filter({ hasText: 'Le rendez-vous a été pris :' })
      const firstItemPriseRdv = selectorPriseRdvLegend.locator('..').locator('xpath=following-sibling::*').locator('div.multiselect__content-wrapper > ul.multiselect__content > li:first-child') 
      await firstItemPriseRdv.click();

      // Bloquer le créneau
      await this.page.locator('button[title="Bloquer ce créneau"]').click()

      // Confirmer le rendez-vous
      const textLocator = this.page.getByText('Êtes-vous sur de vouloir ajouter cette réservation ?');
      await textLocator.locator('xpath=following-sibling::*').locator(' button').filter({ hasText: 'Ajouter' }).click()

      await this.page.waitForTimeout(1000);

      var fullname = name.toUpperCase() + ' ' + firstname
      const appointmentLocator = this.page.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
      await appointmentLocator.waitFor({ state: 'visible' });
    }

    async deleteAppointment(name, firstname) {

      var fullname = name.toUpperCase() + ' ' + firstname

      const appointmentLocator = this.page.locator('strong').filter({ hasText: fullname }).locator('xpath=..//..//..').nth(0);
      await appointmentLocator.click();

      const cancelButton = this.page.locator('button').filter({ hasText: 'Annuler ce/ces rendez-vous' });
      await cancelButton.click();

      const confirmCancelButton = this.page.locator('button > span').filter({ hasText: 'Annuler ce/ces rendez-vous' });
      await confirmCancelButton.click();
    }
  }
  
  module.exports = CalendarPage;