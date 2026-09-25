import { Router } from 'express';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ name: 'Hamza Idiris portfolio API', version: 1 });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
