// src/infra/middleware/index.ts
import type { Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from './auth.js';
import rateLimit from 'express-rate-limit';

interface MiddlewareOptions {
  auth?: boolean;
  rateLimit?: { max: number; windowMs: number };
}

export const createMiddlewareStack = (options: MiddlewareOptions = {}) => {
  const middlewares = [];
  
  if (options.auth) {
    middlewares.push(apiKeyAuth);
  }
  
  if (options.rateLimit) {
    middlewares.push(rateLimit({
      max: options.rateLimit.max,
      windowMs: options.rateLimit.windowMs,
    }));
  }
  
  return middlewares;
};

export const errorHandler = () => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  };
};

export { apiKeyAuth };