import { Router } from 'express';
import { v1Router } from './v1/index.js';

export const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/v1', v1Router);
