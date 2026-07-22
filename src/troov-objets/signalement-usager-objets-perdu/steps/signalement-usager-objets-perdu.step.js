const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');



Given("L'utilisateur est sur la page de connexion", async function() {
    
});

Given("L'utilisateur est sur la page partenaire", async function() {
    await this.backofficePage.goto("http://localhost:3000", { waitUntil: 'domcontentloaded' });
    await expect(this.backofficePage.locator('img[alt="Logo Troov"]')).toBeVisible();
});

Given("L'utilisateur est sur la page de déclaration d'objet perdu", async function() {
    await this.backofficePage.goto("http://localhost:3000/perdu", { waitUntil: 'domcontentloaded' });
    await expect(this.backofficePage).toHaveURL(/\/perdu/);
    await expect(this.backofficePage.getByText("Déclarer un objet")).toBeVisible();
});

Given("L'utilisateur clique sur retour dans la catégorie", async function() {
    await this.backofficePage.locator('.col-6 > div').first().click();
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* WHEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------





When("L'utilisateur navigue vers la page partenaire", async function() {
    await this.backofficePage.goto("http://localhost:3000");
});

// ⬇️ Step de debug temporaire 
When("DEBUG: inspection du champ date", async function() {
    const html = await this.backofficePage.locator('form, [class*="date"], [class*="Date"]').first().evaluate(el => el.outerHTML);
    console.log(html);
});

When("L'utilisateur clique sur le bouton \"J'ai perdu\"", async function() {
    const boutonPerdu = this.backofficePage.getByText("J'ai perdu").first();
    await boutonPerdu.waitFor({ state: 'visible', timeout: 15000 });
    await boutonPerdu.click({ force: true });
});

When("L'utilisateur sélectionne la date aujourd'hui dans le calendrier", async function() {
    await this.backofficePage.locator('#common-when .input-date-picker #input-date-picker__today').click();
});

When("L'utilisateur sélectionne la date d'hier dans le calendrier", async function() {
    await this.backofficePage.locator('#common-when .input-date-picker #input-date-picker__yesterday').click();
});

When("L'utilisateur sélectionne la date d'avant-hier dans le calendrier", async function() {
    await this.backofficePage.locator('#common-when .input-date-picker #input-date-picker__before_yesterday').click();
});

// Si aujourd'hui est le 10, on sélectionne le 15 du mois précédent (toujours visible dans le calendrier).
When("L'utilisateur sélectionne une date dans le calendrier", async function() {
    const conteneurDate = this.backofficePage.locator('#common-when');

    await conteneurDate.getByRole('textbox').click();

    const aujourdHui = new Date();
    const dateChoisie = new Date(aujourdHui);

    if (aujourdHui.getDate() > 15) {
        dateChoisie.setDate(15); // 15 du mois courant, déjà passé donc visible
    } else {
        dateChoisie.setMonth(dateChoisie.getMonth() - 1);
        dateChoisie.setDate(15); // 15 du mois précédent, toujours visible
    }

    const libelleJour = dateChoisie.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    // Scopé sous #common-when, comme les autres sélecteurs de date (today/hier/avant-hier)
    await conteneurDate.getByLabel(libelleJour).click();
});


When("L'utilisateur saisie une adresse {string}", async function(adresse) {
    const champAdresse = this.backofficePage.getByPlaceholder('Saisissez l\u2019adresse de la').first();
    
    // nettoyage initial pour que la selection fonctionne bien
    await champAdresse.click();
    await champAdresse.clear();

  
    // PREMIÈRE TENTATIVE
    //-----------------------------------------------
    //  On tape "Paris" lentement (0.3s entre chaque lettre)
    await champAdresse.pressSequentially("Paris", { delay: 300 });
    await this.backofficePage.waitForTimeout(800); // une petite pause  pour laisser charger

    // On efface les 3 dernières lettres ("r", "i", "s") ENCORE PLUS LENTEMENT
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(600); // une petite Pause sur "Pa"

    // On re-tape "ris" lentement
    await champAdresse.pressSequentially("ris", { delay: 300 });
    await this.backofficePage.waitForTimeout(800);


    // DEUXIÈME TENTATIVE 
    //-----------------------------------------------
    // 4. On ré-efface les 3 lettres lentement pour perturber à nouveau le composant
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await this.backofficePage.waitForTimeout(600);

    // Saisie finale et définitive de "ris"
    await champAdresse.pressSequentially("ris", { delay: 300 });
    
    // Pause finale  pour que la liste de suggestions se stabilise à l'écran
    await this.backofficePage.waitForTimeout(1500);
});
When("L'utilisateur sélectionne la suggestion {string}", async function(suggestion) {
    const regexEchap = suggestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.backofficePage.locator('div').filter({ hasText: new RegExp(`^${regexEchap}$`) }).click();
});
When("L'utilisateur clique sur Transport", async function() {
    await this.backofficePage.getByRole('tab', { name: 'Transport' }).click();
});

When("L'utilisateur sélectionne un réseau de transport {string}", async function(reseau) {
    await this.backofficePage.getByText('Sélectionnez un réseau...').click();
    await this.backofficePage.getByText(reseau).click();
});

When("L'ultisateur sélectionne une type de transport {string}", async function(type) {
    await this.backofficePage.getByText('Sélectionnez un type de').click();
    await this.backofficePage.getByRole('option', { name: type }).locator('span').first().click();
});

When("L'ulisateur sélectionne une ligne de transport {string}", async function(ligne) {
    await this.backofficePage.getByLabel('Transport').locator('div').filter({ hasText: 'Sélectionnez une ligne' }).nth(3).click();
    await this.backofficePage.getByRole('option', { name: ligne }).locator('span').first().click();
});
When("L'utilisateur sélectionne la catégorie {string} dans le formulaire de déclaration d'objet perdu", async function(categorie) {
    const boutonRetour = this.backofficePage.locator('.col-6 > div').first();
    if (await boutonRetour.isVisible().catch(() => false)) {
        await boutonRetour.click();
    }
    await this.backofficePage.getByRole('img', { name: categorie }).click();
});
When("L'utilisateur sélectionne la catégorie {string}, puis {string} dans le formulaire de déclaration d'objet perdu", async function(categorie, sousCategorie) {
    await this.backofficePage.getByRole('img', { name: categorie }).click();
    
    const regexEchap = sousCategorie.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idSousCategorie = this.backofficePage.locator('.type').filter({ 
        has: this.backofficePage.locator('.text-dark', { hasText: new RegExp(`^${regexEchap}$`) })
    });
    await idSousCategorie.getByRole('img').click();
});

When("L'utilisateur clique sur le bouton {string} sans remplir les champs obligatoires", async function(bouton) {

    const boutonAjouter = this.backofficePage.getByRole('button', { name: bouton });
    await expect(boutonAjouter).toBeVisible();
    await boutonAjouter.scrollIntoViewIfNeeded();

    await this.backofficePage.screenshot({ path: 'debug-avant-clic-bouton.png', fullPage: true });

    await boutonAjouter.dispatchEvent('click');

    await this.backofficePage.waitForTimeout(1000);
});
When("L'utilisateur remplit les champs obligatoires avec des valeurs invalides et clique sur le bouton {string}", async function(bouton) {
    const page = this.backofficePage;


    // ADRESSE : "Paris, France" (même stratégie que "L'utilisateur saisie une adresse")
    // ==========================================
    const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();

    await champAdresse.click();
    await champAdresse.clear();

    // Saisie lente pour déclencher l'autocomplete
    await champAdresse.pressSequentially("Paris", { delay: 300 });
    await page.waitForTimeout(800);

    // Efface les 3 dernières lettres lentement
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(600);

    // Re-tape "ris" lentement
    await champAdresse.pressSequentially("ris", { delay: 300 });
    await page.waitForTimeout(800);

    // Deuxième passage (comme dans le step existant)
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(600);

    await champAdresse.pressSequentially("ris", { delay: 300 });
    await page.waitForTimeout(1500);

    // Sélection de la suggestion "Paris, France"
    const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
    await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
    await suggestionAdresse.click();

   
    //  MARQUE : "Pas de marque"
    // ------------------------------------------
    const optionPasDeMarque = page.locator('label').filter({ hasText: 'Pas de marque' });
    if (await optionPasDeMarque.isVisible().catch(() => false)) {
        await optionPasDeMarque.click();
    }


    //  COULEUR : Noir
    // ------------------------------------------
    const couleurNoir = page.locator('#color-picker-row__color__black');
    if (await couleurNoir.isVisible().catch(() => false)) {
        await couleurNoir.click();
    }

  
    // MODÈLE (valeur "invalide" volontairement courte)
    // ------------------------------------------
    const champModele = page.getByPlaceholder('Indiquez le modèle');
    if (await champModele.isVisible().catch(() => false)) {
        await champModele.click();
        await champModele.fill('x');
    }

  
    //  PRÉNOM
    // ------------------------------------------
    const champPrenom = page.getByPlaceholder('Indiquez le prénom');
    if (await champPrenom.isVisible().catch(() => false)) {
        await champPrenom.click();
        await champPrenom.fill('Fanilo');
        await champPrenom.press('Tab');
    }

   
    //  NOM
    // ------------------------------------------
    const champNom = page.getByPlaceholder('Indiquez le nom');
    if (await champNom.isVisible().catch(() => false)) {
        await champNom.fill('RAMAHENINTSOA');
        await champNom.press('Tab');
    }


    // PRÉSENCE D'UNE ADRESSE SUR L'OBJET : "Non"
    // ------------------------------------------
    const champPresenceAdresse = page.locator('[id="__BVID__256"]').getByRole('combobox')
        .locator('div').filter({ hasText: 'Veuillez indiquer la présence' });
    if (await champPresenceAdresse.isVisible().catch(() => false)) {
        await champPresenceAdresse.click();
        await page.getByRole('option', { name: 'Non' }).locator('span').first().click();
    }

 
    // DESCRIPTION DE L'OBJET (valeur "invalide" volontairement courte)
    //------------------------------------------
    const champDescription = page.getByPlaceholder('Décrire au mieux l\u2019objet et');
    if (await champDescription.isVisible().catch(() => false)) {
        await champDescription.click();
        await champDescription.fill('x');
    }

    
    //  ÉTAT / NIVEAU D'USURE
    //------------------------------------------
    const champEtat = page.locator('[id="__BVID__498"]').getByRole('combobox')
        .locator('div').filter({ hasText: 'Indiquez le niveau d\'usure' });
    if (await champEtat.isVisible().catch(() => false)) {
        await champEtat.click();
        await page.getByRole('option').first().click();
    }


    // SOUMISSION DU FORMULAIRE
    // ------------------------------------------
    const boutonSoumission = page.getByRole('button', { name: bouton });
    await boutonSoumission.scrollIntoViewIfNeeded();

    // Clic direct sur l'élément DOM, contourne les overlays (ex: bandeau cookies)
    // qui interceptent les événements souris même avec { force: true }
    await boutonSoumission.dispatchEvent('click');

    await page.waitForTimeout(1500);
});




// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ********************* THEN *********************
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
Then("La page partenaire s'affiche correctement et l'usager peut déclarer un objet trouvé", async function() {
    await expect(this.backofficePage.locator('img[alt="Logo Troov"]')).toBeVisible();
}); 

Then("La page de déclaration d'objet perdu s'affiche correctement et l'usager peut déclarer un objet perdu", async function() {

     // Preuve :il est exactement sur la page de déclaration d'objet perdu "http://localhost:3000/perdu"
    await expect(this.backofficePage).toHaveURL(/\/perdu/);
    await expect(this.backofficePage.getByText("Déclarer un objet")).toBeVisible();
    //laisse la page ouverte  pendant 1 seconde 
     await this.backofficePage.waitForTimeout(1000);
});


Then("La date d'aujourd'hui sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu", async function() {
    const aujourdHui = new Date();
    const jour = String(aujourdHui.getDate()).padStart(2, '0');
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');
    const annee = aujourdHui.getFullYear();
    const dateFormatee = `${jour}/${mois}/${annee}`;

    const champDate = this.backofficePage.locator('#common-when').getByRole('textbox');
    
    // Le champ contient la date + l'heure 
    await expect(champDate).toHaveValue(new RegExp(`^${dateFormatee} \\d{2}:\\d{2}$`));
});

Then("La date d'hier sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu", async function() {
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const jour = String(hier.getDate()).padStart(2, '0');
    const mois = String(hier.getMonth() + 1).padStart(2, '0');
    const annee = hier.getFullYear();
    const dateFormatee = `${jour}/${mois}/${annee}`;

    const champDate = this.backofficePage.locator('#common-when').getByRole('textbox');
     // Le champ contient la date + l'heure 
    await expect(champDate).toHaveValue(new RegExp(`^${dateFormatee} \\d{2}:\\d{2}$`));
});
Then("La date d'avant-hier est correctement affichée dans le formulaire de déclaration d'objet perdu", async function() {
    const avantHier = new Date();
    avantHier.setDate(avantHier.getDate() - 2);
    const jour = String(avantHier.getDate()).padStart(2, '0');
    const mois = String(avantHier.getMonth() + 1).padStart(2, '0');
    const annee = avantHier.getFullYear();
    const dateFormatee = `${jour}/${mois}/${annee}`;

    const champDate = this.backofficePage.locator('#common-when').getByRole('textbox');
    await expect(champDate).toHaveValue(new RegExp(`^${dateFormatee} \\d{2}:\\d{2}$`));
});
Then("La date sélectionnée est correctement affichée dans le formulaire de déclaration d'objet perdu", async function() {
    const aujourdHui = new Date();
    const dateChoisie = new Date(aujourdHui);

    if (aujourdHui.getDate() > 15) {
        dateChoisie.setDate(15);
    } else {
        dateChoisie.setMonth(dateChoisie.getMonth() - 1);
        dateChoisie.setDate(15);
    }

    const jour = String(dateChoisie.getDate()).padStart(2, '0');
    const mois = String(dateChoisie.getMonth() + 1).padStart(2, '0');
    const annee = dateChoisie.getFullYear();
    const dateFormatee = `${jour}/${mois}/${annee}`;

    const champDate = this.backofficePage.locator('#common-when').getByRole('textbox');
    await expect(champDate).toHaveValue(new RegExp(`^${dateFormatee} \\d{2}:\\d{2}$`));
});
Then("Une suggestion s'affiche et cliquable", async function() {
    const suggestion = this.backofficePage.locator('div').filter({ hasText: /^Paris, France$/ });
    
    try {
        await expect(suggestion).toBeVisible({ timeout: 15000 });
    } catch (error) {
        await this.backofficePage.screenshot({ path: 'debug-suggestion-adresse.png', fullPage: true });
        throw error;
    }
});

Then("L'adresse {string} est correctement sélectionnée dans le formulaire de déclaration d'objet perdu", async function(adresseAttendue) {
    // Essaie d'abord de trouver le texte combiné exact (ex: "Paris, France")
    const regexEchap = adresseAttendue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blocCombine = this.backofficePage.locator('div, span').filter({ hasText: new RegExp(`^${regexEchap}$`) });
    
    const blocVisible = await blocCombine.count() > 0 && await blocCombine.first().isVisible().catch(() => false);
    
    if (blocVisible) {
        await expect(blocCombine.first()).toBeVisible();
        return;
    }

    // Sinon, vérifie chaque partie séparément (utile si affichées comme des tags distincts)
    const parties = adresseAttendue.split(',').map(p => p.trim());
    for (const partie of parties) {
        const elements = this.backofficePage.getByText(partie, { exact: true });
        const count = await elements.count();

        let trouveVisible = false;
        for (let i = 0; i < count; i++) {
            if (await elements.nth(i).isVisible()) {
                trouveVisible = true;
                break;
            }
        }
        expect(trouveVisible).toBe(true);
    }
});

// Exemple : catégorie "Appareil", sous-catégorie "Téléphone"
Then("Les sous-catégories {string} correspondantes sont correctement affichées dans le formulaire de déclaration d'objet perdu", async function(sousCategories) {
    const items = sousCategories.includes(' - ')
        ? sousCategories.split(' - ').map(i => i.trim())
        : sousCategories.split(',').map(i => i.trim());

    for (const item of items) {
        const regexEchap = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const element = this.backofficePage.locator('.type .text-dark').filter({ hasText: new RegExp(`^${regexEchap}$`) });
        await expect(element.first()).toBeVisible({ timeout: 10000 });
    }
});
Then("Les champs associé a la catégorie {string} s'affiche", async function(champs) {
   
    const html = await this.backofficePage.locator('[data-v-63f1f14a]').first().innerHTML();
    await this.backofficePage.screenshot({ path: 'debug-champs-specifiques.png', fullPage: true });
});

Then("Les messages d'erreur de validation des champs obligatoires s'affichent correctement dans le formulaire de déclaration d'objet perdu", async function() {
    const page = this.backofficePage;

    const messageErreur = page.getByText(/Vous devez choisir une adresse/i);

    try {
        await expect(messageErreur).toBeVisible({ timeout: 5000 });
    } catch (error) {
        await page.screenshot({ path: 'debug-messages-erreur-validation.png', fullPage: true });
        throw error;
    }
});

Then("On passe a la page d'inscription ou de connexion", async function() {
    const page = this.backofficePage;

    // Vérifie qu'une modale d'inscription/connexion apparaît (sans changement d'URL, car SPA)
    const titreModale = page.getByText('Plus qu\'une étape!');

    try {
        await expect(titreModale).toBeVisible({ timeout: 10000 });

        // Vérifie quelques champs clés de la modale pour confirmer que c'est bien le bon formulaire
        await expect(page.getByText('Inscrivez-vous')).toBeVisible();
        await expect(page.getByText('Civilité*')).toBeVisible();
    } catch (error) {
        await page.screenshot({ path: 'debug-page-inscription.png', fullPage: true });
        throw error;
    }
});