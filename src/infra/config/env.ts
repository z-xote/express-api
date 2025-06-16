// src/config/env.ts
import 'dotenv/config';
// Import package.json to extract version
import pkg from '@pkg' assert { type: 'json' }


// Define the shape of your environment variables
interface EnvConfig {
  // From .env file
  APP_NAME: string;
  PORT: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  API_VERSION: string;
  
  // Additional computed values
  APP_VERSION: string;
  BUILD_TIME: string;
  CONFIG_LOADED: string;
  VALID_API_KEYS: string;
  
  // Allow any other env vars that might exist
  [key: string]: string | undefined;
}

// Extract all .env variables
const rawEnv = process.env;

// Define additional environment variables
const additionalEnv = {
  APP_VERSION: pkg.version,
  BUILD_TIME: new Date().toISOString(),
  CONFIG_LOADED: 'true',
};

// Merge both together with proper typing
export const ENV: EnvConfig = {
  ...rawEnv,
  ...additionalEnv,
} as EnvConfig;

// Validate required keys
const requiredKeys: (keyof EnvConfig)[] = ['APP_NAME', 'PORT', 'JWT_SECRET'];
requiredKeys.forEach((key) => {
  if (!ENV[key]) {
    throw new Error(`Missing required ENV var: ${key}`);
  }
});