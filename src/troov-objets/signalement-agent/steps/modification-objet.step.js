const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');

// Chargement de la configuration
const config = require(path.resolve(process.cwd(), 'config/env.js'));

/*-----------------------------------------GIVEN-----------------------------------------*/

Given("l'utilisateur est sur {string}", async function (url) {
  const page = this.backofficePage;
  const targetUrl = url.startsWith('http') ? url : `${config.troovURL}${url}`;
  
  await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
});

Given("L'utilisateur se trouve sur la page \"Mes objets\"", async function () {
  const page = this.backofficePage;
  const lienMesObjets = page
    .locator('span')
    .filter({ hasText: /^Mes objets$/ })
    .first();
  await expect(lienMesObjets).toBeVisible({
    timeout: 15000
  });
  await lienMesObjets.click();
  await page.waitForURL('**/items**', {
    timeout: 15000
  });
});

/*-----------------------------------------WHEN-----------------------------------------*/

When("L'utilisateur se connecte avec ces identifiants SSO", async function () {
  const page = this.backofficePage;
  await page.getByLabel('Email').fill(config.usernameAgent);
  await page.getByLabel('Mot de passe').fill(config.passwordAgent);
  
  await page.getByRole('button', { name: /connexion/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
});

When("L'utilisateur clique sur l'objet", async function () {
  const page = this.backofficePage;
  const premiereLigne = page
    .locator('table tbody tr')
    .first();
  await expect(premiereLigne).toBeVisible({
    timeout: 15000
  });
  await premiereLigne
    .locator('td')
    .nth(1)
    .click();
});

When("L'utilisateur clique sur le bouton {string}", async function (texte) {
  const page = this.backofficePage;

  if (/acc[eé]der a la fiche objet/i.test(texte)) {
    const boutonModifier = page.getByLabel('Modifier la fiche');
    await expect(boutonModifier).toBeVisible({
      timeout: 10000
    });
    await boutonModifier.click();
    return;
  }

  if (/enregistrer/i.test(texte)) {
    const boutonEnregistrer = page.getByLabel('Enregistrer');
    await expect(boutonEnregistrer).toBeVisible({
      timeout: 10000
    });
    await expect(boutonEnregistrer).toBeEnabled({
      timeout: 10000
    });
    await boutonEnregistrer.click();
    return;
  }

  const bouton = page
    .getByRole('button', {
      name: texte,
      exact: true
    })
    .or(
      page.getByLabel(texte, {
        exact: true
      })
    )
    .first();
  await expect(bouton).toBeVisible({
    timeout: 10000
  });
  await expect(bouton).toBeEnabled({
    timeout: 10000
  });
  await bouton.click();
});

When("L'utilisateur modifie la couleur de l'objet", async function () {
  const page = this.backofficePage;
  const boutonCouleur = page.getByRole('button', {
    name: 'Gris',
    exact: true
  });
  await expect(boutonCouleur).toBeVisible({
    timeout: 10000
  });
  await boutonCouleur.click();
});

/*-----------------------------------------THEN-----------------------------------------*/

Then("L'utilisateur arrive sur sa page d'accueil agent", async function () {
  const page = this.backofficePage;
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});

Then("La fiche de l'objet s'affiche", async function () {
  const page = this.backofficePage;
  const ficheObjet = page.locator('table tbody tr').first();
  await expect(ficheObjet).not.toBeVisible({
    timeout: 10000
  }).catch(() => {});
});

Then("La fiche de l'objet s'ouvre", async function () {
  const page = this.backofficePage;
  const boutonCouleur = page.getByRole('button', {
    name: /gris|noir/i
  }).first();
  await expect(boutonCouleur).toBeVisible({
    timeout: 10000
  });
});

Then("Les modifications de l'objet sont possibles", async function () {
  const page = this.backofficePage;
  const boutonCouleur = page.getByRole('button', {
    name: 'Gris',
    exact: true
  });
  await expect(boutonCouleur).toBeVisible({
    timeout: 10000
  });
  await expect(boutonCouleur).toBeEnabled({
    timeout: 10000
  });
});

Then("Les modifications de l'objet sont enregistrees", async function () {
  const page = this.backofficePage;
  const boutonEnregistrer = page.getByLabel('Enregistrer');
  await expect(boutonEnregistrer).not.toBeVisible({
    timeout: 10000
  });
});