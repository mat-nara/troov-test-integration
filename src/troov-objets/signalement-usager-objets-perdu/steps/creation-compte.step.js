const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
Before(async function () {
    await this.backofficePage.goto("http://localhost:3000", { waitUntil: 'domcontentloaded' });
});

// Locator utilitaire pour scoper les champs à l'intérieur de la modale
// plutôt que sur toute la page (évite les ambiguïtés avec la page derrière)
function modaleInscription(page) {
    return page.getByText('Plus qu\'une étape!').locator('..').locator('..');
}


Given("L'utilisateur atteint la modale d'inscription depuis une declaration d'objet perdu", async function () {
    const page = this.backofficePage;

    // 1. Page partenaire
    await page.goto("http://localhost:3000", { waitUntil: 'domcontentloaded' });
    await expect(page.locator('img[alt="Logo Troov"]')).toBeVisible();

    // 2. Clique sur "J'ai perdu"
    const boutonPerdu = page.getByText("J'ai perdu").first();
    await boutonPerdu.waitFor({ state: 'visible', timeout: 15000 });
    await boutonPerdu.click({ force: true });

    // 3. Sélectionne la catégorie "Sacs & Bagages", puis "Sac"
    await page.getByRole('img', { name: 'Sacs & Bagages' }).click();
    const idSousCategorie = page.locator('.type').filter({
        has: page.locator('.text-dark', { hasText: /^Sac$/ })
    });
    await idSousCategorie.getByRole('img').click();

    // 4. Remplit les champs obligatoires avec des valeurs invalides
    const champAdresse = page.getByPlaceholder('Saisissez l\u2019adresse de la').first();
    await champAdresse.click();
    await champAdresse.clear();

    await champAdresse.pressSequentially("Paris", { delay: 300 });
    await page.waitForTimeout(800);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(600);
    await champAdresse.pressSequentially("ris", { delay: 300 });
    await page.waitForTimeout(800);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(400);
    await champAdresse.press('Backspace');
    await page.waitForTimeout(600);
    await champAdresse.pressSequentially("ris", { delay: 300 });
    await page.waitForTimeout(1500);

    const suggestionAdresse = page.locator('div').filter({ hasText: /^Paris, France$/ }).first();
    await suggestionAdresse.waitFor({ state: 'visible', timeout: 15000 });
    await suggestionAdresse.click();

    const optionPasDeMarque = page.locator('label').filter({ hasText: 'Pas de marque' });
    if (await optionPasDeMarque.isVisible().catch(() => false)) {
        await optionPasDeMarque.click();
    }

    const couleurNoir = page.locator('#color-picker-row__color__black');
    if (await couleurNoir.isVisible().catch(() => false)) {
        await couleurNoir.click();
    }

    const champModele = page.getByPlaceholder('Indiquez le modèle');
    if (await champModele.isVisible().catch(() => false)) {
        await champModele.click();
        await champModele.fill('x');
    }

    const champPrenom = page.getByPlaceholder('Indiquez le prénom');
    if (await champPrenom.isVisible().catch(() => false)) {
        await champPrenom.click();
        await champPrenom.fill('Fanilo');
        await champPrenom.press('Tab');
    }

    const champNom = page.getByPlaceholder('Indiquez le nom');
    if (await champNom.isVisible().catch(() => false)) {
        await champNom.fill('RAMAHENINTSOA');
        await champNom.press('Tab');
    }

    const champPresenceAdresse = page.locator('[id="__BVID__256"]').getByRole('combobox')
        .locator('div').filter({ hasText: 'Veuillez indiquer la présence' });
    if (await champPresenceAdresse.isVisible().catch(() => false)) {
        await champPresenceAdresse.click();
        await page.getByRole('option', { name: 'Non' }).locator('span').first().click();
    }

    const champDescription = page.getByPlaceholder('Décrire au mieux l\u2019objet et');
    if (await champDescription.isVisible().catch(() => false)) {
        await champDescription.click();
        await champDescription.fill('x');
    }

    const champEtat = page.locator('[id="__BVID__498"]').getByRole('combobox')
        .locator('div').filter({ hasText: 'Indiquez le niveau d\'usure' });
    if (await champEtat.isVisible().catch(() => false)) {
        await champEtat.click();
        await page.getByRole('option').first().click();
    }

    const boutonSoumission = page.getByRole('button', { name: 'Ajouter mon annonce' });
    await boutonSoumission.scrollIntoViewIfNeeded();
    await boutonSoumission.dispatchEvent('click');
    await page.waitForTimeout(1500);

    // 5. Vérifie que la modale d'inscription est bien apparue
    await expect(page.getByText('Plus qu\'une étape!')).toBeVisible({ timeout: 10000 });
});

// ------------------------------------------- Given ---------------------------------------

Given("L'utilisateur est connecte a son espace usager", async function () {

    await this.backofficePage.goto("http://localhost:3000/login", { waitUntil: 'domcontentloaded' });
    await this.backofficePage.getByPlaceholder('Indiquez votre email').fill('user.test@troov.com');
    await this.backofficePage.getByPlaceholder('Indiquez votre mot de passe').fill('Password123!');
    await this.backofficePage.getByRole('button', { name: 'Connexion' }).click();
    await this.backofficePage.waitForURL(/\/accueil/);
});

Given("L'utilisateur n'a pas encore verifie son compte", async function () {
    // Suppose que le compte de test utilisé n'est pas encore vérifié.
    // TODO: si besoin, appeler une API de seed/fixture pour garantir cet état.
});

Given('La pop-up {string} est affichee', async function (popupTitle) {
    const popup = this.backofficePage.getByText('Compte non vérifié').locator('..');
    await expect(popup).toBeVisible();
});
Given("L'utilisateur est connecte a son espace usager", async function () {
    await this.backofficePage.goto("http://localhost:3000/login");
    await this.backofficePage.getByPlaceholder('Indiquez votre email').fill('user.test@troov.com');
    await this.backofficePage.getByPlaceholder('Indiquez votre mot de passe').fill('Password123!');
    await this.backofficePage.getByRole('button', { name: 'Connexion' }).click();
    await this.backofficePage.waitForURL(/\/accueil/);
});




// ----------------------------------------- When --------------------------------------------------------

When(
    "L'utilisateur saisit les informations en laissant un champ obligatoire vide \\(Email\\)",
    async function () {
        // Email unique même si le champ reste vide (pour cohérence)
        this.email = `test.${Date.now()}.${Math.floor(Math.random() * 9999)}@troov.com`;

        const modale = modaleInscription(this.backofficePage);

        await modale.getByLabel('Civilité*').selectOption('M');
        await modale.getByLabel('Nom*', { exact: true }).fill('Rakoto');
        await modale.getByLabel('Prénom*').fill('Mandimby');
        await modale.getByLabel('Email*').fill(''); 
        await modale.getByPlaceholder('Numéro de téléphone').fill('0341234567');
        await modale.getByLabel('Mot de passe*').fill('Password123!');
    }
);


function checkboxParLabel(page, labelCase) {
    const cleanText = labelCase.includes("conditions")
        ? "conditions d'utilisation"   // unique au label "J'ai lu et j'accepte les conditions..."
        : "recevoir des infos";        // unique au label "J'accepte de recevoir des infos..."

    const label = modaleInscription(page).locator('label').filter({ hasText: cleanText }).first();

    return label.locator('input[type="checkbox"], input[type="radio"]')
        .or(label.locator('..').locator('input[type="checkbox"], input[type="radio"]'))
        .first();
}

// 1. Step pour COCHER la case
When('L\'utilisateur coche la case {string}', async function (labelCase) {
    const checkbox = checkboxParLabel(this.backofficePage, labelCase);

    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
        await checkbox.dispatchEvent('click');
        await checkbox.dispatchEvent('change');
    }

    await expect(checkbox).toBeChecked();
});

// 2. Step pour NE PAS COCHER la case
When('L\'utilisateur ne coche pas la case {string}', async function (labelCase) {
    const checkbox = checkboxParLabel(this.backofficePage, labelCase);

    const isChecked = await checkbox.isChecked().catch(() => false);
    if (isChecked) {
        await checkbox.dispatchEvent('click');
        await checkbox.dispatchEvent('change');
    }

    await expect(checkbox).not.toBeChecked();
});

// STEPS CAPTCHA-
//-------------------------------------------------------------

When("L'utilisateur remplit correctement le champ Captcha {string}", async function (captchaLabel) {
    const modale = modaleInscription(this.backofficePage);
    const champCaptcha = modale.locator('#is-human-input');

    const estVisible = await champCaptcha.isVisible().catch(() => false);

    if (estVisible) {
        await champCaptcha.click({ force: true });
        await champCaptcha.clear();
        await champCaptcha.fill('aaaa');
        await expect(champCaptcha).toHaveValue('aaaa');
    }
});

When("L'utilisateur ne remplit pas le champ Captcha {string}", async function (captchaLabel) {
    const modale = modaleInscription(this.backofficePage);
    const champCaptcha = modale.locator('#is-human-input');

    if (await champCaptcha.isVisible().catch(() => false)) {
        await champCaptcha.fill('');
    }
});

When('L\'utilisateur saisit le texte affiche dans le champ Captcha {string}', async function (captchaLabel) {
    const modale = modaleInscription(this.backofficePage);
    // On cible le vrai champ Captcha de la modale
    const champCaptcha = modale.locator('#is-human-input');

    const estVisible = await champCaptcha.isVisible().catch(() => false);

    if (estVisible) {
        await champCaptcha.click({ force: true });
        await champCaptcha.clear();
        await champCaptcha.fill('aaaa');
        await expect(champCaptcha).toHaveValue('aaaa');
    }
});



When('L\'utilisateur saisit les informations obligatoires \\(Civilite, Nom, Prenom, Email, Telephone, Mot de passe\\)', async function () {
    const page = this.backofficePage;
    const modale = modaleInscription(page);

    // Génération de données uniques
    const timestamp = Date.now();
    const emailTest = `test.user.${timestamp}@yopmail.com`;

    try {
        // 1. Civilité - Sélectionner "Monsieur"
        const civiliteMale = modale.locator('button:has-text("M."), input[value="M"]').first();
        if (await civiliteMale.isVisible().catch(() => false)) {
            await civiliteMale.click();
        } else {
            // Alternative: chercher par label
            const civiliteLabel = modale.getByText('Civilité').locator('..');
            const optionMale = civiliteLabel.locator('button:has-text("M."), input[value="M"]').first();
            if (await optionMale.isVisible().catch(() => false)) {
                await optionMale.click();
            }
        }

        // 2. Nom
        const nomInput = modale.locator('input[name="lastName"], input[name="lastname"], #lastname, input[placeholder*="Nom"]').first();
        if (await nomInput.isVisible().catch(() => false)) {
            await nomInput.click();
            await nomInput.clear();
            await nomInput.fill('Dupont');
        } else {
            console.log(' Champ Nom non trouvé');
        }

        // 3. Prénom
        const prenomInput = modale.locator('input[name="firstName"], input[name="firstname"], #firstname, input[placeholder*="Prénom"]').first();
        if (await prenomInput.isVisible().catch(() => false)) {
            await prenomInput.click();
            await prenomInput.clear();
            await prenomInput.fill('Jean');
        } else {
            console.log('Champ Prénom non trouvé');
        }

        // 4. Email
        const emailInput = modale.locator('input[type="email"], #email, [name="email"]').first();
        if (await emailInput.isVisible().catch(() => false)) {
            await emailInput.click();
            await emailInput.clear();
            await emailInput.fill(emailTest);
        } else {
            console.log('Champ Email non trouvé');
        }

        // 5. Téléphone
        const telephoneInput = modale.locator('input[type="tel"], #phone, [name="phone"], input[placeholder*="téléphone"], input[placeholder*="Téléphone"]').first();
        if (await telephoneInput.isVisible().catch(() => false)) {
            await telephoneInput.click();
            await telephoneInput.clear();
            await telephoneInput.fill('0612345678');
        } else {
            console.log('Champ Téléphone non trouvé');
        }

        // 6. Mot de passe
        const passwordInput = modale.locator('input[type="password"], #password, [name="password"]').first();
        if (await passwordInput.isVisible().catch(() => false)) {
            await passwordInput.click();
            await passwordInput.clear();
            await passwordInput.fill('MotDePasseFort123!');

        } else {
            console.log('Champ Mot de passe non trouvé');
        }


        await page.waitForTimeout(500);


    } catch (error) {
        console.error('Erreur lors du remplissage:', error.message);
        throw error;
    }
});
When('L\'utilisateur valide le formulaire sur le bouton {string}', async function (buttonLabel) {
    const modale = modaleInscription(this.backofficePage);
    const bouton = modale.getByRole('button', { name: buttonLabel });

    await bouton.scrollIntoViewIfNeeded();
    await bouton.dispatchEvent('click');
    console.log("URL après validation :", this.backofficePage.url());
});


When('L\'utilisateur accede a la page {string}', async function (pageName) {
    const routes = {
        Accueil: '/accueil',
    };
    await this.backofficePage.goto(`http://localhost:3000${routes[pageName] || '/'}`, { waitUntil: 'domcontentloaded' });
});

When("L'utilisateur clique sur le bouton \"Renvoyer l'email de confirmation\"", async function () {
    await this.backofficePage.getByRole('button', { name: "Renvoyer l'email de confirmation" }).click();
});

When("L'utilisateur clique sur la croix de fermeture de la pop-up", async function () {
    await this.backofficePage.getByRole('button', { name: 'Fermer' }).click(); // TODO: ajuster le nom accessible réel de la croix
});

// ----------- ----------------------- Then ------------------------------------------------

Then("Le compte utilisateur est cree", async function () {
});

Then("Le compte est cree avec succes", async function () {
    await this.backofficePage.waitForURL(/\/dashboard\/.*\/user/, { 
        timeout: 20000,
        waitUntil: 'domcontentloaded' 
    });

    await expect(this.backofficePage).toHaveURL(/\/dashboard\/.*\/user/);
});

Then("Le compte n'est pas cree", async function () {
    await expect(this.backofficePage.getByText('Plus qu\'une étape!')).toBeVisible();
});

Then("Un message invite l'utilisateur a verifier son compte", async function () {
    await expect(this.backofficePage.getByText(/vérifier votre compte/i)).toBeVisible();
});

Then("L'utilisateur est redirigé vers son tableau de bord", async function () {
    await expect(this.backofficePage).toHaveURL(/\/dashboard\/.*\/user/, {
        timeout: 30000
    });
});

Then("Un mail de verification est envoye a l'adresse email de l'utilisateur", async function () {

});

Then(
    "Arrive sur la page du tableau de bord, l'utilisateur voit s'afficher l'objet qu'il a declare precedemment",
    async function () {
        await expect(this.backofficePage.getByText('Mon dernier objet ajouté')).toBeVisible();
    }
);

Then("Un message d'erreur indique que le champ est requis", async function () {
    const modale = modaleInscription(this.backofficePage);
    
    const champEmail = modale.getByLabel('Email*');
    const champCaptcha = modale.locator('#is-human-input');
    const caseConditions = checkboxParLabel(this.backofficePage, "conditions");

    const emailInvalid = await champEmail.evaluate(el => !el.checkValidity()).catch(() => false);
    const captchaInvalid = await champCaptcha.evaluate(el => !el.checkValidity()).catch(() => false);
    const conditionsNonCochees = !(await caseConditions.isChecked().catch(() => false));

    const auMoinsUneErreur = emailInvalid || captchaInvalid || conditionsNonCochees;
    expect(auMoinsUneErreur).toBeTruthy();

    if (!conditionsNonCochees) {
        const champCible = emailInvalid ? champEmail : champCaptcha;
        const message = await champCible.evaluate(el => el.validationMessage);
        expect(message.length).toBeGreaterThan(0);
    }
});

Then("Un message d'erreur indique {string}", async function (expectedMessage) {
    // Attente plus longue + recherche plus souple
    await expect(this.backofficePage.getByText(expectedMessage, { exact: false }))
        .toBeVisible({ timeout: 15000 });
});

Then('Une pop-up {string} s\'affiche en bas de la page', async function (popupTitle) {
    await expect(this.backofficePage.getByText(popupTitle)).toBeVisible();
});

Then('Un bouton {string} est disponible dans la pop-up', async function (buttonLabel) {
    await expect(this.backofficePage.getByRole('button', { name: buttonLabel })).toBeVisible();
});

Then("Un nouveau mail de verification est envoye a l'adresse email de l'utilisateur", async function () {
    // TODO: idem que ci-dessus, vérifier via une boîte mail de test
});

Then('La pop-up {string} n\'est plus visible sur la page', async function (popupTitle) {
    await expect(this.backofficePage.getByText(popupTitle)).not.toBeVisible();
});