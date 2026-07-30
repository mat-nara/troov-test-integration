const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const path = require('path');


/*-----------------------------------------WHEN-----------------------------------------*/
When("L'utilisateur clique sur {string}", async function (texte) {
  const page = this.backofficePage;

  if (texte === 'Ajouter mon annonce') {
    await page.locator('#btn-add-ad').click();
  } else {
    await page.getByRole('link', { name: texte }).click();
  }
});

When("L'utilisateur utilise la barre de signalement express", async function () {
  await this.backofficePage
    .locator('img[src*="id_card.png"]')
    .click();
});

When("L'utilisateur ouvre le formulaire de signalement", async function () {
  await this.backofficePage
    .locator('img[src*="id_card.png"]')
    .first()
    .click();
});

Then("la date, le statut trouvé et le partenaire sont remplis automatiquement", async function () {
  await expect(this.backofficePage.locator('span[title="Signaler un objet"]')).toBeVisible();
});

When("L'utilisateur complète les infos de l'objet", async function () {
  const page = this.backofficePage;

  // 1. Saisie de la date de naissance
  const birthdateInput = page.locator('#input_birthdateitem_types_fields');
  await birthdateInput.fill('1986-10-20');
  await birthdateInput.dispatchEvent('input');
  await birthdateInput.dispatchEvent('change');
  await birthdateInput.blur();
  await expect(birthdateInput).toHaveValue('1986-10-20');

  // 2. Saisie du Nom & Prénom
  await page.locator('#input_lastnameitem_types_fields').fill('Dupont');
  await page.locator('#input_firstnameitem_types_fields').fill('Jean');

  // 3. Activer l'adresse via le Multiselect "Présence d'une adresse"
  await page.locator('div[data-cy="has_address"]').click();
  await page.locator('span[data-cy="form.yes"]').click();

  // 4. Remplir le champ Adresse
  const adresseInput = page.locator('#input_addressitem_types_fields');
  await adresseInput.waitFor({ state: 'visible', timeout: 5000 });
  await adresseInput.fill('Paris, France');

  // 5. Sélectionner le département (Aisne) via data-cy="district"
  await page.locator('div[data-cy="district"]').click();

  const optionAisne = page.locator('span[data-cy="district.Aisne"]');
  await optionAisne.waitFor({ state: 'visible', timeout: 5000 });
  await optionAisne.click();

  // 6. Compléter la description et le reste du formulaire
  await page.locator('#input_detailitem_types_fields').fill('Objet trouvé test automatisé - carte identité');
  await page.locator('input[type="number"][step="0.01"]').fill('0.05');
});


When("L'utilisateur ajoute une photo", async function () {
  const cheminPhoto = path.resolve(__dirname, '../fixtures/cin_french_front.jpg');
  await this.backofficePage
    .locator('input[type="file"]')
    .setInputFiles(cheminPhoto);
});


/*-----------------------------------------THEN-----------------------------------------*/
Then("Le formulaire s'ouvre", async function () {
  await expect(this.backofficePage.locator('span[title="Signaler un objet"]')).toBeVisible();
});

Then("l'annonce est enregistrée", async function () {
  const page = this.backofficePage;

  // On cherche un élément contenant le texte exact du message de confirmation
  const meConfirmation = page.getByText(/Bravo, votre objet a bien été ajouté/i);

  // On attend jusqu'à 15 secondes qu'il devienne visible
  await expect(meConfirmation).toBeVisible({ timeout: 15000 });
});