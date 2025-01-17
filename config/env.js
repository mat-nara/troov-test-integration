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
  browserName: process.env.BROWSER || 'chromium', 
  headless: process.env.HEADLESS === "true" || false, 
  mobileDevice: process.env.MOBILE_DEVICE, 
  troovURL: process.env.TROOV_URL || 'http://localhost:3000', 
  callscreenURL: process.env.CALLSCREEN_URL || 'http://localhost:3001', 
  username: process.env.TROOV_USERNAME || 'caf@troov.com',
  password: process.env.TROOV_PASSWORD || 'Caf2024',
};