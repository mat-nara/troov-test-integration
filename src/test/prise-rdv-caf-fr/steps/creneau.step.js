const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const config = require('../../../../config/env.js')

setDefaultTimeout(60 * 1000);

Given("La page de choix du créneau est ouverte", async function() {
    await this.terminalPage.goto('https://lib.dev.caf.troovrdv.com/troovrdv-front/appointment/troov_test');

    let motif = 'Enfant'
    let sousMotif = "J'attends / J'accueille un enfant"

    // Choix du motif
    const inputOfficeTypeLocator = this.terminalPage.locator('label[for="office-type"] + div span.p-select-label');
    await inputOfficeTypeLocator.click();
    const liEnfantLocator = this.terminalPage.locator(`li[aria-label="${motif}"]`);
    await liEnfantLocator.click();
    const updatedTextOfficeType = await inputOfficeTypeLocator.textContent();
    expect(updatedTextOfficeType.trim()).toBe(motif);

    // choix du sous-motif
    const inputOfficeLocator = this.terminalPage.locator('label[for="sub-officeType"] + div span.p-select-label');
    console.log('wait for visible click ...')
    await inputOfficeLocator.locator('..').locator('.p-select-dropdown-icon').waitFor({ state: 'visible' });
    await inputOfficeLocator.locator('..').click();
    const liAttendEnfantLocator = await this.terminalPage.locator(`li[aria-label="${sousMotif}"] span:not(.tui-hidden)`);
    await liAttendEnfantLocator.click();
    const updatedTextOffice = await liAttendEnfantLocator.textContent();
    expect(updatedTextOffice.trim()).toBe(sousMotif);

    await this.terminalPage.locator('button[aria-label="Continuer"]').click();
    
    // Page choix du creneau
});

Given("Nous avons une date et les créneaux correspondant avant le clique sur la flèche de navigation droite", async function() {
    const locatorDate1 = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active').nth(0)
    this.initialDate  = await locatorDate1.locator('button[name="date"] .tui-font-normal').textContent();
});

Given("Nous avons une date et les créneaux correspondant avant le clique sur la flèche de navigation gauche", async function() {
    // Naviger d'abord vers la droite pour pouvoir revenir a gauche
    await this.terminalPage.locator('button[aria-label="Next Page"]').click();
    await this.terminalPage.waitForTimeout(2000);

    const locatorDate1 = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active').nth(0)
    this.initialDate  = await locatorDate1.locator('button[name="date"] .tui-font-normal').textContent();
});


// ------------------------------------

When("L'utilisateur clique sur la flèche de navigation droite pour changer la date", async function() {
    await this.terminalPage.locator('button[aria-label="Next Page"]').click();
    await this.terminalPage.waitForTimeout(2000);
});

When("L'utilisateur clique sur la flèche de navigation gauche pour changer la date", async function() {
    await this.terminalPage.locator('button[aria-label="Previous Page"]').click();
    await this.terminalPage.waitForTimeout(2000);
});

// Filtre by mode
When("L'utilisateur clique sur l'icône de filtre", async function() {
    await this.terminalPage.locator('button[name="filter"]').click();
    await this.terminalPage.waitForTimeout(1000);
});

When("L'utilisateur sélectionne le mode {string}", async function(mode) {
    await this.terminalPage.getByText('Rendez-vous téléphonique').nth(0).click();
    await this.terminalPage.getByText('Rendez-vous en visioconférence').nth(0).click();
    await this.terminalPage.getByText('Rendez-vous sur site').nth(0).click();
    
    await this.terminalPage.locator(`span[data-pc-section="label"]:has-text("${mode}")`).click();
    await this.terminalPage.waitForTimeout(1000);
});

When("L'utilisateur clique sur le bouton \"Confirmer\"", async function() {
    await this.terminalPage.locator('button[name="filter-confirm"]').click();
    await this.terminalPage.waitForTimeout(1000);
});

// Filtre by critère
When("L'utilisateur sélectionne le critère {string}", async function(critère) {
    
    const filterSitesLocator = this.terminalPage.locator('div[name="filter-sites"]');
    const sitesCount = await filterSitesLocator.count();

    // Déselectionne tout les sites
    for (let i = 0; i < sitesCount; i++) {
        await this.terminalPage.locator('div[name="filter-sites"] button').nth(i).click();
    }

    await this.terminalPage.waitForTimeout(1000);

    this.siteSelectionner = []
    this.siteNonSelectionner = []

    switch (critère) {
        case "Sélection de tous les sites":
            await this.terminalPage.locator('#filter-sites-all').check();

            for (let i = 0; i < sitesCount; i++) {
                let sitelocator = this.terminalPage.locator('div[name="filter-sites"] button').nth(i);
                this.siteSelectionner.push(await sitelocator.locator('span[data-pc-section="label"]').textContent());
            }
            break;
            
        case "Sélection multiple":
            let randomNumber = 0;
            if(sitesCount == 0){
                randomNumber = 0;
            }else if(sitesCount == 1){
                randomNumber = 1;
            }else{
                randomNumber = Math.floor(Math.random() * sitesCount - 1) + 1;
            }

            for (let i = 0; i < randomNumber; i++) {
                let sitelocator = this.terminalPage.locator('div[name="filter-sites"] button').nth(i);
                await sitelocator.click();
                this.siteSelectionner.push(await sitelocator.locator('span[data-pc-section="label"]').textContent());
            }

            for (let i = randomNumber; i < sitesCount; i++) {
                let sitelocator = this.terminalPage.locator('div[name="filter-sites"] button').nth(i);
                this.siteNonSelectionner.push(await sitelocator.locator('span[data-pc-section="label"]').textContent());
            }
            break;

        case "Sélection d'un site":
            let sitelocator = this.terminalPage.locator('div[name="filter-sites"] button').nth(0);
            await sitelocator.click();
            this.siteSelectionner.push(await sitelocator.locator('span[data-pc-section="label"]').textContent());

            for (let i = 1; i < sitesCount; i++) {
                let sitelocator = this.terminalPage.locator('div[name="filter-sites"] button').nth(i);
                this.siteNonSelectionner.push(await sitelocator.locator('span[data-pc-section="label"]').textContent());
            }
            break;

        default:
            break;
    }
});

// Sélection de rendez-vous
When("L'utilisateur sélectionne un rendez-vous disponible", async function() {
    const rdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span').nth(0);
    rdvLocator.click()
});

When("L'utilisateur clique sur le bouton \"Sélectionner\"", async function() {
    const firstRdvLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel').nth(0);
    await firstRdvLocator.locator('button[aria-label="Sélectionner"]').click();
});

// ------------------------------------

Then("Le titre \"Choisir votre créneau\" s'affiche", async function() {
    const label = this.terminalPage.locator('label', { hasText: /Choisir votre créneau - \d+\/\d+/ });
    await expect(label).toBeVisible();
});

Then("L'utilisateur peut effectue un défilement sur la liste des créneaux", async function () {

    await this.terminalPage.waitForTimeout(3000);

    const scrollableEl = this.terminalPage.locator('#app > .tui-h-full > .tui-h-dvh');

    const initialScrollTop = await scrollableEl.evaluate(el => el.scrollTop);
    //console.log(`Position initiale du scroll de l'élément : ${initialScrollTop}`);

    // Utiliser un scroll fluide avec window.scrollTo() dans evaluate
    await this.terminalPage.evaluate(() => {
        const element = document.querySelector('#app > .tui-h-full > .tui-h-dvh');
        element.scrollTo({
            top: element.scrollHeight,  // Scrolling jusqu'en bas de l'élément
            behavior: 'smooth'          // Scroll fluide
        });
    });

    // Attendre un peu pour que le scroll soit effectif
    await this.terminalPage.waitForTimeout(2000);

    // Vérifier la nouvelle position de scroll
    const newScrollTop = await scrollableEl.evaluate(el => el.scrollTop);
    //console.log(`Position du scroll après défilement : ${newScrollTop}`);

    // Vérifier que le scroll a bien bougé
    expect(newScrollTop).toBeGreaterThan(initialScrollTop); // La position du scroll 

});

Then("La date affichée est mise à jour en conséquence vers la date suivante", async function() {
    // Wait for next data loaded
    await this.terminalPage.waitForTimeout(2000);

    const newlocatorDate1 = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active').nth(0)
    const updatedDate  = await  newlocatorDate1.locator('button[name="date"] .tui-font-normal').textContent();
    expect(updatedDate).not.toBe(this.initialDate);
    
    // Check date is next date
    const [day, month] = this.initialDate.trim().split('/').map(num => parseInt(num, 10));
    const year = new Date().getFullYear(); // Utiliser l'année actuelle
    var dateBefore = new Date(year, month - 1, day); // Mois est indexé de 0 (janvier = 0)

    const [updatedDay, updatedMonth] = updatedDate.trim().split('/').map(num => parseInt(num, 10));
    var dateAfter = new Date(dateBefore.getFullYear(), updatedMonth - 1, updatedDay);

    // Vérifier que la nouvelle date est bien après la date initiale
    expect(dateAfter.getTime()).toBeGreaterThan(dateBefore.getTime());
});

Then("La date affichée est mise à jour en conséquence vers la date précédente", async function() {
    // Wait for next data loaded
    await this.terminalPage.waitForTimeout(2000);

    const newlocatorDate1 = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active').nth(0)
    const updatedDate  = await  newlocatorDate1.locator('button[name="date"] .tui-font-normal').textContent();
    expect(updatedDate).not.toBe(this.initialDate);

    // Check date is previous date
    const [day, month] = this.initialDate.trim().split('/').map(num => parseInt(num, 10));
    const year = new Date().getFullYear(); // Utiliser l'année actuelle
    var dateBefore = new Date(year, month - 1, day); // Mois est indexé de 0 (janvier = 0)

    const [updatedDay, updatedMonth] = updatedDate.trim().split('/').map(num => parseInt(num, 10));
    var dateAfter = new Date(dateBefore.getFullYear(), updatedMonth - 1, updatedDay);

    // Vérifier que la nouvelle date est bien après la date initiale
    expect(dateAfter.getTime()).toBeLessThan(dateBefore.getTime());
});

Then("Les créneaux correspondants à la nouvelle date sont affichés", async function() {
    
});

Then("Seuls les créneaux en mode {string} sont affichés, les créneaux des autres modes ne sont pas affichés", async function(mode) {
    
    // Attendre le chargement
    await this.terminalPage.locator('p-progressspinner').waitFor({ state: 'detached' });
    await this.terminalPage.waitForTimeout(2000);

    const baseLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span');

    // Filtrer les éléments 
    const phoneLocator = baseLocator.filter({ hasText: "Par téléphone" });
    const visioLocator = baseLocator.filter({ hasText: "En visioconférence" });    
    const physiqueLocator = baseLocator.filter({ hasText: /^(?!Par téléphone|En visioconférence).*/ });

    // Vérifier le nombre d'occurrences
    const phoneCount = await phoneLocator.count();
    const visioCount = await visioLocator.count();
    const physiqueCount = await physiqueLocator.count();

    switch (mode) {
        case "Rendez-vous téléphonique":
            expect(phoneCount).toBeGreaterThan(0);
            expect(visioCount).toBe(0);
            expect(physiqueCount).toBe(0);
            break;
        case "Rendez-vous en visioconférence":
            expect(phoneCount).toBe(0);
            expect(visioCount).toBeGreaterThan(0);
            expect(physiqueCount).toBe(0);
            break;
        case "Rendez-vous sur site":
            expect(phoneCount).toBe(0);
            expect(visioCount).toBe(0);
            expect(physiqueCount).toBeGreaterThan(0);
            break;
        default:
            break;
    }
});

Then("Seuls les créneaux correspondant au critère {string} sont affichés, les créneaux des autres modes ne sont pas affichés", async function(critère) {
    console.log('this.siteSelectionner: ', this.siteSelectionner);
    console.log('this.siteNonSelectionner: ', this.siteNonSelectionner);

    await this.terminalPage.locator('p-progressspinner').waitFor({ state: 'detached' });
    await this.terminalPage.waitForTimeout(2000);

    const baseLocator = this.terminalPage.locator('.p-carousel-item-list .p-carousel-item-active .p-accordion .p-accordionpanel span');

    // Filtrer les éléments 
    for (let i = 0; i < this.siteSelectionner.length; i++) {
        expect(await baseLocator.filter({ hasText: this.siteSelectionner[0] }).count()).toBeGreaterThan(0);
    }

    for (let i = 0; i < this.siteNonSelectionner.length; i++) {
        expect(await baseLocator.filter({ hasText: this.siteNonSelectionner[0] }).count()).toBe(0);
    }
});

Then("L'utilisateur est redirigé vers l'écran de l'ajout du contact: \"Confirmer vos coordonnées\" s'affiche", async function() {
    const heading = await this.terminalPage.getByText("Confirmer vos coordonnées");
    await expect(heading).toBeVisible();
});

