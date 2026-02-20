import express from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import {
    startQuizHandler,
    resumeQuizHandler,
    submitQuizHandler,
    getQuizStatsHandler,
    getQuizHistoryHandler,
    getQuizReviewHandler,
    saveAnswerHandler,
    markQuestionHandler,
    viewCertificateHandler
} from './quiz.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', getQuizStatsHandler);
router.post('/start', startQuizHandler);
router.get('/resume/:quizId', resumeQuizHandler);
router.patch('/answer', saveAnswerHandler);
router.patch('/mark', markQuestionHandler);
router.post('/submit', submitQuizHandler);
router.get('/history', getQuizHistoryHandler);
router.get('/review/:quizId', getQuizReviewHandler);
router.get('/certificate/:quizId', viewCertificateHandler);

export default router;
