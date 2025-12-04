const dotenv = require('dotenv');

// Get the environment from NODE_ENV, default to 'development' if not set
const environment = process.env.NODE_ENV || 'development';

// Load the appropriate .env file based on the environment
dotenv.config({ path: `.env.${environment}` });

// Ensure environment variables are loaded
if (!process.env.BROWSER) {
  throw new Error('BROWSER environment variable is not set.');
}

module.exports =  {
  troovCafUserArrivalURL: process.env.TROOV_CAF_USER_ARRIVAL_URL || 'https://lib.dev.caf.troovrdv.com/troovrdv-front/cnaf/enrollment', 
  troovCafUserBackofficeURL: process.env.TROOV_CAF_BACKOFFICE_URL || 'https://dev.caf.troovrdv.com/fr/login', 
  troovCafUserBackofficeUsername: process.env.TROOV_CAF_BACKOFFICE_USERNAME || 'admin@troov.com', 
  troovCafUserBackofficePassword: process.env.TROOV_CAF_BACKOFFICE_PASSWORD || 'T&C-Oe4cMol4e!', 
  browserName: process.env.BROWSER || 'chromium', 
  headless: process.env.HEADLESS === "true" || false, 
  mobileDevice: process.env.MOBILE_DEVICE, 
  troovURL: process.env.TROOV_URL || 'http://localhost:3000', 
  callscreenURL: process.env.CALLSCREEN_URL || 'http://localhost:3001', 
  username: process.env.TROOV_USERNAME || 'caf@troov.com',
  password: process.env.TROOV_PASSWORD || 'Caf2024',
  usernameProfileInterfaceNational: process.env.USERNAME_PROFILE_INTERFACE_NATIONAL || 'interface-national@test.com', 
  passwordProfileInterfaceNational: process.env.PASSWORD_PROFILE_INTERFACE_NATIONAL || 'Troov2025', 
  usernameProfileAdministrateurCaf: process.env.USERNAME_PROFILE_ADMINISTRATEUR_CAF || 'admin-caf-1@test.com', 
  passwordProfileAdministrateurCaf: process.env.PASSWORD_PROFILE_ADMINISTRATEUR_CAF || 'Troov2025', 
  usernameProfileSuperviseur: process.env.USERNAME_PROFILE_SUPERVISEUR || 'superviseur-manager@test.com', 
  passwordProfileSuperviseur: process.env.PASSWORD_PROFILE_SUPERVISEUR || 'Troov2025', 
  usernameProfileUtilisateurAcceuil: process.env.USERNAME_PROFILE_UTILISATEUR_ACCEUIL || 'utilisateur-acceuil@test.com', 
  passwordProfileUtilisateurAcceuil: process.env.PASSWORD_PROFILE_UTILISATEUR_ACCEUIL || 'Troov2025', 
};