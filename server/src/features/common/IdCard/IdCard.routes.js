import express from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { getIdCardHandler } from './IdCard.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getIdCardHandler);

export default router;
