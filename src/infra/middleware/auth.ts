// src/infra/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';


export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
 
  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return; // Don't return the response, just return void
  }

  // [WIP]: Validate against stored API keys
  const validKeys = ENV.VALID_API_KEYS?.split(',') || [];

  if (!validKeys.includes(apiKey)) {
    res.status(403).json({ error: 'Invalid API key' });
    return; // Don't return the response, just return void
  }
  
  next();
};