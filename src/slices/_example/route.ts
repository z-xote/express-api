// src/slices/_example/routes.ts
import { Router } from 'express';
import { ExampleService } from './service';

const router = Router();
const service = new ExampleService();

router.get('/', async (req, res) => {
  const data = await service.getData();
  res.json({ message: 'Example slice', data });
});

export default router;