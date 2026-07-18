const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');


Given("L'utilisateur est sur la page de connexion", async function() {
    
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur navigue vers la page partenaire", async function() {
    console.log(this)
    await this.backofficePage.goto("http://localhost:3000");
});





// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------




Then("La page partenaire s'affiche correctement et l'usager peut déclarer un objet trouvé", async function() {
    await expect(this.backofficePage.locator('img[alt="Logo Troov"]')).toBeVisible();
}); 
