// src/slices/index.ts
import { Router } from 'express';
import exampleRoutes from './_example/route';

const router = Router();

// Mount slice routes
router.use('/example', exampleRoutes);

// Add new slices here as they're created
// router.use('/hotels', hotelRoutes);
// router.use('/proxy', proxyRoutes);

export default router;