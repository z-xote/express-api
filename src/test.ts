// Example logger statements showing conditional pretty printing
import { createLogger } from './infra/utils/logger';

const logger = createLogger('express-api');
const authLogger = createLogger('express-api')
const dbLogger = createLogger('express-api')
const apiLogger = createLogger('express-api')


const testBody = {
  userId: '12345',
  email: 'user@example.com',
  permissions: ['read', 'write', 'admin'],
  loginTime: new Date().toISOString(),
  ipAddress: '192.168.1.100',
  version: '1.2.0',
  statusCode: 200,
  what: null,
  this: true,
  that: false

  // No prettyPrint flag = compact JSON
}

// Simple message with common metadata (handled cleanly) - NO pretty print
logger.info('Server started', { 
  version: '0.0.3', 
  port: 3001, 
  healthCheck: 'http://localhost:3001/health' 
});

// Compact JSON for debug/internal logs - NO pretty print
authLogger.info('User authentication successful', {
  ...testBody,
  prettyPrint: true
});

// Pretty printed for important/complex data - WITH pretty print
dbLogger.info('Query executed', {
  query: 'SELECT u.*, p.name as profile_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.active = true',
  duration: '45ms',
  rows: 23,
  cacheHit: false,
  queryPlan: {
    type: 'IndexScan',
    cost: 0.29,
    estimatedRows: 25
  },
  connectionPool: {
    active: 5,
    idle: 2,
    total: 7
  }
});

// Pretty printed API request for debugging - WITH pretty print
apiLogger.info('API request processed', {
  method: 'POST',
  endpoint: '/api/users/profile',
  statusCode: 201,
  requestBody: {
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: false,
        sms: true
      },
      privacy: {
        profileVisible: true,
        shareData: false
      }
    }
  },
  responseTime: '127ms'
});

// Compact error for simple logs - NO pretty print
logger.error('Database connection failed', {
  error: 'Connection timeout after 5000ms',
  retryAttempt: 3,
  maxRetries: 5,
  healthCheck: 'http://localhost:3001/health/db'
});

// Pretty printed error for detailed debugging - WITH pretty print
logger.error('Complex database error', {
  prettyPrint: true, // Pretty print for detailed error analysis
  error: 'Connection timeout after 5000ms',
  connectionString: 'postgresql://localhost:5432/myapp',
  retryAttempt: 3,
  maxRetries: 5,
  lastError: {
    code: 'ECONNREFUSED',
    errno: -61,
    syscall: 'connect',
    address: '127.0.0.1',
    port: 5432
  },
  healthCheck: 'http://localhost:3001/health/db'
});

// Compact cache stats for monitoring - NO pretty print
logger.info('Cache hit rate', {
  hitRate: 0.847,
  totalRequests: 15420,
  memoryUsage: '245MB'
});

// Pretty printed cache analysis - WITH pretty print
logger.info('Detailed cache analysis', {
  prettyPrint: true, // Pretty print for analysis
  hitRate: 0.847,
  totalRequests: 15420,
  cacheHits: 13051,
  cacheMisses: 2369,
  memoryUsage: {
    used: '245MB',
    available: '755MB',
    percentage: 24.5
  },
  topKeys: [
    { key: 'user:12345', hits: 145 },
    { key: 'product:67890', hits: 98 },
    { key: 'session:abc123', hits: 76 }
  ]
});