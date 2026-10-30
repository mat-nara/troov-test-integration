const { Given, When, Then } = require('@cucumber/cucumber');
const {remplirChampsObjet, validerFormulaire, remplirAdresse, ouvrirFicheMatch, demanderAnalyseCharlie, ouvrirSection, verifierScoreIA
} = require('../../../../core/helper');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const LIGNE_MATCH = {marque: 'SAMSONITE', modele: 'valise cabine'};


/*-------------------------------------------GIVEN----------------------------------------------*/
Given(
  'l\'agent {string} est en service et connecte sur le back-office Troov de l\'equipe {string} \\(demo.troov.com\\)',
  async function (agent, equipe) {
    const email = process.env.TROOV_AGENT_USERNAME;
    const password = process.env.TROOV_AGENT_PASSWORD;
    if (!email || !password) {
      throw new Error('TROOV_AGENT_USERNAME et TROOV_AGENT_PASSWORD doivent etre definis dans le .env');
    }

    const page = this.backofficePage;
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('#email', email);
    await page.fill('#password', password);

    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.click('button[type="submit"].btn-primary')
    ]);

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });
  }
);


/*--------------------------------------------WHEN-----------------------------------------------*/

//creation objet sur la page de l'agent

When('L\'agent cree l\'objet trouve suivant :', async function (dataTable) {
  const page = this.backofficePage;
  await page.click('a.prftch[href*="/dashboard/"][href*="/items/add"]');
  await remplirChampsObjet(page, dataTable.rowsHash());
  await validerFormulaire(page);
});


//creation de l'objet sur la page usager

When(
  'L\'usager declare l\'objet perdu correspondant le jour meme via le formulaire public {string} :',
  async function (formName, dataTable) {
    const email = process.env.TROOV_PUBLIC_FORM_USERNAME;
    const password = process.env.TROOV_PUBLIC_FORM_PASSWORD;
    if (!email || !password) {
      throw new Error('TROOV_PUBLIC_FORM_USERNAME et TROOV_PUBLIC_FORM_PASSWORD doivent etre definis dans le .env');
    }

    this.usagerPage = await this.context.newPage();
    const page = this.usagerPage;

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('#email', email);
    await page.fill('#password', password);
    await Promise.all([
      page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 }),
      page.click('button[type="submit"].btn-primary')
    ]);

    const lien = page.getByRole('link', { name: 'Signaler un objet' }).first();
    if (await lien.isVisible().catch(() => false)) {
      await lien.click();
    } else {
      const dashboardId = process.env.TROOV_PUBLIC_DASHBOARD_ID ||
        (page.url().match(/\/dashboard\/([a-f0-9]+)/i) || [])[1];
      if (!dashboardId) throw new Error(`DashboardId introuvable. URL: ${page.url()}`);
      await page.goto(`${BASE_URL}/dashboard/${dashboardId}/items/add`, { waitUntil: 'domcontentloaded' });
    }

    await page.locator('[data-cy="address-picker"] input').waitFor({ state: 'visible', timeout: 15000 });
    await remplirAdresse(page);
    await remplirChampsObjet(page, dataTable.rowsHash());
    await validerFormulaire(page);
  }
);

//stratégie pour une temps de pause 

When('L\'utilisateur attend {int} secondes', async function (secondes) {
  await this.backofficePage.waitForTimeout(secondes * 1000);
});

//ouverture du fiche du match

When('L\'utilisateur ouvre la fiche du match cote back office', async function () {
  await ouvrirFicheMatch(this.backofficePage, LIGNE_MATCH);
});

//analyse de Charlie

When('L\'utilisateur demande a Charlie d\'analyser si le badge est grise', async function () {
  await demanderAnalyseCharlie(this.backofficePage);
});

When('L\'utilisateur ouvre {string}', async function (section) {
  await ouvrirSection(this.backofficePage, section);
});


/*------------------------------------------------THEN---------------------------------------------*/

Then('Un score IA est affiche', async function () {
  await verifierScoreIA(this.backofficePage, this);
});