import express from 'express';
import sliceRouter from './slices/index';
import { errorHandler, apiKeyAuth } from './infra/middleware/index';
import { ENV } from './infra/config/env';

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
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Always start the server when this script is run
const app = createApp();
const port = Number(ENV.PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`🔵 version: ${ENV.APP_VERSION}`);
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Keep the process alive
process.stdin.resume();