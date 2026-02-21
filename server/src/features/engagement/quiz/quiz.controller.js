import * as quizService from './quiz.services.js';
import { successResponse, errorResponse, createdResponse } from '../../../utils/response.js';

export const startQuizHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await quizService.startQuizService(userId);
        if (!result.success) {
            if (result.hasIncomplete) {
                return res.status(409).json({
                    success: false,
                    hasIncomplete: true,
                    incompleteQuizId: result.incompleteQuizId,
                    message: result.message
                });
            }
            return errorResponse(res, result.message, 400);
        }
        return createdResponse(res, 'Quiz started successfully', result.quiz);
    } catch (error) {
        console.error('Error starting quiz:', error);
        return errorResponse(res, 'Failed to start quiz', 500);
    }
};
export const resumeQuizHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId } = req.params;
        const result = await quizService.resumeQuizService(parseInt(quizId), userId);
        if (!result.success) {
            if (result.timeExpired && result.autoSubmitted) {
                return res.status(410).json({
                    success: false,
                    timeExpired: true,
                    autoSubmitted: true,
                    result: result.result,
                    message: result.message
                });
            }
            if (result.timeExpired) {
                return res.status(410).json({
                    success: false,
                    timeExpired: true,
                    message: result.message
                });
            }
            return errorResponse(res, result.message, 404);
        }

        return successResponse(res, 'Quiz resumed successfully', result.data);
    } catch (error) {
        console.error('Error resuming quiz:', error);
        return errorResponse(res, 'Failed to resume quiz', 500);
    }
};
export const submitQuizHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId } = req.body;

        if (!quizId) {
            return errorResponse(res, 'Quiz ID is required', 400);
        }

        const result = await quizService.submitQuizService(parseInt(quizId), userId);

        if (!result.success) {
            return errorResponse(res, result.message, 400);
        }

        return successResponse(res, 'Quiz submitted successfully', result.result);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        return errorResponse(res, 'Failed to submit quiz', 500);
    }
};

export const saveAnswerHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId, questionId, userAnswer } = req.body;

        if (!quizId || !questionId || !userAnswer) {
            return errorResponse(res, 'quizId, questionId, and userAnswer are required', 400);
        }

        const result = await quizService.saveAnswerService(parseInt(quizId), userId, parseInt(questionId), userAnswer);

        if (!result.success) {
            return errorResponse(res, result.message, 400);
        }

        return successResponse(res, 'Answer saved successfully');
    } catch (error) {
        console.error('Error saving answer:', error);
        return errorResponse(res, 'Failed to save answer', 500);
    }
};

export const markQuestionHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId, questionId, isMarked } = req.body;

        if (!quizId || !questionId || isMarked === undefined) {
            return errorResponse(res, 'quizId, questionId, and isMarked are required', 400);
        }

        const result = await quizService.markQuestionService(parseInt(quizId), userId, parseInt(questionId), isMarked);

        if (!result.success) {
            return errorResponse(res, result.message, 400);
        }

        return successResponse(res, 'Mark status updated successfully');
    } catch (error) {
        console.error('Error updating mark status:', error);
        return errorResponse(res, 'Failed to update mark status', 500);
    }
};

export const getQuizStatsHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await quizService.getQuizStatsService(userId);

        if (!result.success) {
            return errorResponse(res, 'Failed to fetch quiz statistics', 500);
        }

        return successResponse(res, 'Quiz statistics fetched successfully', result.stats);
    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        return errorResponse(res, 'Failed to fetch quiz statistics', 500);
    }
};

export const getQuizHistoryHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const dateFilter = req.query.dateFilter || null;
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;

        const result = await quizService.getQuizHistoryService(userId, page, limit, dateFilter, startDate, endDate);

        if (!result.success) {
            return errorResponse(res, 'Failed to fetch quiz history', 500);
        }

        return successResponse(res, 'Quiz history fetched successfully', {
            history: result.history,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        return errorResponse(res, 'Failed to fetch quiz history', 500);
    }
};

export const getQuizReviewHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId } = req.params;

        const result = await quizService.getQuizReviewService(parseInt(quizId), userId);

        if (!result.success) {
            return errorResponse(res, result.message || 'Failed to fetch quiz review', 404);
        }

        return successResponse(res, 'Quiz review fetched successfully', result.data);
    } catch (error) {
        console.error('Error fetching quiz review:', error);
        return errorResponse(res, 'Failed to fetch quiz review', 500);
    }
};

export const viewCertificateHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { quizId } = req.params;

        const result = await quizService.getCertificatePDFService(parseInt(quizId), userId);

        if (!result.success) {
            return errorResponse(res, result.message || 'Certificate not found', 404);
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="certificate-${quizId}.pdf"`
        });
        return res.send(result.pdfBuffer);
    } catch (error) {
        console.error('Error viewing certificate:', error);
        return errorResponse(res, 'Failed to view certificate', 500);
    }
};
