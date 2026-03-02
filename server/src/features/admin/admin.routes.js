import express from 'express';
import { getMetricsHandler } from './admin.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = express.Router();

router.get('/metrics', authMiddleware, requireRole(7) , getMetricsHandler);

export default router;
