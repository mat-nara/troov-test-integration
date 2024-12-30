import dotenv from 'dotenv';

// Get the environment from NODE_ENV, default to 'development' if not set
const environment = process.env.NODE_ENV || 'development';

// Load the appropriate .env file based on the environment
dotenv.config({ path: `.env.${environment}` });

export const config = {
  troovURL: process.env.TROOV_URL || 'http://localhost:3000', 
  callscreenURL: process.env.CALLSCREEN_URL || 'http://localhost:3001', 
  username: process.env.TROOV_USERNAME || 'caf@troov.com',
  password: process.env.TROOV_PASSWORD || 'Caf2024',
};