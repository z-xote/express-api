// src/config/env.ts
import 'dotenv/config';

// Import package.json to extract version
const pkg = require('../../package.json');
const packageVersion = pkg.version;

// Extract all .env variables
const rawEnv = process.env;

// Define additional environment variables
const additionalEnv = {
  APP_VERSION: packageVersion,
  BUILD_TIME: new Date().toISOString(),
  CONFIG_LOADED: 'true',
};

// Merge both together
export const ENV = {
  ...rawEnv,
  ...additionalEnv,
} as const;

// Optional: Validate required keys
const requiredKeys = ['APP_NAME', 'PORT', 'JWT_SECRET'];
requiredKeys.forEach((key) => {
  if (!ENV[key as keyof typeof ENV]) {
    throw new Error(`Missing required ENV var: ${key}`);
  }
});
