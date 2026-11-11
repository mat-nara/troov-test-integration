const { Given, When, Then } = require('@cucumber/cucumber');

// URL de base normalisée
const BASE_URL = (
    process.env.BASE_URL || 'http://localhost:3000'
).replace(/\/+$/, '').replace(/\/login$/i, '');
const {
    remplirChampsObjet,
    validerFormulaire,
    remplirAdresse,
    ouvrirSection,
    demanderAnalyseCharlie
} = require('./helper');
/*--------------------------------GIVEN COMMUN----------------------------------------*/

Given(
    'l\'agent {string} est en service et connecte sur le back-office Troov de l\'equipe {string} \\(demo.troov.com\\)',
    async function (agent, equipe) {

        const email = process.env.TROOV_AGENT_USERNAME;
        const password = process.env.TROOV_AGENT_PASSWORD;

        if (!email || !password) {
            throw new Error('Les identifiants Troov doivent être définis dans le .env');
        }

        const page = this.backofficePage;

        await page.goto(`${BASE_URL}/login`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.click('button[type="submit"].btn-primary')
    ]);

    await page.waitForURL(
      url => !url.pathname.includes('/login'),
      { timeout: 30000 }
    );
  }
);
/*--------------------------------WHEN COMMUN----------------------------------------*/

When('L\'agent cree l\'objet trouve suivant :', async function (dataTable) {
    const page = this.backofficePage;

    await page.click('a.prftch[href*="/dashboard/"][href*="/items/add"]');

    await remplirChampsObjet(page, dataTable.rowsHash());

    await validerFormulaire(page);
});

// Déclaration d'un objet perdu via le formulaire public
When(
    'L\'usager declare l\'objet perdu correspondant le jour meme via le formulaire public {string} :',
    async function (formName, dataTable) {

        const email = process.env.TROOV_PUBLIC_FORM_USERNAME;
        const password = process.env.TROOV_PUBLIC_FORM_PASSWORD;

        if (!email || !password) {
            throw new Error(
                'TROOV_PUBLIC_FORM_USERNAME et TROOV_PUBLIC_FORM_PASSWORD doivent etre definis dans le .env'
            );
        }

        this.usagerPage = await this.context.newPage();
        const page = this.usagerPage;

        await page.goto(`${BASE_URL}/login`, {
            waitUntil: 'domcontentloaded'
        });

        await page.fill('#email', email);
        await page.fill('#password', password);

        await Promise.all([
            page.waitForURL(
                url => !url.pathname.includes('/login'),
                { timeout: 15000 }
            ),
            page.click('button[type="submit"].btn-primary')
        ]);

        const lien = page.getByRole('link', {
            name: 'Signaler un objet'
        }).first();

        if (await lien.isVisible().catch(() => false)) {
            await lien.click();
        } else {
            const dashboardId =
                process.env.TROOV_PUBLIC_DASHBOARD_ID ||
                (page.url().match(/\/dashboard\/([a-f0-9]+)/i) || [])[1];

            if (!dashboardId) {
                throw new Error(`DashboardId introuvable. URL: ${page.url()}`);
            }

            await page.goto(
                `${BASE_URL}/dashboard/${dashboardId}/items/add`,
                { waitUntil: 'domcontentloaded' }
            );
        }

        await page.locator('[data-cy="address-picker"] input').waitFor({
            state: 'visible',
            timeout: 15000
        });

        await remplirAdresse(page);
        await remplirChampsObjet(page, dataTable.rowsHash());
        await validerFormulaire(page);
    }
);

/*-------------------------- ATTENTE COMMUNE --------------------------------*/

When('L\'utilisateur attend {int} secondes', async function (secondes) {
    await this.backofficePage.waitForTimeout(secondes * 1000);
});

/*-------------------------- OUVERTURE SECTION COMMUNE --------------------------*/

When('L\'utilisateur ouvre {string}', async function (section) {
    await ouvrirSection(this.backofficePage, section);
});

/*-------------------------- ANALYSE CHARLIE COMMUNE --------------------------*/

When('L\'utilisateur demande a Charlie d\'analyser si le badge est grise', async function () {
    await demanderAnalyseCharlie(this.backofficePage);
});