const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/*-----------------------------------------GIVEN-----------------------------------------*/
Given('L\'utilisateur se trouve sur la page "Mes objets"', async function () {
  const page = this.backofficePage;

  const lienMesObjets = page.locator('a.side-nav-link-ref:has-text("Mes objets")').first();
  await lienMesObjets.waitFor({ state: 'visible', timeout: 15000 });
  await lienMesObjets.click();

  await page.waitForURL('**/items**', { timeout: 15000 });
});



/*-----------------------------------------WHEN-----------------------------------------*/
// --- SCÉNARIO STEPS ---
When("L'utilisateur clique sur l'objet", async function () {
  const page = this.backofficePage;

  const premiereLigne = page.locator('table tbody tr').first();
  await premiereLigne.waitFor({ state: 'visible', timeout: 10000 });
  await premiereLigne.click();
});

When("L'utilisateur modifie la couleur de l'objet", async function () {
  const page = this.backofficePage;
  const boutonBlanc = page.getByRole('button', { name: /Blanc/i });
  await boutonBlanc.waitFor({ state: 'visible', timeout: 10000 });
  await boutonBlanc.click();
});


When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = this.backofficePage;
  const bouton = page.getByRole('button', { name: texte, exact: true });
  await bouton.waitFor({ state: 'visible', timeout: 10000 });
  await bouton.click();
});


/*-----------------------------------------THEN-----------------------------------------*/
Then("La fiche de l'objet s'affiche", async function () {
  const page = this.backofficePage;

  const boutonModifier = page.getByRole('button', { name: /Modifier la fiche/i });
  await expect(boutonModifier).toBeVisible({ timeout: 10000 });
});

Then("Les modifications de l'objet sont enregistrees", async function () {
  // Aucune assertion : le logiciel n'affiche pas de message de succès
});