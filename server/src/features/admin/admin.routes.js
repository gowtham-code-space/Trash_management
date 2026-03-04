import express from 'express';
import {
    getMetricsHandler, getLogsHandler, getDistinctValuesHandler, exportLogsHandler, getDashboardKpisHandler, getQuizKpisHandler,
    getQuizConfigsHandler, createQuizConfigHandler, updateQuizConfigHandler, deleteQuizConfigHandler, setActiveQuizConfigHandler,
    getDeletedQuizConfigsHandler, restoreQuizConfigHandler,
    getQuestionsHandler, createQuestionHandler, updateQuestionHandler, deleteQuestionHandler, bulkCreateQuestionsHandler,
} from './admin.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = express.Router();
router.use(authMiddleware, requireRole(7));

router.get('/dashboard/kpis', getDashboardKpisHandler);
router.get('/metrics', getMetricsHandler);
router.get('/logs', getLogsHandler);
router.get('/logs/filters', getDistinctValuesHandler);
router.get('/logs/export', exportLogsHandler);

router.get('/quiz/kpis', getQuizKpisHandler);
router.get('/quiz/configs', getQuizConfigsHandler);
router.get('/quiz/configs/deleted', getDeletedQuizConfigsHandler);
router.post('/quiz/configs', createQuizConfigHandler);
router.put('/quiz/configs/:id', updateQuizConfigHandler);
router.delete('/quiz/configs/:id', deleteQuizConfigHandler);
router.patch('/quiz/configs/:id/activate', setActiveQuizConfigHandler);
router.patch('/quiz/configs/:id/restore', restoreQuizConfigHandler);

router.get('/quiz/questions', getQuestionsHandler);
router.post('/quiz/questions', createQuestionHandler);
router.put('/quiz/questions/:id', updateQuestionHandler);
router.delete('/quiz/questions/:id', deleteQuestionHandler);
router.post('/quiz/questions/bulk', bulkCreateQuestionsHandler);

export default router;
