import express from 'express';
import sliceRouter from './slices/index';
import { errorHandler, apiKeyAuth } from './infra/middleware/index';
import { ENV } from './infra/config/env';
import { createLogger } from './infra/utils/logger';
import chalk from 'chalk';

const logger = createLogger('express-api');

export function createApp() {
  const app = express();
  
  // Global middleware
  app.use(express.json());
  
  // Health check (no auth)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // All API routes require auth
  app.use('/api', apiKeyAuth, sliceRouter);

  // Error handling
  app.use(errorHandler());
  
  return app;
}

// Add process error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Always start the server when this script is run
const app = createApp();
const port = Number(ENV.PORT) || 3000;

const server = app.listen(port, () => {
  // Clean server start message
  logger.info('Server started', { 
    version: ENV.APP_VERSION, 
    port, 
    healthCheck: `http://localhost:${port}/health` 
  });
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server failed to start', { error: error.message });
  process.exit(1);
});

// Keep the process alive
process.stdin.resume();
